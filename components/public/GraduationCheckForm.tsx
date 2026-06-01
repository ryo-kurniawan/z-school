"use client";

import { useState } from "react";

type GraduationStudent = {
  id: string;
  nis: string | null;
  nisn: string | null;
  student_name: string;
  class_name: string | null;
  major: string | null;
  status: "LULUS" | "TIDAK_LULUS";
  note: string | null;
  student_photo_url: string | null;
};

type ResultState = {
  success: boolean;
  message: string;
  student?: GraduationStudent;
};

function getStatusLabel(status: GraduationStudent["status"]) {
  if (status === "LULUS") {
    return "LULUS";
  }

  return "TIDAK LULUS";
}

export function GraduationCheckForm() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setResult(null);
    setPhotoError(false);

    try {
      const response = await fetch("/api/graduation/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
        }),
      });

      const data = await response.json();

      setResult(data);
    } catch {
      setResult({
        success: false,
        message: "Gagal mengecek data. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const student = result?.student;
  const isPassed = student?.status === "LULUS";

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-800">
            NIS / NISN
          </label>

          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Masukkan NIS atau NISN"
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Mengecek..." : "Cek Kelulusan"}
        </button>
      </form>

      {result ? (
        <div
          className={`mt-6 rounded-2xl border p-5 ${
            result.success
              ? isPassed
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-yellow-200 bg-yellow-50 text-yellow-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="text-sm leading-6">{result.message}</p>

          {student ? (
            <div className="mt-5">
              <div className="flex flex-col items-center text-center">
                {student.student_photo_url && !photoError ? (
                  <img
                    src={student.student_photo_url}
                    alt={`Foto ${student.student_name}`}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                    className="h-28 w-28 rounded-2xl border border-white/80 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-white/80 bg-white/70 text-xs font-medium text-gray-500 shadow-sm">
                    Tidak ada foto
                  </div>
                )}

                <h2 className="mt-4 text-xl font-bold text-gray-950">
                  {student.student_name}
                </h2>

                <div
                  className={`mt-2 rounded-full px-4 py-1 text-xs font-bold tracking-wide ${
                    isPassed
                      ? "bg-green-600 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {getStatusLabel(student.status)}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/70 p-4 text-sm text-gray-800">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      NIS
                    </p>
                    <p className="mt-1 font-semibold">{student.nis || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      NISN
                    </p>
                    <p className="mt-1 font-semibold">{student.nisn || "-"}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Kelas
                    </p>
                    <p className="mt-1 font-semibold">
                      {student.class_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Jurusan
                    </p>
                    <p className="mt-1 font-semibold">
                      {student.major || "-"}
                    </p>
                  </div>
                </div>

                {student.note ? (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Catatan
                    </p>
                    <p className="mt-1 leading-6">{student.note}</p>
                  </div>
                ) : null}
              </div>

              {isPassed ? (
                <a
                  href={`/api/graduation/${student.id}/skl`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Download SKL
                </a>
              ) : (
                <div className="mt-4 rounded-xl border border-yellow-200 bg-white/70 p-4 text-sm leading-6 text-yellow-800">
                  SKL hanya tersedia untuk siswa yang dinyatakan lulus.
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}