import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const rows = [
    {
      nis: "12345",
      nisn: "0098765432",
      student_name: "Budi Santoso",
      class_name: "VI",
      major: "",
      status: "LULUS",
      note: "Selamat, Anda dinyatakan lulus.",

      student_photo_url: "https://picsum.photos/300/300",

      birth_place: "Boalemo",
      birth_date: "2012-03-02",
      gender: "Laki-Laki",

      graduation_letter_number: "421.2/SDN-03-MNG/001/VI/2025",
      graduation_letter_place: "Mananggu",
      graduation_letter_date: "2025-06-02",

      religion_score: 80.18,
      pancasila_score: 81.23,
      indonesian_score: 82.63,
      math_score: 82.5,
      ipas_score: 81.8,
      pjok_score: 80.88,
      art_score: 83.83,
      total_score: 573.05,
      average_score: 81.86,
    },
    {
      nis: "12346",
      nisn: "0098765433",
      student_name: "Siti Aminah",
      class_name: "VI",
      major: "",
      status: "TIDAK_LULUS",
      note: "Silakan menghubungi pihak sekolah.",

      student_photo_url: "https://picsum.photos/301/301",

      birth_place: "Boalemo",
      birth_date: "2012-06-20",
      gender: "Perempuan",

      graduation_letter_number: "",
      graduation_letter_place: "Mananggu",
      graduation_letter_date: "2025-06-02",

      religion_score: "",
      pancasila_score: "",
      indonesian_score: "",
      math_score: "",
      ipas_score: "",
      pjok_score: "",
      art_score: "",
      total_score: "",
      average_score: "",
    },
  ];

  const headers = [
    "nis",
    "nisn",
    "student_name",
    "class_name",
    "major",
    "status",
    "note",
    "student_photo_url",

    "birth_place",
    "birth_date",
    "gender",

    "graduation_letter_number",
    "graduation_letter_place",
    "graduation_letter_date",

    "religion_score",
    "pancasila_score",
    "indonesian_score",
    "math_score",
    "ipas_score",
    "pjok_score",
    "art_score",
    "total_score",
    "average_score",
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: headers,
  });

  worksheet["!cols"] = [
    { wch: 18 }, // nis
    { wch: 18 }, // nisn
    { wch: 32 }, // student_name
    { wch: 16 }, // class_name
    { wch: 16 }, // major
    { wch: 16 }, // status
    { wch: 40 }, // note
    { wch: 56 }, // student_photo_url

    { wch: 20 }, // birth_place
    { wch: 16 }, // birth_date
    { wch: 16 }, // gender

    { wch: 34 }, // graduation_letter_number
    { wch: 22 }, // graduation_letter_place
    { wch: 20 }, // graduation_letter_date

    { wch: 18 }, // religion_score
    { wch: 18 }, // pancasila_score
    { wch: 18 }, // indonesian_score
    { wch: 18 }, // math_score
    { wch: 18 }, // ipas_score
    { wch: 18 }, // pjok_score
    { wch: 18 }, // art_score
    { wch: 18 }, // total_score
    { wch: 18 }, // average_score
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Kelulusan");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="template-data-kelulusan-z-school.xlsx"',
    },
  });
}
