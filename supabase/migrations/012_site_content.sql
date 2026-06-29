-- ============================================================================
-- Migration 012 : Table site_content (CMS pour la landing page)
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "write_site_content" ON site_content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- ── Données par défaut : contenu actuel hardcodé de la landing page ──────────

INSERT INTO site_content (section, content) VALUES

('hero', '{
  "badge": "Solution SaaS pour le Sénégal",
  "title": "Gérez vos copropriétés en toute simplicité",
  "titleHighlight": "copropriétés",
  "subtitle": "Le logiciel dédié aux syndics professionnels et bénévoles au Sénégal : comptabilité réglementaire, convocations AG, gestion des charges et assistant IA. Solution complète et 100% locale.",
  "ctaPrimary": "Commencer gratuitement",
  "ctaSecondary": "Voir la démo",
  "socialProof": "Déjà adopté par 50+ copropriétés à Dakar",
  "statsLeft": {"title": "Économie moyenne", "subtitle": "1.5M FCFA/an vs syndic"},
  "statsRight": {"title": "Installation 24h", "subtitle": "Migration gratuite"},
  "dashboardStats": [
    {"value": "32", "label": "Immeubles actifs"},
    {"value": "847", "label": "Lots gérés"}
  ],
  "chatDemo": {
    "question": "Quel est le solde actuel de l''immeuble Résidence Almadies ?",
    "answer": "Solde : 12.450.000 FCFA. 3 impayés en cours. Taux de recouvrement : 94%"
  }
}'::jsonb),

('proof_bar', '{
  "items": [
    {"icon": "🛡️", "text": "Conforme OHADA"},
    {"icon": "🔒", "text": "Données au Sénégal"},
    {"icon": "📊", "text": "Comptabilité certifiée"},
    {"icon": "🤖", "text": "Assistant IA intégré"},
    {"icon": "📞", "text": "Support local"}
  ]
}'::jsonb),

('problems', '{
  "sectionLabel": "Le problème",
  "title": "Votre syndic vous coûte trop cher pour ce qu''il fait.",
  "subtitle": "Les honoraires explosent, la réactivité disparaît. Il existe une alternative légale, plus économique — et SyndicPro la rend accessible à tous au Sénégal.",
  "items": [
    {"icon": "💸", "title": "Honoraires opaques en hausse constante", "desc": "500.000 à 1.500.000 FCFA/an pour un immeuble standard. Avec des frais \"extra\" qui s''accumulent à chaque intervention."},
    {"icon": "⏰", "title": "Réactivité inexistante", "desc": "Une fuite, un ascenseur en panne — et vous attendez des semaines une réponse par email."},
    {"icon": "📋", "title": "Comptes illisibles, AG inutiles", "desc": "Des documents complexes conçus pour décourager les questions plutôt que pour informer les copropriétaires."},
    {"icon": "🚪", "title": "Changer de syndic = un parcours du combattant", "desc": "Vote en AG, délai de préavis, récupération des archives… Personne ne vous guide dans la transition."}
  ],
  "solutionTitle": "La solution : le syndic moderne avec SyndicPro",
  "solutionPoints": [
    "Vous gérez votre immeuble vous-même, avec nos outils",
    "L''IA répond à toutes vos questions en français ou wolof",
    "La comptabilité OHADA, les AG et les relances sont automatisées",
    "Nous prenons en charge votre transition depuis votre ancien syndic",
    "Un juriste disponible par téléphone pour les cas complexes"
  ],
  "solutionStats": [
    {"num": "−70%", "label": "sur vos charges"},
    {"num": "48h", "label": "pour être opérationnel"},
    {"num": "0 FCFA", "label": "frais de migration"}
  ]
}'::jsonb),

('features', '{
  "sectionLabel": "Fonctionnalités",
  "title": "Tout ce dont un syndic a besoin. Dans un seul outil.",
  "subtitle": "De la comptabilité à la gestion des travaux, SyndicPro couvre toutes vos obligations avec un assistant IA pour vous guider.",
  "items": [
    {"icon": "📊", "title": "Comptabilité & trésorerie", "desc": "Plan comptable OHADA, appels de fonds, suivi bancaire et clôture d''exercice en quelques clics."},
    {"icon": "👥", "title": "Assemblées générales", "desc": "Convocations automatiques, gestion des votes, PV généré par l''IA. Conformité garantie."},
    {"icon": "🤖", "title": "Assistant IA 24h/24", "desc": "Posez vos questions en français ou en wolof. L''IA lit votre base de données en temps réel."},
    {"icon": "🔧", "title": "Tickets & travaux", "desc": "Suivi des incidents, gestion des devis, carnet d''entretien, recherche d''artisans qualifiés."},
    {"icon": "🔔", "title": "Relances automatiques", "desc": "Détection des impayés, envoi de relances graduées sans intervention manuelle."},
    {"icon": "📱", "title": "Espace copropriétaire", "desc": "Application mobile pour chaque copropriétaire : solde, historique, tickets, documents."}
  ]
}'::jsonb),

('security', '{
  "sectionLabel": "Sécurité & Conformité",
  "title": "Conforme. Sécurisé. Certifié.",
  "subtitle": "La gestion d''une copropriété engage votre responsabilité. SyndicPro est conçu pour vous protéger selon la législation sénégalaise.",
  "items": [
    {"icon": "⚖️", "title": "Conforme au droit sénégalais", "desc": "Application stricte des dispositions du Code des Obligations Civiles et Commerciales (COCC) en matière de copropriété."},
    {"icon": "📋", "title": "Comptabilité OHADA", "desc": "Respect du plan comptable OHADA et des normes SYSCOHADA pour une comptabilité conforme et auditée."},
    {"icon": "🔐", "title": "Données hébergées au Sénégal", "desc": "Serveurs locaux à Dakar. Chiffrement AES-256, sauvegardes quotidiennes, conformité DPD (Direction Protection Données)."},
    {"icon": "👨‍⚖️", "title": "Expert juridique disponible", "desc": "Un juriste spécialisé en droit immobilier sénégalais disponible pour répondre à vos questions complexes."},
    {"icon": "🏦", "title": "Traçabilité bancaire", "desc": "Intégration avec les banques locales (BICIS, SGBS, BOA, etc.) pour une réconciliation automatique sécurisée."},
    {"icon": "📞", "title": "Support local en français & wolof", "desc": "Équipe basée à Dakar, disponible en français et en wolof pour vous accompagner au quotidien."}
  ]
}'::jsonb),

('pricing', '{
  "sectionLabel": "Tarifs transparents",
  "title": "Un prix fixe. Pas de surprise.",
  "subtitle": "Tarif adapté au marché sénégalais. Un forfait mensuel en FCFA, tout inclus.",
  "footerNote": "Pas de frais cachés · Résiliation à tout moment · Support inclus",
  "plans": [
    {
      "name": "Essentiel",
      "lots": "Jusqu''à 15 lots",
      "price": "29.000",
      "tag": "Essentiel",
      "features": ["Comptabilité complète OHADA", "Gestion des copropriétaires", "Convocations & PV d''AG", "Relances impayés", "Espace copropriétaire mobile", "Support par email"],
      "cta": "Commencer",
      "featured": false
    },
    {
      "name": "Confort",
      "lots": "16 à 30 lots",
      "price": "49.000",
      "tag": "⭐ Populaire",
      "features": ["Tout l''Essentiel", "Assistant IA illimité", "Gestion appels d''offres", "Carnet d''entretien complet", "Rapports financiers avancés", "Support téléphonique"],
      "cta": "Commencer",
      "featured": true
    },
    {
      "name": "Sur-mesure",
      "lots": "Plus de 30 lots",
      "price": "Sur devis",
      "tag": "Sur-mesure",
      "features": ["Tout le Confort", "Multi-immeubles", "Compte bancaire dédié", "Juriste attitré", "Formation sur site", "SLA prioritaire 4h"],
      "cta": "Nous contacter",
      "featured": false
    }
  ]
}'::jsonb),

('testimonials', '{
  "sectionLabel": "Témoignages",
  "title": "Ils ont franchi le pas",
  "subtitle": "Des présidents de conseil syndical et gestionnaires d''immeubles à Dakar comme vous.",
  "items": [
    {
      "stars": 5,
      "text": "Notre ancien syndic nous coûtait 850.000 FCFA/an. Avec SyndicPro, on paie 49.000 FCFA/mois et on gère tout nous-mêmes. La migration a pris 48h et le support était disponible à chaque étape.",
      "initials": "AM",
      "name": "Amadou M.",
      "role": "Président CS — 24 lots, Almadies"
    },
    {
      "stars": 5,
      "text": "Ce que j''apprécie le plus, c''est l''IA. Je pose mes questions en wolof, elle me répond avec les chiffres exacts de notre copropriété. C''est comme avoir un expert comptable disponible 24h/24.",
      "initials": "FB",
      "name": "Fatou B.",
      "role": "Gestionnaire — 18 lots, Mermoz"
    },
    {
      "stars": 5,
      "text": "L''AG de mars était la première que j''organisais seul. Convocations envoyées en 3 clics, PV généré automatiquement. Zéro erreur de procédure. Je ne retournerai jamais à un syndic classique.",
      "initials": "IK",
      "name": "Ibrahima K.",
      "role": "Président CS — 16 lots, Plateau"
    }
  ]
}'::jsonb),

('faq', '{
  "sectionLabel": "Questions fréquentes",
  "title": "Tout ce que vous voulez savoir sur SyndicPro",
  "items": [
    {"q": "Qu''est-ce que SyndicPro ?", "a": "SyndicPro est un logiciel de gestion de copropriété conçu pour les <strong>syndics professionnels et bénévoles au Sénégal</strong>. Il couvre la comptabilité OHADA, les assemblées générales, la gestion des charges et intègre un <strong>assistant IA</strong> pour vous accompagner dans toutes vos démarches."},
    {"q": "Combien coûte SyndicPro ?", "a": "SyndicPro est disponible à partir de <strong>29.000 FCFA/mois</strong> (formule Essentiel pour jusqu''à 15 lots). La formule Confort est à 49.000 FCFA/mois (16-30 lots). Les deux formules incluent un essai gratuit de 14 jours sans engagement et sans carte bancaire."},
    {"q": "SyndicPro est-il conforme à la législation sénégalaise ?", "a": "Oui, totalement. SyndicPro respecte le <strong>Code des Obligations Civiles et Commerciales (COCC)</strong> du Sénégal et applique les normes <strong>OHADA</strong> pour la comptabilité. Toutes les procédures (AG, convocations, votes) sont conformes à la réglementation en vigueur."},
    {"q": "SyndicPro convient-il à ma taille de copropriété ?", "a": "SyndicPro s''adapte aux copropriétés de <strong>2 à 100 lots</strong>. Il est particulièrement efficace pour les petites et moyennes copropriétés (5 à 50 lots) qui souhaitent une gestion moderne et professionnelle."},
    {"q": "Peut-on migrer depuis notre système actuel vers SyndicPro ?", "a": "Oui. Notre équipe à Dakar accompagne la transition : récupération des données comptables, paramétrage de la copropriété, formation des utilisateurs. La migration est <strong>gratuite et prise en charge</strong> par nos experts."},
    {"q": "Faut-il des compétences comptables pour utiliser SyndicPro ?", "a": "Non. SyndicPro est conçu pour des <strong>non-comptables</strong>. La saisie des dépenses, la répartition des charges et la clôture d''exercice sont guidées pas à pas. L''assistant IA répond à vos questions en temps réel, en français ou en wolof."},
    {"q": "SyndicPro remplace-t-il vraiment un syndic professionnel ?", "a": "SyndicPro est utilisé autant par les <strong>syndics professionnels</strong> que par les <strong>syndics bénévoles</strong>. Pour la grande majorité des copropriétés de moins de 50 lots, il couvre toutes les obligations : comptabilité OHADA, AG, gestion des charges, relances, espace copropriétaire."},
    {"q": "Combien de temps prend la gestion avec SyndicPro ?", "a": "En moyenne, nos utilisateurs consacrent <strong>1 à 2 heures par mois</strong> à la gestion courante. La préparation d''une AG prend environ 2 heures avec SyndicPro grâce à l''automatisation et l''assistant IA."},
    {"q": "Mes données sont-elles sécurisées ?", "a": "Oui. Vos données sont hébergées sur des <strong>serveurs locaux à Dakar</strong> avec chiffrement AES-256 et sauvegardes quotidiennes. Nous sommes conformes aux normes de la Direction de la Protection des Données (DPD) du Sénégal. Vos données ne quittent jamais le territoire sénégalais."},
    {"q": "Puis-je intégrer SyndicPro avec ma banque ?", "a": "Oui. SyndicPro s''intègre avec les principales banques sénégalaises (<strong>BICIS, SGBS, BOA, Ecobank, UBA</strong>, etc.) pour la réconciliation bancaire automatique et le suivi des paiements en temps réel."}
  ]
}'::jsonb),

('cta_final', '{
  "title": "Prêt à moderniser la gestion de vos copropriétés ?",
  "subtitle": "14 jours d''essai gratuits. Sans carte bancaire. Migration depuis votre système actuel prise en charge.",
  "ctaPrimary": "Créer mon compte gratuitement",
  "ctaSecondary": "Contactez-nous →",
  "footerNote": "Support 7j/7 · Aucun engagement · Formation incluse"
}'::jsonb),

('footer', '{
  "description": "La solution moderne de gestion de copropriété pour le Sénégal. Conforme OHADA, assistant IA intégré, support local.",
  "copyright": "© 2026 SyndicPro. Tous droits réservés. Dakar, Sénégal 🇸🇳",
  "productLinks": [
    {"label": "Fonctionnalités", "href": "#fonctionnalites"},
    {"label": "Tarifs", "href": "#tarifs"},
    {"label": "Sécurité", "href": "#securite"},
    {"label": "FAQ", "href": "#faq"}
  ],
  "resourceLinks": [
    {"label": "Documentation", "href": "#"},
    {"label": "Guide de démarrage", "href": "#"},
    {"label": "Vidéos tutoriels", "href": "#"},
    {"label": "Blog", "href": "#"}
  ],
  "companyLinks": [
    {"label": "À propos", "href": "#"},
    {"label": "Contact", "href": "#"},
    {"label": "Carrières", "href": "#"},
    {"label": "Partenaires", "href": "#"}
  ],
  "legalLinks": [
    {"label": "Mentions légales", "href": "#"},
    {"label": "Confidentialité", "href": "#"},
    {"label": "CGV", "href": "#"},
    {"label": "Cookies", "href": "#"}
  ],
  "trustBadges": [
    {"icon": "🛡️", "text": "Conforme OHADA"},
    {"icon": "🔒", "text": "Hébergé au Sénégal"},
    {"icon": "✓", "text": "Certifié DPD"},
    {"icon": "📞", "text": "Support local"}
  ]
}'::jsonb)

ON CONFLICT (section) DO NOTHING;
