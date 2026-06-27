-- ⚠️ FICHIER OBSOLÈTE — REMPLACÉ PAR 011_mode_cotisation.sql
-- Le numéro 009 était déjà utilisé par 009_fix_rls_recursion.sql.
-- N'EXÉCUTEZ PLUS ce fichier. Utilisez 011_mode_cotisation.sql (colonne
-- mode_cotisation + policy INSERT sur profiles). Contenu gardé pour mémoire.
--
-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 009 — Base de calcul des cotisations (tantième vs fixe)
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-14
--
-- Ajoute la colonne `mode_cotisation` à la table immeubles :
--   - 'tantieme' : la cotisation mensuelle de chaque lot est calculée
--      automatiquement = budget_mensuel × (tantième_lot / total_tantièmes)
--   - 'fixe'     : la cotisation de chaque lot est saisie manuellement
--
-- La colonne budget_mensuel existe déjà (migration 002).
--
-- ✅ Exécuter dans Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.immeubles
  ADD COLUMN IF NOT EXISTS mode_cotisation TEXT NOT NULL DEFAULT 'fixe';

-- Contrainte de valeurs autorisées (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'immeubles_mode_cotisation_check'
  ) THEN
    ALTER TABLE public.immeubles
      ADD CONSTRAINT immeubles_mode_cotisation_check
      CHECK (mode_cotisation IN ('tantieme', 'fixe'));
  END IF;
END $$;
