-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 006 — Définir my_syndicat_id() manquant dans la migration 005
--
-- La migration 005 crée une policy RLS qui utilise public.my_syndicat_id()
-- mais cette fonction n'était pas définie → la policy échouait silencieusement.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Fonction helper SECURITY DEFINER pour obtenir le syndicat_id de l'utilisateur courant
-- sans risque de récursion RLS (car SECURITY DEFINER bypass le RLS sur profiles).
CREATE OR REPLACE FUNCTION public.my_syndicat_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT syndicat_id FROM public.profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.my_syndicat_id() TO authenticated;

-- Re-créer la policy de la migration 005 au cas où elle aurait échoué
-- (DROP IF EXISTS pour éviter les doublons)
DROP POLICY IF EXISTS "profiles_syndicat_read" ON public.profiles;

CREATE POLICY "profiles_syndicat_read" ON public.profiles
  FOR SELECT
  USING (
    syndicat_id = public.my_syndicat_id()
    AND public.my_syndicat_id() IS NOT NULL
  );

SELECT 'my_syndicat_id() créée et policy profiles_syndicat_read appliquée' AS status;
