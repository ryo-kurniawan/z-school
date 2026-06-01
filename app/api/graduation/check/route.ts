import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const STUDENT_SELECT = `
  id,
  student_name,
  nis,
  nisn,
  class_name,
  major,
  status,
  note,
  student_photo_url
`;

function cleanIdentifier(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = cleanIdentifier(body.identifier);

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "NIS atau NISN wajib diisi.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: setting, error: settingError } = await supabase
      .from("site_settings")
      .select("graduation_announcement_enabled, graduation_message")
      .limit(1)
      .maybeSingle();

    if (settingError) {
      console.error("Setting error:", settingError);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal membaca pengaturan kelulusan.",
        },
        { status: 500 },
      );
    }

    if (!setting?.graduation_announcement_enabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            setting?.graduation_message ||
            "Pengumuman kelulusan belum dibuka.",
        },
        { status: 403 },
      );
    }

    const { data: studentByNis, error: nisError } = await supabase
      .from("graduation_students")
      .select(STUDENT_SELECT)
      .eq("nis", identifier)
      .limit(1)
      .maybeSingle();

    if (nisError) {
      console.error("NIS search error:", nisError);

      return NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan saat mencari data siswa berdasarkan NIS.",
        },
        { status: 500 },
      );
    }

    let student = studentByNis;

    if (!student) {
      const { data: studentByNisn, error: nisnError } = await supabase
        .from("graduation_students")
        .select(STUDENT_SELECT)
        .eq("nisn", identifier)
        .limit(1)
        .maybeSingle();

      if (nisnError) {
        console.error("NISN search error:", nisnError);

        return NextResponse.json(
          {
            success: false,
            message:
              "Terjadi kesalahan saat mencari data siswa berdasarkan NISN.",
          },
          { status: 500 },
        );
      }

      student = studentByNisn;
    }

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Data siswa tidak ditemukan. Pastikan NIS/NISN benar.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        setting?.graduation_message ||
        "Berikut hasil pengumuman kelulusan Anda.",
      student,
    });
  } catch (error) {
    console.error("Graduation check request error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Request tidak valid.",
      },
      { status: 400 },
    );
  }
}