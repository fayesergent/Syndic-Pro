import { uid } from "../services/supabase.js";

// État initial vide — les données réelles viennent de Supabase via INIT_FROM_SUPABASE
export const makeInitialState = () => ({
  solde:         0,
  paiements:     [],
  depenses:      [],
  prestataires:  [],
  cotisationsExc:[],
  signalements:  [],
  annonces:      [],
  comptesMarchands: {
    wave: {numero:"", tillId:"",     actif:false},
    om:   {numero:"", businessId:"", actif:false},
    free: {numero:"", actif:false},
  },
});

export function reducer(state, action) {
  switch(action.type) {
    case "VALIDER_PAIEMENT": {
      const p = state.paiements.find(x => x.lot === action.lot);
      if(!p || p.montant > 0) return state;
      return {...state,
        paiements: state.paiements.map(x =>
          x.lot === action.lot ? {...x, montant:action.montant, mode:action.mode} : x
        ),
        solde: state.solde + action.montant,
      };
    }
    case "AJOUTER_DEPENSE": {
      const d = {...action.data, id: action.data.id || uid()};
      return {...state,
        depenses: [...state.depenses, d],
        solde: d.statut==="regle" ? state.solde - d.montant : state.solde,
      };
    }
    case "VALIDER_DEPENSE": {
      const d = state.depenses.find(x => x.id === action.id);
      if(!d || d.statut === "regle") return state;
      const today = new Date().toLocaleDateString("fr-FR").slice(0,5);
      return {...state,
        depenses: state.depenses.map(x =>
          x.id === action.id ? {...x, statut:"regle", date:today, mode:action.mode} : x
        ),
        solde: state.solde - d.montant,
      };
    }
    case "SUPPRIMER_DEPENSE": {
      const d = state.depenses.find(x => x.id === action.id);
      if(!d) return state;
      return {...state,
        depenses: state.depenses.filter(x => x.id !== action.id),
        solde: d.statut === "regle" ? state.solde + d.montant : state.solde,
      };
    }
    case "ADD_PRESTA":
      return {...state, prestataires:[...state.prestataires, {...action.data, id:action.data.id||uid()}]};
    case "DEL_PRESTA":
      return {...state, prestataires:state.prestataires.filter(p => p.id !== action.id)};
    case "UPD_PRESTA":
      return {...state, prestataires:state.prestataires.map(p => p.id === action.id ? {...p, ...action.data} : p)};
    case "PAYER_PRESTA": {
      const today = new Date().toLocaleDateString("fr-FR").slice(0,5);
      const d = {id:uid(), label:action.label, montant:action.montant, mode:action.mode, date:today, cat:"fixe", statut:"regle", pid:action.pid};
      return {...state, depenses:[...state.depenses, d], solde:state.solde - action.montant};
    }
    case "CREER_COTISATION_EXC":
      return {...state, cotisationsExc:[...state.cotisationsExc, {
        ...action.data, id:Date.now(), votes:{}, statut:"vote",
        dateCreation:new Date().toLocaleDateString("fr-FR"),
      }]};
    case "VOTER_COT":
      return {...state, cotisationsExc:state.cotisationsExc.map(c =>
        c.id===action.cid ? {...c, votes:{...c.votes, [action.lot]:action.dateVote}} : c
      )};
    case "CLORE_VOTE":
      return {...state, cotisationsExc:state.cotisationsExc.map(c =>
        c.id===action.id ? {...c, statut:"clos"} : c
      )};
    case "ADD_SIGNALEMENT":
      return {...state, signalements:[{
        ...action.data, id:uid(), statut:"prive", reponse:null,
        dateCreation:new Date().toLocaleDateString("fr-FR"),
      }, ...state.signalements]};
    case "RENDRE_PUBLIC":
      return {...state, signalements:state.signalements.map(s =>
        s.id===action.id ? {...s, statut:"public"} : s
      )};
    case "REPONDRE_SIG":
      return {...state, signalements:state.signalements.map(s =>
        s.id===action.id ? {...s, reponse:action.reponse} : s
      )};
    case "ADD_ANNONCE":
      return {...state, annonces:[{
        ...action.data, id:uid(), date:new Date().toLocaleDateString("fr-FR"), public:true,
      }, ...state.annonces]};
    case "UPD_MARCHANDS":
      return {...state, comptesMarchands:{...state.comptesMarchands, [action.op]:action.data}};
    case "INIT_FROM_SUPABASE":
      return {...state, ...action.data, loaded:true};
    default:
      return state;
  }
}
