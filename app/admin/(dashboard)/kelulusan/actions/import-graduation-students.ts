"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

type GraduationExcelRow = {
  nis?: string | number;
  nisn?: string | number;
  student_name?: string;
  class_name?: string;
  major?: string;
  status?: string;
  note?: string;

  student_photo_url?: string;

  birth_place?: string;
  birth_date?: string | number;
  gender?: string;

  graduation_letter_number?: string;
  graduation_letter_place?: string;
  graduation_letter_date?: string | number;

  religion_score?: string | number;
  pancila_score?: string | number;
  pancasila_score?: string | number;
  indonesian_score?: string | number;
  math_score?: string | number;
  science_score?: string | number;
  social_score?: string | number;
  pjok_score?: string | number;
  art_score?: string | number;
  total_score?: string | number;
  average_score?: string | number;
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim().replace(",", ".");
  const number = Number(normalized);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
}

function normalizeStatus(value: unknown) {
  const status = cleanText(value).toUpperCase().replace(/\s+/g, "_");

  if (status === "LULUS") {
    return "LULUS";
  }

  if (
    status === "TIDAK_LULUS" ||
    status === "TIDAKLULUS" ||
    status === "TIDAK LULUS"
  ) {
    return "TIDAK_LULUS";
  }

  return "";
}

export async function importGraduationStudents(formData: FormData) {
  let redirectUrl = "/admin/kelulusan";

  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("File Excel wajib diupload");
    }

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      throw new Error("Format file harus .xlsx atau .xls");
    }

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("Sheet Excel tidak ditemukan");
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<GraduationExcelRow>(worksheet, {
      defval: "",
    });

    if (!rows.length) {
      throw new Error("Data Excel kosong");
    }

    const students = rows.map((row, index) => {
      const rowNumber = index + 2;

      const nis = cleanText(row.nis);
      const nisn = cleanText(row.nisn);
      const studentName = cleanText(row.student_name);
      const className = cleanText(row.class_name);
      const major = cleanText(row.major);
      const status = normalizeStatus(row.status);
      const note = cleanText(row.note);
      const studentPhotoUrl = cleanText(row.student_photo_url);

      if (!nis && !nisn) {
        throw new Error(`Baris ${rowNumber}: NIS atau NISN wajib diisi`);
      }

      if (!studentName) {
        throw new Error(`Baris ${rowNumber}: student_name wajib diisi`);
      }

      if (!status) {
        throw new Error(
          `Baris ${rowNumber}: status wajib LULUS atau TIDAK_LULUS`
        );
      }

      return {
        nis: nis || null,
        nisn: nisn || null,
        student_name: studentName,
        class_name: className || null,
        major: major || null,
        status,
        note: note || null,

        student_photo_url: studentPhotoUrl || null,

        birth_place: cleanText(row.birth_place) || null,
        birth_date: cleanText(row.birth_date) || null,
        gender: cleanText(row.gender) || null,

        graduation_letter_number:
          cleanText(row.graduation_letter_number) || null,
        graduation_letter_place:
          cleanText(row.graduation_letter_place) || null,
        graduation_letter_date: cleanText(row.graduation_letter_date) || null,

        religion_score: cleanNumber(row.religion_score),
        pancasila_score: cleanNumber(
          row.pancasila_score || row.pancila_score
        ),
        indonesian_score: cleanNumber(row.indonesian_score),
        math_score: cleanNumber(row.math_score),
        science_score: cleanNumber(row.science_score),
        social_score: cleanNumber(row.social_score),
        pjok_score: cleanNumber(row.pjok_score),
        art_score: cleanNumber(row.art_score),
        total_score: cleanNumber(row.total_score),
        average_score: cleanNumber(row.average_score),
      };
    });

    const supabase = await createClient();

    const { error: deleteError } = await supabase
      .from("graduation_students")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: insertError } = await supabase
      .from("graduation_students")
      .insert(students);

    if (insertError) {
      throw new Error(insertError.message);
    }

    redirectUrl = `/admin/kelulusan?success=${encodeURIComponent(
      `${students.length} data kelulusan berhasil diimport`
    )}`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengimport data.";

    redirectUrl = `/admin/kelulusan?error=${encodeURIComponent(message)}`;
  }

  redirect(redirectUrl);
}