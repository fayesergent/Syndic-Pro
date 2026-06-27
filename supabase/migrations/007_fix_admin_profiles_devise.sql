-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 007 — Restauration profils admin + colonne devise syndicats
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-06
--
-- ✅ Exécuter dans Supabase SQL Editor (Settings → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Restaurer les profils superadmin vers Résidence Hélène ─────────────────
-- Les profils ont été écrasés lors de tests d'onboarding.
-- Tous les superadmins doivent pointer vers le syndicat de la plateforme.
UPDATE public.profiles
SET
  syndicat_id   = 'aaaaaaaa-0000-0000-0000-000000000001',
  immeubles_ids = '{"bbbbbbbb-0000-0000-0000-000000000001"}'
WHERE role = 'superadmin';

-- ─── 2. Ajouter colonne devise sur syndicats ───────────────────────────────────
-- La colonne devise est utilisée dans l'UI (onboarding + back-office)
-- mais absente du schéma prod actuel.
ALTER TABLE public.syndicats
  ADD COLUMN IF NOT EXISTS devise TEXT DEFAULT 'FCFA';

-- ─── 3. S'assurer que les syndicats créés ont une devise par défaut ────────────
UPDATE public.syndicats
SET devise = 'FCFA'
WHERE devise IS NULL;

-- ─── 4. Vérification ──────────────────────────────────────────────────────────
SELECT p.id, p.role, p.nom_complet, p.syndicat_id, s.nom AS syndicat_nom
FROM public.profiles p
LEFT JOIN public.syndicats s ON s.id = p.syndicat_id
WHERE p.role = 'superadmin';
