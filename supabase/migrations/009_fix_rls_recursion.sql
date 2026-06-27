-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION 009 — URGENCE : corriger la récursion infinie du RLS
-- Projet : orgrwqsxtzvnezzealrd
-- Date   : 2026-06-06
--
-- PROBLÈME : migration 008 a créé des policies qui interrogent `profiles`
-- dans une policy ON `profiles` → boucle infinie → impossible de se connecter.
--
-- RÈGLE D'OR : une policy ON `profiles` ne doit JAMAIS lire `profiles`.
-- SOLUTION   : utiliser des fonctions SECURITY DEFINER (bypass RLS) partout
--              où on a besoin de syndicat_id ou role de l'utilisateur courant.
--
-- ✅ Exécuter EN PREMIER dans Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Étape 1 : Fonctions SECURITY DEFINER (bypass RLS total) ─────────────────
-- Ces fonctions s'exécutent en tant que leur propriétaire (superuser postgres),
-- donc elles lisent profiles sans déclencher aucune policy RLS → pas de boucle.

CREATE OR REPLACE FUNCTION public.my_syndicat_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT syndicat_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─── Étape 2 : Politique profiles (la plus critique) ─────────────────────────
-- JAMAIS de sous-requête sur profiles ici → utiliser my_syndicat_id() et my_role()

DROP POLICY IF EXISTS "profiles_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_syndicat_read" ON public.profiles;

-- Son propre profil : accès complet
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Lecture des profils du même syndicat + superadmin voit tout
CREATE POLICY "profiles_syndicat_read" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR syndicat_id = public.my_syndicat_id()
    OR public.my_role() = 'superadmin'
  );

-- ─── Étape 3 : syndicats ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "syndicats_read"   ON public.syndicats;
DROP POLICY IF EXISTS "syndicats_insert" ON public.syndicats;
DROP POLICY IF EXISTS "syndicats_update" ON public.syndicats;

CREATE POLICY "syndicats_read" ON public.syndicats
  FOR SELECT USING (
    id = public.my_syndicat_id()
    OR public.my_role() = 'superadmin'
  );

CREATE POLICY "syndicats_insert" ON public.syndicats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "syndicats_update" ON public.syndicats
  FOR UPDATE USING (
    public.my_role() = 'superadmin'
  );

-- ─── Étape 4 : immeubles ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "immeubles_read"  ON public.immeubles;
DROP POLICY IF EXISTS "immeubles_write" ON public.immeubles;

CREATE POLICY "immeubles_read" ON public.immeubles
  FOR SELECT USING (
    syndicat_id = public.my_syndicat_id()
    OR public.my_role() = 'superadmin'
  );

CREATE POLICY "immeubles_write" ON public.immeubles
  FOR ALL USING (
    (syndicat_id = public.my_syndicat_id()
     AND public.my_role() IN ('superadmin', 'concierge'))
    OR public.my_role() = 'superadmin'
  );

-- ─── Étape 5 : lots ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "lots_read"  ON public.lots;
DROP POLICY IF EXISTS "lots_write" ON public.lots;

CREATE POLICY "lots_read" ON public.lots
  FOR SELECT USING (
    syndicat_id = public.my_syndicat_id()
    OR public.my_role() = 'superadmin'
  );

CREATE POLICY "lots_write" ON public.lots
  FOR ALL USING (
    (syndicat_id = public.my_syndicat_id()
     AND public.my_role() IN ('superadmin', 'concierge'))
    OR public.my_role() = 'superadmin'
  );

-- ─── Étape 6 : autres tables (inchangées — utiliser my_syndicat_id) ───────────

-- Recréer proprement avec la fonction SECURITY DEFINER
-- (my_syndicat_id était déjà SECURITY DEFINER → pas de récursion)
DROP POLICY IF EXISTS "paiements_syndicat"  ON public.paiements;
DROP POLICY IF EXISTS "depenses_syndicat"   ON public.depenses;
DROP POLICY IF EXISTS "prestataires_syndicat" ON public.prestataires;
DROP POLICY IF EXISTS "signalements_syndicat" ON public.signalements;
DROP POLICY IF EXISTS "annonces_syndicat"   ON public.annonces;
DROP POLICY IF EXISTS "cot_exc_syndicat"    ON public.cotisations_exceptionnelles;
DROP POLICY IF EXISTS "marchands_syndicat"  ON public.comptes_marchands;

CREATE POLICY "paiements_syndicat"    ON public.paiements
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "depenses_syndicat"     ON public.depenses
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "prestataires_syndicat" ON public.prestataires
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "signalements_syndicat" ON public.signalements
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "annonces_syndicat"     ON public.annonces
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "cot_exc_syndicat"      ON public.cotisations_exceptionnelles
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');
CREATE POLICY "marchands_syndicat"    ON public.comptes_marchands
  FOR ALL USING (syndicat_id = public.my_syndicat_id() OR public.my_role() = 'superadmin');

-- ─── Vérification : doit retourner toutes les policies sans erreur ─────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
