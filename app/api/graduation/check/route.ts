import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim();

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: "NIS atau NISN wajib diisi.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: setting, error: settingError } = await supabase
      .from("site_settings")
      .select("graduation_announcement_enabled, graduation_message")
      .limit(1)
      .maybeSingle();

    if (settingError) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal membaca pengaturan kelulusan.",
        },
        { status: 500 }
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
        { status: 403 }
      );
    }

    const { data: student, error: studentError } = await supabase
      .from("graduation_students")
      .select(
        `
        id,
        student_name,
        nis,
        nisn,
        class_name,
        major,
        status,
        note,
        student_photo_url
      `
      )
      .or(`nis.eq.${identifier},nisn.eq.${identifier}`)
      .maybeSingle();

    if (studentError) {
      return NextResponse.json(
        {
          success: false,
          message: "Terjadi kesalahan saat mencari data siswa.",
        },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Data siswa tidak ditemukan. Pastikan NIS/NISN benar.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        setting?.graduation_message ||
        "Berikut hasil pengumuman kelulusan Anda.",
      student,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Request tidak valid.",
      },
      { status: 400 }
    );
  }
}