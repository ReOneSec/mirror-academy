-- 004: Notice board. Safe to run more than once.
-- Admins post notices from /admin (server API, service role). Anyone can read published ones.

CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 150),
  body text CHECK (body IS NULL OR char_length(body) <= 3000),
  link_url text,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notices_list_idx ON notices (published, pinned DESC, created_at DESC);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published notices" ON notices;
CREATE POLICY "Public can read published notices"
  ON notices FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Public bucket for notice PDFs and images (max 4 MB each).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('notices', 'notices', true, 4194304,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- First notice, pinned. Added only once.
INSERT INTO notices (title, body, link_url, pinned, published, created_at)
SELECT
  'WBPSC Clerkship Part-I exam: 26 and 27 December 2026',
  'Admit cards will be available from 14 December 2026 at psc.wb.gov.in.',
  'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement',
  true, true, '2026-11-25 10:46:00+05:30'
WHERE NOT EXISTS (
  SELECT 1 FROM notices WHERE title = 'WBPSC Clerkship Part-I exam: 26 and 27 December 2026'
);
