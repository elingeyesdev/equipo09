-- ============================================================================
-- SEED: Reward Tiers de prueba para campañas publicadas
-- Ejecutar UNA VEZ en PostgreSQL (psql, DBeaver, etc.)
-- ============================================================================

-- Este script inserta 3 niveles de recompensa para CADA campaña publicada
-- de tipo 'reward' que NO tenga reward tiers todavía.

-- Nivel 1: Básico
INSERT INTO reward_tiers (campaign_id, title, description, amount, currency, max_claims, estimated_delivery, sort_order)
SELECT 
    c.id,
    'Apoyo Básico',
    'Recibirás un agradecimiento personalizado del emprendedor y acceso anticipado a las actualizaciones del proyecto.',
    25.00,
    'USD',
    NULL,  -- sin límite
    (c.end_date + INTERVAL '30 days')::date,
    1
FROM campaigns c
WHERE c.status IN ('published', 'funded', 'partially_funded')
  AND c.campaign_type = 'reward'
  AND NOT EXISTS (SELECT 1 FROM reward_tiers rt WHERE rt.campaign_id = c.id);

-- Nivel 2: Intermedio
INSERT INTO reward_tiers (campaign_id, title, description, amount, currency, max_claims, estimated_delivery, sort_order)
SELECT 
    c.id,
    'Patrocinador',
    'Incluye todo lo del nivel anterior, más un kit exclusivo con merchandising del proyecto y tu nombre en la lista de patrocinadores oficiales.',
    100.00,
    'USD',
    50,  -- máximo 50 claims
    (c.end_date + INTERVAL '60 days')::date,
    2
FROM campaigns c
WHERE c.status IN ('published', 'funded', 'partially_funded')
  AND c.campaign_type = 'reward'
  AND EXISTS (
      SELECT 1 FROM reward_tiers rt WHERE rt.campaign_id = c.id AND rt.title = 'Apoyo Básico'
  )
  AND NOT EXISTS (
      SELECT 1 FROM reward_tiers rt WHERE rt.campaign_id = c.id AND rt.title = 'Patrocinador'
  );

-- Nivel 3: Premium
INSERT INTO reward_tiers (campaign_id, title, description, amount, currency, max_claims, estimated_delivery, sort_order)
SELECT 
    c.id,
    'Inversionista VIP',
    'Acceso completo a todos los beneficios anteriores, además de una reunión virtual con el equipo fundador, acceso beta al producto y mención especial en el lanzamiento.',
    500.00,
    'USD',
    10,  -- solo 10 disponibles
    (c.end_date + INTERVAL '90 days')::date,
    3
FROM campaigns c
WHERE c.status IN ('published', 'funded', 'partially_funded')
  AND c.campaign_type = 'reward'
  AND EXISTS (
      SELECT 1 FROM reward_tiers rt WHERE rt.campaign_id = c.id AND rt.title = 'Patrocinador'
  )
  AND NOT EXISTS (
      SELECT 1 FROM reward_tiers rt WHERE rt.campaign_id = c.id AND rt.title = 'Inversionista VIP'
  );

-- ============================================================================
-- Verificación: ver lo que se insertó
-- ============================================================================
SELECT 
    c.title AS campaña,
    rt.title AS recompensa,
    rt.amount AS monto,
    rt.max_claims AS limite,
    rt.estimated_delivery AS entrega
FROM reward_tiers rt
JOIN campaigns c ON rt.campaign_id = c.id
ORDER BY c.title, rt.amount;
