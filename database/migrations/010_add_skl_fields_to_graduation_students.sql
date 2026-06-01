-- =====================================================
-- Migration: 010_add_skl_fields_to_graduation_students
-- Description: Add SKL generation fields to graduation_students.
-- =====================================================

alter table public.graduation_students
  add column if not exists birth_place text,
  add column if not exists birth_date date,
  add column if not exists gender text,

  add column if not exists graduation_letter_number text,
  add column if not exists graduation_letter_place text,
  add column if not exists graduation_letter_date date,

  add column if not exists religion_score numeric(5,2),
  add column if not exists pancasila_score numeric(5,2),
  add column if not exists indonesian_score numeric(5,2),
  add column if not exists math_score numeric(5,2),
  add column if not exists science_score numeric(5,2),
  add column if not exists social_score numeric(5,2),
  add column if not exists pjok_score numeric(5,2),
  add column if not exists art_score numeric(5,2),

  add column if not exists total_score numeric(6,2),
  add column if not exists average_score numeric(5,2),

  add column if not exists headmaster_name text,
  add column if not exists headmaster_nip text;

alter table public.graduation_students
  drop constraint if exists graduation_students_gender_check;

alter table public.graduation_students
  add constraint graduation_students_gender_check
  check (
    gender is null
    or gender in ('Laki-Laki', 'Perempuan')
  );

alter table public.graduation_students
  drop constraint if exists graduation_students_scores_check;

alter table public.graduation_students
  add constraint graduation_students_scores_check
  check (
    (religion_score is null or religion_score between 0 and 100)
    and (pancasila_score is null or pancasila_score between 0 and 100)
    and (indonesian_score is null or indonesian_score between 0 and 100)
    and (math_score is null or math_score between 0 and 100)
    and (science_score is null or science_score between 0 and 100)
    and (social_score is null or social_score between 0 and 100)
    and (pjok_score is null or pjok_score between 0 and 100)
    and (art_score is null or art_score between 0 and 100)
    and (total_score is null or total_score between 0 and 1000)
    and (average_score is null or average_score between 0 and 100)
  );

create index if not exists idx_graduation_students_birth_date
on public.graduation_students (birth_date);

create index if not exists idx_graduation_students_graduation_letter_date
on public.graduation_students (graduation_letter_date);