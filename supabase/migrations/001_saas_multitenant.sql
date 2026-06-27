-- ═══════════════════════════════════════════════════════════════
-- SyndicPro → Migration SaaS Multi-Tenant
-- Exécuter dans Supabase SQL Editor (Settings → SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TABLE syndicats — un par client SaaS
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS syndicats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT NOT NULL,
  adresse     TEXT,
  email       TEXT,
  telephone   TEXT,
  pays        TEXT DEFAULT 'SN',
  devise      TEXT DEFAULT 'FCFA',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- 2. TABLE immeubles — N immeubles par syndicat
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS immeubles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicat_id         UUID REFERENCES syndicats(id) ON DELETE CASCADE,
  nom                 TEXT NOT NULL,
  adresse             TEXT,
  reference_fonciere  TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- 3. TABLE lots — N lots par immeuble
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id UUID REFERENCES immeubles(id) ON DELETE CASCADE,
  syndicat_id UUID,
  numero      INTEGER NOT NULL,
  appart      TEXT NOT NULL,
  proprio     TEXT,
  etage       TEXT,
  tantieme    INTEGER NOT NULL DEFAULT 0,
  cotisation  NUMERIC NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (immeuble_id, numero)
);

-- ───────────────────────────────────────────────────────────────
-- 4. SEED — Résidence Hélène (données pilote migrées)
--    IDs conservés pour compatibilité avec les paiements existants
-- ───────────────────────────────────────────────────────────────

INSERT INTO syndicats (id, nom, adresse, pays, devise)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Syndicat Résidence Hélène',
  'Grand Dakar, Sénégal',
  'SN',
  'FCFA'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO immeubles (id, syndicat_id, nom, adresse, reference_fonciere)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Résidence Hélène',
  'Grand Dakar, Sénégal',
  'TF 8.323/GR Grand Dakar'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO lots (id, immeuble_id, syndicat_id, numero, appart, proprio, etage, tantieme, cotisation) VALUES
  ('cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 1,'RDC droite', 'Babacar Diop',    'RDC',      516,  32242),
  ('cccccccc-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 2,'RDC gauche', 'Babacar Diop',    'RDC',      862,  53861),
  ('cccccccc-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 3,'1er droite', 'Absatou Touré',   '1er',      675,  42177),
  ('cccccccc-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 4,'1er gauche', 'Oumoul Faye',     '1er',      862,  53861),
  ('cccccccc-0000-0000-0000-000000000005','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 5,'2e droite',  'Zeinab Diop',     '2e',       675,  42177),
  ('cccccccc-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 6,'2e gauche',  'Birane Gueye',    '2e',       862,  53861),
  ('cccccccc-0000-0000-0000-000000000007','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 7,'3e droite',  'Wore Diop',       '3e',       680,  42489),
  ('cccccccc-0000-0000-0000-000000000008','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 8,'3e gauche',  'Yves',            '3e',       873,  54548),
  ('cccccccc-0000-0000-0000-000000000009','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 9,'4e droite',  'Mariama Touré',   '4e',       675,  42177),
  ('cccccccc-0000-0000-0000-000000000010','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',10,'4e gauche',  'Ndiaye Samb',     '4e',       868,  54236),
  ('cccccccc-0000-0000-0000-000000000011','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',11,'5e droite',  'Marie Dieye',     '5e',       675,  42177),
  ('cccccccc-0000-0000-0000-000000000012','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',12,'5e gauche',  'M. Diop et fils', '5e',       868,  54236),
  ('cccccccc-0000-0000-0000-000000000013','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',13,'Terrasse',   'Mme Fall',        'Terrasse', 909,  56798)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────────────────
-- 5. MISE À JOUR profiles — ajouter immeubles_ids
-- ───────────────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS immeubles_ids UUID[] DEFAULT '{}';

-- Remplir pour les profils existants de Résidence Hélène
UPDATE profiles
SET immeubles_ids = ARRAY['bbbbbbbb-0000-0000-0000-000000000001'::uuid]
WHERE syndicat_id = 'aaaaaaaa-0000-0000-0000-000000000001'
  AND (immeubles_ids IS NULL OR array_length(immeubles_ids, 1) IS NULL);

-- ───────────────────────────────────────────────────────────────
-- 6. RLS (Row-Level Security) — isolation par syndicat
-- ───────────────────────────────────────────────────────────────

-- Syndicats : lecture seule pour les membres
ALTER TABLE syndicats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "syndicats_member_read" ON syndicats FOR SELECT
  USING (id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid()));

-- Immeubles : lecture pour les membres du syndicat
ALTER TABLE immeubles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "immeubles_member_read" ON immeubles FOR SELECT
  USING (syndicat_id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "immeubles_admin_write" ON immeubles FOR ALL
  USING (syndicat_id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','concierge')));

-- Lots : lecture pour les membres du syndicat
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lots_member_read" ON lots FOR SELECT
  USING (syndicat_id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "lots_admin_write" ON lots FOR ALL
  USING (syndicat_id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','concierge')));
