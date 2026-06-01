import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type ImageData = {
  dataUrl: string;
  format: "PNG";
};

function formatDateIndonesian(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatScore(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return String(value);
  }

  return number.toFixed(2);
}

function safeFileName(value: string) {
  return value
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toUpperCase();
}

async function imageUrlToDataUrl(url?: string | null): Promise<ImageData | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Logo fetch failed:", {
        url,
        status: response.status,
        statusText: response.statusText,
      });

      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const pngBuffer = await sharp(inputBuffer)
      .resize({
        width: 512,
        height: 512,
        fit: "contain",
        background: {
          r: 0,
          g: 0,
          b: 0,
          alpha: 0,
        },
      })
      .png()
      .toBuffer();

    const base64 = pngBuffer.toString("base64");

    return {
      dataUrl: `data:image/png;base64,${base64}`,
      format: "PNG",
    };
  } catch (error) {
    console.error("Logo convert failed:", error);
    return null;
  }
}

function addCenteredText(
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
  }
) {
  doc.setFontSize(options?.fontSize || 11);
  doc.setFont("times", options?.fontStyle || "normal");
  doc.text(text, 105, y, {
    align: "center",
  });
}

function addLogo(
  doc: jsPDF,
  image: ImageData | null,
  x: number,
  y: number,
  size: number
) {
  if (!image) return;

  try {
    doc.addImage(image.dataUrl, image.format, x, y, size, size);
  } catch (error) {
    console.error("addImage failed:", error);
  }
}

function addRowText(doc: jsPDF, label: string, value: string, y: number) {
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);

  doc.text(label, 30, y);
  doc.text(":", 78, y);
  doc.text(value || "-", 83, y);
}

function addScoreTable(
  doc: jsPDF,
  subjects: Array<{
    name: string;
    score: string;
  }>,
  totalScore: string,
  averageScore: string,
  startY: number
) {
  const tableX = 25;
  const tableWidth = 160;

  const noWidth = 12;
  const scoreWidth = 25;
  const subjectWidth = tableWidth - noWidth - scoreWidth;

  const rowHeight = 7;
  const totalRows = 1 + subjects.length + 2;
  const tableHeight = totalRows * rowHeight;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);

  doc.rect(tableX, startY, tableWidth, tableHeight);

  doc.line(tableX + noWidth, startY, tableX + noWidth, startY + tableHeight);
  doc.line(
    tableX + noWidth + subjectWidth,
    startY,
    tableX + noWidth + subjectWidth,
    startY + tableHeight
  );

  for (let i = 1; i < totalRows; i++) {
    const y = startY + i * rowHeight;
    doc.line(tableX, y, tableX + tableWidth, y);
  }

  doc.setFont("times", "bold");
  doc.setFontSize(10);

  doc.text("No.", tableX + noWidth / 2, startY + 4.7, {
    align: "center",
  });

  doc.text(
    "Mata Pelajaran",
    tableX + noWidth + subjectWidth / 2,
    startY + 4.7,
    {
      align: "center",
    }
  );

  doc.text(
    "Nilai",
    tableX + noWidth + subjectWidth + scoreWidth / 2,
    startY + 4.7,
    {
      align: "center",
    }
  );

  doc.setFont("times", "normal");
  doc.setFontSize(9.8);

  subjects.forEach((subject, index) => {
    const y = startY + (index + 1) * rowHeight;

    doc.text(`${index + 1}.`, tableX + noWidth / 2, y + 4.7, {
      align: "center",
    });

    doc.text(subject.name, tableX + noWidth + 3, y + 4.7);

    doc.text(
      subject.score,
      tableX + noWidth + subjectWidth + scoreWidth / 2,
      y + 4.7,
      {
        align: "center",
      }
    );
  });

  const totalY = startY + (subjects.length + 1) * rowHeight;
  const averageY = startY + (subjects.length + 2) * rowHeight;

  doc.setFont("times", "bold");

  doc.text("Jumlah Nilai", tableX + noWidth + subjectWidth / 2, totalY + 4.7, {
    align: "center",
  });

  doc.text(
    totalScore,
    tableX + noWidth + subjectWidth + scoreWidth / 2,
    totalY + 4.7,
    {
      align: "center",
    }
  );

  doc.text(
    "Rata-Rata Nilai",
    tableX + noWidth + subjectWidth / 2,
    averageY + 4.7,
    {
      align: "center",
    }
  );

  doc.text(
    averageScore,
    tableX + noWidth + subjectWidth + scoreWidth / 2,
    averageY + 4.7,
    {
      align: "center",
    }
  );

  return startY + tableHeight;
}

function generateSklPdf({
  student,
  setting,
  governmentLogo,
  schoolLogo,
}: {
  student: any;
  setting: any;
  governmentLogo: ImageData | null;
  schoolLogo: ImageData | null;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const schoolName = setting?.school_name || "SD NEGERI 03 MANANGGU";
  const schoolAddress =
    setting?.address ||
    "Jln. Irigasi, Desa Bendungan, Kec. Mananggu, Kab. Boalemo Pos : 96265";
  const schoolEmail = setting?.email || "sdntigamananggu@gmail.com";
  const schoolPhone = setting?.phone || "-";

  const letterPlace = student.graduation_letter_place || "Mananggu";
  const letterDate = formatDateIndonesian(student.graduation_letter_date);

  const headmasterName = setting?.headmaster_name || "-";
  const headmasterNip = setting?.headmaster_nip || "-";

  const pageWidth = 210;

  addLogo(doc, governmentLogo, 22, 14, 23);
  addLogo(doc, schoolLogo, 165, 14, 23);

  addCenteredText(doc, "PEMERINTAH KABUPATEN BOALEMO", 17, {
    fontSize: 13,
    fontStyle: "bold",
  });

  addCenteredText(doc, schoolName, 23, {
    fontSize: 14,
    fontStyle: "bold",
  });

  addCenteredText(doc, schoolAddress, 28, {
    fontSize: 9,
  });

  addCenteredText(doc, `Email : ${schoolEmail} Telp : ${schoolPhone}`, 33, {
    fontSize: 9,
  });

  doc.setLineWidth(0.5);
  doc.line(20, 39, 190, 39);

  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("SURAT KETERANGAN LULUS", pageWidth / 2, 49, {
    align: "center",
  });

  doc.setLineWidth(0.2);
  doc.line(74, 50, 136, 50);

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text(
    `Nomor : ${
      student.graduation_letter_number || "421.2/SDN-03-MNG/          /VI/2025"
    }`,
    pageWidth / 2,
    56,
    {
      align: "center",
    }
  );

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text(
    `Yang bertanda tangan di bawah ini Kepala ${schoolName} menerangkan bahwa :`,
    25,
    68
  );

  addRowText(doc, "N a m a", student.student_name || "-", 80);
  addRowText(
    doc,
    "Tempat, Tanggal Lahir",
    `${student.birth_place || "-"}, ${formatDateIndonesian(student.birth_date)}`,
    87
  );
  addRowText(doc, "Jenis Kelamin", student.gender || "-", 94);
  addRowText(doc, "NIS", student.nis || "-", 101);
  addRowText(doc, "N I S N", student.nisn || "-", 108);

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text(
    "Berdasarkan kriteria kelulusan peserta didik yang sudah ditetapkan, maka yang bersangkutan dinyatakan :",
    25,
    121
  );

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("L U L U S", pageWidth / 2, 135, {
    align: "center",
  });

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text("Dengan hasil sebagai berikut :", 25, 145);

  const subjects = [
    {
      name: "Pendidikan Agama dan Budi Pekerti",
      score: formatScore(student.religion_score),
    },
    {
      name: "Pendidikan Pancasila",
      score: formatScore(student.pancasila_score),
    },
    {
      name: "Bahasa Indonesia",
      score: formatScore(student.indonesian_score),
    },
    {
      name: "Matematika",
      score: formatScore(student.math_score),
    },
    {
      name: "Ilmu Pengetahuan Alam",
      score: formatScore(student.science_score),
    },
    {
      name: "Ilmu Pengetahuan Sosial",
      score: formatScore(student.social_score),
    },
    {
      name: "Pendidikan Jasmani, Olahraga, dan Kesehatan",
      score: formatScore(student.pjok_score),
    },
    {
      name: "Seni, Budaya, dan Prakarya",
      score: formatScore(student.art_score),
    },
  ];

  const tableEndY = addScoreTable(
    doc,
    subjects,
    formatScore(student.total_score),
    formatScore(student.average_score),
    149
  );

  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.text(
    "Demikian surat keterangan ini di buat, untuk dapat di pergunakan sebagaimana mestinya.",
    25,
    tableEndY + 11
  );

  const signatureX = 137;
  const signatureY = tableEndY + 25;

  doc.text(`${letterPlace}, ${letterDate}`, signatureX, signatureY);
  doc.text("Kepala Sekolah", signatureX, signatureY + 6);

  doc.setFont("times", "bold");
  doc.text(headmasterName, signatureX, signatureY + 34);

  doc.setLineWidth(0.2);
  doc.line(signatureX, signatureY + 35, signatureX + 48, signatureY + 35);

  doc.setFont("times", "normal");
  doc.text(`NIP. ${headmasterNip}`, signatureX, signatureY + 41);

  return doc;
}

export async function GET(_request: Request, context: RouteParams) {
  const { id } = await context.params;

  const supabase = await createClient();

  const { data: setting, error: settingError } = await supabase
    .from("site_settings")
    .select(
      `
      school_name,
      headmaster_name,
      headmaster_nip,
      address,
      email,
      phone,
      logo_url,
      government_logo_url
    `
    )
    .limit(1)
    .maybeSingle();

  if (settingError) {
    console.error("SKL setting error:", settingError);

    return NextResponse.json(
      {
        message: "Gagal mengambil pengaturan sekolah.",
        detail: settingError.message,
      },
      { status: 500 }
    );
  }

  const { data: student, error: studentError } = await supabase
    .from("graduation_students")
    .select(
      `
      id,
      nis,
      nisn,
      student_name,
      class_name,
      major,
      status,
      note,
      student_photo_url,
      birth_place,
      birth_date,
      gender,
      graduation_letter_number,
      graduation_letter_place,
      graduation_letter_date,
      religion_score,
      pancasila_score,
      indonesian_score,
      math_score,
      science_score,
      social_score,
      pjok_score,
      art_score,
      total_score,
      average_score
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (studentError) {
    console.error("SKL student error:", studentError);

    return NextResponse.json(
      {
        message: "Gagal mengambil data siswa.",
        detail: studentError.message,
      },
      { status: 500 }
    );
  }

  if (!student) {
    return NextResponse.json(
      { message: "Data siswa tidak ditemukan." },
      { status: 404 }
    );
  }

  if (student.status !== "LULUS") {
    return NextResponse.json(
      { message: "SKL hanya tersedia untuk siswa yang dinyatakan lulus." },
      { status: 403 }
    );
  }

  const governmentLogo = await imageUrlToDataUrl(setting?.government_logo_url);
  const schoolLogo = await imageUrlToDataUrl(setting?.logo_url);

  const doc = generateSklPdf({
    student,
    setting,
    governmentLogo,
    schoolLogo,
  });

  const pdfArrayBuffer = doc.output("arraybuffer");

  const fileName = `SKL-${safeFileName(student.student_name)}.pdf`;

  return new NextResponse(pdfArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}