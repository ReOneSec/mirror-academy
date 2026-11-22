-- Mirror Academy — Initial migration
-- Creates courses and enquiries tables with RLS policies

-- Courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream text NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order int NOT NULL,
  is_active bool DEFAULT true
);

-- Enquiries table
CREATE TABLE enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  course_slug text REFERENCES courses(slug),
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Courses: public read only
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (true);

-- Enquiries: public insert only (no read/update/delete for anon)
CREATE POLICY "enquiries_public_insert" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Enquiries: authenticated role can read (for future admin)
CREATE POLICY "enquiries_admin_read" ON enquiries
  FOR SELECT USING (auth.role() = 'authenticated');
