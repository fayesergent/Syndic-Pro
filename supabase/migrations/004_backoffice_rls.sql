-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 004 — Back-Office RLS & Fonctions RPC
-- Exécuter dans : Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Fonction RPC : lister les users d'un syndicat ────────────────────────────
-- Permet de lire auth.users (inaccessible via REST anon) de façon contrôlée
-- SECURITY DEFINER = s'exécute avec les droits du propriétaire (postgres)
-- La clause WHERE garantit qu'un user ne peut voir que son propre syndicat

CREATE OR REPLACE FUNCTION public.list_syndicat_users(p_syndicat_id UUID)
RETURNS TABLE(
  id           UUID,
  email        TEXT,
  created_at   TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE p.syndicat_id = p_syndicat_id
    AND p_syndicat_id IN (
      SELECT syndicat_id FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('superadmin', 'concierge')
    )
  ORDER BY u.created_at ASC;
$$;

-- ─── Accorder l'exécution aux utilisateurs authentifiés ───────────────────────
GRANT EXECUTE ON FUNCTION public.list_syndicat_users(UUID) TO authenticated;

-- ─── Vérification ─────────────────────────────────────────────────────────────
SELECT 'list_syndicat_users RPC créée' AS status;
