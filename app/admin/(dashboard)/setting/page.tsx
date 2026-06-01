import { createClient } from "@/lib/supabase/server";
import { updateSiteSetting } from "./actions/update-setting";

type AdminSettingPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminSettingPage({
  searchParams,
}: AdminSettingPageProps) {
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  if (settingError) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal mengambil data setting: {settingError.message}
        </div>
      </main>
    );
  }

  return (
    <main className="w-full p-6">
      <div className="w-full max-w-none">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--primary)]">
          Admin
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-950">
          Setting Website
        </h1>

        <p className="mt-2 text-gray-600">
          Kelola informasi sekolah, profil website, dan pengaturan kelulusan.
        </p>

        {success ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          action={updateSiteSetting}
          className="mt-8 w-full"
        >
          <input type="hidden" name="id" defaultValue={setting.id} />

          <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,420px)]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Identitas Sekolah
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Nama Sekolah
                    </label>
                    <input
                      name="school_name"
                      type="text"
                      defaultValue={setting.school_name || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Jenjang Sekolah
                    </label>
                    <select
                      name="school_level"
                      defaultValue={setting.school_level || "sd"}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    >
                      <option value="sd">SD - Merah</option>
                      <option value="smp">SMP - Biru Dongker</option>
                      <option value="sma">SMA - Biru Muda / Abu-abu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      NPSN
                    </label>
                    <input
                      name="school_npsn"
                      type="text"
                      defaultValue={setting.school_npsn || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Kepala Sekolah
                    </label>
                    <input
                      name="headmaster_name"
                      type="text"
                      defaultValue={setting.headmaster_name || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Telepon
                    </label>
                    <input
                      name="phone"
                      type="text"
                      defaultValue={setting.phone || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={setting.email || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-800">
                      Website
                    </label>
                    <input
                      name="website"
                      type="text"
                      defaultValue={setting.website || ""}
                      placeholder="https://sekolah.sch.id"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-800">
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      defaultValue={setting.address || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Profil Sekolah
                </h2>

                <div className="mt-5 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Tentang Sekolah
                    </label>
                    <textarea
                      name="about"
                      rows={4}
                      defaultValue={setting.about || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Sejarah
                    </label>
                    <textarea
                      name="history"
                      rows={4}
                      defaultValue={setting.history || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Visi
                    </label>
                    <textarea
                      name="vision"
                      rows={3}
                      defaultValue={setting.vision || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Misi
                    </label>
                    <textarea
                      name="mission"
                      rows={4}
                      defaultValue={setting.mission || ""}
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Akreditasi
                    </label>
                    <input
                      name="accreditation"
                      type="text"
                      defaultValue={setting.accreditation || ""}
                      placeholder="Contoh: A"
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Pengaturan Kelulusan
                </h2>

                <div className="mt-5 space-y-5">
                  <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
                    <input
                      name="graduation_announcement_enabled"
                      type="checkbox"
                      defaultChecked={setting.graduation_announcement_enabled}
                      className="h-4 w-4 accent-[var(--primary)]"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      Aktifkan pengumuman kelulusan
                    </span>
                  </label>

                  <div>
                    <label className="text-sm font-medium text-gray-800">
                      Pesan Pengumuman
                    </label>
                    <textarea
                      name="graduation_message"
                      rows={3}
                      defaultValue={setting.graduation_message || ""}
                      placeholder="Contoh: Selamat kepada siswa yang dinyatakan lulus."
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Logo Sekolah
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Logo akan digunakan di header, dashboard, dan identitas
                  website.
                </p>

                {setting.logo_url ? (
                  <div className="mt-5 flex justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <img
                      src={setting.logo_url}
                      alt="Logo sekolah"
                      className="h-28 w-28 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-5 flex h-36 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                    Belum ada logo
                  </div>
                )}

                <input
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)] hover:file:opacity-90"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Format JPG, PNG, WebP, atau SVG. Maksimal 5MB.
                </p>

                {setting.logo_url ? (
                  <label className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                    <input
                      name="remove_logo"
                      type="checkbox"
                      className="h-4 w-4"
                    />
                    Hapus logo saat ini
                  </label>
                ) : null}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Logo Pemerintah Kabupaten
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Logo ini digunakan di kop surat SKL bagian kiri.
                </p>

                {setting.government_logo_url ? (
                  <div className="mt-5 flex justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6">
                    <img
                      src={setting.government_logo_url}
                      alt="Logo pemerintah kabupaten"
                      className="h-28 w-28 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-5 flex h-36 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                    Belum ada logo pemerintah
                  </div>
                )}

                <input
                  name="government_logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)] hover:file:opacity-90"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Format JPG, PNG, WebP, atau SVG. Maksimal 5MB.
                </p>

                {setting.government_logo_url ? (
                  <label className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                    <input
                      name="remove_government_logo"
                      type="checkbox"
                      className="h-4 w-4"
                    />
                    Hapus logo pemerintah saat ini
                  </label>
                ) : null}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-gray-950">
                  Banner Website
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Banner digunakan sebagai gambar utama di halaman publik.
                </p>

                {setting.banner_url ? (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    <img
                      src={setting.banner_url}
                      alt="Banner website"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-5 flex h-44 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                    Belum ada banner
                  </div>
                )}

                <input
                  name="banner"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)] hover:file:opacity-90"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Format JPG, PNG, atau WebP. Maksimal 5MB.
                </p>

                {setting.banner_url ? (
                  <label className="mt-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                    <input
                      name="remove_banner"
                      type="checkbox"
                      className="h-4 w-4"
                    />
                    Hapus banner saat ini
                  </label>
                ) : null}
              </section>
            </aside>
          </div>

          <div className="mt-6 flex justify-end rounded-2xl border border-gray-200 bg-white p-6">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              Simpan Setting
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}