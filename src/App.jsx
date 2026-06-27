import { useState } from "react";
import { AppProvider, useApp } from "./contexts/AppContext.jsx";
import { ROLE_TABS, ROLE_LABELS } from "./data/authData.js";
import { useIsMobile } from "./hooks/useIsMobile.js";
import { Icon } from "./components/ui/index.js";
import { MonthSelector }   from "./components/ui/MonthSelector.jsx";
import { ImmeubleSelector } from "./components/ui/ImmeubleSelector.jsx";
import { LandingPage }      from "./pages/LandingPage.jsx";
import { LoginView }        from "./pages/LoginView.jsx";
import { SignupView }       from "./pages/SignupView.jsx";
import { DashboardView }    from "./pages/DashboardView.jsx";
import { SuperAdminView }   from "./pages/SuperAdminView.jsx";
import { ConciergeView }    from "./pages/ConciergeView.jsx";
import { ProprietaireView } from "./pages/ProprietaireView.jsx";
import { OnboardingView }   from "./pages/OnboardingView.jsx";
import { BackofficeView }   from "./pages/backoffice/BackofficeView.jsx";
import { Sidebar }          from "./layouts/Sidebar.jsx";

const ALL_NAV = [
  {id:"dashboard",  label:"Tableau de bord", shortLabel:"Board",    icon:"dashboard"},
  {id:"concierge",  label:"Concierge",        shortLabel:"Concierg", icon:"concierge"},
  {id:"admin",      label:"Super Admin",      shortLabel:"Admin",    icon:"admin"},
  {id:"proprio",    label:"Propriétaire",     shortLabel:"Proprio",  icon:"proprio"},
  {id:"backoffice", label:"Back-Office",      shortLabel:"BO",       icon:"backoffice"},
];

function AppShell() {
  const isMobile = useIsMobile();
  const {state, dispatch, user, tab, loading, login, logout, go, lots, needsOnboarding, syndicatNom} = useApp();
  const [drawer, setDrawer] = useState(false);
  // "landing" | "login" | "signup"
  const [authView, setAuthView] = useState("landing");

  const navItems     = user ? ALL_NAV.filter(n => ROLE_TABS[user.role]?.includes(n.id)) : [];
  const signsPending = state.signalements.filter(s => s.statut === "prive").length;
  const titles       = {
    dashboard: "Tableau de Bord",
    concierge: "Espace Concierge",
    admin:     "Super Admin",
    proprio:   user?.role==="proprietaire" ? `Mon espace · ${user.name?.split(" ")[0]||""}` : "Espace Propriétaire",
  };
  // Premier lot accessible à l'utilisateur connecté
  const defaultLot   = user?.role === "proprietaire"
    ? (user.lots?.[0] ?? lots[0]?.lot ?? 1)
    : (lots[0]?.lot ?? 1);
  const rl           = user ? ROLE_LABELS[user.role] : null;

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:44,height:44,border:"3px solid #10B981",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"#4A6480",fontSize:12,fontWeight:600}}>Chargement SyndicPro...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if(!user) {
    if(authView === "signup") {
      return <SignupView
        isMobile={isMobile}
        onGoLogin={() => setAuthView("login")}
        onSignedUp={({authUser, nomComplet}) => login({
          authUser,
          profile:       null,
          id:            authUser.id,
          email:         authUser.email,
          name:          nomComplet || authUser.email,
          role:          "admin",
          lots:          [],
          lotIds:        [],
          syndicat_id:   null,
          immeuble_id:   null,
          immeubles_ids: [],
        })}
      />;
    }
    if(authView === "login") {
      return <LoginView onLogin={login} onGoSignup={() => setAuthView("signup")} isMobile={isMobile}/>;
    }
    return <LandingPage
      isMobile={isMobile}
      onLogin={() => setAuthView("login")}
      onSignup={() => setAuthView("signup")}
    />;
  }

  // Nouveau client SaaS → onboarding
  if(needsOnboarding) return <OnboardingView isMobile={isMobile}/>;

  const sidebarProps = {tab, navItems, signsPending, user, rl, logout, go, syndicatNom, onClose:()=>setDrawer(false)};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#F1F5F9;-webkit-font-smoothing:antialiased;}
        h1,h2,h3,h4{font-family:'Outfit',sans-serif;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px;}
        button,input,select,textarea{font-family:'DM Sans',sans-serif;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        @keyframes spin{to{transform:rotate(360deg);}}
        html { height: -webkit-fill-available; }
        body { min-height: -webkit-fill-available; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
      <div style={{display:"flex",minHeight:"100vh"}}>
        {!isMobile && <Sidebar isDrawer={false} {...sidebarProps}/>}
        {isMobile && drawer && <>
          <div onClick={() => setDrawer(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:80}}/>
          <Sidebar isDrawer={true} {...sidebarProps}/>
        </>}

        <main style={{marginLeft:isMobile?0:215,flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
          <header style={{background:"#fff",borderBottom:"1px solid #E2E8F0",padding:isMobile?"0 13px":"0 22px",height:isMobile?52:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
            <div style={{display:"flex",alignItems:"center",gap:isMobile?9:0}}>
              {isMobile && <button onClick={() => setDrawer(true)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer",display:"flex",padding:4,minWidth:36,minHeight:36,alignItems:"center",justifyContent:"center"}}><Icon name="menu"/></button>}
              <div>
                <h1 style={{fontSize:isMobile?13:15,fontWeight:800,color:"#0F2044",letterSpacing:"-0.02em"}}>{titles[tab]}</h1>
                <p style={{fontSize:9,color:"#94A3B8"}}>{lots.length} lot{lots.length!==1?"s":""} actifs</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:isMobile?5:8}}>
              {/* Sélecteur immeuble — visible si plusieurs immeubles */}
              <ImmeubleSelector isMobile={isMobile}/>
              {/* Sélecteur mois — visible pour superadmin et concierge */}
              {user.role !== "proprietaire" && <MonthSelector isMobile={isMobile}/>}
              <button style={{position:"relative",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B",cursor:"pointer"}}>
                <Icon name="bell" size={14}/>
                {signsPending > 0 && <span style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:"#EF4444",border:"1.5px solid #fff"}}/>}
              </button>
              <div style={{display:"flex",alignItems:"center",gap:7,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:isMobile?"4px 8px":"5px 10px"}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#10B981",flexShrink:0}}>{user.name[0]}</div>
                {!isMobile && <span style={{fontSize:11,fontWeight:600,color:"#0F2044"}}>{user.name.split(" ")[0]}</span>}
                <span style={{fontSize:8,background:rl.bg,color:rl.color,padding:"1px 6px",borderRadius:10,fontWeight:700,whiteSpace:"nowrap"}}>{rl.label}</span>
              </div>
            </div>
          </header>

          <div style={{padding:isMobile?"12px 11px calc(80px + env(safe-area-inset-bottom))":"22px",flex:1}}>
            {tab==="dashboard"  && <DashboardView isMobile={isMobile} solde={state.solde} paiements={state.paiements} depenses={state.depenses} annonces={state.annonces} dispatch={dispatch} currentUser={user}/>}
            {tab==="concierge"  && <ConciergeView isMobile={isMobile} state={state} dispatch={dispatch}/>}
            {tab==="admin"      && <SuperAdminView isMobile={isMobile} state={state} dispatch={dispatch}/>}
            {tab==="proprio"    && <ProprietaireView isMobile={isMobile} state={state} dispatch={dispatch} defaultLot={defaultLot} currentUser={user}/>}
            {tab==="backoffice" && <BackofficeView isMobile={isMobile}/>}
          </div>
        </main>

        {isMobile && (
          <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"#0F2044",borderTop:"1px solid #1E3A5F",display:"flex",zIndex:60,paddingBottom:"env(safe-area-inset-bottom)"}}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => go(item.id)}
                style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:"9px 3px 7px",border:"none",cursor:"pointer",background:"transparent",color:tab===item.id?"#10B981":"#4A6480",minHeight:54,position:"relative"}}>
                {tab===item.id && <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2,background:"#10B981",borderRadius:"0 0 2px 2px"}}/>}
                <Icon name={item.icon} size={19}/>
                <span style={{fontSize:8,fontWeight:tab===item.id?700:500}}>{item.shortLabel}</span>
                {item.id==="concierge" && signsPending > 0 && <span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:8,height:8,borderRadius:"50%",background:"#EF4444",border:"1.5px solid #0F2044"}}/>}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>;
}
