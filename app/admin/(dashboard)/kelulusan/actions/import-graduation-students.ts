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
  ipas_score?: string | number;
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

function normalizeGoogleDriveImageUrl(value: unknown) {
  const url = cleanText(value);

  if (!url) {
    return "";
  }

  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  const idMatch = url.match(/[?&]id=([^&]+)/);

  const fileId = fileMatch?.[1] || idMatch?.[1];

  if (!fileId) {
    return url;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`;
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

    const students = rows
      .map((row, index) => {
        const nis = cleanText(row.nis);
        const nisn = cleanText(row.nisn);
        const studentName = cleanText(row.student_name);
        const className = cleanText(row.class_name);
        const major = cleanText(row.major);
        const statusText = cleanText(row.status);
        const status = normalizeStatus(row.status);
        const note = cleanText(row.note);

        const studentPhotoUrl = normalizeGoogleDriveImageUrl(
          row.student_photo_url,
        );

        const birthPlace = cleanText(row.birth_place);
        const birthDate = cleanText(row.birth_date);
        const gender = cleanText(row.gender);

        const graduationLetterNumber = cleanText(
          row.graduation_letter_number,
        );
        const graduationLetterPlace = cleanText(row.graduation_letter_place);
        const graduationLetterDate = cleanText(row.graduation_letter_date);

        const religionScore = cleanNumber(row.religion_score);
        const pancasilaScore = cleanNumber(
          row.pancasila_score || row.pancila_score,
        );
        const indonesianScore = cleanNumber(row.indonesian_score);
        const mathScore = cleanNumber(row.math_score);
        const ipasScore = cleanNumber(row.ipas_score);
        const pjokScore = cleanNumber(row.pjok_score);
        const artScore = cleanNumber(row.art_score);
        const totalScore = cleanNumber(row.total_score);
        const averageScore = cleanNumber(row.average_score);

        const rowNumber = index + 2;

        const isEmptyRow =
          !nis &&
          !nisn &&
          !studentName &&
          !className &&
          !major &&
          !statusText &&
          !note &&
          !studentPhotoUrl &&
          !birthPlace &&
          !birthDate &&
          !gender &&
          !graduationLetterNumber &&
          !graduationLetterPlace &&
          !graduationLetterDate &&
          religionScore === null &&
          pancasilaScore === null &&
          indonesianScore === null &&
          mathScore === null &&
          ipasScore === null &&
          pjokScore === null &&
          artScore === null &&
          totalScore === null &&
          averageScore === null;

        if (isEmptyRow) {
          return null;
        }

        if (!nis && !nisn) {
          throw new Error(`Baris ${rowNumber}: NIS atau NISN wajib diisi`);
        }

        if (!studentName) {
          throw new Error(`Baris ${rowNumber}: student_name wajib diisi`);
        }

        if (!status) {
          throw new Error(
            `Baris ${rowNumber}: status wajib LULUS atau TIDAK_LULUS`,
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

          birth_place: birthPlace || null,
          birth_date: birthDate || null,
          gender: gender || null,

          graduation_letter_number: graduationLetterNumber || null,
          graduation_letter_place: graduationLetterPlace || null,
          graduation_letter_date: graduationLetterDate || null,

          religion_score: religionScore,
          pancasila_score: pancasilaScore,
          indonesian_score: indonesianScore,
          math_score: mathScore,
          ipas_score: ipasScore,
          pjok_score: pjokScore,
          art_score: artScore,
          total_score: totalScore,
          average_score: averageScore,
        };
      })
      .filter((student): student is NonNullable<typeof student> => {
        return student !== null;
      });

    if (!students.length) {
      throw new Error("Data Excel kosong");
    }

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
      `${students.length} data kelulusan berhasil diimport`,
    )}`;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengimport data.";

    redirectUrl = `/admin/kelulusan?error=${encodeURIComponent(message)}`;
  }

  redirect(redirectUrl);
}