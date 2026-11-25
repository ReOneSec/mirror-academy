-- Mirror Academy: team notes and follow-up date per registration, plus a lookup index
-- for the duplicate check. Safe to run more than once.

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS follow_up_date date;

CREATE INDEX IF NOT EXISTS enquiries_phone_course_idx ON enquiries (phone, course_slug);
