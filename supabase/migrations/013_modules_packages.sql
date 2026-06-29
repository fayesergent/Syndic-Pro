-- ============================================================================
-- Migration 013 : Tables modules, packages et demandes_modules
-- ============================================================================

-- Catalogue des modules disponibles
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  categorie TEXT DEFAULT 'base',
  actif BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Packages prédéfinis
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  prix_mensuel INTEGER DEFAULT 0,
  devise TEXT DEFAULT 'FCFA',
  modules_ids UUID[] DEFAULT '{}',
  max_lots INTEGER,
  actif BOOLEAN DEFAULT true,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Demandes de modules par un syndic (workflow de validation)
CREATE TABLE IF NOT EXISTS demandes_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicat_id UUID NOT NULL REFERENCES syndicats(id) ON DELETE CASCADE,
  demandeur_id UUID NOT NULL,
  package_id UUID REFERENCES packages(id),
  modules_selectionnes UUID[] DEFAULT '{}',
  commentaire TEXT,
  statut TEXT DEFAULT 'en_attente',
  reponse_admin TEXT,
  valide_par UUID,
  valide_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_modules" ON modules FOR SELECT USING (true);
CREATE POLICY "manage_modules" ON modules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_packages" ON packages FOR SELECT USING (true);
CREATE POLICY "manage_packages" ON packages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

ALTER TABLE demandes_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_own_demandes" ON demandes_modules FOR SELECT USING (
  syndicat_id IN (SELECT syndicat_id FROM profiles WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);
CREATE POLICY "create_demandes" ON demandes_modules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'concierge'))
);
CREATE POLICY "manage_demandes" ON demandes_modules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- ── Données par défaut : modules ─────────────────────────────────────────────

INSERT INTO modules (nom, description, icon, categorie, ordre) VALUES
  ('Comptabilité & trésorerie', 'Plan comptable OHADA, appels de fonds, suivi bancaire et clôture d''exercice.', '📊', 'base', 1),
  ('Gestion des copropriétaires', 'Fiches copropriétaires, tantièmes, historique des paiements.', '👥', 'base', 2),
  ('Assemblées générales', 'Convocations automatiques, gestion des votes, PV généré par l''IA.', '📋', 'base', 3),
  ('Relances impayés', 'Détection des impayés, envoi de relances graduées automatiques.', '🔔', 'base', 4),
  ('Espace copropriétaire', 'Application mobile : solde, historique, tickets, documents.', '📱', 'base', 5),
  ('Assistant IA', 'Questions en français ou wolof, réponses en temps réel sur vos données.', '🤖', 'premium', 6),
  ('Tickets & travaux', 'Suivi des incidents, gestion des devis, carnet d''entretien.', '🔧', 'premium', 7),
  ('Gestion appels d''offres', 'Publication, réception et comparaison des offres prestataires.', '📝', 'premium', 8),
  ('Rapports financiers avancés', 'Tableaux de bord, exports Excel, analyses par période.', '📈', 'premium', 9),
  ('Multi-immeubles', 'Gestion centralisée de plusieurs immeubles dans un seul compte.', '🏢', 'enterprise', 10),
  ('Compte bancaire dédié', 'Rapprochement bancaire automatisé avec votre banque locale.', '🏦', 'enterprise', 11),
  ('Juriste attitré', 'Expert en droit immobilier sénégalais dédié à votre copropriété.', '👨‍⚖️', 'enterprise', 12),
  ('Formation sur site', 'Formation en présentiel pour vos équipes à Dakar.', '🎓', 'enterprise', 13),
  ('SLA prioritaire', 'Temps de réponse garanti sous 4h pour les incidents critiques.', '⚡', 'enterprise', 14)
ON CONFLICT DO NOTHING;

-- ── Données par défaut : packages ────────────────────────────────────────────
-- Note : les modules_ids seront mis à jour après insertion des modules

DO $$
DECLARE
  mod_ids_base UUID[];
  mod_ids_premium UUID[];
  mod_ids_enterprise UUID[];
BEGIN
  SELECT array_agg(id ORDER BY ordre) INTO mod_ids_base
  FROM modules WHERE categorie = 'base';

  SELECT array_agg(id ORDER BY ordre) INTO mod_ids_premium
  FROM modules WHERE categorie IN ('base', 'premium');

  SELECT array_agg(id ORDER BY ordre) INTO mod_ids_enterprise
  FROM modules WHERE categorie IN ('base', 'premium', 'enterprise');

  INSERT INTO packages (nom, description, prix_mensuel, max_lots, modules_ids, ordre) VALUES
    ('Essentiel', 'Idéal pour les petites copropriétés jusqu''à 15 lots. Comptabilité OHADA complète et gestion de base.', 29000, 15, COALESCE(mod_ids_base, '{}'), 1),
    ('Confort', 'Pour les copropriétés de 16 à 30 lots. Assistant IA illimité et fonctionnalités avancées.', 49000, 30, COALESCE(mod_ids_premium, '{}'), 2),
    ('Sur-mesure', 'Pour les grandes copropriétés de plus de 30 lots. Support dédié et fonctionnalités entreprise.', 0, NULL, COALESCE(mod_ids_enterprise, '{}'), 3)
  ON CONFLICT DO NOTHING;
END $$;
