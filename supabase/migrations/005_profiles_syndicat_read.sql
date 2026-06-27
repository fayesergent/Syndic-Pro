-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 005 — Fix RLS profiles : permettre aux superadmins de lire
--                tous les profils de leur syndicat
--
-- Problème : la policy "profiles_own" (FOR ALL WHERE id = auth.uid()) empêche
-- un superadmin de voir les profils des autres utilisateurs.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ajouter une policy SELECT pour lire tous les profils du même syndicat
-- (superadmin + concierge uniquement)
-- La fonction my_syndicat_id() est SECURITY DEFINER → bypass RLS → pas de récursion
CREATE POLICY "profiles_syndicat_read" ON public.profiles
  FOR SELECT
  USING (
    syndicat_id = public.my_syndicat_id()
    AND public.my_syndicat_id() IS NOT NULL
  );

-- Vérification
SELECT COUNT(*) AS nb_policies
FROM pg_policies
WHERE tablename = 'profiles';
