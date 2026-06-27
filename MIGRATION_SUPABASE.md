# MIGRATION_SUPABASE.md
**Date :** 2026-06-05  
**Source :** `kygmnmtmmzysbbytvatr.supabase.co` (ancienne base)  
**Destination :** `orgrwqsxtzvnezzealrd.supabase.co` — projet `syndicpro-prod`

---

## État de la migration — ✅ TERMINÉE

| Étape | Statut | Détail |
|---|---|---|
| Export données ancienne base | ✅ | 10 tables exportées |
| Génération SQL complet | ✅ | `002_migration_prod.sql` exécuté |
| Réparation auth.users | ✅ | `003_repair_auth_users.sql` exécuté |
| Correction bugs colonnes | ✅ | `supabaseService.js` corrigé |
| Clé anon configurée | ✅ | `sb_publishable_Y9bKALl8VfcV_Wakn-Slfg_zFqb49FS` |
| Build Docker prod | ✅ | 906 modules transformés, 0 erreur |
| Tests de validation | ✅ | **14/14 tests réussis** |

---

## Ce qui a été migré

### Schéma (11 tables créées)

| Table | Lignes | Description |
|---|---|---|
| `syndicats` | 1 | Syndicat Résidence Hélène |
| `immeubles` | 1 | Bâtiment Résidence Hélène |
| `lots` | 13 | 13 appartements avec tantièmes |
| `profiles` | 15 | Profils utilisateurs (1 superadmin, 1 concierge, 13 propriétaires) |
| `paiements` | 10 | Cotisations mai 2026 (10 lots payés sur 13) |
| `depenses` | 7 | Charges mai 2026 (5 réglées, 2 en attente) |
| `prestataires` | 5 | Gardiennage, Nettoyage, Ascenseurs, SENELEC, SDE |
| `annonces` | 3 | 3 annonces de la résidence |
| `cotisations_exceptionnelles` | 1 | Audit Plomberie (vote en cours) |
| `comptes_marchands` | 3 | Wave, OM, Free (inactifs) |
| `signalements` | 0 | Aucun signalement dans l'ancienne base |

### Utilisateurs auth (15 comptes)

| Email | Mot de passe | Rôle |
|---|---|---|
| `admin@helene2026.com` | `SyndicAdmin2026` | superadmin |
| `concierge@helene2026.com` | `SyndicConcierg2026` | concierge |
| `babacar.diop@helene2026.com` | `SyndicLot01` | propriétaire (Lots 1+2) |
| `absatou.toure@helene2026.com` | `SyndicLot03` | propriétaire (Lot 3) |
| `oumoul.faye@helene2026.com` | `SyndicLot04` | propriétaire (Lot 4) |
| `zeinab.diop@helene2026.com` | `SyndicLot05` | propriétaire (Lot 5) |
| `birane.gueye@helene2026.com` | `SyndicLot06` | propriétaire (Lot 6) |
| `wore.diop@helene2026.com` | `SyndicLot07` | propriétaire (Lot 7) |
| `yves@helene2026.com` | `SyndicLot08` | propriétaire (Lot 8) |
| `mariama.toure@helene2026.com` | `SyndicLot09` | propriétaire (Lot 9) |
| `ndiaye.samb@helene2026.com` | `SyndicLot10` | propriétaire (Lot 10) |
| `marie.dieye@helene2026.com` | `SyndicLot11` | propriétaire (Lot 11) |
| `diop.fils@helene2026.com` | `SyndicLot12` | propriétaire (Lot 12) |
| `mme.fall@helene2026.com` | `SyndicLot13` | propriétaire (Lot 13) |

### RLS activé (11 politiques)

Toutes les tables ont Row-Level Security activé. Les données sont isolées par `syndicat_id`. Deux fonctions helper sont créées :
- `public.my_syndicat_id()` — retourne le syndicat de l'utilisateur courant
- `public.my_immeuble_ids()` — retourne les immeubles accessibles

---

## Bugs corrigés lors de la migration

### Discordances colonnes détectées (ancienne base vs code)

| Table | Colonne dans le code | Colonne réelle en DB | Correction |
|---|---|---|---|
| `lots` | `appart` | `appartement` | ✅ Fallback ajouté dans `loadLots` |
| `lots` | `cotisation` | `cotisation_mensuelle` | ✅ Fallback ajouté dans `loadLots` |
| `lots` | `appart:` (insert) | `appartement:` | ✅ Corrigé dans `createLots` |
| `lots` | `cotisation:` (insert) | `cotisation_mensuelle:` | ✅ Corrigé dans `createLots` |
| `immeubles` | `reference_fonciere` | `reference_tf` | ✅ Fallback ajouté dans `loadImmeubles` + `createImmeuble` |
| `syndicats` | `email, telephone, pays, devise` | colonnes absentes | ✅ Corrigé dans `createSyndicat` |
| `profiles` | `immeubles_ids` | colonne manquante (ALTER non exécuté) | ✅ Inclus dans `002_migration_prod.sql` |

### Fichier modifié : `src/services/supabaseService.js`

- `loadLots()` : utilise `l.appartement || l.appart` et `l.cotisation_mensuelle ?? l.cotisation`
- `loadImmeubles()` : utilise `i.reference_tf || i.reference_fonciere`
- `createSyndicat()` : insert uniquement les colonnes existantes (nom, adresse, ville, plan, actif)
- `createImmeuble()` : utilise `reference_tf` au lieu de `reference_fonciere`
- `createLots()` : utilise `appartement` et `cotisation_mensuelle`

---

## Compatibilité ancienne base

**Aucune perte de données.** Les UUID des lots sont conservés (`cccccccc-0000-0000-0000-000000000001` etc.), ce qui maintient la compatibilité avec tous les `lot_id` existants dans la table `paiements`.

---

## Limitation rencontrée

**Connexion psql directe impossible** depuis Docker Desktop Windows vers la nouvelle base Supabase : le nom `db.orgrwqsxtzvnezzealrd.supabase.co` ne résout qu'en IPv6, non routé par Docker Desktop. 

**Solution utilisée :** Génération d'un fichier SQL complet auto-suffisant à exécuter via le SQL Editor de Supabase.

---

## Vérification post-migration

Une fois les étapes 1 et 2 effectuées, lancer :

```bash
docker compose up app-dev
```

Puis tester :
- [x] Login `admin@helene2026.com` → tableau de bord avec 13 lots
- [x] Login `concierge@helene2026.com` → Cotisations (10 payés / 13)
- [x] Login `mme.fall@helene2026.com` → Espace propriétaire Lot 13
- [x] Changement de mois → données rechargées dynamiquement
- [x] Créer un nouveau syndicat via onboarding → multi-tenant opérationnel
