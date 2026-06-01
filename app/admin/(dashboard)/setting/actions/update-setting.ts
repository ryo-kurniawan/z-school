"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SITE_ASSETS_BUCKET = "site-assets";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() || "jpg";
}

function isValidFile(file: File, allowedTypes: string[]) {
  return allowedTypes.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
}

function getStoragePathFromPublicUrl(publicUrl: string, bucket: string) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function deleteStorageFileByPublicUrl({
  supabase,
  publicUrl,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  publicUrl: string | null;
}) {
  if (!publicUrl) return;

  const filePath = getStoragePathFromPublicUrl(publicUrl, SITE_ASSETS_BUCKET);

  if (!filePath) return;

  await supabase.storage.from(SITE_ASSETS_BUCKET).remove([filePath]);
}

async function uploadSiteAsset({
  supabase,
  file,
  folder,
  filenamePrefix,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  file: File;
  folder: "logo" | "banner" | "government-logo";
  filenamePrefix: string;
}) {
  const extension = getFileExtension(file.name);
  const filePath = `${folder}/${filenamePrefix}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function updateSiteSetting(formData: FormData) {
  const id = String(formData.get("id") || "");

  const schoolName = String(formData.get("school_name") || "").trim();
  const schoolLevel = String(formData.get("school_level") || "sd");
  const schoolNpsn = String(formData.get("school_npsn") || "").trim();
  const headmasterName = String(formData.get("headmaster_name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const website = String(formData.get("website") || "").trim();

  const about = String(formData.get("about") || "").trim();
  const history = String(formData.get("history") || "").trim();
  const vision = String(formData.get("vision") || "").trim();
  const mission = String(formData.get("mission") || "").trim();
  const accreditation = String(formData.get("accreditation") || "").trim();

  const graduationMessage = String(
    formData.get("graduation_message") || "",
  ).trim();

  const graduationAnnouncementEnabled =
    formData.get("graduation_announcement_enabled") === "on";

  const logoFile = formData.get("logo");
  const bannerFile = formData.get("banner");
  const governmentLogoFile = formData.get("government_logo");

  const removeLogo = formData.get("remove_logo") === "on";
  const removeBanner = formData.get("remove_banner") === "on";
  const removeGovernmentLogo = formData.get("remove_government_logo") === "on";

  if (!id) {
    redirect("/admin/setting?error=Data setting tidak ditemukan");
  }

  if (!schoolName) {
    redirect("/admin/setting?error=Nama sekolah wajib diisi");
  }

  if (!["sd", "smp", "sma"].includes(schoolLevel)) {
    redirect("/admin/setting?error=Jenjang sekolah tidak valid");
  }

  const supabase = await createClient();

  const { data: currentSetting, error: currentSettingError } = await supabase
    .from("site_settings")
    .select("logo_url, banner_url, government_logo_url")
    .eq("id", id)
    .maybeSingle();

  if (currentSettingError || !currentSetting) {
    redirect("/admin/setting?error=Data setting tidak ditemukan");
  }

  let nextLogoUrl: string | null | undefined = undefined;
  let nextBannerUrl: string | null | undefined = undefined;
  let nextGovernmentLogoUrl: string | null | undefined = undefined;

  try {
    if (logoFile instanceof File && logoFile.size > 0) {
      if (!isValidFile(logoFile, ALLOWED_LOGO_TYPES)) {
        redirect(
          "/admin/setting?error=Logo harus berupa JPG, PNG, WebP, atau SVG dengan ukuran maksimal 5MB",
        );
      }

      nextLogoUrl = await uploadSiteAsset({
        supabase,
        file: logoFile,
        folder: "logo",
        filenamePrefix: "school-logo",
      });
    } else if (removeLogo) {
      nextLogoUrl = null;
    }

    if (governmentLogoFile instanceof File && governmentLogoFile.size > 0) {
      if (!isValidFile(governmentLogoFile, ALLOWED_LOGO_TYPES)) {
        redirect(
          "/admin/setting?error=Logo pemerintah harus berupa JPG, PNG, WebP, atau SVG dengan ukuran maksimal 5MB",
        );
      }

      nextGovernmentLogoUrl = await uploadSiteAsset({
        supabase,
        file: governmentLogoFile,
        folder: "government-logo",
        filenamePrefix: "government-logo",
      });
    } else if (removeGovernmentLogo) {
      nextGovernmentLogoUrl = null;
    }

    if (bannerFile instanceof File && bannerFile.size > 0) {
      if (!isValidFile(bannerFile, ALLOWED_BANNER_TYPES)) {
        redirect(
          "/admin/setting?error=Banner harus berupa JPG, PNG, atau WebP dengan ukuran maksimal 5MB",
        );
      }

      nextBannerUrl = await uploadSiteAsset({
        supabase,
        file: bannerFile,
        folder: "banner",
        filenamePrefix: "school-banner",
      });
    } else if (removeBanner) {
      nextBannerUrl = null;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal upload file";

    redirect(`/admin/setting?error=${encodeURIComponent(message)}`);
  }

  const updatePayload: {
    school_name: string;
    school_level: string;
    school_npsn: string | null;
    headmaster_name: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    about: string | null;
    history: string | null;
    vision: string | null;
    mission: string | null;
    accreditation: string | null;
    graduation_message: string | null;
    graduation_announcement_enabled: boolean;
    logo_url?: string | null;
    banner_url?: string | null;
    government_logo_url?: string | null;
  } = {
    school_name: schoolName,
    school_level: schoolLevel,
    school_npsn: schoolNpsn || null,
    headmaster_name: headmasterName || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    website: website || null,
    about: about || null,
    history: history || null,
    vision: vision || null,
    mission: mission || null,
    accreditation: accreditation || null,
    graduation_message: graduationMessage || null,
    graduation_announcement_enabled: graduationAnnouncementEnabled,
  };

  if (nextLogoUrl !== undefined) {
    updatePayload.logo_url = nextLogoUrl;
  }

  if (nextGovernmentLogoUrl !== undefined) {
    updatePayload.government_logo_url = nextGovernmentLogoUrl;
  }

  if (nextBannerUrl !== undefined) {
    updatePayload.banner_url = nextBannerUrl;
  }

  const { error } = await supabase
    .from("site_settings")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    if (nextLogoUrl) {
      await deleteStorageFileByPublicUrl({
        supabase,
        publicUrl: nextLogoUrl,
      });
    }

    if (nextGovernmentLogoUrl) {
      await deleteStorageFileByPublicUrl({
        supabase,
        publicUrl: nextGovernmentLogoUrl,
      });
    }

    if (nextBannerUrl) {
      await deleteStorageFileByPublicUrl({
        supabase,
        publicUrl: nextBannerUrl,
      });
    }

    redirect(`/admin/setting?error=${encodeURIComponent(error.message)}`);
  }

  if (nextLogoUrl !== undefined) {
    await deleteStorageFileByPublicUrl({
      supabase,
      publicUrl: currentSetting.logo_url,
    });
  }

  if (nextGovernmentLogoUrl !== undefined) {
    await deleteStorageFileByPublicUrl({
      supabase,
      publicUrl: currentSetting.government_logo_url,
    });
  }

  if (nextBannerUrl !== undefined) {
    await deleteStorageFileByPublicUrl({
      supabase,
      publicUrl: currentSetting.banner_url,
    });
  }

  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/setting");

  redirect("/admin/setting?success=Setting website berhasil disimpan");
}
