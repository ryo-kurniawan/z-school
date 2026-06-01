-- =====================================================
-- Migration: 011_add_government_logo_to_site_settings
-- Description: Add government logo URL for SKL letterhead.
-- =====================================================

alter table public.site_settings
  add column if not exists government_logo_url text;

notify pgrst, 'reload schema';