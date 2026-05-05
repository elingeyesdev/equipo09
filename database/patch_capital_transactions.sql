-- =============================================================================
-- PATCH: capital_transactions
-- Tabla de historial de inyecciones de capital para inversores.
-- Compatible con schema.sql (completo).
-- =============================================================================

CREATE TABLE capital_transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount        NUMERIC(18,2)  NOT NULL CHECK (amount > 0),
    type          VARCHAR(20)    NOT NULL DEFAULT 'deposit'
                  CHECK (type IN ('deposit', 'withdrawal')),
    previous_max  NUMERIC(18,2)  NOT NULL,
    new_max       NUMERIC(18,2)  NOT NULL,
    notes         TEXT,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capital_transactions_user_id ON capital_transactions(user_id);
CREATE INDEX idx_capital_transactions_created_at ON capital_transactions(created_at DESC);

COMMENT ON TABLE capital_transactions IS 'Historial de inyecciones/retiros de capital simulado de inversores. Auditoría completa.';
