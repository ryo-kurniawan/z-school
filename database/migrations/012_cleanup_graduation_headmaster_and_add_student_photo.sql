-- =====================================================
-- Migration: 012_cleanup_graduation_headmaster_and_add_student_photo
-- Description:
-- - Move headmaster data responsibility to site_settings.
-- - Remove headmaster fields from graduation_students.
-- - Add student photo URL for public graduation result.
-- =====================================================

alter table public.site_settings
  add column if not exists headmaster_nip text;

alter table public.graduation_students
  add column if not exists student_photo_url text;

alter table public.graduation_students
  drop column if exists headmaster_name;

alter table public.graduation_students
  drop column if exists headmaster_nip;

notify pgrst, 'reload schema';