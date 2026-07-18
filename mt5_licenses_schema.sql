-- ============================================================
--  Schéma PostgreSQL — Licences MT5 (Gold Trading Bot)
--  À exécuter une seule fois sur ta base goldtradingbot.com
-- ============================================================

CREATE TABLE IF NOT EXISTS mt5_licenses (
    id              SERIAL PRIMARY KEY,

    -- Identité du client (simple pour l'instant, pas de FK vers une
    -- table "clients" puisqu'elle n'existe pas encore — tu pourras
    -- ajouter client_id plus tard si besoin)
    client_name     VARCHAR(120)        NOT NULL,
    client_email    VARCHAR(160)        NOT NULL,
    client_whatsapp VARCHAR(30),

    -- Identité du compte MT5 à autoriser
    account_number  BIGINT              NOT NULL,
    broker          VARCHAR(100)        NOT NULL DEFAULT '',
    server          VARCHAR(100)        NOT NULL DEFAULT '',

    -- Produit concerné : permet de vendre plusieurs EA sous la même
    -- table (JMEGOLD_DUAL, GOLD_SCALPER, GOLDDOUBLESTOP...).
    -- 'ALL' = licence valable pour tous tes EA.
    ea_name         VARCHAR(60)         NOT NULL DEFAULT 'ALL',

    -- Plan et paramètres de trading autorisés
    plan            VARCHAR(20)         NOT NULL DEFAULT 'Starter'
                        CHECK (plan IN ('Starter','Standard','Pro','VIP')),
    lot             NUMERIC(6,2)        NOT NULL DEFAULT 0.01,

    -- Statut et validité
    status          VARCHAR(20)         NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active','suspended','expired','cancelled')),
    expiry_date     DATE                NOT NULL,

    -- Suivi (rempli automatiquement par la route de vérification)
    last_check_at   TIMESTAMPTZ,
    last_check_ip   VARCHAR(60),
    check_count     INTEGER             NOT NULL DEFAULT 0,

    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Une licence par (compte MT5 + EA) : évite les doublons si un client
-- rachète/renouvelle, tu fais un UPDATE plutôt qu'un nouvel INSERT.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mt5_licenses_account_ea
    ON mt5_licenses (account_number, ea_name);

CREATE INDEX IF NOT EXISTS idx_mt5_licenses_expiry
    ON mt5_licenses (expiry_date);

-- Exemple d'insertion manuelle (à adapter/supprimer) :
-- INSERT INTO mt5_licenses
--   (client_name, client_email, account_number, broker, server, ea_name, plan, lot, status, expiry_date)
-- VALUES
--   ('Jean Test', 'jean@example.com', 12345678, 'IC Markets', 'ICMarkets-Live01', 'JMEGOLD_DUAL', 'Pro', 0.10, 'active', '2026-12-31');
