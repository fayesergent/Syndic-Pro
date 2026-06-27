-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 010 — Ajouter policy UPDATE pour profiles (superadmin)
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-08
--
-- PROBLÈME : les superadmins ne peuvent pas modifier les profils d'autres
-- utilisateurs car il n'existe que la policy "profiles_own" (FOR ALL) qui ne
-- s'applique qu'à son propre profil.
--
-- SOLUTION : ajouter une policy UPDATE permettant aux superadmins de modifier
-- n'importe quel profil, et aux utilisateurs normaux de modifier leur propre profil.
--
-- ✅ Exécuter dans Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Supprimer la policy "profiles_own" existante (FOR ALL) ───────────────────
-- On va la remplacer par des policies séparées pour SELECT/UPDATE/DELETE

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;

-- ─── Nouvelle policy SELECT pour son propre profil ────────────────────────────
CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- ─── Nouvelle policy UPDATE : son propre profil OU superadmin ─────────────────
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR public.my_role() = 'superadmin'
  );

-- ─── Nouvelle policy DELETE : seulement superadmin (pas soi-même) ─────────────
-- Note: la suppression d'utilisateur se fait via edge function qui utilise
-- auth.admin.deleteUser, donc cette policy est principalement pour la sécurité
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (
    public.my_role() = 'superadmin'
    AND auth.uid() != id  -- Ne peut pas se supprimer soi-même
  );

-- ─── Vérification ─────────────────────────────────────────────────────────────
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;
