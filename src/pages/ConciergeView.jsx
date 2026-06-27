import { useState } from "react";
import { useApp } from "../contexts/AppContext.jsx";
import { getStats } from "../utils/statsHelpers.js";
import { CTab } from "../components/ui/index.js";
import { ModalRecu } from "../components/ModalRecu.jsx";
import { TabCotisations }  from "./concierge/TabCotisations.jsx";
import { TabDepenses }     from "./concierge/TabDepenses.jsx";
import { TabPrestataires } from "./concierge/TabPrestataires.jsx";
import { TabExceptionnel } from "./concierge/TabExceptionnel.jsx";
import { TabSignalements } from "./concierge/TabSignalements.jsx";
import { TabAnnonces }     from "./concierge/TabAnnonces.jsx";

export const ConciergeView = ({isMobile, state, dispatch}) => {
  const {lots} = useApp();
  const [tab,setTab]   = useState("cotisations");
  const [recu,setRecu] = useState(null);
  const {tots, nbPayes, nbImpayes, pct} = getStats(state.paiements, lots);
  const signsPending = state.signalements.filter(s => s.statut === "prive").length;

  const tabs = [
    {id:"cotisations",  label:"Cotisations",  icon:"percent"},
    {id:"depenses",     label:"Dépenses",     icon:"trending"},
    {id:"prestataires", label:"Prestataires", icon:"building"},
    {id:"exceptionnel", label:"Exceptionnel", icon:"alert"},
    {id:"signalements", label:"Signalements", icon:"flag",  badge:signsPending},
    {id:"annonces",     label:"Annonces",     icon:"bell"},
  ];

  return (
    <div>
      {recu && <ModalRecu p={recu} onClose={() => setRecu(null)} isMobile={isMobile}/>}
      <CTab tabs={tabs} active={tab} onChange={setTab} isMobile={isMobile}/>
      {tab === "cotisations"  && <TabCotisations  isMobile={isMobile} tots={tots} nbPayes={nbPayes} nbImpayes={nbImpayes} pct={pct} dispatch={dispatch} setRecu={setRecu}/>}
      {tab === "depenses"     && <TabDepenses     isMobile={isMobile} state={state} dispatch={dispatch}/>}
      {tab === "prestataires" && <TabPrestataires isMobile={isMobile} state={state} dispatch={dispatch}/>}
      {tab === "exceptionnel" && <TabExceptionnel isMobile={isMobile} state={state} dispatch={dispatch} lots={lots}/>}
      {tab === "signalements" && <TabSignalements isMobile={isMobile} state={state} dispatch={dispatch} lots={lots}/>}
      {tab === "annonces"     && <TabAnnonces     isMobile={isMobile} state={state} dispatch={dispatch}/>}
    </div>
  );
};
