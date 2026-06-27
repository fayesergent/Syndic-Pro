-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 008 — RLS : superadmin accès global à tous les syndicats
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-06
--
-- Problème : les superadmins ne peuvent pas lire/écrire les immeubles et lots
-- d'autres syndicats car le RLS les limite à leur propre syndicat_id.
-- Cette migration ajoute la règle "superadmin peut tout faire" sur :
--   syndicats (SELECT + UPDATE), immeubles (SELECT + ALL), lots (SELECT + ALL)
--
-- ✅ Exécuter dans Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── syndicats ────────────────────────────────────────────────────────────────

-- Lecture : membre de ce syndicat OU superadmin
DROP POLICY IF EXISTS "syndicats_read" ON public.syndicats;
CREATE POLICY "syndicats_read" ON public.syndicats
  FOR SELECT USING (
    id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Modification : superadmin uniquement
DROP POLICY IF EXISTS "syndicats_update" ON public.syndicats;
CREATE POLICY "syndicats_update" ON public.syndicats
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ─── immeubles ────────────────────────────────────────────────────────────────

-- Lecture : membre du syndicat OU superadmin
DROP POLICY IF EXISTS "immeubles_read" ON public.immeubles;
CREATE POLICY "immeubles_read" ON public.immeubles
  FOR SELECT USING (
    syndicat_id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Écriture : admin/concierge de ce syndicat OU superadmin
DROP POLICY IF EXISTS "immeubles_write" ON public.immeubles;
CREATE POLICY "immeubles_write" ON public.immeubles
  FOR ALL USING (
    syndicat_id IN (
      SELECT syndicat_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'concierge')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ─── lots ─────────────────────────────────────────────────────────────────────

-- Lecture : membre du syndicat OU superadmin
DROP POLICY IF EXISTS "lots_read" ON public.lots;
CREATE POLICY "lots_read" ON public.lots
  FOR SELECT USING (
    syndicat_id IN (SELECT syndicat_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Écriture : admin/concierge de ce syndicat OU superadmin
DROP POLICY IF EXISTS "lots_write" ON public.lots;
CREATE POLICY "lots_write" ON public.lots
  FOR ALL USING (
    syndicat_id IN (
      SELECT syndicat_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'concierge')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ─── profiles : superadmin peut lire TOUS les profils ─────────────────────────
-- (nécessaire pour afficher les utilisateurs de n'importe quel syndicat)
DROP POLICY IF EXISTS "profiles_syndicat_read" ON public.profiles;
CREATE POLICY "profiles_syndicat_read" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR syndicat_id = (
      SELECT syndicat_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ─── Vérification ─────────────────────────────────────────────────────────────
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('syndicats', 'immeubles', 'lots', 'profiles')
ORDER BY tablename, policyname;
