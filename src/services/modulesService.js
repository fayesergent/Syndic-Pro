import { supabase } from "./supabase.js";

// ─── MODULES ─────────────────────────────────────────────────────────────────

export async function loadModules() {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("actif", true)
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function loadAllModules() {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function createModule({ nom, description, icon, categorie }) {
  const { data, error } = await supabase
    .from("modules")
    .insert({ nom, description, icon: icon || "📦", categorie: categorie || "base" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateModule(id, updates) {
  const { error } = await supabase.from("modules").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteModule(id) {
  const { error } = await supabase.from("modules").delete().eq("id", id);
  if (error) throw error;
}

// ─── PACKAGES ────────────────────────────────────────────────────────────────

export async function loadPackages() {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("actif", true)
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function loadAllPackages() {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function createPackage({ nom, description, prix_mensuel, max_lots, modules_ids }) {
  const { data, error } = await supabase
    .from("packages")
    .insert({ nom, description, prix_mensuel, max_lots, modules_ids: modules_ids || [] })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePackage(id, updates) {
  const { error } = await supabase.from("packages").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deletePackage(id) {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw error;
}

// ─── DEMANDES DE MODULES ─────────────────────────────────────────────────────

export async function loadDemandes(syndicatId) {
  let query = supabase
    .from("demandes_modules")
    .select("*")
    .order("created_at", { ascending: false });
  if (syndicatId) {
    query = query.eq("syndicat_id", syndicatId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createDemande({ syndicatId, demandeurId, packageId, modulesIds, commentaire }) {
  const { data, error } = await supabase
    .from("demandes_modules")
    .insert({
      syndicat_id: syndicatId,
      demandeur_id: demandeurId,
      package_id: packageId || null,
      modules_selectionnes: modulesIds || [],
      commentaire: commentaire || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDemandeStatut(id, { statut, reponseAdmin, valideParId }) {
  const updates = {
    statut,
    reponse_admin: reponseAdmin || null,
    valide_par: valideParId || null,
    valide_at: statut !== "en_attente" ? new Date().toISOString() : null,
  };
  const { error } = await supabase
    .from("demandes_modules")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}
