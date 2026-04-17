-- Birth year on profiles — platform is 18+.
-- Nullable because existing rows predate this requirement; all new registrations
-- go through /onboarding which enforces the age gate client + server-side.

alter table profiles
  add column if not exists birth_year int;

-- Reject values from the future or that put the user under 18.
-- Uses a year-only check (no month/day) — we only collect year-of-birth.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_birth_year_18plus'
  ) then
    alter table profiles
      add constraint profiles_birth_year_18plus
      check (
        birth_year is null
        or (
          birth_year >= 1900
          and birth_year <= extract(year from current_date)::int - 18
        )
      );
  end if;
end$$;
