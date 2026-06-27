# ANALYSE_PROJET.md — Audit Complet SyndicPro

> **Date de l'audit :** 2026-06-04  
> **Analyste :** Architecte logiciel senior (IA)  
> **Version analysée :** SyndicPro-main (mono-immeuble pilote)  
> **Objectif :** Préparation à l'évolution vers une plateforme SaaS multi-tenant

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Arborescence des fichiers](#2-arborescence-des-fichiers)
3. [Dépendances](#3-dépendances)
4. [Architecture technique](#4-architecture-technique)
5. [Schéma de base de données](#5-schéma-de-base-de-données)
6. [Composants et vues](#6-composants-et-vues)
7. [Gestion d'état](#7-gestion-détat)
8. [Authentification et autorisation](#8-authentification-et-autorisation)
9. [Valeurs hardcodées — inventaire complet](#9-valeurs-hardcodées--inventaire-complet)
10. [Analyse multi-tenant](#10-analyse-multi-tenant)
11. [Risques techniques](#11-risques-techniques)
12. [Qualité du code](#12-qualité-du-code)
13. [Améliorations prioritaires](#13-améliorations-prioritaires)
14. [Feuille de route SaaS recommandée](#14-feuille-de-route-saas-recommandée)

---

## 1. Vue d'ensemble du projet

| Attribut | Valeur |
|---|---|
| **Nom** | SyndicPro |
| **Type** | Application web de gestion de syndic immobilier |
| **Immeuble pilote** | Résidence Hélène, Grand Dakar, Sénégal |
| **Référence foncière** | TF 8.323/GR Grand Dakar |
| **Nombre de lots** | 13 |
| **Devise** | FCFA (Franc CFA ouest-africain) |
| **Langue UI** | Français |
| **Statut** | Fonctionnel pour un seul immeuble, non multi-tenant |
| **Taille totale src/** | 3 fichiers, ~50 KB |
| **Lignes de code (App.jsx)** | 1 916 lignes |

### Fonctionnalités métier couvertes

- Collecte des cotisations mensuelles (par tantième)
- Suivi des dépenses et remboursements aux prestataires
- Gestion du carnet de prestataires de service
- Cotisations exceptionnelles avec système de vote
- Signalements/demandes de maintenance par lot
- Annonces de la résidence
- Tableau de bord financier (KPIs + graphiques)
- Gestion des comptes de paiement mobile (Wave, OM, Free)

---

## 2. Arborescence des fichiers

```
SyndicPro-main/
├── index.html              # Entrypoint HTML (521 octets)
├── package.json            # Dépendances et scripts NPM
├── vite.config.js          # Configuration Vite (minimale)
├── README.md               # Documentation (vide, 11 octets)
└── src/
    ├── main.jsx            # Point de montage React (243 octets)
    ├── App.jsx             # APPLICATION MONOLITHIQUE (49 Ko, 1 916 lignes)
    └── supabase.js         # Client Supabase (187 octets)
```

**Observation critique :** 99,5 % du code applicatif se trouve dans un seul fichier `App.jsx`. Il n'y a ni dossier `components/`, ni `pages/`, ni `hooks/`, ni `services/`, ni `utils/`.

---

## 3. Dépendances

### Dépendances de production

| Package | Version | Rôle |
|---|---|---|
| `react` | ^18.3.1 | Framework UI |
| `react-dom` | ^18.3.1 | Rendu DOM |
| `@supabase/supabase-js` | ^2.45.0 | Client BDD + Auth |
| `recharts` | ^2.12.7 | Graphiques financiers |

### Dépendances de développement

| Package | Version | Rôle |
|---|---|---|
| `vite` | ^5.4.0 | Bundler + dev server |
| `@vitejs/plugin-react` | ^4.3.1 | Hot Module Replacement |

### Absences notables

- Pas de TypeScript (`@types/*`)
- Pas de framework CSS (Tailwind, MUI, Ant Design)
- Pas de router (`react-router-dom`)
- Pas de gestionnaire d'état global (Redux, Zustand, Jotai)
- Pas de bibliothèque de formulaires (React Hook Form, Formik)
- Pas de bibliothèque de tests (Jest, Vitest, Testing Library)
- Pas d'ORM ou couche de requêtes typées (Prisma, Drizzle)
- Pas de linter/formatter (ESLint, Prettier)

---

## 4. Architecture technique

### Stack

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│   React 18 + Vite   │   useReducer   │   Recharts  │
│   Inline CSS        │   No Router    │   No TS      │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│   Supabase (PostgreSQL)   │   Supabase Auth         │
│   RESTful SDK             │   Anon Key (public)     │
├─────────────────────────────────────────────────────┤
│                  DEPLOYMENT                         │
│   Vercel (prévu)   │   Pas de Docker   │   Vite SSG │
└─────────────────────────────────────────────────────┘
```

### Flux de données

**Lecture (chargement à la connexion) :**
```
Login → supabase.auth.signInWithPassword()
      → loadFromSupabase() — 7 requêtes parallèles
      → dispatch({ type: "INIT_FROM_SUPABASE", data })
      → Re-render complet de l'UI
```

**Écriture (action utilisateur) :**
```
Clic bouton → dispatch(action) → Mise à jour d'état optimiste
            → UI re-render immédiat
            → syncToSupabase() [async, fire-and-forget]
            → En cas d'erreur : console.error() uniquement
```

**Risque majeur du flux d'écriture :** Les mises à jour optimistes ne sont jamais annulées en cas d'erreur Supabase. L'état local peut diverger silencieusement de la base de données.

---

## 5. Schéma de base de données

### Tables identifiées (7 tables)

#### `paiements` — Cotisations mensuelles
```sql
lot_id         UUID     PK partiel
immeuble_id    UUID     Clé de tenant
syndicat_id    UUID     Clé de tenant (niveau syndic)
mois           TEXT     "YYYY-MM"
montant        NUMERIC
mode           TEXT     (Wave|OM|Espèces|-)
UNIQUE (lot_id, mois)
```

#### `depenses` — Dépenses de charges
```sql
id             UUID     PK
immeuble_id    UUID     Clé de tenant
syndicat_id    UUID
mois           TEXT
label          TEXT
montant        NUMERIC
mode           TEXT
categorie      TEXT     (fixe|variable)
statut         TEXT     (regle|pending)
date_reglement TEXT     nullable
prestataire_id UUID     FK → prestataires (nullable)
```

#### `prestataires` — Carnet de prestataires
```sql
id               UUID     PK
immeuble_id      UUID     Clé de tenant
syndicat_id      UUID
nom              TEXT
contact          TEXT
telephone        TEXT
adresse          TEXT
montant_mensuel  NUMERIC
mode_paiement    TEXT
numero_wave      TEXT
numero_om        TEXT
initiales        TEXT
couleur          TEXT     (hex)
```

#### `signalements` — Demandes de maintenance
```sql
id          UUID       PK
immeuble_id UUID       Clé de tenant
syndicat_id UUID
lot_id      UUID
proprio     TEXT
appart      TEXT
description TEXT
photo_url   TEXT       nullable
statut      TEXT       (prive|public)
reponse     TEXT       nullable
created_at  TIMESTAMP
```

#### `annonces` — Annonces de la résidence
```sql
id          UUID      PK
immeuble_id UUID      Clé de tenant
syndicat_id UUID
titre       TEXT
message     TEXT
type        TEXT      (info|alerte)
public      BOOLEAN
created_at  TIMESTAMP
```

#### `cotisations_exceptionnelles` — Levées exceptionnelles
```sql
id          UUID    PK
immeuble_id UUID    Clé de tenant
syndicat_id UUID
cause       TEXT
impacts     TEXT
montant     NUMERIC
photo_url   TEXT    nullable
statut      TEXT    (vote|clos)
votes       JSONB   {lot_id: date_vote}
repartition JSONB   distribution par tantième
created_at  TIMESTAMP
```

#### `comptes_marchands` — Comptes de paiement mobile
```sql
syndicat_id UUID    PK partiel (scope syndic, pas immeuble)
operateur   TEXT    PK partiel (wave|om|free)
numero      TEXT
till_id     TEXT    (Wave)
business_id TEXT    (OM)
actif       BOOLEAN
UNIQUE (syndicat_id, operateur)
```

#### `profiles` — Métadonnées utilisateurs
```sql
id          UUID    PK (FK → auth.users)
syndicat_id UUID    Clé d'appartenance
immeuble_id UUID    Clé d'appartenance
nom_complet TEXT
role        TEXT    (superadmin|concierge|proprietaire)
lots_ids    UUID[]  Tableau des lots accessibles
```

### Observations schéma

- `comptes_marchands` est scopé par `syndicat_id` seulement, pas par `immeuble_id` — incohérence avec les autres tables.
- `lots_ids` dans `profiles` contient des UUIDs mais le code en extrait des entiers (1–13) par parsing d'une convention de nommage — pattern fragile.
- Aucune migration SQL visible dans le dépôt — le schéma n'est pas versionné localement.

---

## 6. Composants et vues

### Vues principales (4)

| Vue | Rôle | Accès |
|---|---|---|
| `LoginView` | Formulaire de connexion + démo rapide | Public |
| `DashboardView` | KPIs, graphique, derniers événements | Tous les rôles |
| `ConciergeView` | Gestion opérationnelle (6 onglets) | `concierge` |
| `SuperAdminView` | Administration globale | `superadmin` |
| `ProprietaireView` | Vue propriétaire (lots propres) | `proprietaire` |

### Onglets ConciergeView (6)

| Onglet | Fonctionnalité |
|---|---|
| `TabCotisations` | Valider les paiements mensuels des 13 lots, générer reçu WhatsApp |
| `TabDepenses` | Ajouter/valider/supprimer les charges |
| `TabPrestataires` | CRUD prestataires + coordonnées paiement |
| `TabExceptionnel` | Créer levées exceptionnelles, gérer vote par lot |
| `TabSignalements` | Répondre aux signalements, publier ou garder privés |
| `TabAnnonces` | Publier annonces (info/alerte) |

### Composants atomiques identifiés

| Composant | Description |
|---|---|
| `KpiCard` | Carte métrique avec icône, valeur, tendance |
| `MB` (ModeButton) | Badge de mode de paiement (Wave/OM/Espèces/-) |
| `SPill` | Pastille PAYÉ/IMPAYÉ |
| `Card` | Conteneur avec ombre |
| `Input` | Champ texte contrôlé avec label |
| `CTab` | Navigation par onglets |
| `Icon` | Bibliothèque SVG interne (30+ icônes) |
| `SH` | En-tête de section avec bouton d'action |
| `CTip` | Tooltip personnalisé pour Recharts |
| `ModalRecu` | Modal de reçu avec template message WhatsApp |

---

## 7. Gestion d'état

### Pattern : `useReducer` avec 17 actions

```javascript
const [state, dispatch] = useReducer(reducer, null, makeInitialState)
```

**Structure de l'état initial :**
```javascript
{
  solde: 177038,          // Solde en caisse (FCFA)
  paiements: [...],       // Tableau {lot, montant, mode}
  depenses: [...],        // Tableau des charges
  prestataires: [...],    // Carnet prestataires
  cotisationsExc: [],     // Levées exceptionnelles
  signalements: [],       // Demandes de maintenance
  annonces: [...],        // Annonces publiées
  comptesMarchands: {...} // Comptes Wave/OM/Free
}
```

**Liste des 17 actions reducer :**

| Action | Effet |
|---|---|
| `INIT_FROM_SUPABASE` | Chargement initial depuis la BDD |
| `VALIDER_PAIEMENT` | Enregistrer paiement lot mensuel |
| `AJOUTER_DEPENSE` | Créer une nouvelle charge |
| `VALIDER_DEPENSE` | Marquer une charge comme réglée |
| `SUPPRIMER_DEPENSE` | Supprimer une charge |
| `ADD_PRESTA` | Ajouter un prestataire |
| `DEL_PRESTA` | Supprimer un prestataire |
| `UPD_PRESTA` | Modifier un prestataire |
| `PAYER_PRESTA` | Payer un prestataire (crée une dépense) |
| `CREER_COTISATION_EXC` | Créer une levée exceptionnelle |
| `VOTER_COT` | Voter sur une levée exceptionnelle |
| `CLORE_VOTE` | Clôturer le vote d'une levée |
| `ADD_SIGNALEMENT` | Soumettre une demande de maintenance |
| `RENDRE_PUBLIC` | Publier un signalement |
| `REPONDRE_SIG` | Répondre à un signalement (concierge) |
| `ADD_ANNONCE` | Publier une annonce |
| `UPD_MARCHANDS` | Mettre à jour les comptes de paiement |

---

## 8. Authentification et autorisation

### Flux d'authentification

```
1. Saisie email/password → supabase.auth.signInWithPassword()
2. Supabase valide les credentials
3. Requête sur table profiles (id = auth.uid())
4. Extraction : syndicat_id, immeuble_id, role, lots_ids
5. Parsing des lots_ids → numéros de lots (1–13)
6. Session persistée via cookies Supabase
```

### Comptes de démonstration (hardcodés dans App.jsx)

| Email | Mot de passe | Rôle | Lots |
|---|---|---|---|
| `admin@helene2026.com` | `SyndicAdmin2026` | superadmin | — |
| `concierge@helene2026.com` | `SyndicConcierg2026` | concierge | — |
| `babacar.diop@helene2026.com` | `SyndicLot01` | proprietaire | [1, 2] |
| `absatou.toure@helene2026.com` | `SyndicLot03` | proprietaire | [3] |
| `oumoul.faye@helene2026.com` | `SyndicLot04` | proprietaire | [4] |
| `zeinab.diop@helene2026.com` | `SyndicLot05` | proprietaire | [5] |
| `birane.gueye@helene2026.com` | `SyndicLot06` | proprietaire | [6] |
| `wore.diop@helene2026.com` | `SyndicLot07` | proprietaire | [7] |
| `yves@helene2026.com` | `SyndicLot08` | proprietaire | [8] |
| `mariama.toure@helene2026.com` | `SyndicLot09` | proprietaire | [9] |
| `ndiaye.samb@helene2026.com` | `SyndicLot10` | proprietaire | [10] |
| `marie.dieye@helene2026.com` | `SyndicLot11` | proprietaire | [11] |
| `diop.fils@helene2026.com` | `SyndicLot12` | proprietaire | [12] |
| `mme.fall@helene2026.com` | `SyndicLot13` | proprietaire | [13] |

### Contrôle d'accès par rôle (RBAC)

```javascript
const ROLE_TABS = {
  superadmin:   ["dashboard", "admin"],
  concierge:    ["dashboard", "concierge"],
  proprietaire: ["dashboard", "proprietaire"]
}
```

**Faiblesse critique :** Ce contrôle d'accès est 100 % côté client. Il n'existe aucune vérification côté serveur (pas de RLS visible, pas de middleware).

---

## 9. Valeurs hardcodées — inventaire complet

### Identifiants UUID de tenant

```javascript
// src/App.jsx — constantes globales
const SYNDICAT_ID = "aaaaaaaa-0000-0000-0000-000000000001"
const IMMEUBLE_ID = "bbbbbbbb-0000-0000-0000-000000000001"
const MOIS_ACTIF  = "2026-05"
```

### Fonction de génération d'UUID de lot

```javascript
const lotUUID = (num) =>
  `cccccccc-0000-0000-0000-${String(num).padStart(12, "0")}`
// Lot 1  → cccccccc-0000-0000-0000-000000000001
// Lot 13 → cccccccc-0000-0000-0000-000000000013
```

### Données immeuble hardcodées (13 lots)

| Lot | Désignation | Propriétaire | Tantième | Cotisation |
|---|---|---|---|---|
| 1 | RDC droite | Babacar Diop | 516 | 32 242 FCFA |
| 2 | RDC gauche | Babacar Diop | 862 | 53 861 FCFA |
| 3 | 1er droite | Absatou Touré | 675 | 42 177 FCFA |
| 4 | 1er gauche | Oumoul Faye | 862 | 53 861 FCFA |
| 5 | 2e droite | Zeinab Diop | 675 | 42 177 FCFA |
| 6 | 2e gauche | Birane Gueye | 862 | 53 861 FCFA |
| 7 | 3e droite | Wore Diop | 680 | 42 489 FCFA |
| 8 | 3e gauche | Yves | 873 | 54 548 FCFA |
| 9 | 4e droite | Mariama Touré | 675 | 42 177 FCFA |
| 10 | 4e gauche | Ndiaye Samb | 868 | 54 236 FCFA |
| 11 | 5e droite | Marie Dieye | 675 | 42 177 FCFA |
| 12 | 5e gauche | M. Diop et fils | 868 | 54 236 FCFA |
| 13 | Terrasse | Mme Fall | 909 | 56 798 FCFA |

**Total attendu mensuel :** 619 512 FCFA

### Prestataires hardcodés (état initial)

| Prestataire | Contact | Téléphone | Montant mensuel |
|---|---|---|---|
| Gardiennage DACCESS | Ousmane Ndiaye | +221 77 123 45 67 | 210 000 FCFA |
| Propre+ Nettoyage | Aissatou Fall | +221 76 987 65 43 | 70 000 FCFA |
| OTIS Ascenseurs SN | Thierno Ba | +221 33 867 12 34 | 60 000 FCFA |
| SENELEC / Woyofal | Agence Mermoz | +221 33 839 99 99 | 100 000 FCFA |
| SDE / Sen'Eau | Service Client | +221 33 839 77 77 | 60 000 FCFA |

### Dépenses mai 2026 hardcodées

| Libellé | Montant | Statut |
|---|---|---|
| Woyofal (Électricité) | 100 000 FCFA | Réglé |
| Sen'Eau (Eau) | 119 476 FCFA | Réglé |
| Gardiennage | 210 000 FCFA | Réglé |
| Nettoyage | 70 000 FCFA | Réglé |
| Ascenseur | 60 000 FCFA | Réglé |
| Honoraire Syndic | 177 000 FCFA | En attente |
| Fonds Réserve | 60 000 FCFA | En attente |

### Solde initial hardcodé

```javascript
solde: 177038  // FCFA — calculé manuellement, codé en dur
```

### Credentials Supabase (fallback hardcodé)

```javascript
// src/supabase.js
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL
  || "https://kygmnmtmmzysbbytvatr.supabase.co"   // ← HARDCODÉ
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  || "eyJhbGci..."                                   // ← HARDCODÉ
```

### Données historiques pour graphiques (fév–mai 2026)

Séries mensuelles complètes hardcodées dans `DashboardView` pour alimenter les graphiques Recharts — ces données ne proviennent pas de Supabase.

---

## 10. Analyse multi-tenant

### Ce qui fonctionne (bonnes bases)

| Mécanisme | Description |
|---|---|
| Filtrage par `immeuble_id` | Toutes les requêtes Supabase filtrent par immeuble |
| Filtrage par `syndicat_id` | Les comptes marchands sont scopés au syndicat |
| Restriction de lots | Les propriétaires ne voient que leurs lots (côté client) |
| RBAC basique | Les onglets sont filtrés par rôle utilisateur |
| `profiles.immeuble_id` | La table profiles stocke l'appartenance à un immeuble |

### Lacunes critiques pour le multi-tenant

#### 1. Identifiants de tenant hardcodés (BLOQUANT)
```javascript
// Ces deux constantes doivent devenir dynamiques
const SYNDICAT_ID = "aaaaaaaa-0000-0000-0000-000000000001"
const IMMEUBLE_ID = "bbbbbbbb-0000-0000-0000-000000000001"
```
Il est impossible d'ajouter un deuxième immeuble sans modifier le code source.

#### 2. Mois actif hardcodé
```javascript
const MOIS_ACTIF = "2026-05"
```
Toute gestion multi-mensuelle est impossible sans modification du code.

#### 3. Isolation locataire 100 % côté client
Toute la logique de scoping se fait dans React. Un utilisateur avec accès aux outils développeur pourrait modifier `IMMEUBLE_ID` en mémoire et accéder aux données d'un autre immeuble.

#### 4. Absence de RLS (Row-Level Security) Supabase
Aucune politique RLS visible. Cela signifie que la clé `anon` publique, combinée à l'absence de RLS, permet potentiellement l'accès à tous les enregistrements de toutes les tables.

#### 5. Données de lots et propriétaires hardcodées
Les 13 lots avec noms, tantièmes et cotisations sont des constantes JavaScript, pas des données en base. Ajouter un immeuble nécessite une modification du code.

#### 6. Schéma incohérent (syndicat vs immeuble)
`comptes_marchands` est scopé par `syndicat_id` uniquement, alors que toutes les autres tables utilisent `immeuble_id`. Cela complique l'isolation dans un contexte multi-immeuble au sein d'un même syndicat.

#### 7. Mises à jour optimistes sans rollback
Si la synchronisation Supabase échoue, l'état React reste modifié sans correspondance BDD. À l'échelle multi-tenant, cela peut conduire à des incohérences de données invisibles entre utilisateurs.

---

## 11. Risques techniques

### CRITIQUE (à traiter avant tout passage en production multi-tenant)

| # | Risque | Impact | Description |
|---|---|---|---|
| C1 | **Credentials Supabase hardcodés** | Sécurité | La clé anon est dans le code source versionné. Sans RLS, elle donne accès à toutes les données. |
| C2 | **Absence de RLS** | Sécurité / Isolation | Sans Row-Level Security, n'importe quel client avec la clé anon peut lire/écrire toutes les tables. |
| C3 | **IDs de tenant hardcodés** | Scalabilité | Rend toute évolution multi-tenant impossible sans refactoring. |
| C4 | **Autorisation 100 % client-side** | Sécurité | Les rôles et le scoping de lots ne sont vérifiés que dans React, pas en base de données. |
| C5 | **Mots de passe en clair dans le code** | Sécurité | Les credentials de démo sont visibles dans le source (y compris dans les bundles Vite buildés). |

### ÉLEVÉ

| # | Risque | Impact | Description |
|---|---|---|---|
| H1 | **Architecture monolithique** | Maintenabilité | 1 916 lignes dans un seul fichier rendent le refactoring dangereux. |
| H2 | **Mises à jour optimistes sans rollback** | Intégrité des données | Divergence silencieuse entre état local et BDD en cas d'erreur réseau. |
| H3 | **Absence de tests** | Régression | Aucun filet de sécurité pour les modifications. |
| H4 | **Données métier hardcodées** | Flexibilité | Lots, tantièmes, propriétaires dans le code — impossible de gérer depuis une UI. |
| H5 | **MOIS_ACTIF statique** | Fonctionnel | Passage au mois suivant nécessite une modification du code. |

### MOYEN

| # | Risque | Impact | Description |
|---|---|---|---|
| M1 | **Pas de TypeScript** | Qualité | Aucune vérification de type à la compilation. |
| M2 | **Aucune gestion d'erreur UI** | UX | Les erreurs Supabase ne sont que `console.error()`, invisibles pour l'utilisateur. |
| M3 | **CSS inline intégral** | Maintenabilité | Impossible de créer un système de thème ou de personnalisation par syndic. |
| M4 | **Pas de router** | Navigation | Navigation simulée par état React, URLs non partageables, historique navigateur non géré. |
| M5 | **Schéma BDD non versionné** | Infrastructure | Pas de fichiers de migration SQL dans le dépôt. |
| M6 | **Données historiques hardcodées** | Exactitude | Les graphiques du dashboard utilisent des données statiques, pas de vraies données BDD. |

### BAS

| # | Risque | Impact | Description |
|---|---|---|---|
| B1 | **Pas de linter/formatter** | Qualité code | Incohérences de style à mesure que le projet grandit. |
| B2 | **Pas de chargement progressif** | UX | Tout est chargé en bloc à la connexion. |
| B3 | **README vide** | Onboarding | Aucune documentation pour un nouveau développeur. |

---

## 12. Qualité du code

### Points forts

- Pattern `useReducer` cohérent et bien structuré
- Logique métier claire et lisible (en français)
- Design responsive mobile pensé dès le départ
- Dépendances minimales (lean)
- Nommage français cohérent avec le domaine métier

### Points faibles

| Problème | Gravité |
|---|---|
| Fichier unique de 1 916 lignes | Critique |
| Aucun composant extrait dans des fichiers séparés | Élevé |
| CSS 100 % inline — pas de classes, pas de variables | Élevé |
| Pas de TypeScript — aucune sécurité de type | Moyen |
| Pas de tests unitaires ni d'intégration | Élevé |
| Pas de gestion d'erreur utilisateur | Moyen |
| Données statiques mélangées avec la logique applicative | Élevé |
| Duplication de fonctions de formatage | Bas |
| Pas de séparation services / composants | Élevé |

---

## 13. Améliorations prioritaires

### Priorité 1 — Sécurité (avant tout déploiement public)

1. **Activer RLS sur toutes les tables Supabase**
   ```sql
   -- Exemple pour la table paiements
   ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "tenant_isolation" ON paiements
     FOR ALL USING (
       immeuble_id IN (
         SELECT immeuble_id FROM profiles WHERE id = auth.uid()
       )
     );
   ```

2. **Supprimer les credentials hardcodés** — utiliser uniquement les variables d'environnement avec une erreur explicite si absentes.

3. **Supprimer les mots de passe de démo** du code source — utiliser Supabase Auth Studio pour créer/gérer les comptes.

### Priorité 2 — Multi-tenant (cœur de l'évolution)

4. **Rendre `IMMEUBLE_ID` et `SYNDICAT_ID` dynamiques**
   ```javascript
   // Charger depuis le profil utilisateur après connexion
   const { immeuble_id, syndicat_id } = userProfile
   ```

5. **Sortir les données de lots de App.jsx** — créer une table `lots` en base de données avec tantièmes, désignations, propriétaires.

6. **Rendre `MOIS_ACTIF` dynamique** — stocker en BDD ou paramètre UI par immeuble.

7. **Versionner le schéma SQL** — créer un dossier `supabase/migrations/` avec toutes les DDL.

### Priorité 3 — Architecture (refactoring)

8. **Décomposer App.jsx** en modules :
   ```
   src/
   ├── components/     # Composants atomiques (KpiCard, SPill, MB, etc.)
   ├── views/          # Vues principales (Login, Dashboard, Concierge, etc.)
   ├── hooks/          # useSupabase, useAuth, useImmeuble
   ├── services/       # supabaseService.js (toutes les requêtes SQL)
   ├── context/        # AppContext, AuthContext
   └── utils/          # Formatage FCFA, dates, tantièmes
   ```

9. **Ajouter React Router** pour des URLs navigables et le partage de liens.

10. **Migrer vers TypeScript** — typer les entités métier (Lot, Paiement, Depense, etc.).

### Priorité 4 — Qualité et robustesse

11. **Ajouter la gestion d'erreur UI** — toasts/notifications pour les erreurs Supabase.

12. **Implémenter le rollback des mises à jour optimistes** ou passer à un pattern async explicite.

13. **Ajouter des tests** — au minimum des tests d'intégration sur les flux critiques (paiement, dépense).

14. **Adopter un système de design** — CSS Modules, Tailwind, ou MUI pour remplacer le CSS inline.

---

## 14. Feuille de route SaaS recommandée

### Phase 0 — Stabilisation (Sprint 1–2)
- [ ] Activer RLS Supabase sur toutes les tables
- [ ] Supprimer les credentials hardcodés du code
- [ ] Versionner le schéma BDD (migrations SQL)
- [ ] Corriger les mises à jour optimistes sans rollback

### Phase 1 — Fondations multi-tenant (Sprint 3–5)
- [ ] Créer table `immeubles` et table `lots` en BDD
- [ ] Rendre `immeuble_id` / `syndicat_id` dynamiques (depuis profil)
- [ ] Rendre `MOIS_ACTIF` paramétrable par immeuble
- [ ] Migrer données des lots de App.jsx vers Supabase
- [ ] Implémenter sélecteur de mois dans l'UI

### Phase 2 — Refactoring architectural (Sprint 6–8)
- [ ] Décomposer App.jsx en composants/services/hooks
- [ ] Ajouter React Router
- [ ] Migrer vers TypeScript
- [ ] Ajouter ESLint + Prettier

### Phase 3 — Onboarding multi-syndic (Sprint 9–12)
- [ ] Interface de création de syndic et d'immeuble
- [ ] Wizard d'onboarding (import lots, propriétaires, tantièmes)
- [ ] Gestion multi-immeubles pour un même syndicat
- [ ] Tableau de bord super-admin cross-immeubles
- [ ] Facturation SaaS (Stripe ou paiement mobile)

### Phase 4 — Production SaaS (Sprint 13–16)
- [ ] Docker + CI/CD
- [ ] Monitoring (Sentry, logs structurés)
- [ ] Tests automatisés (Vitest + Playwright)
- [ ] Documentation utilisateur
- [ ] Système de permissions granulaires par immeuble

---

## Annexe — Estimations financières immeuble pilote (mai 2026)

| Métrique | Valeur |
|---|---|
| Cotisations attendues | 619 512 FCFA |
| Dépenses totales | 796 476 FCFA |
| Dépenses réglées | 559 476 FCFA |
| Dépenses en attente | 237 000 FCFA |
| Solde en caisse (initial) | 177 038 FCFA |

---

*Rapport généré le 2026-06-04 — Audit statique, aucune modification du code.*
