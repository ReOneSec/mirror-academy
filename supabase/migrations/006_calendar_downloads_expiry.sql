-- 006: Notice expiry, exam calendar, downloads. Safe to run more than once.

-- Notices: optional last day to show (IST). After that day the notice hides itself.
ALTER TABLE notices ADD COLUMN IF NOT EXISTS expires_on date;

-- The WBPSC Clerkship notice stops showing after the exam (27 Dec 2026), unless already set.
UPDATE notices SET expires_on = '2026-12-27'
WHERE title = 'WBPSC Clerkship Part-I exam: 26 and 27 December 2026' AND expires_on IS NULL;

-- Exam calendar: exam dates, admit cards, results, applications, with official links.
CREATE TABLE IF NOT EXISTS exam_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam text NOT NULL CHECK (char_length(exam) BETWEEN 1 AND 120),
  kind text NOT NULL DEFAULT 'exam' CHECK (kind IN ('exam', 'admit_card', 'result', 'application', 'other')),
  starts_on date NOT NULL,
  ends_on date CHECK (ends_on IS NULL OR ends_on >= starts_on),
  note text CHECK (note IS NULL OR char_length(note) <= 300),
  link_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exam_events_list_idx ON exam_events (published, starts_on);

ALTER TABLE exam_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published exam events" ON exam_events;
CREATE POLICY "Public can read published exam events"
  ON exam_events FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- First entries: WBPSC Clerkship Part-I (from the official WBPSC announcement). Added only once.
INSERT INTO exam_events (exam, kind, starts_on, ends_on, note, link_url)
SELECT 'WBPSC Clerkship Part-I', 'admit_card', '2026-12-14', NULL,
       'Admit cards available at psc.wb.gov.in',
       'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement'
WHERE NOT EXISTS (SELECT 1 FROM exam_events WHERE exam = 'WBPSC Clerkship Part-I' AND kind = 'admit_card');

INSERT INTO exam_events (exam, kind, starts_on, ends_on, note, link_url)
SELECT 'WBPSC Clerkship Part-I', 'exam', '2026-12-26', '2026-12-27', NULL,
       'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement'
WHERE NOT EXISTS (SELECT 1 FROM exam_events WHERE exam = 'WBPSC Clerkship Part-I' AND kind = 'exam');

-- Downloads: syllabus PDFs, previous year papers, study material, official notifications.
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  category text NOT NULL DEFAULT 'study_material'
    CHECK (category IN ('syllabus', 'previous_papers', 'study_material', 'notification')),
  exam text CHECK (exam IS NULL OR char_length(exam) <= 80),
  file_path text,
  file_name text,
  file_type text,
  file_size integer,
  link_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (file_path IS NOT NULL OR link_url IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS downloads_list_idx ON downloads (published, category, created_at DESC);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published downloads" ON downloads;
CREATE POLICY "Public can read published downloads"
  ON downloads FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Public bucket for download files (PDF or image, max 25 MB each). Admin uploads go straight
-- from the browser through a one-time signed URL made by the server, so large PDFs work.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('downloads', 'downloads', true, 26214400,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- First download: the official WBPSC Clerkship announcement (link to psc.wb.gov.in). Added only once.
INSERT INTO downloads (title, category, exam, link_url)
SELECT 'WBPSC Clerkship exam announcement (official PDF)', 'notification', 'Clerkship',
       'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement'
WHERE NOT EXISTS (SELECT 1 FROM downloads WHERE title = 'WBPSC Clerkship exam announcement (official PDF)');
