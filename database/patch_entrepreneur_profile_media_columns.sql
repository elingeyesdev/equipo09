-- Parche para bases creadas con schema_mvp.sql ANTES de incluir avatar_url / cover_url
-- en entrepreneur_profiles. El backend inserta esas columnas al crear el perfil.
-- Ejecutar una vez en PostgreSQL (psql, DBeaver, etc.).

ALTER TABLE entrepreneur_profiles
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);

ALTER TABLE entrepreneur_profiles
  ADD COLUMN IF NOT EXISTS cover_url VARCHAR(512);
