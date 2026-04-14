-- Parche para agregar columnas de avatar y cover al perfil de inversor.
-- Ejecutar una vez en PostgreSQL (psql, DBeaver, etc.).

ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);

ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS cover_url VARCHAR(512);
