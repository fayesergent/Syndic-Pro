-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLÈTE — SyndicPro vers syndicpro-prod
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-05
--
-- ✅ Exécuter dans Supabase SQL Editor (Settings → SQL Editor → New Query)
-- ✅ Ordre : schéma → données → auth → RLS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Extensions requises ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 1 — SCHÉMA (tables du domaine métier)
-- Correspond EXACTEMENT au schéma de l'ancienne base
-- ─────────────────────────────────────────────────────────────────────────────

-- 1.1 syndicats
CREATE TABLE IF NOT EXISTS public.syndicats (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom            TEXT NOT NULL,
  reference_tf   TEXT,
  ville          TEXT,
  adresse        TEXT,
  logo_url       TEXT,
  plan           TEXT DEFAULT 'starter',
  actif          BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1.2 immeubles
CREATE TABLE IF NOT EXISTS public.immeubles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicat_id       UUID REFERENCES public.syndicats(id) ON DELETE CASCADE,
  nom               TEXT NOT NULL,
  adresse           TEXT,
  reference_tf      TEXT,
  ville             TEXT,
  nb_lots           INTEGER DEFAULT 0,
  budget_mensuel    NUMERIC DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 1.3 lots (schéma réel de l'ancienne base)
CREATE TABLE IF NOT EXISTS public.lots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id         UUID REFERENCES public.immeubles(id) ON DELETE CASCADE,
  syndicat_id         UUID REFERENCES public.syndicats(id),
  numero              INTEGER NOT NULL,
  appartement         TEXT NOT NULL,
  etage               TEXT,
  superficie_m2       NUMERIC,
  tantieme            INTEGER NOT NULL DEFAULT 0,
  cotisation_mensuelle NUMERIC NOT NULL DEFAULT 0,
  proprio             TEXT,
  email               TEXT,
  telephone           TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (immeuble_id, numero)
);

-- 1.4 profiles (liée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  syndicat_id    UUID REFERENCES public.syndicats(id),
  immeuble_id    UUID,
  immeubles_ids  UUID[] DEFAULT '{}',
  role           TEXT DEFAULT 'proprietaire',
  nom_complet    TEXT,
  telephone      TEXT,
  lots_ids       UUID[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1.5 paiements
CREATE TABLE IF NOT EXISTS public.paiements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id         UUID,
  immeuble_id    UUID REFERENCES public.immeubles(id),
  syndicat_id    UUID REFERENCES public.syndicats(id),
  mois           TEXT NOT NULL,
  montant        NUMERIC DEFAULT 0,
  mode           TEXT DEFAULT '-',
  valide_par     UUID,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (lot_id, mois)
);

-- 1.6 depenses
CREATE TABLE IF NOT EXISTS public.depenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id      UUID REFERENCES public.immeubles(id),
  syndicat_id      UUID REFERENCES public.syndicats(id),
  prestataire_id   UUID,
  label            TEXT NOT NULL,
  montant          NUMERIC DEFAULT 0,
  categorie        TEXT DEFAULT 'fixe',
  mode             TEXT DEFAULT '-',
  statut           TEXT DEFAULT 'pending',
  mois             TEXT NOT NULL,
  date_reglement   TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 1.7 prestataires
CREATE TABLE IF NOT EXISTS public.prestataires (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id      UUID REFERENCES public.immeubles(id),
  syndicat_id      UUID REFERENCES public.syndicats(id),
  nom              TEXT NOT NULL,
  contact          TEXT,
  telephone        TEXT,
  adresse          TEXT,
  montant_mensuel  NUMERIC DEFAULT 0,
  mode_paiement    TEXT DEFAULT 'Wave',
  numero_wave      TEXT DEFAULT '',
  numero_om        TEXT DEFAULT '',
  initiales        TEXT,
  couleur          TEXT DEFAULT '#10B981',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 1.8 signalements
CREATE TABLE IF NOT EXISTS public.signalements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id    UUID REFERENCES public.immeubles(id),
  syndicat_id    UUID REFERENCES public.syndicats(id),
  lot_id         UUID,
  proprio        TEXT,
  appart         TEXT,
  description    TEXT NOT NULL,
  photo_url      TEXT,
  statut         TEXT DEFAULT 'prive',
  reponse        TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1.9 annonces
CREATE TABLE IF NOT EXISTS public.annonces (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id    UUID REFERENCES public.immeubles(id),
  syndicat_id    UUID REFERENCES public.syndicats(id),
  titre          TEXT NOT NULL,
  message        TEXT,
  type           TEXT DEFAULT 'info',
  public         BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1.10 cotisations_exceptionnelles
CREATE TABLE IF NOT EXISTS public.cotisations_exceptionnelles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immeuble_id    UUID REFERENCES public.immeubles(id),
  syndicat_id    UUID REFERENCES public.syndicats(id),
  cause          TEXT NOT NULL,
  impacts        TEXT,
  montant        NUMERIC DEFAULT 0,
  photo_url      TEXT,
  statut         TEXT DEFAULT 'vote',
  votes          JSONB DEFAULT '{}',
  repartition    JSONB DEFAULT '[]',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 1.11 comptes_marchands
CREATE TABLE IF NOT EXISTS public.comptes_marchands (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicat_id    UUID REFERENCES public.syndicats(id),
  operateur      TEXT NOT NULL,
  numero         TEXT,
  till_id        TEXT,
  business_id    TEXT,
  actif          BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (syndicat_id, operateur)
);


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 2 — DONNÉES (export complet de l'ancienne base)
-- ─────────────────────────────────────────────────────────────────────────────

-- 2.1 Syndicat Résidence Hélène
INSERT INTO public.syndicats (id, nom, reference_tf, ville, adresse, plan, actif, created_at) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'Résidence Hélène',
   'TF 8.323/GR Grand Dakar (Ex 25.093/DG)',
   'Dakar', NULL, 'starter', true,
   '2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.2 Immeuble
INSERT INTO public.immeubles (id, syndicat_id, nom, adresse, reference_tf, ville, nb_lots, budget_mensuel, created_at) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'Résidence Hélène', 'Grand Dakar, Dakar',
   'TF 8.323/GR Grand Dakar', 'Dakar', 13, 624833,
   '2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.3 Lots (13 lots — IDs conservés pour compatibilité)
INSERT INTO public.lots (id, immeuble_id, syndicat_id, numero, appartement, etage, superficie_m2, tantieme, cotisation_mensuelle, proprio, created_at) VALUES
  ('cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 1,'RDC droite', 'RDC',      88,  516,  32242,'Babacar Diop',    '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 2,'RDC gauche','RDC',     142,  862,  53861,'Babacar Diop',    '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 3,'1er droite','1er',     115,  675,  42177,'Absatou Touré',   '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 4,'1er gauche','1er',     147,  862,  53861,'Oumoul Faye',     '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000005','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 5,'2e droite', '2e',      115,  675,  42177,'Zeinab Diop',     '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 6,'2e gauche', '2e',      147,  862,  53861,'Birane Gueye',    '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000007','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 7,'3e droite', '3e',      116,  680,  42489,'Wore Diop',       '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000008','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 8,'3e gauche', '3e',      149,  873,  54548,'Yves',            '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000009','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001', 9,'4e droite', '4e',      115,  675,  42177,'Mariama Touré',   '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000010','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',10,'4e gauche', '4e',      148,  868,  54236,'Ndiaye Samb',     '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000011','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',11,'5e droite', '5e',      115,  675,  42177,'Marie Dieye',     '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000012','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',12,'5e gauche', '5e',      148,  868,  54236,'M. Diop et fils', '2026-05-17T12:22:16.689582+00:00'),
  ('cccccccc-0000-0000-0000-000000000013','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001',13,'Terrasse',  'Terrasse',155,  909,  56798,'Mme Fall',        '2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.4 Prestataires
INSERT INTO public.prestataires (id, immeuble_id, syndicat_id, nom, contact, telephone, adresse, montant_mensuel, mode_paiement, numero_wave, numero_om, initiales, couleur, created_at) VALUES
  ('fe825693-ea7e-4a81-9fee-f3ff5639ce9c','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Gardiennage DACCESS','Ousmane Ndiaye','+221 77 123 45 67','Rue 10 Mermoz, Dakar',  210000,'Espèces','','',    'GD','#0F2044','2026-05-17T12:22:16.689582+00:00'),
  ('bf4383ec-46b1-4d14-8538-fced42aff7ee','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Propre+ Nettoyage',  'Aissatou Fall',  '+221 76 987 65 43','Almadies, Dakar',         70000,'Wave',   '76987654','','PN','#10B981','2026-05-17T12:22:16.689582+00:00'),
  ('8a681839-7f24-464d-9fc8-2df4953d6b22','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','OTIS Ascenseurs SN', 'Thierno Ba',     '+221 33 867 12 34','Zone Industrielle, Dakar', 60000,'OM',     '','77567890','OT','#3B82F6','2026-05-17T12:22:16.689582+00:00'),
  ('fde4552c-36ef-4c51-ba6f-a6ec13b44ec4','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','SENELEC / Woyofal',  'Agence Mermoz',  '+221 33 839 99 99','Agence Mermoz, Dakar',    100000,'Wave',   '338399999','','SL','#F59E0B','2026-05-17T12:22:16.689582+00:00'),
  ('dbb85322-49e4-44a7-bb22-829192ede36a','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','SDE / Sen''Eau',     'Service Client', '+221 33 839 77 77','Agence Plateau, Dakar',    60000,'Wave',   '338397777','','SE','#06B6D4','2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.5 Paiements (mai 2026 — 10 lots payés)
INSERT INTO public.paiements (id, lot_id, immeuble_id, syndicat_id, mois, montant, mode, created_at) VALUES
  ('86cf5e2c-1006-4f2f-96fb-73159b0ccb4b','cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',32242,'Wave',   '2026-05-22T17:35:46.017918+00:00'),
  ('f06f3c18-4edf-47ca-936a-20d02c124311','cccccccc-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',42200,'Wave',   '2026-05-17T12:22:16.689582+00:00'),
  ('5c27a8a6-4ba1-43e0-850f-2b17d7bdd073','cccccccc-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',53900,'Espèces','2026-05-17T12:22:16.689582+00:00'),
  ('d80f6a8d-ca7f-4f14-b82e-1c82ae63bb14','cccccccc-0000-0000-0000-000000000006','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',53900,'OM',     '2026-05-17T12:22:16.689582+00:00'),
  ('156ba265-159d-4654-9026-740bd146d067','cccccccc-0000-0000-0000-000000000007','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',42500,'Wave',   '2026-05-17T12:22:16.689582+00:00'),
  ('ec7880a3-bd8b-42c4-bbc5-d05772006588','cccccccc-0000-0000-0000-000000000008','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',54600,'OM',     '2026-05-17T12:22:16.689582+00:00'),
  ('353b5edc-861a-4d50-af8b-764325606c13','cccccccc-0000-0000-0000-000000000009','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',42000,'Espèces','2026-05-17T12:22:16.689582+00:00'),
  ('f93a5d76-0aa0-4dcf-959d-75af6c44a324','cccccccc-0000-0000-0000-000000000010','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',54236,'Wave',   '2026-05-17T12:22:16.689582+00:00'),
  ('853dfaa2-df61-4401-912d-ea071046f85b','cccccccc-0000-0000-0000-000000000011','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',42200,'Wave',   '2026-05-17T12:22:16.689582+00:00'),
  ('acc97ba6-9c62-4775-9cd6-cdce8ec6e162','cccccccc-0000-0000-0000-000000000013','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','2026-05',56800,'Wave',   '2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (lot_id, mois) DO NOTHING;

-- 2.6 Dépenses (mai 2026)
INSERT INTO public.depenses (id, immeuble_id, syndicat_id, label, montant, categorie, mode, statut, mois, date_reglement, created_at) VALUES
  ('830c4978-fb90-43ad-bb3e-f289cb103a26','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Woyofal',          100000,'variable','Wave',   'regle',  '2026-05','01/05','2026-05-17T12:22:16.689582+00:00'),
  ('6f3f80fc-3262-4660-8955-12d00357f3cc','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Sen''Eau',          119476,'variable','Wave',   'regle',  '2026-05','02/05','2026-05-17T12:22:16.689582+00:00'),
  ('45a9d628-53cc-4f84-8dc4-1d07fd1d943b','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Gardiennage',      210000,'fixe',    'Espèces','regle',  '2026-05','03/05','2026-05-17T12:22:16.689582+00:00'),
  ('687a00f8-cf3d-4729-a592-0e8a53e16bca','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Nettoyage',         70000,'fixe',    'Espèces','regle',  '2026-05','03/05','2026-05-17T12:22:16.689582+00:00'),
  ('20367e55-c64c-4c0e-b9ee-adf5793f1b28','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Entretien ascenseur',60000,'fixe',  'Wave',   'regle',  '2026-05','03/05','2026-05-17T12:22:16.689582+00:00'),
  ('80072bef-e948-4131-bedb-80b26adf47ae','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Honoraire Syndic', 177000,'fixe',    '-',      'pending','2026-05',NULL,  '2026-05-17T12:22:16.689582+00:00'),
  ('d561c7c3-3cf9-44a2-a5f0-cbd7b0ea6381','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Fonds de Réserve',  60000,'variable','-',     'pending','2026-05',NULL,  '2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.7 Annonces
INSERT INTO public.annonces (id, immeuble_id, syndicat_id, titre, message, type, public, created_at) VALUES
  ('d1f6d25e-fd5d-4b64-87fe-188b1b2f6a76','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Maintenance ascenseur', 'L''ascenseur sera en maintenance le 15/05 de 9h à 12h. Merci de votre compréhension.','alerte',true,'2026-05-17T12:22:16.689582+00:00'),
  ('f4fa9c7e-08b6-4a0b-9168-773ee217fe75','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Réunion de copropriété','Réunion prévue le 28/05 à 18h30 — salle commune. Présence souhaitée.','info',true,'2026-05-17T12:22:16.689582+00:00'),
  ('b912d500-7f9f-410e-a6f9-748ed8340f30','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Nettoyage renforcé',   'Nettoyage complet des parties communes chaque lundi et jeudi jusqu''à fin mai.','info',true,'2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.8 Cotisation exceptionnelle (Audit Plomberie)
INSERT INTO public.cotisations_exceptionnelles (id, immeuble_id, syndicat_id, cause, impacts, montant, statut, votes, repartition, created_at) VALUES
  ('059eb6fd-bbf6-4471-a352-2e6c1d9c968b',
   'bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'Audit Plomberie',
   'Humidité dans les appartements sur les dalles',
   1000000,
   'vote',
   '{"13": "m1"}',
   '[{"lot":1,"part":51600},{"lot":2,"part":86200},{"lot":3,"part":67500},{"lot":4,"part":86200},{"lot":5,"part":67500},{"lot":6,"part":86200},{"lot":7,"part":68000},{"lot":8,"part":87300},{"lot":9,"part":67500},{"lot":10,"part":86800},{"lot":11,"part":67500},{"lot":12,"part":86800},{"lot":13,"part":90900}]',
   '2026-05-26T07:53:16.649564+00:00')
ON CONFLICT (id) DO NOTHING;

-- 2.9 Comptes marchands
INSERT INTO public.comptes_marchands (id, syndicat_id, operateur, numero, actif, created_at) VALUES
  ('425a1aed-ec20-4d47-a655-d68dfd834cb4','aaaaaaaa-0000-0000-0000-000000000001','free', NULL, false,'2026-05-17T12:22:16.689582+00:00'),
  ('d4fc244b-97db-4051-bc45-c3141c8f5f26','aaaaaaaa-0000-0000-0000-000000000001','om',   NULL, false,'2026-05-17T12:22:16.689582+00:00'),
  ('57d2dc4b-354d-4abc-be8a-d41d35924066','aaaaaaaa-0000-0000-0000-000000000001','wave', NULL, false,'2026-05-17T12:22:16.689582+00:00')
ON CONFLICT (syndicat_id, operateur) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 3 — UTILISATEURS AUTH (comptes de démonstration)
-- Les mots de passe sont hachés avec bcrypt via pgcrypto
-- ─────────────────────────────────────────────────────────────────────────────

-- Fonction helper pour créer un utilisateur auth proprement
CREATE OR REPLACE FUNCTION create_demo_user(
  p_id        UUID,
  p_email     TEXT,
  p_password  TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud
  ) VALUES (
    p_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(), now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false, 'authenticated', 'authenticated'
  ) ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les 15 comptes de démonstration avec les MÊMES UUIDs que l'ancienne base
SELECT create_demo_user('18c0c918-835f-467f-8d03-02bdc911e163', 'admin2@helene2026.com',     'SyndicAdmin2026');
SELECT create_demo_user('186ed800-3b5e-4704-b25d-a8506d93d5d9', 'admin@helene2026.com',      'SyndicAdmin2026');
SELECT create_demo_user('5577e1e6-67ac-4dd8-a5a3-e07ec89bc755', 'concierge@helene2026.com',  'SyndicConcierg2026');
SELECT create_demo_user('5bcace1f-8d63-485a-9618-04f3e49e0179', 'diop.fils@helene2026.com',  'SyndicLot12');
SELECT create_demo_user('93f4fb26-e218-4a00-b26e-e82b53afa4a8', 'birane.gueye@helene2026.com','SyndicLot06');
SELECT create_demo_user('f05f7ec0-abf3-4b61-892c-1b6b1d59bd9c', 'ndiaye.samb@helene2026.com','SyndicLot10');
SELECT create_demo_user('b1e04ae2-ee7e-49a9-b537-8667cc86577c', 'wore.diop@helene2026.com',  'SyndicLot07');
SELECT create_demo_user('da071274-fde9-4d71-b1f0-2f3da7499502', 'yves@helene2026.com',        'SyndicLot08');
SELECT create_demo_user('5447378c-8b7e-4d09-8f57-f037b446c235', 'marie.dieye@helene2026.com','SyndicLot11');
SELECT create_demo_user('3a35f3ea-aa40-4001-b65c-dcf2859718f3', 'mariama.toure@helene2026.com','SyndicLot09');
SELECT create_demo_user('75984ebc-ff0a-43b4-a4d6-355fd48343cf', 'babacar.diop@helene2026.com','SyndicLot01');
SELECT create_demo_user('80dc63cc-3b86-4ca3-8e87-15e6c54dd7b8', 'mme.fall@helene2026.com',   'SyndicLot13');
SELECT create_demo_user('b43daec7-67ab-4398-a4d8-c0509a872fa6', 'absatou.toure@helene2026.com','SyndicLot03');
SELECT create_demo_user('33a25ad3-488d-40e2-b7a1-052567dd18ad', 'oumoul.faye@helene2026.com','SyndicLot04');
SELECT create_demo_user('b2504c4c-c5d6-495d-98ba-3db146362a32', 'zeinab.diop@helene2026.com','SyndicLot05');

-- Supprimer la fonction helper (nettoyage)
DROP FUNCTION IF EXISTS create_demo_user(UUID, TEXT, TEXT);


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 4 — PROFILES (liés aux auth.users créés ci-dessus)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.profiles (id, syndicat_id, immeuble_id, immeubles_ids, role, nom_complet, lots_ids, created_at) VALUES
  ('18c0c918-835f-467f-8d03-02bdc911e163','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','superadmin','Super Admin',   '{}','2026-05-17T17:03:54.248414+00:00'),
  ('186ed800-3b5e-4704-b25d-a8506d93d5d9','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','superadmin','Super Admin',   '{}','2026-05-17T17:08:58.612307+00:00'),
  ('5577e1e6-67ac-4dd8-a5a3-e07ec89bc755','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','concierge','Mamadou Sarr',  '{}','2026-05-17T17:20:46.806258+00:00'),
  ('5bcace1f-8d63-485a-9618-04f3e49e0179','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','M. Diop et fils','{"cccccccc-0000-0000-0000-000000000012"}','2026-05-17T17:31:21.458993+00:00'),
  ('93f4fb26-e218-4a00-b26e-e82b53afa4a8','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Birane Gueye',  '{"cccccccc-0000-0000-0000-000000000006"}','2026-05-17T17:31:21.458993+00:00'),
  ('f05f7ec0-abf3-4b61-892c-1b6b1d59bd9c','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Ndiaye Samb',   '{"cccccccc-0000-0000-0000-000000000010"}','2026-05-17T17:31:21.458993+00:00'),
  ('b1e04ae2-ee7e-49a9-b537-8667cc86577c','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Wore Diop',     '{"cccccccc-0000-0000-0000-000000000007"}','2026-05-17T17:31:21.458993+00:00'),
  ('da071274-fde9-4d71-b1f0-2f3da7499502','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Yves',          '{"cccccccc-0000-0000-0000-000000000008"}','2026-05-17T17:31:21.458993+00:00'),
  ('5447378c-8b7e-4d09-8f57-f037b446c235','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Marie Dieye',   '{"cccccccc-0000-0000-0000-000000000011"}','2026-05-17T17:31:21.458993+00:00'),
  ('3a35f3ea-aa40-4001-b65c-dcf2859718f3','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Mariama Touré', '{"cccccccc-0000-0000-0000-000000000009"}','2026-05-17T17:31:21.458993+00:00'),
  ('75984ebc-ff0a-43b4-a4d6-355fd48343cf','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Babacar Diop',  '{"cccccccc-0000-0000-0000-000000000001","cccccccc-0000-0000-0000-000000000002"}','2026-05-17T17:31:21.458993+00:00'),
  ('80dc63cc-3b86-4ca3-8e87-15e6c54dd7b8','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Mme Fall',      '{"cccccccc-0000-0000-0000-000000000013"}','2026-05-17T17:31:21.458993+00:00'),
  ('b43daec7-67ab-4398-a4d8-c0509a872fa6','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Absatou Touré', '{"cccccccc-0000-0000-0000-000000000003"}','2026-05-17T17:31:21.458993+00:00'),
  ('33a25ad3-488d-40e2-b7a1-052567dd18ad','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Oumoul Faye',   '{"cccccccc-0000-0000-0000-000000000004"}','2026-05-17T17:31:21.458993+00:00'),
  ('b2504c4c-c5d6-495d-98ba-3db146362a32','aaaaaaaa-0000-0000-0000-000000000001',NULL,'{"bbbbbbbb-0000-0000-0000-000000000001"}','proprietaire','Zeinab Diop',   '{"cccccccc-0000-0000-0000-000000000005"}','2026-05-17T17:31:21.458993+00:00')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 5 — RLS (Row-Level Security)
-- ─────────────────────────────────────────────────────────────────────────────

-- Activer RLS sur toutes les tables
ALTER TABLE public.syndicats              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immeubles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depenses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestataires           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signalements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annonces               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotisations_exceptionnelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comptes_marchands      ENABLE ROW LEVEL SECURITY;

-- profiles : accès à son propre profil uniquement
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- syndicats : lecture pour les membres du syndicat
CREATE POLICY "syndicats_read" ON public.syndicats
  FOR SELECT USING (
    id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "syndicats_insert" ON public.syndicats
  FOR INSERT WITH CHECK (true);

-- immeubles : lecture pour les membres du syndicat
CREATE POLICY "immeubles_read" ON public.immeubles
  FOR SELECT USING (
    syndicat_id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "immeubles_write" ON public.immeubles
  FOR ALL USING (
    syndicat_id IN (
      SELECT syndicat_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin','concierge')
    )
  );

-- lots : lecture pour les membres du syndicat
CREATE POLICY "lots_read" ON public.lots
  FOR SELECT USING (
    syndicat_id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
  );
CREATE POLICY "lots_write" ON public.lots
  FOR ALL USING (
    syndicat_id IN (
      SELECT syndicat_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin','concierge')
    )
  );

-- Helper : syndicat de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.my_syndicat_id() RETURNS UUID AS $$
  SELECT syndicat_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper : immeuble accessible
CREATE OR REPLACE FUNCTION public.my_immeuble_ids() RETURNS UUID[] AS $$
  SELECT COALESCE(immeubles_ids, '{}')
  FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- paiements
CREATE POLICY "paiements_syndicat" ON public.paiements
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- depenses
CREATE POLICY "depenses_syndicat" ON public.depenses
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- prestataires
CREATE POLICY "prestataires_syndicat" ON public.prestataires
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- signalements
CREATE POLICY "signalements_syndicat" ON public.signalements
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- annonces
CREATE POLICY "annonces_syndicat" ON public.annonces
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- cotisations_exceptionnelles
CREATE POLICY "cot_exc_syndicat" ON public.cotisations_exceptionnelles
  FOR ALL USING (syndicat_id = public.my_syndicat_id());

-- comptes_marchands
CREATE POLICY "marchands_syndicat" ON public.comptes_marchands
  FOR ALL USING (syndicat_id = public.my_syndicat_id());


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIE 6 — VÉRIFICATION FINALE
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'syndicats'              AS table_name, COUNT(*) AS nb_rows FROM public.syndicats
UNION ALL
SELECT 'immeubles',             COUNT(*) FROM public.immeubles
UNION ALL
SELECT 'lots',                  COUNT(*) FROM public.lots
UNION ALL
SELECT 'profiles',              COUNT(*) FROM public.profiles
UNION ALL
SELECT 'paiements',             COUNT(*) FROM public.paiements
UNION ALL
SELECT 'depenses',              COUNT(*) FROM public.depenses
UNION ALL
SELECT 'prestataires',          COUNT(*) FROM public.prestataires
UNION ALL
SELECT 'annonces',              COUNT(*) FROM public.annonces
UNION ALL
SELECT 'cotisations_exc',       COUNT(*) FROM public.cotisations_exceptionnelles
UNION ALL
SELECT 'comptes_marchands',     COUNT(*) FROM public.comptes_marchands
ORDER BY table_name;
