import { createContext, useContext, useState, useEffect, useReducer, useCallback } from "react";
import { supabase } from "../services/supabase.js";
import {
  loadFromSupabase, syncToSupabase,
  loadLots, loadImmeubles, loadSyndicat,
} from "../services/supabaseService.js";
import { makeInitialState, reducer } from "./appReducer.js";
import { ROLE_TABS } from "../data/authData.js";

const AppContext = createContext(null);

// Mois courant au format YYYY-MM
function getCurrentMois() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

export function AppProvider({ children }) {
  const [state, dispatch]               = useReducer(reducer, null, makeInitialState);
  const [user, setUser]                 = useState(null);
  const [tab, setTab]                   = useState(null);
  const [loading, setLoading]           = useState(true);

  // ── Contexte tenant dynamique ──────────────────────────────────────────────
  const [syndicatId, setSyndicatId]         = useState(null);
  const [syndicatNom, setSyndicatNom]       = useState(null);
  const [immeubles, setImmeubles]           = useState([]);
  const [selectedImmeuble, setSelectedImmeubleState] = useState(null);
  const [lots, setLots]                     = useState([]);
  const [currentMois, setCurrentMois]       = useState(getCurrentMois);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const immeubleId = selectedImmeuble?.id ?? null;

  // ── Sélection d'un immeuble → recharge lots + données ─────────────────────
  const setSelectedImmeuble = useCallback(async (imm) => {
    setSelectedImmeubleState(imm);
    if(!imm) return;
    const fetchedLots = await loadLots(imm.id);
    setLots(fetchedLots);
  }, []);

  // ── Session existante au démarrage ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({data:{session}}) => {
      if(session?.user) {
        const {data:profile} = await supabase
          .from("profiles").select("*").eq("id", session.user.id).single();
        if(profile) {
          if(!profile.syndicat_id) {
            setNeedsOnboarding(true);
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: profile.nom_complet || session.user.email,
              role: profile.role || "admin",
              lots: [],
              lotIds: [],
              syndicat_id: null,
              immeuble_id: null,
              immeubles_ids: [],
            });
            setLoading(false);
            return;
          }
          await initUserSession(session.user, profile);
        } else {
          // Session valide mais aucun profil (compte fraîchement créé) →
          // diriger vers l'onboarding pour créer le syndicat.
          setNeedsOnboarding(true);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.nom_complet || session.user.email,
            role: "admin",
            lots: [],
            lotIds: [],
            syndicat_id: null,
            immeuble_id: null,
            immeubles_ids: [],
          });
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    });
  }, []);

  // ── Initialise la session utilisateur après login/refresh ─────────────────
  async function initUserSession(authUser, profile) {
    const sid = profile.syndicat_id;
    setSyndicatId(sid);

    // Charger le syndicat (pour avoir le nom)
    const syndicat = await loadSyndicat(sid);
    setSyndicatNom(syndicat?.nom || "Syndicat");

    // Charger tous les immeubles du syndicat
    const fetchedImmeubles = await loadImmeubles(sid);
    setImmeubles(fetchedImmeubles);

    // Sélectionner le premier immeuble autorisé
    const immeubleIds = profile.immeubles_ids?.length
      ? profile.immeubles_ids
      : fetchedImmeubles.map(i => i.id);
    const firstImmeuble = fetchedImmeubles.find(i => immeubleIds.includes(i.id)) || fetchedImmeubles[0];
    let fetchedLots = [];
    if(firstImmeuble) {
      fetchedLots = await loadLots(firstImmeuble.id);
      setSelectedImmeubleState(firstImmeuble);
      setLots(fetchedLots);
    }

    // Lots accessibles au propriétaire (par lotIds depuis profile)
    const lotIds = profile.lots_ids || [];
    const lotNums = fetchedLots
      .filter(l => lotIds.length === 0 || lotIds.includes(l.lotId))
      .map(l => l.lot);

    const u = {
      id:           authUser.id,
      email:        authUser.email,
      name:         profile.nom_complet || authUser.email,
      role:         profile.role || "proprietaire",
      lots:         profile.role === "proprietaire" ? lotNums : fetchedLots.map(l => l.lot),
      lotIds:       lotIds,
      syndicat_id:  sid,
      immeuble_id:  firstImmeuble?.id || null,
      immeubles_ids: profile.immeubles_ids || [],
    };
    setUser(u);
    setTab((ROLE_TABS[u.role]||["dashboard"])[0]);

    // Charger les données du mois courant
    if(firstImmeuble) {
      const data = await loadFromSupabase({
        syndicatId: sid,
        immeubleId: firstImmeuble.id,
        mois:       currentMois,
        lots:       fetchedLots,
      });
      if(data) dispatch({type:"INIT_FROM_SUPABASE", data});
    }
    setLoading(false);
  }

  // ── Recharger quand l'immeuble ou le mois change ───────────────────────────
  useEffect(() => {
    if(!immeubleId || !syndicatId || !lots.length) return;
    loadFromSupabase({ syndicatId, immeubleId, mois:currentMois, lots }).then(data => {
      if(data) dispatch({type:"INIT_FROM_SUPABASE", data});
    });
  }, [immeubleId, currentMois]);

  // ── Dispatch avec sync Supabase ────────────────────────────────────────────
  const dispatchAndSync = useCallback((action) => {
    dispatch(action);
    if(immeubleId && syndicatId) {
      syncToSupabase(action, state, {syndicatId, immeubleId, mois:currentMois})
        .catch(console.error);
    }
  }, [state, immeubleId, syndicatId, currentMois]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (u) => {
    // u vient de LoginView avec authUser, profile et données user
    if(!u.syndicat_id) {
      setNeedsOnboarding(true);
      setUser(u);
      return;
    }
    // Charger toutes les données du syndicat (nom, immeubles, lots, etc.)
    setLoading(true);
    await initUserSession(u.authUser, u.profile);
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTab(null);
    setSyndicatId(null);
    setSyndicatNom(null);
    setSelectedImmeubleState(null);
    setImmeubles([]);
    setLots([]);
    setNeedsOnboarding(false);
    dispatch({type:"INIT_FROM_SUPABASE", data:makeInitialState()});
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const go = id => setTab(id);

  // ── Changement immeuble (Phase 4) ──────────────────────────────────────────
  const changeImmeuble = async (imm) => {
    await setSelectedImmeuble(imm);
    // Les données seront rechargées par l'effet sur immeubleId
  };

  // ── Fin onboarding (Phase 5) ───────────────────────────────────────────────
  const completeOnboarding = async (authUser, profile) => {
    setNeedsOnboarding(false);
    setLoading(true);
    await initUserSession(authUser, profile);
  };

  // ── Rechargement back-office ───────────────────────────────────────────────
  const reloadImmeubles = async () => {
    if(!syndicatId) return;
    const fetched = await loadImmeubles(syndicatId);
    setImmeubles(fetched);
    return fetched;
  };

  const reloadLots = async (targetImmeubleId) => {
    const id = targetImmeubleId || immeubleId;
    if(!id) return;
    const fetched = await loadLots(id);
    setLots(fetched);
    return fetched;
  };

  return (
    <AppContext.Provider value={{
      state, dispatch:dispatchAndSync,
      user, tab, setTab, loading,
      login, logout, go,
      // Contexte tenant
      syndicatId,
      syndicatNom,
      immeubles,
      selectedImmeuble,
      immeubleId,
      lots,
      currentMois, setCurrentMois,
      changeImmeuble,
      // Rechargements back-office
      reloadImmeubles,
      reloadLots,
      // Onboarding
      needsOnboarding,
      completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if(!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
