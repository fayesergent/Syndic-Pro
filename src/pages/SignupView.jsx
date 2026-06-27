import { useState } from "react";
import { supabase } from "../services/supabase.js";
import { Icon } from "../components/ui/Icon.jsx";
import { Input } from "../components/ui/Input.jsx";

// ─────────────────────────────────────────────────────────────────────────────
// Création de compte (gérant) — « Créer mon compte gratuitement »
// Inscrit l'utilisateur via Supabase Auth puis le route vers l'onboarding
// (création de son syndicat / immeuble / lots). Le profil est créé à la fin
// de l'onboarding avec le rôle « superadmin » (gérant de son propre syndicat).
// ─────────────────────────────────────────────────────────────────────────────

export const SignupView = ({ onSignedUp, onGoLogin, isMobile }) => {
  const [nom, setNom]         = useState("");
  const [email, setEmail]     = useState("");
  const [pwd, setPwd]         = useState("");
  const [pwd2, setPwd2]       = useState("");
  const [showP, setShowP]     = useState(false);
  const [err, setErr]         = useState("");
  const [info, setInfo]       = useState("");
  const [loading, setLoading] = useState(false);

  const go = async () => {
    setErr(""); setInfo("");
    if (!nom.trim() || !email.trim() || !pwd) { setErr("Veuillez remplir tous les champs."); return; }
    if (pwd.length < 8) { setErr("Le mot de passe doit faire au moins 8 caractères."); return; }
    if (pwd !== pwd2) { setErr("Les deux mots de passe ne correspondent pas."); return; }

    setLoading(true);
    const emailTrim = email.trim();
    const nomTrim   = nom.trim();

    try {
      // Essai 1 — le compte existe peut-être déjà (tentative précédente), tenter une connexion
      const { data: signIn } = await supabase.auth.signInWithPassword({ email: emailTrim, password: pwd });
      if (signIn?.session && signIn?.user) {
        setLoading(false);
        onSignedUp({ authUser: signIn.user, nomComplet: nomTrim });
        return;
      }
    } catch (_) { /* pas encore de compte ou email non confirmé — on continue */ }

    try {
      // Essai 2 — signUp classique via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: emailTrim,
        password: pwd,
        options: { data: { nom_complet: nomTrim } },
      });

      if (error) {
        const msg = error.message || "";
        if (msg.includes("rate limit")) {
          // Rate limit = le compte existe déjà depuis une tentative précédente
          // Tenter de passer à l'onboarding avec un user minimal
          setLoading(false);
          onSignedUp({
            authUser: { id: null, email: emailTrim, user_metadata: { nom_complet: nomTrim } },
            nomComplet: nomTrim,
          });
          return;
        }
        setErr(msg.includes("already")
          ? "Un compte existe déjà avec cet e-mail. Connectez-vous."
          : "Inscription impossible : " + msg);
        setLoading(false);
        return;
      }

      // Session immédiate ou user disponible → onboarding
      if (data?.session && data?.user) {
        setLoading(false);
        onSignedUp({ authUser: data.user, nomComplet: nomTrim });
        return;
      }

      // Pas de session : tente connexion directe
      try {
        const { data: signIn2 } = await supabase.auth.signInWithPassword({ email: emailTrim, password: pwd });
        if (signIn2?.session && signIn2?.user) {
          setLoading(false);
          onSignedUp({ authUser: signIn2.user, nomComplet: nomTrim });
          return;
        }
      } catch (_) {}

      // User existe mais pas de session (email non confirmé) → on continue quand même
      if (data?.user) {
        setLoading(false);
        onSignedUp({ authUser: data.user, nomComplet: nomTrim });
        return;
      }

      setLoading(false);
      setErr("Impossible de créer le compte. Vérifiez votre connexion et réessayez.");
    } catch (e) {
      console.error("Signup error:", e);
      setErr("Erreur lors de l'inscription : " + e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0F2044",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:300,height:300,borderRadius:"50%",background:"#10B98112",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:220,height:220,borderRadius:"50%",background:"#10B98108",pointerEvents:"none"}}/>
      <div style={{background:"#fff",borderRadius:20,padding:isMobile?"26px 20px":"34px 38px",width:"100%",maxWidth:410,boxShadow:"0 24px 64px rgba(0,0,0,0.3)",position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{width:50,height:50,borderRadius:13,background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px"}}><Icon name="building" size={24}/></div>
          <h1 style={{fontSize:19,fontWeight:900,color:"#0F2044",margin:0,letterSpacing:"-0.03em"}}>Créer mon compte</h1>
          <p style={{fontSize:11,color:"#94A3B8",margin:"3px 0 0"}}>Gratuit · Configurez votre syndicat en quelques minutes</p>
          <div style={{width:30,height:2,background:"#10B981",borderRadius:2,margin:"11px auto 0"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Input label="Nom complet" value={nom} onChange={e => {setNom(e.target.value); setErr("");}} placeholder="Prénom Nom"/>
          <Input label="Adresse e-mail" value={email} onChange={e => {setEmail(e.target.value); setErr("");}} type="email" placeholder="vous@exemple.com"/>
          <div>
            <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Mot de passe (min. 8 caractères)</label>
            <div style={{position:"relative"}}>
              <input type={showP?"text":"password"} value={pwd} onChange={e => {setPwd(e.target.value); setErr("");}} placeholder="••••••••"
                style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 40px 9px 12px",fontSize:13,color:"#0F2044",outline:"none",boxSizing:"border-box",background:"#F8FAFC",fontFamily:"inherit"}}
                onFocus={e => e.target.style.border="1.5px solid #10B981"} onBlur={e => e.target.style.border="1.5px solid #E2E8F0"}/>
              <button onClick={() => setShowP(!showP)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#94A3B8",cursor:"pointer",display:"flex",padding:2}}>
                <Icon name={showP?"eyeoff":"eye"} size={15}/>
              </button>
            </div>
          </div>
          <Input label="Confirmer le mot de passe" value={pwd2} onChange={e => {setPwd2(e.target.value); setErr("");}} type={showP?"text":"password"} placeholder="••••••••"/>

          {err && <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"8px 11px",fontSize:12,color:"#DC2626"}}>⚠️ {err}</div>}
          {info && <div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:8,padding:"8px 11px",fontSize:12,color:"#059669"}}>{info}</div>}

          <button onClick={go} disabled={loading} style={{background:loading?"#6EE7B7":"#10B981",border:"none",borderRadius:10,padding:"12px 0",fontSize:14,fontWeight:800,color:"#fff",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,minHeight:44}}>
            {loading ? <><span style={{width:15,height:15,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Création...</> : "Créer mon compte gratuitement →"}
          </button>
        </div>
        <div style={{marginTop:18,borderTop:"1px solid #F1F5F9",paddingTop:14,textAlign:"center"}}>
          <p style={{fontSize:12,color:"#64748B"}}>
            Vous avez déjà un compte ?{" "}
            <button onClick={onGoLogin} style={{background:"none",border:"none",color:"#10B981",fontWeight:700,cursor:"pointer",fontSize:12,padding:0}}>Se connecter</button>
          </p>
        </div>
      </div>
      <p style={{fontSize:10,color:"#3D5A80",marginTop:16,textAlign:"center"}}>🔒 Vos données sont sécurisées · SyndicPro</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
};
