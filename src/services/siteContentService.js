import { supabase } from "./supabase.js";

// ─── Contenu par défaut (fallback si la DB ne répond pas) ────────────────────

const DEFAULT_CONTENT = {
  hero: {
    badge: "Solution SaaS pour le Sénégal",
    title: "Gérez vos copropriétés en toute simplicité",
    titleHighlight: "copropriétés",
    subtitle: "Le logiciel dédié aux syndics professionnels et bénévoles au Sénégal : comptabilité réglementaire, convocations AG, gestion des charges et assistant IA. Solution complète et 100% locale.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Voir la démo",
    socialProof: "Déjà adopté par 50+ copropriétés à Dakar",
    statsLeft: { title: "Économie moyenne", subtitle: "1.5M FCFA/an vs syndic" },
    statsRight: { title: "Installation 24h", subtitle: "Migration gratuite" },
    dashboardStats: [
      { value: "32", label: "Immeubles actifs" },
      { value: "847", label: "Lots gérés" },
    ],
    chatDemo: {
      question: "Quel est le solde actuel de l'immeuble Résidence Almadies ?",
      answer: "Solde : 12.450.000 FCFA. 3 impayés en cours. Taux de recouvrement : 94%",
    },
  },
  proof_bar: {
    items: [
      { icon: "🛡️", text: "Conforme OHADA" },
      { icon: "🔒", text: "Données au Sénégal" },
      { icon: "📊", text: "Comptabilité certifiée" },
      { icon: "🤖", text: "Assistant IA intégré" },
      { icon: "📞", text: "Support local" },
    ],
  },
  problems: {
    sectionLabel: "Le problème",
    title: "Votre syndic vous coûte trop cher pour ce qu'il fait.",
    subtitle: "Les honoraires explosent, la réactivité disparaît. Il existe une alternative légale, plus économique — et SyndicPro la rend accessible à tous au Sénégal.",
    items: [
      { icon: "💸", title: "Honoraires opaques en hausse constante", desc: "500.000 à 1.500.000 FCFA/an pour un immeuble standard." },
      { icon: "⏰", title: "Réactivité inexistante", desc: "Une fuite, un ascenseur en panne — et vous attendez des semaines." },
      { icon: "📋", title: "Comptes illisibles, AG inutiles", desc: "Des documents complexes conçus pour décourager les questions." },
      { icon: "🚪", title: "Changer de syndic = un parcours du combattant", desc: "Vote en AG, délai de préavis, récupération des archives…" },
    ],
    solutionTitle: "La solution : le syndic moderne avec SyndicPro",
    solutionPoints: [
      "Vous gérez votre immeuble vous-même, avec nos outils",
      "L'IA répond à toutes vos questions en français ou wolof",
      "La comptabilité OHADA, les AG et les relances sont automatisées",
      "Nous prenons en charge votre transition depuis votre ancien syndic",
      "Un juriste disponible par téléphone pour les cas complexes",
    ],
    solutionStats: [
      { num: "−70%", label: "sur vos charges" },
      { num: "48h", label: "pour être opérationnel" },
      { num: "0 FCFA", label: "frais de migration" },
    ],
  },
  features: {
    sectionLabel: "Fonctionnalités",
    title: "Tout ce dont un syndic a besoin. Dans un seul outil.",
    subtitle: "De la comptabilité à la gestion des travaux, SyndicPro couvre toutes vos obligations avec un assistant IA pour vous guider.",
    items: [
      { icon: "📊", title: "Comptabilité & trésorerie", desc: "Plan comptable OHADA, appels de fonds, suivi bancaire et clôture d'exercice en quelques clics." },
      { icon: "👥", title: "Assemblées générales", desc: "Convocations automatiques, gestion des votes, PV généré par l'IA. Conformité garantie." },
      { icon: "🤖", title: "Assistant IA 24h/24", desc: "Posez vos questions en français ou en wolof. L'IA lit votre base de données en temps réel." },
      { icon: "🔧", title: "Tickets & travaux", desc: "Suivi des incidents, gestion des devis, carnet d'entretien, recherche d'artisans qualifiés." },
      { icon: "🔔", title: "Relances automatiques", desc: "Détection des impayés, envoi de relances graduées sans intervention manuelle." },
      { icon: "📱", title: "Espace copropriétaire", desc: "Application mobile pour chaque copropriétaire : solde, historique, tickets, documents." },
    ],
  },
  security: {
    sectionLabel: "Sécurité & Conformité",
    title: "Conforme. Sécurisé. Certifié.",
    subtitle: "La gestion d'une copropriété engage votre responsabilité. SyndicPro est conçu pour vous protéger selon la législation sénégalaise.",
    items: [
      { icon: "⚖️", title: "Conforme au droit sénégalais", desc: "Application stricte des dispositions du COCC en matière de copropriété." },
      { icon: "📋", title: "Comptabilité OHADA", desc: "Respect du plan comptable OHADA et des normes SYSCOHADA." },
      { icon: "🔐", title: "Données hébergées au Sénégal", desc: "Serveurs locaux à Dakar. Chiffrement AES-256, sauvegardes quotidiennes." },
      { icon: "👨‍⚖️", title: "Expert juridique disponible", desc: "Un juriste spécialisé en droit immobilier sénégalais disponible." },
      { icon: "🏦", title: "Traçabilité bancaire", desc: "Intégration avec les banques locales pour une réconciliation automatique." },
      { icon: "📞", title: "Support local en français & wolof", desc: "Équipe basée à Dakar, disponible pour vous accompagner." },
    ],
  },
  pricing: {
    sectionLabel: "Tarifs transparents",
    title: "Un prix fixe. Pas de surprise.",
    subtitle: "Tarif adapté au marché sénégalais. Un forfait mensuel en FCFA, tout inclus.",
    footerNote: "Pas de frais cachés · Résiliation à tout moment · Support inclus",
    plans: [
      { name: "Essentiel", lots: "Jusqu'à 15 lots", price: "29.000", tag: "Essentiel", features: ["Comptabilité complète OHADA", "Gestion des copropriétaires", "Convocations & PV d'AG", "Relances impayés", "Espace copropriétaire mobile", "Support par email"], cta: "Commencer", featured: false },
      { name: "Confort", lots: "16 à 30 lots", price: "49.000", tag: "⭐ Populaire", features: ["Tout l'Essentiel", "Assistant IA illimité", "Gestion appels d'offres", "Carnet d'entretien complet", "Rapports financiers avancés", "Support téléphonique"], cta: "Commencer", featured: true },
      { name: "Sur-mesure", lots: "Plus de 30 lots", price: "Sur devis", tag: "Sur-mesure", features: ["Tout le Confort", "Multi-immeubles", "Compte bancaire dédié", "Juriste attitré", "Formation sur site", "SLA prioritaire 4h"], cta: "Nous contacter", featured: false },
    ],
  },
  testimonials: {
    sectionLabel: "Témoignages",
    title: "Ils ont franchi le pas",
    subtitle: "Des présidents de conseil syndical et gestionnaires d'immeubles à Dakar comme vous.",
    items: [
      { stars: 5, text: "Notre ancien syndic nous coûtait 850.000 FCFA/an. Avec SyndicPro, on paie 49.000 FCFA/mois et on gère tout nous-mêmes.", initials: "AM", name: "Amadou M.", role: "Président CS — 24 lots, Almadies" },
      { stars: 5, text: "Ce que j'apprécie le plus, c'est l'IA. Je pose mes questions en wolof, elle me répond avec les chiffres exacts de notre copropriété.", initials: "FB", name: "Fatou B.", role: "Gestionnaire — 18 lots, Mermoz" },
      { stars: 5, text: "L'AG de mars était la première que j'organisais seul. Convocations envoyées en 3 clics, PV généré automatiquement.", initials: "IK", name: "Ibrahima K.", role: "Président CS — 16 lots, Plateau" },
    ],
  },
  faq: {
    sectionLabel: "Questions fréquentes",
    title: "Tout ce que vous voulez savoir sur SyndicPro",
    items: [
      { q: "Qu'est-ce que SyndicPro ?", a: "SyndicPro est un logiciel de gestion de copropriété conçu pour les <strong>syndics professionnels et bénévoles au Sénégal</strong>." },
      { q: "Combien coûte SyndicPro ?", a: "SyndicPro est disponible à partir de <strong>29.000 FCFA/mois</strong> (formule Essentiel)." },
    ],
  },
  cta_final: {
    title: "Prêt à moderniser la gestion de vos copropriétés ?",
    subtitle: "14 jours d'essai gratuits. Sans carte bancaire. Migration depuis votre système actuel prise en charge.",
    ctaPrimary: "Créer mon compte gratuitement",
    ctaSecondary: "Contactez-nous →",
    footerNote: "Support 7j/7 · Aucun engagement · Formation incluse",
  },
  footer: {
    description: "La solution moderne de gestion de copropriété pour le Sénégal.",
    copyright: "© 2026 SyndicPro. Tous droits réservés. Dakar, Sénégal 🇸🇳",
    productLinks: [],
    resourceLinks: [],
    companyLinks: [],
    legalLinks: [],
    trustBadges: [],
  },
};

export { DEFAULT_CONTENT };

// ─── Charger tout le contenu du site ─────────────────────────────────────────

export async function loadSiteContent() {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("section, content");
    if (error) throw error;
    const result = { ...DEFAULT_CONTENT };
    (data || []).forEach((row) => {
      if (row.section && row.content) {
        result[row.section] = row.content;
      }
    });
    return result;
  } catch (e) {
    console.error("loadSiteContent error:", e);
    return DEFAULT_CONTENT;
  }
}

// ─── Mettre à jour une section ───────────────────────────────────────────────

export async function updateSiteSection(section, content) {
  const { error } = await supabase
    .from("site_content")
    .upsert(
      { section, content, updated_at: new Date().toISOString() },
      { onConflict: "section" }
    );
  if (error) throw error;
}

// ─── Supprimer une section (remet le défaut) ─────────────────────────────────

export async function deleteSiteSection(section) {
  const { error } = await supabase
    .from("site_content")
    .delete()
    .eq("section", section);
  if (error) throw error;
}
