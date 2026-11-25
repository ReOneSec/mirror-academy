-- Mirror Academy: columns the registration form writes, and the Interview batch.
-- Safe to run more than once.

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS batch_type text DEFAULT 'Free batch';
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS address text;

-- Drop any existing CHECK on batch_type, then allow the three batches.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'enquiries'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%batch_type%'
  LOOP
    EXECUTE format('ALTER TABLE enquiries DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE enquiries ADD CONSTRAINT enquiries_batch_type_check
  CHECK (batch_type IN ('Free batch', 'Paid batch', 'Interview batch'));
