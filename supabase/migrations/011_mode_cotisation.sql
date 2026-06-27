-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 011 — Base de calcul des cotisations (tantième vs fixe)
--                 + restauration de la policy INSERT sur profiles
-- Projet : (votre projet Supabase)
-- Date   : 2026-06-15
--
-- 1) Ajoute la colonne `mode_cotisation` à la table immeubles :
--      - 'tantieme' : cotisation_lot = budget × (tantième_lot / total_tantièmes)
--      - 'fixe'     : cotisation saisie manuellement
--    (la colonne budget_mensuel existe déjà — migration 002)
--
-- 2) Restaure une policy INSERT sur `profiles`. La migration 010 a supprimé
--    "profiles_own" (FOR ALL) et ne l'a remplacée que par SELECT/UPDATE/DELETE :
--    sans INSERT, un nouvel utilisateur (compte gratuit) ne peut PAS créer son
--    propre profil à la fin de l'onboarding. On rétablit ce droit ici.
--
-- ✅ Idempotent : ré-exécutable sans risque.
-- ✅ Exécuter dans Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Colonne mode_cotisation ──────────────────────────────────────────────
ALTER TABLE public.immeubles
  ADD COLUMN IF NOT EXISTS mode_cotisation TEXT NOT NULL DEFAULT 'fixe';

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

-- ─── 2. Policy INSERT sur profiles (chacun crée son propre profil) ────────────
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── Vérification ─────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
