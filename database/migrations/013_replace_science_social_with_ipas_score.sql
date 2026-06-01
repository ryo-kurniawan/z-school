-- =====================================================
-- Migration: 013_replace_science_social_with_ipas_score
-- Description:
-- Replace science_score and social_score with ipas_score
-- because current curriculum uses IPAS.
-- =====================================================

alter table public.graduation_students
  add column if not exists ipas_score numeric(5,2);

update public.graduation_students
set ipas_score =
  case
    when science_score is not null and social_score is not null
      then round(((science_score + social_score) / 2)::numeric, 2)
    when science_score is not null
      then science_score
    when social_score is not null
      then social_score
    else ipas_score
  end
where ipas_score is null;

alter table public.graduation_students
  drop column if exists science_score;

alter table public.graduation_students
  drop column if exists social_score;

notify pgrst, 'reload schema';