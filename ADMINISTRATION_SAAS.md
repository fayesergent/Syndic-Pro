# ADMINISTRATION_SAAS.md — Back-Office SyndicPro
**Version :** 1.0 — 2026-06-05  
**Accès :** Rôle `superadmin` uniquement

---

## 1. Vue d'ensemble

Le back-office SyndicPro permet de gérer l'intégralité de la plateforme depuis l'interface React, **sans passer par le SQL Editor Supabase** pour les opérations courantes.

### Accès

```
Dashboard → Sidebar → "Back-Office" (icône ⚙️)
URL logique : tab=backoffice
Rôle requis : superadmin
```

### 5 onglets disponibles

| Onglet | Icône | Capacités |
|---|---|---|
| **Syndicats** | 🏢 | Modifier le syndicat courant, créer un nouveau client |
| **Immeubles** | 🏗️ | CRUD complet des immeubles du syndicat |
| **Lots** | 📋 | Table éditable des lots (tantièmes, cotisations, m²) |
| **Utilisateurs** | 👥 | CRUD complet des comptes (via Edge Function sécurisée) |
| **Paramètres** | ⚙️ | Comptes marchands, paramètres financiers |

---

## 2. Architecture technique

### Hiérarchie des données

```
Syndicat (client SaaS)
  └─ Immeuble(s) [1..N]
       └─ Lots [1..N]
            └─ Paiements, Dépenses, Signalements...

Syndicat ← profiles (users)
  ├─ superadmin   : gestion globale du syndicat
  ├─ concierge    : gestion opérationnelle d'un immeuble
  └─ proprietaire : accès restreint à ses propres lots
```

### Stack technique

```
Frontend React  ──→  supabaseService.js  ──→  Supabase REST API
                 ──→  invokeAdminUsers()  ──→  Edge Function (Deno)
                                              └──→  service_role key
                                                    └──→  auth.users
```

### Sécurité des credentials

| Clé | Emplacement | Exposition |
|---|---|---|
| `VITE_SUPABASE_ANON_KEY` | `.env` (frontend) | Publique — OK (protégée par RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets | **Jamais exposée** — uniquement dans l'Edge Function |

---

## 3. Onglet Syndicats

### Fonctionnalités

**Fiche syndicat courante (lecture)**
- Nom, adresse, ville, pays, devise, plan
- Nombre d'immeubles, nombre de lots total
- Date de création

**Édition inline**
- Bouton "✎ Modifier" → bascule les champs en mode input
- Champs modifiables : nom, adresse, ville, plan, devise
- Bouton "💾 Enregistrer" → appel `updateSyndicat(id, data)`

**Bouton "+ Nouveau client"**
- Lance le wizard `OnboardingView` (4 étapes)
- Crée un nouveau syndicat distinct avec ses propres immeubles et lots

**Note :** La suppression d'un syndicat est intentionnellement absente de l'UI (opération irréversible avec cascade — à réserver au SQL Editor si besoin).

### Service functions utilisées
- `loadSyndicat(syndicatId)` → lecture
- `updateSyndicat(syndicatId, data)` → mise à jour

---

## 4. Onglet Immeubles

### Fonctionnalités

**Liste des immeubles** (grid de cards)
- Nom, adresse, référence TF, nb lots, budget mensuel
- Badge "Actif" / nombre de lots en attente de paiement

**Créer un immeuble**
- Bouton "+ Immeuble" → formulaire slide-in
- Champs : nom (requis), adresse, référence TF, ville, nb_lots estimé, budget_mensuel
- Appel `createImmeuble(syndicatId, data)` → réutilise la fonction d'onboarding

**Éditer un immeuble**
- Clic sur la card → formulaire pré-rempli
- Champs : tous modifiables sauf `id`
- Appel `updateImmeuble(id, data)`

**Supprimer un immeuble**
- Bouton "🗑 Supprimer" + confirmation textuelle (taper le nom exact)
- Appel `deleteImmeuble(id)` — cascade sur les lots (FK ON DELETE CASCADE)

**Sélecteur de syndicat**
- Si le superadmin a accès à plusieurs syndicats, un sélecteur apparaît en haut

### Service functions utilisées
- `loadImmeubles(syndicatId)` → liste
- `createImmeuble(syndicatId, data)` → création
- `updateImmeuble(id, data)` → édition
- `deleteImmeuble(id)` → suppression

---

## 5. Onglet Lots

### Fonctionnalités

**Sélecteur d'immeuble** (en-tête)
- Reprend `ImmeubleSelector` existant
- Change l'immeuble courant → recharge les lots

**Table des lots** (inline-editable)
```
# | Désignation | Étage | Propriétaire | Tantième | Cotisation | m² | Actions
```

**Édition inline**
- Clic sur une cellule → transforme en `<input>`
- Modification visible immédiatement dans l'UI (optimistic)
- Un indicateur "modifié" sur les lignes changées

**Ajouter un lot**
- Bouton "+ Lot" → nouvelle ligne vide en bas de table
- Numéro auto-incrémenté

**Supprimer un lot**
- Icône 🗑 en fin de ligne + confirmation
- Appel `deleteLot(id)`

**Sauvegarder tout**
- Bouton "💾 Sauvegarder" (en bas) → batch update de toutes les lignes modifiées
- Appels parallèles `updateLot(id, data)` pour chaque ligne touchée
- Puis `reloadLots()` pour rafraîchir le contexte global

**Pied de tableau**
- Total tantièmes (idéalement 10 000)
- Total cotisations attendues / mois

### Service functions utilisées
- `loadLots(immeubleId)` → liste (contexte AppContext)
- `addLot(immeubleId, syndicatId, lot)` → création
- `updateLot(id, data)` → mise à jour unitaire
- `deleteLot(id)` → suppression

---

## 6. Onglet Utilisateurs

### Fonctionnalités

**Liste des utilisateurs** (tableau)
```
Avatar | Nom complet | Email | Rôle | Immeubles | Lots | Créé le | Actions
```

**Filtres**
- Tous les rôles / Superadmin / Concierge / Propriétaire

**Créer un utilisateur**
- Modal "+ Utilisateur" avec :
  - Email (requis, unique)
  - Mot de passe (requis à la création, min 8 chars)
  - Nom complet
  - Rôle (dropdown)
  - Si concierge → sélecteur d'immeuble(s)
  - Si propriétaire → sélecteur de lots (cases à cocher)
- Appel Edge Function `admin-users` action `create`

**Modifier un utilisateur**
- Modal pré-rempli (sans mot de passe)
- Peut modifier : nom, rôle, immeubles assignés, lots assignés
- Bouton "🔑 Réinitialiser MDP" → génère un champ nouveau mot de passe
- Appel `updateUserProfile(userId, data)` + Edge Function si changement de MDP

**Supprimer un utilisateur**
- Confirmation + appel Edge Function action `delete`
- Supprime l'entrée `auth.users` ET le `profile` (cascade)

### Edge Function — Sécurité
La Edge Function `admin-users` :
1. Vérifie que l'appelant a un JWT valide
2. Vérifie que le profil de l'appelant a le rôle `superadmin`
3. Vérifie que l'utilisateur cible appartient au même `syndicat_id`
4. Effectue l'opération avec la `service_role` key

---

## 7. Onglet Paramètres

Reprend le contenu de l'ancien `SuperAdminView` :

- **Comptes marchands** : Wave, OM, Free — numéros + toggle actif
- **Paramètres financiers** : frais de service mensuel
- **Graphique** : Prévisionnel vs Réel des charges
- **Grille tantièmes** : tableau lecture seule (accès rapide)

---

## 8. Edge Function admin-users

### Déploiement

```bash
# Pré-requis : Supabase CLI installé
npm install -g supabase

# Déployer
supabase functions deploy admin-users \
  --project-ref orgrwqsxtzvnezzealrd

# Configurer le secret service_role dans Supabase
# Dashboard → Settings → Edge Functions → Secrets
# Ajouter : SUPABASE_SERVICE_ROLE_KEY = <valeur depuis Settings → API>
```

### API de la fonction

```typescript
// POST https://orgrwqsxtzvnezzealrd.supabase.co/functions/v1/admin-users
// Headers: Authorization: Bearer <jwt_token>
// Body:
{
  action: "create" | "update_password" | "update_email" | "delete",
  
  // Pour "create" :
  email: string,
  password: string,
  nomComplet: string,
  role: "superadmin" | "concierge" | "proprietaire",
  syndicatId: string,
  immeubleId?: string,
  lotsIds?: string[],
  immeubleIds?: string[],
  
  // Pour "update_password" et "update_email" :
  userId: string,
  newPassword?: string,
  newEmail?: string,
  
  // Pour "delete" :
  userId: string
}
```

### Réponse

```json
// Succès
{"success": true, "userId": "uuid", "email": "user@example.com"}

// Erreur
{"success": false, "error": "Message d'erreur"}
```

---

## 9. SQL requis

### Fichier : supabase/migrations/004_backoffice_rls.sql

À exécuter une fois dans le SQL Editor avant utilisation du back-office :

```sql
-- Fonction RPC pour lister les emails des utilisateurs d'un syndicat
-- (la table auth.users n'est pas accessible via REST API standard)
CREATE OR REPLACE FUNCTION public.list_syndicat_users(p_syndicat_id UUID)
RETURNS TABLE(
  id           UUID,
  email        TEXT,
  created_at   TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT u.id, u.email, u.created_at
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE p.syndicat_id = p_syndicat_id
    AND p.syndicat_id IN (
      SELECT syndicat_id FROM public.profiles WHERE id = auth.uid()
    )
  ORDER BY u.created_at;
$$;
```

---

## 10. Opérations sans interface (SQL Editor uniquement)

Les opérations suivantes restent volontairement hors de l'interface pour leur caractère irréversible ou technique :

| Opération | Raison |
|---|---|
| Supprimer un syndicat | Cascade totale irréversible |
| Modifier les politiques RLS | Technique — risque de blocage |
| Exécuter des migrations de schéma | Technique — versioning requis |
| Accéder à `auth.audit_log_entries` | Données de sécurité sensibles |
| Modifier les clés API Supabase | Via dashboard Supabase uniquement |
