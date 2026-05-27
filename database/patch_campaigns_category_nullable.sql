-- patch_campaigns_category_nullable.sql
-- La columna category_id en campaigns era NOT NULL, pero el sistema ahora
-- gestiona categorías a través de la tabla campaign_categories (many-to-many).
-- Se permite NULL para no bloquear la creación de campañas.
ALTER TABLE campaigns ALTER COLUMN category_id DROP NOT NULL;
