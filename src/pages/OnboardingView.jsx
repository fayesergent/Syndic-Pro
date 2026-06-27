import { useState } from "react";
import { supabase } from "../services/supabase.js";
import { createSyndicatFull, createAdminProfile, createProprietaireAccounts } from "../services/supabaseService.js";
import { useApp } from "../contexts/AppContext.jsx";
import { Icon, Card, Input } from "../components/ui/index.js";
import { computeCotisationsTantieme, downloadModeleExcel, parseModeleExcel } from "../utils/excelTemplate.js";

// ─── Wizard d'onboarding 4 étapes ────────────────────────────────────────────
// Étape 1 : Informations du syndicat
// Étape 2 : Informations de l'immeuble
// Étape 3 : Définition des lots
// Étape 4 : Confirmation et création

const STEPS = [
  {id:1, label:"Syndicat",  icon:"building"},
  {id:2, label:"Immeuble",  icon:"building"},
  {id:3, label:"Lots",      icon:"percent"},
  {id:4, label:"Confirmation", icon:"check"},
];

function StepDots({current}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:24}}>
      {STEPS.map((s,i) => (
        <div key={s.id} style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            background:current>=s.id?"#10B981":"#E2E8F0",
            color:current>=s.id?"#fff":"#94A3B8",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:700,flexShrink:0,
          }}>
            {current>s.id ? "✓" : s.id}
          </div>
          <span style={{fontSize:10,fontWeight:current===s.id?700:500,color:current>=s.id?"#0F2044":"#94A3B8"}}>
            {s.label}
          </span>
          {i < STEPS.length-1 && <div style={{width:20,height:2,background:current>s.id?"#10B981":"#E2E8F0",borderRadius:2}}/>}
        </div>
      ))}
    </div>
  );
}

export const OnboardingView = ({isMobile, onDone, onClose}) => {
  // onDone : callback optionnel quand utilisé en mode back-office (overlay)
  // Si non fourni → mode onboarding normal (nouvel utilisateur)
  const {completeOnboarding, reloadImmeubles, logout} = useApp();
  const [step,    setStep]    = useState(1);
  const [err,     setErr]     = useState("");
  const [saving,  setSaving]  = useState(false);

  // Étape 1 — Syndicat
  const [syndicatNom,     setSyndicatNom]     = useState("");
  const [syndicatAdresse, setSyndicatAdresse] = useState("");
  const [syndicatEmail,   setSyndicatEmail]   = useState("");
  const [syndicatTel,     setSyndicatTel]     = useState("");
  const [pays,            setPays]            = useState("SN");
  const [devise,          setDevise]          = useState("FCFA");

  // Étape 2 — Immeuble
  const [immeubleNom, setImmeubleNom]   = useState("");
  const [immeubleAdr, setImmeubleAdr]   = useState("");
  const [immeubleRef, setImmeubleRef]   = useState("");
  const [nbLots,      setNbLots]        = useState("1");
  const [budget,      setBudget]        = useState("");
  const [modeCotisation, setModeCotisation] = useState("tantieme"); // 'tantieme' | 'fixe'

  // Étape 3 — Lots
  const [lotsForm, setLotsForm] = useState([]);
  const [excelMsg, setExcelMsg] = useState(null);

  const isTantieme = modeCotisation === "tantieme";

  // Total des tantièmes (pour le calcul automatique des cotisations)
  const totalTantiemeForm = lotsForm.reduce((s, l) => s + Number(l.tantieme||0), 0);

  // Cotisation calculée d'un lot en mode tantième
  const cotisationCalc = (l) =>
    isTantieme && totalTantiemeForm && budget
      ? Math.round((Number(budget) * (Number(l.tantieme)||0)) / totalTantiemeForm)
      : Number(l.cotisation||0);

  const initLots = (nb) => {
    const rows = Array.from({length:nb}, (_, i) => ({
      numero:   i+1,
      appart:   "",
      etage:    "",
      proprio:  "",
      email:    "",
      telephone:"",
      tantieme: "",
      cotisation:"",
    }));
    setLotsForm(rows);
  };

  const updateLot = (idx, field, val) => {
    setLotsForm(prev => prev.map((l, i) => i===idx ? {...l, [field]:val} : l));
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setExcelMsg(null);
    try {
      const lots = await parseModeleExcel(file);
      setLotsForm(lots);
      setNbLots(String(lots.length));
      setExcelMsg({type:"ok", text:`${lots.length} lots importés depuis le fichier Excel.`});
    } catch(err) {
      setExcelMsg({type:"err", text:err.message});
    }
    e.target.value = "";
  };

  const goNext = () => {
    setErr("");
    if(step === 1) {
      if(!syndicatNom.trim()) { setErr("Le nom du syndicat est requis."); return; }
    }
    if(step === 2) {
      const n = Number(nbLots);
      if(!immeubleNom.trim()) { setErr("Le nom de l'immeuble est requis."); return; }
      if(!Number.isInteger(n) || n < 1 || n > 200) { setErr("Nombre de lots invalide (1-200)."); return; }
      if(isTantieme && (!budget || Number(budget) <= 0)) {
        setErr("En mode tantième, le budget mensuel est requis pour calculer les cotisations."); return;
      }
      // Ne pas écraser des lots déjà importés depuis Excel
      if(lotsForm.length !== n) initLots(n);
    }
    if(step === 3) {
      const invalid = isTantieme
        ? lotsForm.some(l => !l.appart.trim() || !l.tantieme)
        : lotsForm.some(l => !l.appart.trim() || !l.tantieme || !l.cotisation);
      if(invalid) {
        setErr(isTantieme
          ? "Chaque lot doit avoir une désignation et un tantième (la cotisation est calculée automatiquement)."
          : "Chaque lot doit avoir une désignation, un tantième et une cotisation.");
        return;
      }
    }
    setStep(s => s+1);
  };

  const create = async () => {
    setSaving(true); setErr("");
    try {
      // Récupérer le user depuis la session Supabase ou depuis le contexte AppContext
      let authUser = null;
      try {
        const {data: authData} = await supabase.auth.getUser();
        authUser = authData?.user || null;
      } catch(_) {}
      if(!authUser) {
        try {
          const {data: sessionData} = await supabase.auth.getSession();
          authUser = sessionData?.session?.user || null;
        } catch(_) {}
      }

      // Cotisations : calculées automatiquement en mode tantième, sinon saisies
      const baseLots = lotsForm.map(l => ({
        numero:     Number(l.numero),
        appart:     l.appart,
        etage:      l.etage,
        proprio:    l.proprio,
        email:      l.email || "",
        telephone:  l.telephone || "",
        tantieme:   Number(l.tantieme||0),
        cotisation: Number(l.cotisation||0),
      }));
      const finalLots = isTantieme
        ? computeCotisationsTantieme(baseLots, Number(budget||0))
        : baseLots;

      // Syndicat + immeuble + lots + profil admin créés via edge function (service_role, bypass RLS)
      const {syndicat, immeuble} = await createSyndicatFull({
        syndicatNom,
        syndicatAdresse,
        pays,
        devise,
        immeubleNom,
        immeubleAdr,
        immeubleRef,
        immeubleBudget:         Number(budget||0),
        immeubleModeCotisation: modeCotisation,
        lots: finalLots,
        adminUserId:    authUser?.id || null,
        adminNomComplet: authUser?.user_metadata?.nom_complet || authUser?.email || syndicatNom,
      });

      // Créer automatiquement les comptes propriétaires (lots avec email)
      const lotsWithEmail = finalLots.filter(l => l.email?.trim());
      let accountsSummary = null;
      if(lotsWithEmail.length) {
        try {
          accountsSummary = await createProprietaireAccounts(finalLots, syndicat.id, immeuble.id);
        } catch(accErr) {
          console.warn("Accounts creation partial:", accErr.message);
        }
      }

      if(onDone) {
        onDone(syndicat, immeuble, accountsSummary);
      } else if(authUser) {
        try {
          await createAdminProfile(authUser.id, {
            syndicatId: syndicat.id,
            immeubleId: immeuble.id,
            nomComplet: authUser.user_metadata?.nom_complet || authUser.email,
            email:      authUser.email,
          });
        } catch(profileErr) {
          console.warn("Profile creation via client failed, edge function may have handled it:", profileErr.message);
        }
        let profile = null;
        try {
          const {data} = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
          profile = data;
        } catch(_) {}

        await completeOnboarding(authUser, profile || {
          id: authUser.id,
          syndicat_id: syndicat.id,
          immeuble_id: immeuble.id,
          immeubles_ids: [immeuble.id],
          nom_complet: authUser.user_metadata?.nom_complet || authUser.email,
          role: "admin",
          lots_ids: [],
        });
      } else {
        // Pas de session du tout — rediriger vers le login
        setErr("Syndicat créé avec succès ! Connectez-vous maintenant avec vos identifiants.");
        setSaving(false);
      }
    } catch(e) {
      console.error("Onboarding error:", e);
      setErr(e.message || "Erreur lors de la création. Réessayez.");
      setSaving(false);
    }
  };

  const totalTantieme = lotsForm.reduce((s, l) => s + Number(l.tantieme||0), 0);

  return (
    <div style={{minHeight:"100vh",background:"#0F2044",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-100,right:-100,width:300,height:300,borderRadius:"50%",background:"#10B98112",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,left:-80,width:220,height:220,borderRadius:"50%",background:"#10B98108",pointerEvents:"none"}}/>

      <div style={{background:"#fff",borderRadius:20,padding:isMobile?"24px 18px":"36px 40px",width:"100%",maxWidth:560,boxShadow:"0 24px 64px rgba(0,0,0,0.3)",position:"relative"}}>
        {/* Bouton fermer (back-office) ou déconnexion (onboarding) */}
        {onClose ? (
          <button onClick={onClose}
            style={{position:"absolute",top:16,right:16,background:"#F1F5F9",border:"none",borderRadius:8,padding:"6px 8px",color:"#64748B",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
            <Icon name="close" size={13}/>Fermer
          </button>
        ) : (
          <button onClick={logout}
            style={{position:"absolute",top:16,right:16,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"6px 10px",color:"#DC2626",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
            <Icon name="logout" size={13}/>Déconnexion
          </button>
        )}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:48,height:48,borderRadius:13,background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}><Icon name="building" size={22}/></div>
          <h1 style={{fontSize:20,fontWeight:900,color:"#0F2044",margin:0,letterSpacing:"-0.03em"}}>{onDone ? "Nouveau client SaaS" : "Bienvenue sur SyndicPro"}</h1>
          <p style={{fontSize:11,color:"#94A3B8",margin:"4px 0 0"}}>{onDone ? "Créer un nouveau syndicat indépendant en 4 étapes" : "Configurez votre espace de gestion en 4 étapes"}</p>
        </div>

        <StepDots current={step}/>

        {/* ── Étape 1 : Syndicat ── */}
        {step === 1 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"#0F2044",marginBottom:2}}>Votre Syndicat</h2>
            <p style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>Ces informations identifient votre organisation.</p>
            <Input label="Nom du syndicat *" value={syndicatNom} onChange={e=>setSyndicatNom(e.target.value)} placeholder="Ex: Syndicat de la Résidence X"/>
            <Input label="Adresse" value={syndicatAdresse} onChange={e=>setSyndicatAdresse(e.target.value)} placeholder="Ex: 12 Rue Mermoz, Dakar"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="E-mail de contact" value={syndicatEmail} onChange={e=>setSyndicatEmail(e.target.value)} placeholder="contact@syndic.sn"/>
              <Input label="Téléphone" value={syndicatTel} onChange={e=>setSyndicatTel(e.target.value)} placeholder="+221 77 000 00 00"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Pays</label>
                <select value={pays} onChange={e=>setPays(e.target.value)} style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:12,outline:"none",background:"#F8FAFC"}}>
                  <option value="SN">🇸🇳 Sénégal</option>
                  <option value="CI">🇨🇮 Côte d'Ivoire</option>
                  <option value="ML">🇲🇱 Mali</option>
                  <option value="BF">🇧🇫 Burkina Faso</option>
                  <option value="MA">🇲🇦 Maroc</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Devise</label>
                <select value={devise} onChange={e=>setDevise(e.target.value)} style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:12,outline:"none",background:"#F8FAFC"}}>
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">EUR €</option>
                  <option value="MAD">MAD دج</option>
                  <option value="USD">USD $</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 2 : Immeuble ── */}
        {step === 2 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"#0F2044",marginBottom:2}}>Votre Immeuble</h2>
            <p style={{fontSize:11,color:"#94A3B8",marginBottom:4}}>Vous pourrez ajouter d'autres immeubles plus tard.</p>

            <Input label="Nom de l'immeuble *" value={immeubleNom} onChange={e=>setImmeubleNom(e.target.value)} placeholder="Ex: Résidence Les Cocotiers"/>
            <Input label="Adresse" value={immeubleAdr} onChange={e=>setImmeubleAdr(e.target.value)} placeholder="Ex: Almadies, Dakar"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="Référence foncière" value={immeubleRef} onChange={e=>setImmeubleRef(e.target.value)} placeholder="Ex: TF 12345/DK"/>
              <Input label="Nombre de lots *" value={nbLots} onChange={e=>setNbLots(e.target.value)} type="number" placeholder="Ex: 13"/>
            </div>

            {/* Budget mensuel */}
            <Input label={`Budget mensuel${isTantieme ? " *" : ""} (${devise})`} value={budget} onChange={e=>setBudget(e.target.value)} type="number" placeholder={`Ex: ${devise==="EUR"?"2000":"300000"}`}/>

            {/* Base des cotisations */}
            <div>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:6}}>Base de calcul des cotisations *</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {v:"tantieme", t:"Au tantième", d:"Réparti selon le tantième de chaque lot"},
                  {v:"fixe",     t:"Montant fixe", d:"Cotisation saisie pour chaque lot"},
                ].map(o => (
                  <button key={o.v} type="button" onClick={()=>setModeCotisation(o.v)}
                    style={{textAlign:"left",border:`1.5px solid ${modeCotisation===o.v?"#10B981":"#E2E8F0"}`,background:modeCotisation===o.v?"#F0FDF4":"#F8FAFC",borderRadius:10,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{fontSize:12,fontWeight:700,color:modeCotisation===o.v?"#059669":"#0F2044"}}>{o.t}</div>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{o.d}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Lots ── */}
        {step === 3 && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:4}}>
              <div>
                <h2 style={{fontSize:14,fontWeight:700,color:"#0F2044",margin:0}}>Définition des Lots</h2>
                <p style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{lotsForm.length} lots — total tantièmes : {totalTantieme.toLocaleString("fr-FR")}</p>
              </div>
            </div>

            {/* Boutons Excel : télécharger le modèle + importer */}
            <div style={{background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:10,padding:"12px 14px"}}>
              <p style={{fontSize:11,fontWeight:700,color:"#0369A1",marginBottom:8}}>Importer depuis Excel</p>
              <p style={{fontSize:10,color:"#64748B",marginBottom:10}}>Téléchargez le modèle, remplissez-le avec vos lots, puis importez-le.</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button type="button" onClick={() => downloadModeleExcel(Number(nbLots) || 10)}
                  style={{display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #BAE6FD",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:600,color:"#0369A1",cursor:"pointer"}}>
                  <Icon name="download" size={13}/>Télécharger le modèle
                </button>
                <label style={{display:"flex",alignItems:"center",gap:6,background:"#0F2044",border:"none",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                  <Icon name="upload" size={13}/>Importer un fichier Excel
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} style={{display:"none"}}/>
                </label>
              </div>
              {excelMsg && (
                <div style={{marginTop:8,fontSize:11,color:excelMsg.type==="ok"?"#059669":"#DC2626",fontWeight:600}}>
                  {excelMsg.type==="ok"?"✅ ":"⚠️ "}{excelMsg.text}
                </div>
              )}
            </div>

            {isTantieme && (
              <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#1D4ED8"}}>
                💡 Mode tantième : la cotisation de chaque lot est calculée automatiquement
                ({Number(budget||0).toLocaleString("fr-FR")} {devise} ÷ {totalTantieme.toLocaleString("fr-FR")} tantièmes).
              </div>
            )}

            <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,paddingRight:4}}>
              {lotsForm.map((l, idx) => (
                <Card key={idx} style={{padding:"12px 14px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#10B981",marginBottom:8}}>Lot #{l.numero}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <Input label="Désignation *" value={l.appart} onChange={e=>updateLot(idx,"appart",e.target.value)} placeholder="Ex: RDC droite"/>
                    <Input label="Étage" value={l.etage} onChange={e=>updateLot(idx,"etage",e.target.value)} placeholder="Ex: RDC, 1er, 2e…"/>
                    <Input label="Propriétaire" value={l.proprio} onChange={e=>updateLot(idx,"proprio",e.target.value)} placeholder="Nom complet"/>
                    <Input label="Email propriétaire" value={l.email||""} onChange={e=>updateLot(idx,"email",e.target.value)} type="email" placeholder="proprio@email.com"/>
                    <Input label="Téléphone" value={l.telephone||""} onChange={e=>updateLot(idx,"telephone",e.target.value)} placeholder="+221 77 000 00 00"/>
                    <Input label="Tantième *" value={l.tantieme} onChange={e=>updateLot(idx,"tantieme",e.target.value)} type="number" placeholder="Ex: 750"/>
                    {isTantieme ? (
                      <div>
                        <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Cotisation / mois (auto)</label>
                        <div style={{border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 12px",fontSize:13,color:"#059669",fontWeight:700,background:"#F0FDF4"}}>
                          {cotisationCalc(l).toLocaleString("fr-FR")} {devise}
                        </div>
                      </div>
                    ) : (
                      <Input label="Cotisation / mois *" value={l.cotisation} onChange={e=>updateLot(idx,"cotisation",e.target.value)} type="number" placeholder={`Ex: ${devise==="EUR"?"300":"45000"}`}/>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Étape 4 : Confirmation ── */}
        {step === 4 && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"#0F2044",marginBottom:2}}>Récapitulatif</h2>
            <Card style={{padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Syndicat</div>
              <div style={{fontSize:13,fontWeight:700,color:"#0F2044"}}>{syndicatNom}</div>
              {syndicatAdresse && <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{syndicatAdresse}</div>}
            </Card>
            <Card style={{padding:"14px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Immeuble</div>
              <div style={{fontSize:13,fontWeight:700,color:"#0F2044"}}>{immeubleNom}</div>
              <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{lotsForm.length} lots · {totalTantieme.toLocaleString("fr-FR")} tantièmes</div>
              {immeubleRef && <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Réf : {immeubleRef}</div>}
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <span style={{fontSize:10,fontWeight:700,background:"#EEF2FF",color:"#4F46E5",padding:"3px 9px",borderRadius:20}}>
                  Cotisation : {isTantieme ? "au tantième (auto)" : "montant fixe"}
                </span>
                {Number(budget) > 0 && (
                  <span style={{fontSize:10,fontWeight:700,background:"#F0FDF4",color:"#059669",padding:"3px 9px",borderRadius:20}}>
                    Budget : {Number(budget).toLocaleString("fr-FR")} {devise}/mois
                  </span>
                )}
              </div>
            </Card>
            <div style={{background:"#F0FDF4",borderRadius:10,padding:"10px 14px",border:"1px solid #BBF7D0",fontSize:11,color:"#059669",fontWeight:600}}>
              ✓ Une fois créé, vous accéderez directement à votre tableau de bord.
            </div>
          </div>
        )}

        {err && (
          <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#DC2626",marginTop:12}}>⚠️ {err}</div>
        )}

        <div style={{display:"flex",gap:10,marginTop:20}}>
          {step > 1 && (
            <button onClick={() => {setStep(s=>s-1); setErr("");}}
              style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:10,padding:"12px 0",fontSize:13,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
              ← Retour
            </button>
          )}
          {step < 4 ? (
            <button onClick={goNext}
              style={{flex:2,background:"#0F2044",border:"none",borderRadius:10,padding:"12px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              Suivant →
            </button>
          ) : (
            <button onClick={create} disabled={saving}
              style={{flex:2,background:saving?"#6EE7B7":"#10B981",border:"none",borderRadius:10,padding:"12px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {saving ? <><span style={{width:14,height:14,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Création en cours...</> : "🚀 Créer et accéder"}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
};
