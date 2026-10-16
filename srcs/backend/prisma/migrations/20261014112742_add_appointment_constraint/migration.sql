CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent double booking
ALTER TABLE appointments ADD CONSTRAINT appointment_no_overlap
  EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
  WHERE (status = 'confirmed');

-- Store emails strictly in lowercase
ALTER TABLE clients ADD CONSTRAINT clients_email_lowercase CHECK (email = lower(email));