import { useState } from "react";
import { supabase } from "../services/supabase.js";
import { ROLE_LABELS } from "../data/authData.js";
import { Icon } from "../components/ui/Icon.jsx";
import { Input } from "../components/ui/Input.jsx";

export const LoginView = ({onLogin, onGoSignup, isMobile}) => {
  const [email,setEmail]   = useState("");
  const [pwd,setPwd]       = useState("");
  const [showP,setShowP]   = useState(false);
  const [err,setErr]       = useState("");
  const [loading,setLoading] = useState(false);

  const go = async () => {
    setErr("");
    if(!email || !pwd) { setErr("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      const emailTrim = email.trim();
      const {data, error} = await supabase.auth.signInWithPassword({email:emailTrim, password:pwd});
      if(error) { setErr("Email ou mot de passe incorrect."); setLoading(false); return; }
      if(!data?.user) { setErr("Erreur d'authentification. Réessayez."); setLoading(false); return; }
      const {data:profile} = await supabase
        .from("profiles").select("*").eq("id", data.user.id).single();
      if(!profile) {
        // Compte créé mais syndicat pas encore configuré → onboarding
        setLoading(false);
        onLogin({
          authUser:     data.user,
          profile:      null,
          id:           data.user.id,
          email:        data.user.email,
          name:         data.user.user_metadata?.nom_complet || data.user.email,
          role:         "superadmin",
          lots:         [],
          lotIds:       [],
          syndicat_id:  null,
          immeuble_id:  null,
          immeubles_ids:[],
        });
        return;
      }
      setLoading(false);
      // Passer authUser et profile pour que login() puisse charger le nom du syndicat
      onLogin({
        authUser:     data.user,
        profile:      profile,
        // Données user pour le cas onboarding
        id:           data.user.id,
        email:        data.user.email,
        name:         profile.nom_complet || data.user.email,
        role:         profile.role || "superadmin",
        lots:         [],
        lotIds:       profile.lots_ids || [],
        syndicat_id:  profile.syndicat_id || null,
        immeuble_id:  profile.immeuble_id || null,
        immeubles_ids:profile.immeubles_ids || [],
      });
    } catch(e) {
      console.error("Login error:", e);
      setErr("Erreur de connexion: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0F2044",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:300,height:300,borderRadius:"50%",background:"#10B98112",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:220,height:220,borderRadius:"50%",background:"#10B98108",pointerEvents:"none"}}/>
      <div style={{background:"#fff",borderRadius:20,padding:isMobile?"26px 20px":"34px 38px",width:"100%",maxWidth:410,boxShadow:"0 24px 64px rgba(0,0,0,0.3)",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:26}}>
          <div style={{width:50,height:50,borderRadius:13,background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px"}}><Icon name="building" size={24}/></div>
          <h1 style={{fontSize:19,fontWeight:900,color:"#0F2044",margin:0,letterSpacing:"-0.03em"}}>Syndic Pro</h1>
          <p style={{fontSize:11,color:"#94A3B8",margin:"3px 0 0"}}>Espace de gestion · 2026</p>
          <div style={{width:30,height:2,background:"#10B981",borderRadius:2,margin:"11px auto 0"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Input label="Adresse e-mail" value={email} onChange={e => {setEmail(e.target.value); setErr("");}} type="email" placeholder="votre.nom@helene2026.com"/>
          <div>
            <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Mot de passe</label>
            <div style={{position:"relative"}}>
              <input type={showP?"text":"password"} value={pwd} onChange={e => {setPwd(e.target.value); setErr("");}} onKeyDown={e => e.key==="Enter" && go()} placeholder="••••••••"
                style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 40px 9px 12px",fontSize:13,color:"#0F2044",outline:"none",boxSizing:"border-box",background:"#F8FAFC",fontFamily:"inherit"}}
                onFocus={e => e.target.style.border="1.5px solid #10B981"} onBlur={e => e.target.style.border="1.5px solid #E2E8F0"}/>
              <button onClick={() => setShowP(!showP)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#94A3B8",cursor:"pointer",display:"flex",padding:2}}>
                <Icon name={showP?"eyeoff":"eye"} size={15}/>
              </button>
            </div>
          </div>
          {err && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"8px 11px",fontSize:12,color:"#DC2626"}}>⚠️ {err}</div>}
          <button onClick={go} disabled={loading} style={{background:loading?"#6EE7B7":"#10B981",border:"none",borderRadius:10,padding:"12px 0",fontSize:14,fontWeight:800,color:"#fff",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,minHeight:44}}>
            {loading ? <><span style={{width:15,height:15,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Connexion...</> : "Se connecter →"}
          </button>
        </div>
        {onGoSignup && (
          <p style={{fontSize:12,color:"#64748B",textAlign:"center",marginTop:16}}>
            Pas encore de compte ?{" "}
            <button onClick={onGoSignup} style={{background:"none",border:"none",color:"#10B981",fontWeight:700,cursor:"pointer",fontSize:12,padding:0}}>Créer mon compte gratuitement</button>
          </p>
        )}
        <div style={{marginTop:20,borderTop:"1px solid #F1F5F9",paddingTop:14}}>
          <p style={{fontSize:9,color:"#94A3B8",fontWeight:600,textAlign:"center",marginBottom:9,textTransform:"uppercase",letterSpacing:"0.07em"}}>Comptes de démonstration</p>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {[
              {role:"superadmin",   email:"admin@helene2026.com",        pwd:"SyndicAdmin2026",    label:"Super Admin"},
              {role:"concierge",    email:"concierge@helene2026.com",    pwd:"SyndicConcierg2026", label:"Concierge — Mamadou Sarr"},
              {role:"proprietaire", email:"mme.fall@helene2026.com",     pwd:"SyndicLot13",        label:"Mme Fall (Terrasse)"},
              {role:"proprietaire", email:"babacar.diop@helene2026.com", pwd:"SyndicLot01",        label:"Babacar Diop (RDC)"},
            ].map((d,i) => { const rl = ROLE_LABELS[d.role]; return (
              <button key={i} onClick={() => {setEmail(d.email); setPwd(d.pwd); setErr("");}}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,padding:"6px 9px",cursor:"pointer",textAlign:"left"}}>
                <div><div style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>{d.label}</div><div style={{fontSize:9,color:"#94A3B8",marginTop:1}}>{d.email}</div></div>
                <span style={{fontSize:9,background:rl.bg,color:rl.color,padding:"2px 7px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{rl.label}</span>
              </button>
            );})}
          </div>
        </div>
      </div>
      <p style={{fontSize:10,color:"#3D5A80",marginTop:16,textAlign:"center"}}>🔒 Accès sécurisé · TF 8.323/GR Grand Dakar</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
};
