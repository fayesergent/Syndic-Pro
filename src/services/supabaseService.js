import { supabase, uid } from "./supabase.js";

// ─── Contexte tenant passé en paramètre à chaque fonction ────────────────────
// { syndicatId, immeubleId, mois }
// Aucun ID n'est hardcodé ici — tout vient d'AppContext.

// ─── Helpers internes ─────────────────────────────────────────────────────────

// Convertit un lot_id UUID → numéro de lot pour les données de la Résidence Hélène
// (pattern legacy : cccccccc-0000-0000-0000-000000000001 → 1)
// Pour les nouveaux immeubles, on utilisera lot.numero directement depuis la table lots.
function lotNumFromId(lotId, lots) {
  if(lots?.length) {
    const found = lots.find(l => l.lotId === lotId);
    if(found) return found.lot;
  }
  // Fallback legacy : extraire le numéro de l'UUID pattern
  return parseInt((lotId || "").slice(-12)) || 0;
}

// ─── CHARGEMENT DES LOTS ──────────────────────────────────────────────────────

export async function loadLots(immeubleId) {
  if(!immeubleId) return [];
  try {
    const {data, error} = await supabase
      .from("lots")
      .select("*")
      .eq("immeuble_id", immeubleId)
      .order("numero");
    if(error) throw error;
    return (data||[]).map(l => ({
      lotId:      l.id,
      lot:        l.numero,
      // Compatibilité schéma : 'appartement' (prod) ou 'appart' (legacy)
      appart:     l.appartement || l.appart || "",
      proprio:    l.proprio || "",
      etage:      l.etage || "",
      tantieme:   Number(l.tantieme),
      // Compatibilité schéma : 'cotisation_mensuelle' (prod) ou 'cotisation' (legacy)
      cotisation: Number(l.cotisation_mensuelle ?? l.cotisation ?? 0),
    }));
  } catch(e) {
    console.error("loadLots error:", e);
    return [];
  }
}

// ─── CHARGEMENT DES IMMEUBLES ─────────────────────────────────────────────────

export async function loadImmeubles(syndicatId) {
  if(!syndicatId) return [];
  try {
    const {data, error} = await supabase
      .from("immeubles")
      .select("*")
      .eq("syndicat_id", syndicatId)
      .order("created_at");
    if(error) throw error;
    return (data||[]).map(i => ({
      id:      i.id,
      nom:     i.nom,
      adresse: i.adresse || "",
      // Compatibilité schéma : 'reference_tf' (prod) ou 'reference_fonciere' (legacy)
      reference_fonciere: i.reference_tf || i.reference_fonciere || "",
      ville:          i.ville          || "",
      nb_lots:        i.nb_lots        ?? 0,
      budget_mensuel: i.budget_mensuel ?? 0,
      mode_cotisation: i.mode_cotisation || "fixe",
    }));
  } catch(e) {
    console.error("loadImmeubles error:", e);
    return [];
  }
}

// ─── CHARGEMENT DES DONNÉES PRINCIPALE ───────────────────────────────────────

export async function loadFromSupabase({ syndicatId, immeubleId, mois, lots = [] }) {
  if(!immeubleId || !syndicatId) return null;
  try {
    const [
      {data:pmts}, {data:deps}, {data:prests},
      {data:signs}, {data:anns}, {data:cots}, {data:marchands}
    ] = await Promise.all([
      supabase.from("paiements").select("*").eq("immeuble_id", immeubleId).eq("mois", mois),
      supabase.from("depenses").select("*").eq("immeuble_id", immeubleId).eq("mois", mois),
      supabase.from("prestataires").select("*").eq("immeuble_id", immeubleId),
      supabase.from("signalements").select("*").eq("immeuble_id", immeubleId).order("created_at", {ascending:false}),
      supabase.from("annonces").select("*").eq("immeuble_id", immeubleId).order("created_at", {ascending:false}),
      supabase.from("cotisations_exceptionnelles").select("*").eq("immeuble_id", immeubleId).order("created_at", {ascending:false}),
      supabase.from("comptes_marchands").select("*").eq("syndicat_id", syndicatId),
    ]);

    // Paiements : un entry par lot, overlay avec données DB
    const paiements = lots.map(l => ({lot:l.lot, lotId:l.lotId, montant:0, mode:"-"}));
    (pmts||[]).forEach(p => {
      const num = lotNumFromId(p.lot_id, lots);
      const idx = paiements.findIndex(x => x.lot === num);
      if(idx >= 0) paiements[idx] = {lot:num, lotId:p.lot_id, montant:Number(p.montant), mode:p.mode};
    });

    const depenses = (deps||[]).map(d => ({
      id:d.id, label:d.label, montant:Number(d.montant),
      mode:d.mode||"-", date:d.date_reglement||"-",
      cat:d.categorie, statut:d.statut, pid:d.prestataire_id||null,
    }));

    const prestataires = (prests||[]).map(p => ({
      id:p.id, nom:p.nom, contact:p.contact||"", tel:p.telephone||"",
      adresse:p.adresse||"", montant:Number(p.montant_mensuel),
      mode:p.mode_paiement||"Wave", wave:p.numero_wave||"", om:p.numero_om||"",
      ini:p.initiales||(p.nom||"?").slice(0,2).toUpperCase(), col:p.couleur||"#10B981",
    }));

    const signalements = (signs||[]).map(s => ({
      id:s.id,
      lot:    lotNumFromId(s.lot_id, lots),
      lotId:  s.lot_id,
      proprio:s.proprio||"", appart:s.appart||"",
      description:s.description, photo:s.photo_url||null,
      statut:s.statut, reponse:s.reponse||null,
      dateCreation:s.created_at ? new Date(s.created_at).toLocaleDateString("fr-FR") : "-",
    }));

    const annonces = (anns||[]).map(a => ({
      id:a.id, titre:a.titre, message:a.message||"",
      type:a.type||"info", public:a.public!==false,
      date:a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : "-",
    }));

    const cotisationsExc = (cots||[]).map(c => ({
      id:c.id, cause:c.cause, impacts:c.impacts||"",
      montant:Number(c.montant), photo:c.photo_url||null,
      statut:c.statut, votes:c.votes||{},
      repartition:typeof c.repartition==="string" ? JSON.parse(c.repartition) : Array.isArray(c.repartition) ? c.repartition : [],
      dateCreation:c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "-",
    }));

    const comptesMarchands = {
      wave:{numero:"", tillId:"", actif:false},
      om:  {numero:"", businessId:"", actif:false},
      free:{numero:"", actif:false},
    };
    (marchands||[]).forEach(m => {
      if(m.operateur === "wave") comptesMarchands.wave = {numero:m.numero||"", tillId:m.till_id||"", actif:m.actif};
      if(m.operateur === "om")   comptesMarchands.om   = {numero:m.numero||"", businessId:m.business_id||"", actif:m.actif};
      if(m.operateur === "free") comptesMarchands.free = {numero:m.numero||"", actif:m.actif};
    });

    // Solde calculé depuis les données réelles du mois
    const totalRecu     = paiements.reduce((s,p) => s + (p.montant||0), 0);
    const totalDepRegle = depenses.filter(d => d.statut==="regle").reduce((s,d) => s + d.montant, 0);
    const solde = totalRecu - totalDepRegle;

    return {paiements, depenses, prestataires, signalements, annonces, cotisationsExc, comptesMarchands, solde};
  } catch(e) {
    console.error("Supabase load error:", e);
    return null;
  }
}

// ─── SYNCHRONISATION DES MUTATIONS ───────────────────────────────────────────

export async function syncToSupabase(action, state, { syndicatId, immeubleId, mois }) {
  if(!immeubleId || !syndicatId) return;
  try {
    switch(action.type) {
      case "VALIDER_PAIEMENT": {
        // Utiliser le lotId réel si disponible, sinon construire l'UUID legacy
        const lotId = action.lotId || `cccccccc-0000-0000-0000-${String(action.lot).padStart(12,"0")}`;
        await supabase.from("paiements").upsert({
          lot_id:lotId, immeuble_id:immeubleId, syndicat_id:syndicatId,
          mois, montant:action.montant, mode:action.mode,
        }, {onConflict:"lot_id,mois"});
        break;
      }
      case "AJOUTER_DEPENSE": {
        const d = action.data;
        await supabase.from("depenses").insert({
          id:d.id, immeuble_id:immeubleId, syndicat_id:syndicatId,
          label:d.label, montant:d.montant, categorie:d.cat||d.categorie||"fixe",
          mode:d.mode, statut:d.statut, mois,
          date_reglement:d.statut==="regle" ? d.date : null,
          prestataire_id:d.pid||null,
        });
        break;
      }
      case "VALIDER_DEPENSE":
        await supabase.from("depenses").update({
          statut:"regle", mode:action.mode,
          date_reglement:new Date().toLocaleDateString("fr-FR").slice(0,5),
        }).eq("id", action.id);
        break;
      case "SUPPRIMER_DEPENSE":
        await supabase.from("depenses").delete().eq("id", action.id);
        break;
      case "ADD_PRESTA": {
        const p = action.data;
        await supabase.from("prestataires").insert({
          id:p.id, immeuble_id:immeubleId, syndicat_id:syndicatId,
          nom:p.nom, contact:p.contact, telephone:p.tel, adresse:p.adresse,
          montant_mensuel:p.montant, mode_paiement:p.mode,
          numero_wave:p.wave, numero_om:p.om,
          initiales:p.ini||(p.nom||"?").slice(0,2).toUpperCase(), couleur:p.col||"#10B981",
        });
        break;
      }
      case "DEL_PRESTA":
        await supabase.from("prestataires").delete().eq("id", action.id);
        break;
      case "UPD_PRESTA":
        await supabase.from("prestataires").update({
          nom:action.data.nom, contact:action.data.contact, telephone:action.data.tel,
          adresse:action.data.adresse, montant_mensuel:action.data.montant,
          mode_paiement:action.data.mode, numero_wave:action.data.wave, numero_om:action.data.om,
        }).eq("id", action.id);
        break;
      case "PAYER_PRESTA": {
        const id = uid();
        await supabase.from("depenses").insert({
          id, immeuble_id:immeubleId, syndicat_id:syndicatId,
          label:action.label, montant:action.montant, categorie:"fixe",
          mode:action.mode, statut:"regle", mois,
          date_reglement:new Date().toLocaleDateString("fr-FR").slice(0,5),
          prestataire_id:action.pid,
        });
        break;
      }
      case "ADD_SIGNALEMENT": {
        const d = action.data;
        const lotId = d.lotId || `cccccccc-0000-0000-0000-${String(d.lot).padStart(12,"0")}`;
        await supabase.from("signalements").insert({
          immeuble_id:immeubleId, syndicat_id:syndicatId,
          lot_id:lotId, proprio:d.proprio, appart:d.appart,
          description:d.description, photo_url:d.photo||null, statut:"prive",
        });
        break;
      }
      case "RENDRE_PUBLIC":
        await supabase.from("signalements").update({statut:"public"}).eq("id", action.id);
        break;
      case "REPONDRE_SIG":
        await supabase.from("signalements").update({reponse:action.reponse}).eq("id", action.id);
        break;
      case "CREER_COTISATION_EXC": {
        const d = action.data;
        await supabase.from("cotisations_exceptionnelles").insert({
          immeuble_id:immeubleId, syndicat_id:syndicatId,
          cause:d.cause, impacts:d.impacts||"", montant:d.montant,
          photo_url:d.photo||null, statut:"vote", votes:{},
          repartition:d.repartition||[],
        });
        break;
      }
      case "VOTER_COT": {
        const cotVote = state.cotisationsExc.find(c => c.id === action.cid);
        const newVotes = {...(cotVote?.votes||{}), [action.lot]:action.dateVote};
        await supabase.from("cotisations_exceptionnelles").update({votes:newVotes}).eq("id", action.cid);
        break;
      }
      case "CLORE_VOTE":
        await supabase.from("cotisations_exceptionnelles").update({statut:"clos"}).eq("id", action.id);
        break;
      case "ADD_ANNONCE":
        await supabase.from("annonces").insert({
          immeuble_id:immeubleId, syndicat_id:syndicatId,
          titre:action.data.titre, message:action.data.message, type:action.data.type, public:true,
        });
        break;
      case "UPD_MARCHANDS":
        await supabase.from("comptes_marchands").upsert({
          syndicat_id:syndicatId, operateur:action.op,
          numero:action.data.numero||null,
          till_id:action.data.tillId||null,
          business_id:action.data.businessId||null,
          actif:action.data.actif,
        }, {onConflict:"syndicat_id,operateur"});
        break;
      default:
        break;
    }
  } catch(e) {
    console.error("Supabase sync error:", action.type, e.message);
  }
}

// ─── ONBOARDING — Création d'un nouveau syndicat ─────────────────────────────

export async function createSyndicat({ nom, adresse, ville, pays = "SN", devise = "FCFA" }) {
  // Schéma prod : nom, reference_tf, ville, adresse, logo_url, plan, actif
  const {data, error} = await supabase.from("syndicats").insert({
    nom,
    adresse: adresse || null,
    ville:   ville   || null,
    plan:    'starter',
    actif:   true,
  }).select().single();
  if(error) throw error;
  return data;
}

export async function createImmeuble({ syndicatId, nom, adresse, reference_fonciere, ville, nb_lots, budget_mensuel, mode_cotisation }) {
  const {data, error} = await supabase.from("immeubles").insert({
    syndicat_id:    syndicatId,
    nom,
    adresse:        adresse || null,
    reference_tf:   reference_fonciere || null,
    ville:          ville || null,
    nb_lots:        nb_lots ? Number(nb_lots) : null,
    budget_mensuel: budget_mensuel ? Number(budget_mensuel) : null,
    mode_cotisation: mode_cotisation === "tantieme" ? "tantieme" : "fixe",
  }).select().single();
  if(error) throw error;
  return data;
}

export async function createLots(immeubleId, syndicatId, lots) {
  // Schéma prod : 'appartement' + 'cotisation_mensuelle'
  const rows = lots.map(l => ({
    immeuble_id:          immeubleId,
    syndicat_id:          syndicatId,
    numero:               l.numero,
    appartement:          l.appart || l.appartement || "",
    proprio:              l.proprio || "",
    etage:                l.etage || "",
    tantieme:             Number(l.tantieme  || 0),
    cotisation_mensuelle: Number(l.cotisation || 0),
  }));
  const {data, error} = await supabase.from("lots").insert(rows).select();
  if(error) throw error;
  return data;
}

// Crée syndicat + immeuble + lots. Essaie d'abord via l'edge function (service_role),
// puis fallback sur des appels directs si l'edge function n'est pas disponible.
export async function createSyndicatFull({ syndicatNom, syndicatAdresse, pays, devise, immeubleNom, immeubleAdr, immeubleRef, immeubleBudget, immeubleModeCotisation, lots, utilisateurs, adminUserId, adminNomComplet }) {
  // Essai 1 : edge function
  try {
    const {data, error} = await supabase.functions.invoke("admin-users", {
      body: { action: "create_syndicat_full", syndicatNom, syndicatAdresse, pays, devise, immeubleNom, immeubleAdr, immeubleRef, immeubleBudget, immeubleModeCotisation, lots, utilisateurs, adminUserId, adminNomComplet },
    });
    if(!error && data?.success) return { syndicat: data.syndicat, immeuble: data.immeuble };
  } catch(_) {}

  // Fallback : appels directs Supabase
  const syndicat = await createSyndicat({ nom: syndicatNom, adresse: syndicatAdresse, ville: null, pays, devise });
  const immeuble = await createImmeuble({
    syndicatId:         syndicat.id,
    nom:                immeubleNom,
    adresse:            immeubleAdr,
    reference_fonciere: immeubleRef,
    ville:              null,
    nb_lots:            lots?.length || 0,
    budget_mensuel:     immeubleBudget,
    mode_cotisation:    immeubleModeCotisation,
  });
  if(lots?.length) {
    await createLots(immeuble.id, syndicat.id, lots);
  }
  return { syndicat, immeuble };
}

export async function createAdminProfile(userId, { syndicatId, immeubleId, nomComplet, email }) {
  const row = {
    id:userId,
    syndicat_id:syndicatId,
    immeuble_id:immeubleId,
    immeubles_ids:[immeubleId],
    nom_complet:nomComplet,
    role:"admin",
    lots_ids:[],
  };
  if(email) row.email = email;
  const {error} = await supabase.from("profiles").upsert(row, {onConflict:"id"});
  if(error) throw error;
}

// ─── BACK-OFFICE : Fonctions d'administration ─────────────────────────────────

// ── Syndicat ──────────────────────────────────────────────────────────────────

export async function loadSyndicat(syndicatId) {
  if(!syndicatId) return null;
  const {data, error} = await supabase.from("syndicats").select("*").eq("id", syndicatId).single();
  if(error) throw error;
  return data;
}

// Liste tous les syndicats de la plateforme
export async function listAllSyndicats() {
  // Essai 1 : edge function (service_role, bypass RLS)
  try {
    const {data, error} = await supabase.functions.invoke("admin-users", {
      body: { action: "list_all_syndicats" },
    });
    if(!error && data?.success) return data.syndicats || [];
  } catch(_) {}
  // Fallback : requête directe (soumise au RLS)
  try {
    const {data, error} = await supabase.from("syndicats").select("*").order("created_at");
    if(!error && data) return data.map(s => ({...s, nb_immeubles: 0, nb_users: 0}));
  } catch(_) {}
  return [];
}

export async function updateSyndicat(syndicatId, { nom, adresse, ville, plan, devise }) {
  const {error} = await supabase.from("syndicats")
    .update({ nom, adresse, ville, plan, devise })
    .eq("id", syndicatId);
  if(error) throw error;
}

export async function deleteSyndicat(syndicatId) {
  // Essai via edge function
  try {
    const {data, error} = await supabase.functions.invoke("admin-users", {
      body: { action: "delete_syndicat", syndicatId },
    });
    if(!error && data?.success) return;
  } catch(_) {}

  // Fallback : suppression directe en cascade
  await supabase.from("lots").delete().eq("syndicat_id", syndicatId);
  await supabase.from("paiements").delete().eq("syndicat_id", syndicatId);
  await supabase.from("depenses").delete().eq("syndicat_id", syndicatId);
  await supabase.from("prestataires").delete().eq("syndicat_id", syndicatId);
  await supabase.from("signalements").delete().eq("syndicat_id", syndicatId);
  await supabase.from("annonces").delete().eq("syndicat_id", syndicatId);
  await supabase.from("cotisations_exceptionnelles").delete().eq("syndicat_id", syndicatId);
  await supabase.from("comptes_marchands").delete().eq("syndicat_id", syndicatId);
  await supabase.from("immeubles").delete().eq("syndicat_id", syndicatId);
  await supabase.from("profiles").delete().eq("syndicat_id", syndicatId);
  const {error: delErr} = await supabase.from("syndicats").delete().eq("id", syndicatId);
  if(delErr) throw delErr;
}

// ── Immeubles ─────────────────────────────────────────────────────────────────

export async function updateImmeuble(immeubleId, { nom, adresse, reference_tf, ville, nb_lots, budget_mensuel, mode_cotisation }) {
  const updates = { nom, adresse, reference_tf, ville, nb_lots, budget_mensuel };
  if(mode_cotisation !== undefined) updates.mode_cotisation = mode_cotisation === "tantieme" ? "tantieme" : "fixe";
  const {error} = await supabase.from("immeubles")
    .update(updates)
    .eq("id", immeubleId);
  if(error) throw error;
}

export async function deleteImmeuble(immeubleId) {
  const {error} = await supabase.from("immeubles").delete().eq("id", immeubleId);
  if(error) throw error;
}

// ── Lots ──────────────────────────────────────────────────────────────────────

export async function addLot(immeubleId, syndicatId, lot) {
  const {data, error} = await supabase.from("lots").insert({
    immeuble_id:          immeubleId,
    syndicat_id:          syndicatId,
    numero:               Number(lot.numero),
    appartement:          lot.appartement || lot.appart || "",
    proprio:              lot.proprio || "",
    etage:                lot.etage || "",
    superficie_m2:        lot.superficie_m2 ? Number(lot.superficie_m2) : null,
    tantieme:             Number(lot.tantieme || 0),
    cotisation_mensuelle: Number(lot.cotisation_mensuelle || lot.cotisation || 0),
  }).select().single();
  if(error) throw error;
  return data;
}

export async function updateLot(lotId, { appartement, proprio, etage, superficie_m2, tantieme, cotisation_mensuelle }) {
  const {error} = await supabase.from("lots")
    .update({ appartement, proprio, etage, superficie_m2, tantieme, cotisation_mensuelle })
    .eq("id", lotId);
  if(error) throw error;
}

export async function deleteLot(lotId) {
  const {error} = await supabase.from("lots").delete().eq("id", lotId);
  if(error) throw error;
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────

export async function listUsersBySyndicat(syndicatId) {
  if(!syndicatId) return [];

  // Essai 1 : edge function "list" (service_role, bypass RLS complet)
  try {
    const {data, error} = await supabase.functions.invoke("admin-users", {
      body: { action: "list", syndicatId },
    });
    if(!error && data?.success) return data.users || [];
    // Si l'edge function ne connaît pas encore "list" → fallback ci-dessous
  } catch(_) { /* ignore */ }

  // Fallback : requête directe (soumise au RLS)
  try {
    const {data: profiles, error: profErr} = await supabase
      .from("profiles")
      .select("id, role, nom_complet, email, telephone, lots_ids, immeubles_ids, created_at")
      .eq("syndicat_id", syndicatId)
      .order("created_at");
    if(profErr) throw profErr;

    return (profiles || []).map(p => ({
      id:          p.id,
      email:       p.email || "",
      role:        p.role,
      nomComplet:  p.nom_complet   || "",
      telephone:   p.telephone     || "",
      lotsIds:     p.lots_ids      || [],
      immeubleIds: p.immeubles_ids || [],
      createdAt:   p.created_at,
    }));
  } catch(e) {
    console.error("listUsersBySyndicat error:", e);
    return [];
  }
}

export async function updateUserProfile(userId, { nomComplet, telephone, role, immeubleIds, lotsIds }) {
  const updates = {};
  if(nomComplet   !== undefined) updates.nom_complet    = nomComplet;
  if(telephone    !== undefined) updates.telephone      = telephone;
  if(role         !== undefined) updates.role           = role;
  if(immeubleIds  !== undefined) updates.immeubles_ids  = immeubleIds;
  if(lotsIds      !== undefined) updates.lots_ids       = lotsIds;
  const {error} = await supabase.from("profiles").update(updates).eq("id", userId);
  if(error) throw error;
}

// ── Edge Function : gestion auth.users ───────────────────────────────────────

export async function invokeAdminUsers(action, payload) {
  const {data, error} = await supabase.functions.invoke("admin-users", {
    body: { action, ...payload },
  });
  if(error) throw error;
  if(data && !data.success) throw new Error(data.error || "Erreur Edge Function");
  return data;
}

// ── Création automatique des comptes propriétaires depuis les lots ────────────

const DEFAULT_PASSWORD = "SyndicPro2026!";

export async function createProprietaireAccounts(lotsWithUsers, syndicatId, immeubleId) {
  const results = { created: [], failed: [], defaultPassword: DEFAULT_PASSWORD };

  const lotsWithEmail = (lotsWithUsers || []).filter(l => l.email?.trim());
  if(!lotsWithEmail.length) return results;

  const dbLots = await loadLots(immeubleId);

  // Sauvegarder la session courante pour la restaurer après
  const {data: {session: originalSession}} = await supabase.auth.getSession();

  for(const lot of lotsWithEmail) {
    const email = lot.email.trim().toLowerCase();
    const nomComplet = lot.proprio || email;
    const dbLot = dbLots.find(l => l.lot === Number(lot.numero));
    const lotId = dbLot?.lotId || null;

    // Essai 1 : edge function (service_role, ne touche pas à la session client)
    try {
      await invokeAdminUsers("create", {
        email,
        password: DEFAULT_PASSWORD,
        nomComplet,
        role: "proprietaire",
        syndicatId,
        immeubleIds: [immeubleId],
        lotsIds: lotId ? [lotId] : [],
      });
      results.created.push({ email, nom: nomComplet, lot: lot.numero });
      continue;
    } catch(_) {}

    // Essai 2 : signUp direct + création profil
    try {
      const {data, error} = await supabase.auth.signUp({
        email,
        password: DEFAULT_PASSWORD,
        options: { data: { nom_complet: nomComplet } },
      });
      if(error) throw error;
      if(data?.user) {
        await supabase.from("profiles").upsert({
          id:             data.user.id,
          syndicat_id:    syndicatId,
          immeuble_id:    immeubleId,
          immeubles_ids:  [immeubleId],
          nom_complet:    nomComplet,
          email:          email,
          role:           "proprietaire",
          lots_ids:       lotId ? [lotId] : [],
        }, {onConflict:"id"});
        results.created.push({ email, nom: nomComplet, lot: lot.numero });
      }
    } catch(e) {
      results.failed.push({ email, nom: nomComplet, lot: lot.numero, error: e.message });
    }
  }

  // Restaurer la session de l'admin
  if(originalSession) {
    await supabase.auth.setSession({
      access_token:  originalSession.access_token,
      refresh_token: originalSession.refresh_token,
    });
  }

  return results;
}
