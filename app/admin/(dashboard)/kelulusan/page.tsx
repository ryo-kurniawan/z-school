import { createClient } from "@/lib/supabase/server";
import { importGraduationStudents } from "./actions/import-graduation-students";
import { deleteGraduationStudents } from "./actions/delete-graduation-students";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

type AdminKelulusanPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminKelulusanPage({
  searchParams,
}: AdminKelulusanPageProps) {
  const { success, error } = await searchParams;

  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("graduation_students")
    .select(
      "id, nis, nisn, student_name, student_photo_url, class_name, major, status, note",
    )
    .order("student_name", { ascending: true })
    .limit(100);

  const { count: totalStudents } = await supabase
    .from("graduation_students")
    .select("*", { count: "exact", head: true });

  return (
    <main className="p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--primary)]">
            Admin
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-950">
            Data Kelulusan
          </h1>

          <p className="mt-2 text-gray-600">
            Upload data kelulusan siswa melalui file Excel.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-right shadow-sm">
          <p className="text-sm text-gray-500">Total Data</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {totalStudents ?? 0}
          </p>
        </div>
      </div>

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

      {studentsError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal mengambil data kelulusan: {studentsError.message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-950">Import Excel</h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Upload file Excel dengan format kolom yang sudah ditentukan. Proses
            import akan mengganti semua data kelulusan lama.
          </p>

          <div className="mt-5 rounded-xl bg-[var(--secondary)] p-4 text-sm leading-6 text-[var(--secondary-foreground)]">
            <p className="font-semibold">Format kolom:</p>
            <p className="mt-1">
              nis, nisn, student_name, class_name, major, status, note,
              student_photo_url, birth_place, birth_date, gender,
              graduation_letter_number, graduation_letter_place,
              graduation_letter_date, religion_score, pancasila_score,
              indonesian_score, math_score, ipas_score,
              pjok_score, art_score, total_score, average_score
            </p>
          </div>
          <a
            href="/api/admin/graduation/template"
            className="mt-4 block rounded-xl border border-gray-300 px-5 py-3 text-center text-sm font-medium text-gray-700 transition hover:border-[var(--primary)] hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
          >
            Download Template Excel
          </a>

          <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
            <p className="font-semibold">Catatan:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Kolom <strong>student_name</strong> dan <strong>status</strong>{" "}
                wajib diisi.
              </li>
              <li>
                Minimal salah satu dari <strong>nis</strong> atau{" "}
                <strong>nisn</strong> wajib diisi.
              </li>
              <li>
                Status hanya boleh <strong>LULUS</strong> atau{" "}
                <strong>TIDAK_LULUS</strong>.
              </li>
              <li>
                Format kolom NIS/NISN di Excel sebaiknya dibuat sebagai Text.
              </li>
            </ul>
          </div>

          <form action={importGraduationStudents} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-800">
                File Excel
              </label>

              <input
                name="file"
                type="file"
                accept=".xlsx,.xls"
                required
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--primary-foreground)]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              Import Data
            </button>
          </form>

          <form action={deleteGraduationStudents} className="mt-4">
            <ConfirmDeleteButton
              label="Hapus Semua Data"
              message="Yakin ingin menghapus semua data kelulusan? Tindakan ini tidak bisa dibatalkan."
              className="w-full rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
            />
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-950">
              Preview Data
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Menampilkan maksimal 100 data pertama.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4 font-medium">Foto</th>
                  <th className="px-5 py-4 font-medium">Nama</th>
                  <th className="px-5 py-4 font-medium">NIS</th>
                  <th className="px-5 py-4 font-medium">NISN</th>
                  <th className="px-5 py-4 font-medium">Kelas</th>
                  <th className="px-5 py-4 font-medium">Jurusan</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {students?.length ? (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-5 py-4">
                        {student.student_photo_url ? (
                          <img
                            src={student.student_photo_url}
                            alt={`Foto ${student.student_name}`}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            -
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-950">
                        {student.student_name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.nis || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.nisn || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.class_name || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.major || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            student.status === "LULUS"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {student.status === "LULUS" ? "Lulus" : "Tidak Lulus"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Belum ada data kelulusan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
