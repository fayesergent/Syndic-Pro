import { useState } from "react";
import { CTab } from "../../components/ui/index.js";
import { useApp } from "../../contexts/AppContext.jsx";
import { OnboardingView }  from "../OnboardingView.jsx";
import { TabSyndicats }    from "./TabSyndicats.jsx";
import { TabImmeubles }    from "./TabImmeubles.jsx";
import { TabLots }         from "./TabLots.jsx";
import { TabUtilisateurs } from "./TabUtilisateurs.jsx";
import { TabParametres }   from "./TabParametres.jsx";

const ALL_TABS = [
  {id:"syndicats",    label:"Syndicats",     icon:"building"},
  {id:"immeubles",    label:"Immeubles",     icon:"building"},
  {id:"lots",         label:"Lots",          icon:"percent"},
  {id:"utilisateurs", label:"Utilisateurs",  icon:"users"},
  {id:"parametres",   label:"Paramètres",    icon:"settings"},
];

export const BackofficeView = ({isMobile}) => {
  const {user} = useApp();
  const isPlatformAdmin = user?.role === "superadmin";
  const TABS = isPlatformAdmin ? ALL_TABS : ALL_TABS.filter(t => t.id !== "syndicats");
  const [tab, setTab]                   = useState(isPlatformAdmin ? "syndicats" : "immeubles");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [successClient, setSuccessClient]   = useState(null);
  // ID du syndicat actif dans les tabs (null = syndicat propre de l'admin)
  const [activeSyndicatId, setActiveSyndicatId] = useState(null);
  // Nom du syndicat actif pour la bannière
  const [activeSyndicatNom, setActiveSyndicatNom] = useState(null);

  const openOnboarding  = () => { setShowOnboarding(true); setSuccessClient(null); };
  const closeOnboarding = () => setShowOnboarding(false);
  const onOnboardingDone = (syndicat, immeuble) => {
    setShowOnboarding(false);
    setTab("syndicats");
    setSuccessClient({ syndicat, immeuble });
  };

  // Callback depuis TabSyndicats quand l'admin sélectionne un syndicat client
  const handleSelectSyndicat = (syndicatId, syndicatNom, targetTab = "immeubles") => {
    setActiveSyndicatId(syndicatId);
    setActiveSyndicatNom(syndicatNom);
    setTab(targetTab);
  };

  const clearActiveSyndicat = () => {
    setActiveSyndicatId(null);
    setActiveSyndicatNom(null);
    setTab("syndicats");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Overlay Onboarding — plein écran */}
      {showOnboarding && (
        <div style={{position:"fixed",inset:0,zIndex:300,overflowY:"auto",background:"#0F2044"}}>
          <OnboardingView
            isMobile={isMobile}
            onDone={onOnboardingDone}
            onClose={closeOnboarding}
          />
        </div>
      )}

      {/* Bannière succès après création d'un client SaaS */}
      {successClient && (
        <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"#059669",marginBottom:4}}>
              ✅ Nouveau client SaaS créé avec succès
            </div>
            <div style={{fontSize:12,color:"#065F46",lineHeight:1.6}}>
              Syndicat <strong>{successClient.syndicat.nom}</strong> · Immeuble <strong>{successClient.immeuble.nom}</strong><br/>
              Créez maintenant l'utilisateur admin du client via l'onglet <strong>Utilisateurs → + Utilisateur</strong>.
            </div>
          </div>
          <button onClick={() => setSuccessClient(null)}
            style={{background:"none",border:"none",color:"#059669",cursor:"pointer",fontSize:16,lineHeight:1,padding:0,flexShrink:0}}>✕</button>
        </div>
      )}

      {/* Bannière "Gestion d'un syndicat client" */}
      {activeSyndicatId && (
        <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{fontSize:12,color:"#C2410C",fontWeight:600}}>
            ⚙️ Gestion du syndicat client : <strong>{activeSyndicatNom || activeSyndicatId}</strong>
          </div>
          <button onClick={clearActiveSyndicat}
            style={{background:"none",border:"1px solid #FED7AA",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#C2410C",cursor:"pointer",whiteSpace:"nowrap"}}>
            ← Revenir à la liste
          </button>
        </div>
      )}

      {/* Header du back-office */}
      <div style={{background:"#0F2044",borderRadius:13,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:18}}>⚙️</span>
        </div>
        <div>
          <h2 style={{fontSize:14,fontWeight:800,color:"#fff",margin:0,letterSpacing:"-0.01em"}}>Back-Office Administration</h2>
          <p style={{fontSize:10,color:"#4A6480",margin:0,marginTop:2}}>Gérez les syndicats, immeubles, lots et utilisateurs sans SQL</p>
        </div>
      </div>

      <CTab tabs={TABS} active={tab} onChange={setTab} isMobile={isMobile}/>

      {tab === "syndicats" && (
        <TabSyndicats
          isMobile={isMobile}
          openOnboarding={openOnboarding}
          onSelectSyndicat={(id, nom, targetTab) => handleSelectSyndicat(id, nom, targetTab)}
        />
      )}
      {tab === "immeubles"    && <TabImmeubles    isMobile={isMobile} syndicatId={activeSyndicatId || undefined}/>}
      {tab === "lots"         && <TabLots         isMobile={isMobile} syndicatId={activeSyndicatId || undefined}/>}
      {tab === "utilisateurs" && <TabUtilisateurs isMobile={isMobile} syndicatId={activeSyndicatId || undefined}/>}
      {tab === "parametres"   && <TabParametres   isMobile={isMobile}/>}
    </div>
  );
};
