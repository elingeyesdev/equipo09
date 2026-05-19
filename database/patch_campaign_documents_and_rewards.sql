-- Cambio 1: Documentación de Respaldo para Campañas
CREATE TABLE IF NOT EXISTS campaign_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    file_url        VARCHAR(512) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100),
    file_size_bytes BIGINT,
    justification   TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_notes  TEXT,
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cambio 2: Categorías Múltiples (Tags) en lugar de Incentivo de Financiación
CREATE TABLE IF NOT EXISTS campaign_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, category_id)
);

-- Insertar las categorías existentes en la nueva tabla (Backward compatibility migration)
INSERT INTO campaign_categories (campaign_id, category_id)
SELECT id, category_id FROM campaigns WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Cambio 3: Recompensas por Nivel Alcanzado (Automáticas)
-- Validamos si las columnas existen antes de agregarlas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reward_tiers' AND column_name = 'min_percentage') THEN
        ALTER TABLE reward_tiers ADD COLUMN min_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (min_percentage >= 0 AND min_percentage <= 100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reward_tiers' AND column_name = 'max_percentage') THEN
        ALTER TABLE reward_tiers ADD COLUMN max_percentage NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (max_percentage >= 0 AND max_percentage <= 100);
    END IF;
END $$;
