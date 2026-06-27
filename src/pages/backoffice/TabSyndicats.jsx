import { useState, useEffect } from "react";
import { listAllSyndicats, loadSyndicat, updateSyndicat, deleteSyndicat } from "../../services/supabaseService.js";
import { Card, SH, Input, Icon } from "../../components/ui/index.js";

const DEVISE_OPTIONS = ["FCFA", "EUR", "MAD", "USD"];
const PLAN_OPTIONS   = ["starter", "pro", "enterprise"];

// ─── Badge actif/inactif ──────────────────────────────────────────────────────
const StatusBadge = ({actif}) => (
  <span style={{fontSize:9, padding:"2px 8px", borderRadius:20, fontWeight:700,
    background: actif ? "#ECFDF5" : "#FEF2F2",
    color:      actif ? "#059669" : "#DC2626"}}>
    {actif ? "ACTIF" : "INACTIF"}
  </span>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export const TabSyndicats = ({isMobile, openOnboarding, onSelectSyndicat}) => {
  const [mode, setMode]       = useState("list"); // "list" | "detail"
  const [syndicats, setSyndicats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm]       = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null);
  const [deleting, setDeleting]             = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  // ── Charger tous les syndicats via l'edge function ────────────────────────
  const loadAll = async () => {
    setLoading(true);
    const data = await listAllSyndicats();
    setSyndicats(data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const F = (k, v) => setForm(f => ({...f, [k]: v}));

  // ── Ouvrir le détail d'un syndicat ────────────────────────────────────────
  const openDetail = (s) => {
    setSelected(s);
    setForm({
      nom:    s.nom    || "",
      adresse:s.adresse|| "",
      ville:  s.ville  || "",
      plan:   s.plan   || "starter",
      devise: s.devise || "FCFA",
      actif:  s.actif  !== false,
    });
    setEditing(false);
    setMsg(null);
    setMode("detail");
  };

  // ── Sauvegarder les modifications d'un syndicat ───────────────────────────
  const save = async () => {
    if(!form.nom?.trim()) { setMsg({type:"err", text:"Le nom est requis."}); return; }
    setSaving(true);
    try {
      await updateSyndicat(selected.id, {
        nom:    form.nom,
        adresse:form.adresse || null,
        ville:  form.ville   || null,
        plan:   form.plan    || "starter",
        devise: form.devise  || "FCFA",
      });
      const updated = {...selected, ...form};
      setSelected(updated);
      setSyndicats(prev => prev.map(s => s.id === selected.id ? {...s, ...form} : s));
      setEditing(false);
      setMsg({type:"ok", text:"Syndicat mis à jour avec succès."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  // ── Supprimer un syndicat ──────────────────────────────────────────────────
  const confirmDeleteSyndicat = async () => {
    if(!deleteConfirmed) return;
    setSaving(true);
    try {
      await deleteSyndicat(selected.id);
      setSyndicats(prev => prev.filter(s => s.id !== selected.id));
      setDeleting(false);
      setDeleteConfirmed(false);
      setSelected(null);
      setMode("list");
      setMsg({type:"ok", text:"Syndicat supprimé avec succès."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  // ── Vue liste ─────────────────────────────────────────────────────────────
  if(mode === "list") return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Header stats */}
      <Card style={{padding:isMobile?"14px":"18px"}}>
        <SH
          title={`Syndicats clients (${syndicats.length})`}
          subtitle="Cliquez sur un syndicat pour voir ses détails ou le modifier"
          action={
            <button onClick={loadAll}
              style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
              ↻ Actualiser
            </button>
          }
        />

        {loading ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#94A3B8"}}>
            <p style={{fontSize:13}}>Chargement des syndicats...</p>
          </div>
        ) : syndicats.length === 0 ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#94A3B8"}}>
            <Icon name="building" size={32}/>
            <p style={{fontSize:13,marginTop:10}}>Aucun syndicat. Créez le premier client.</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginTop:4}}>
            {syndicats.map(s => (
              <div key={s.id}
                onClick={() => openDetail(s)}
                style={{border:"1px solid #E2E8F0",borderRadius:12,padding:"14px 16px",background:"#fff",cursor:"pointer",transition:"box-shadow 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(15,32,68,0.10)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
              >
                {/* Ligne titre + badge */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:38,height:38,borderRadius:10,background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name="building" size={18}/>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:"#0F2044"}}>{s.nom}</div>
                      <div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{s.ville || s.adresse || "—"}</div>
                    </div>
                  </div>
                  <StatusBadge actif={s.actif}/>
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[
                    ["Immeubles", s.nb_immeubles || 0],
                    ["Utilisateurs", s.nb_users || 0],
                    ["Plan", s.plan || "starter"],
                  ].map(([k,v]) => (
                    <div key={k} style={{background:"#F8FAFC",borderRadius:7,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:8,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#0F2044",marginTop:1}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Nouveau client */}
      <Card style={{padding:isMobile?"14px":"22px",border:"1px solid #E0F2FE",background:"#F0F9FF"}}>
        <SH title="Nouveau client SaaS" subtitle="Créer un nouveau syndicat indépendant"/>
        <p style={{fontSize:12,color:"#64748B",marginBottom:14,lineHeight:1.6}}>
          Cliquez sur "Démarrer l'onboarding" pour créer un nouveau syndicat avec ses immeubles et lots via le wizard guidé en 4 étapes.
        </p>
        <button onClick={openOnboarding}
          style={{display:"flex",alignItems:"center",gap:7,background:"#0F2044",border:"none",borderRadius:9,padding:"11px 20px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
          <Icon name="plus" size={14}/>🚀 Démarrer l'onboarding
        </button>
      </Card>
    </div>
  );

  // ── Vue détail ────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Breadcrumb */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={() => setMode("list")}
          style={{display:"flex",alignItems:"center",gap:6,background:"#F1F5F9",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
          ← Tous les syndicats
        </button>
        <span style={{fontSize:12,color:"#94A3B8"}}>/ {selected?.nom}</span>
      </div>

      {/* Fiche syndicat */}
      <Card style={{padding:isMobile?"14px":"22px"}}>
        <SH
          title={selected?.nom}
          subtitle={`Syndicat · Plan ${selected?.plan || "starter"} · ${selected?.devise || "FCFA"}`}
          action={!editing && (
            <button onClick={() => { setEditing(true); setMsg(null); }}
              style={{display:"flex",alignItems:"center",gap:6,background:"#0F2044",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              <Icon name="edit" size={13}/>Modifier
            </button>
          )}
        />

        {msg && (
          <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626",marginBottom:14}}>
            {msg.type==="ok" ? "✅ " : "⚠️ "}{msg.text}
          </div>
        )}

        {editing ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <Input label="Nom du syndicat *" value={form.nom} onChange={e=>F("nom",e.target.value)} placeholder="Ex: Syndicat Résidence X"/>
              <Input label="Ville" value={form.ville} onChange={e=>F("ville",e.target.value)} placeholder="Ex: Dakar"/>
              <Input label="Adresse" value={form.adresse} onChange={e=>F("adresse",e.target.value)} placeholder="Ex: 12 Rue Mermoz"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Devise</label>
                <select value={form.devise||"FCFA"} onChange={e=>F("devise",e.target.value)}
                  style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:12,outline:"none",background:"#F8FAFC",fontFamily:"inherit"}}>
                  {DEVISE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Plan</label>
                <select value={form.plan||"starter"} onChange={e=>F("plan",e.target.value)}
                  style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:12,outline:"none",background:"#F8FAFC",fontFamily:"inherit"}}>
                  {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={() => { setEditing(false); setForm({nom:selected.nom,adresse:selected.adresse||"",ville:selected.ville||"",plan:selected.plan||"starter",devise:selected.devise||"FCFA"}); setMsg(null); }}
                style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                Annuler
              </button>
              <button onClick={save} disabled={saving}
                style={{flex:2,background:saving?"#6EE7B7":"#10B981",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                {saving ? "Enregistrement..." : "💾 Enregistrer"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10}}>
            {[
              ["Nom",     selected?.nom],
              ["Ville",   selected?.ville   || "—"],
              ["Adresse", selected?.adresse || "—"],
              ["Devise",  selected?.devise  || "FCFA"],
              ["Plan",    selected?.plan    || "starter"],
              ["Statut",  selected?.actif !== false ? "✅ Actif" : "❌ Inactif"],
              ["Immeubles", selected?.nb_immeubles || 0],
              ["Utilisateurs", selected?.nb_users || 0],
            ].map(([k,v]) => (
              <div key={k} style={{background:"#F8FAFC",borderRadius:9,padding:"10px 12px"}}>
                <div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#0F2044"}}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      {!editing && (
        <Card style={{padding:isMobile?"14px":"22px"}}>
          <SH title="Gérer ce syndicat" subtitle="Accédez aux données de ce client"/>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:4}}>
            <button onClick={() => onSelectSyndicat && onSelectSyndicat(selected.id, selected.nom, "immeubles")}
              style={{display:"flex",alignItems:"center",gap:7,background:"#0F2044",border:"none",borderRadius:9,padding:"10px 18px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              <Icon name="building" size={14}/>Immeubles
            </button>
            <button onClick={() => onSelectSyndicat && onSelectSyndicat(selected.id, selected.nom, "utilisateurs")}
              style={{display:"flex",alignItems:"center",gap:7,background:"#4F46E5",border:"none",borderRadius:9,padding:"10px 18px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              <Icon name="users" size={14}/>Utilisateurs
            </button>
            <button onClick={() => onSelectSyndicat && onSelectSyndicat(selected.id, selected.nom, "lots")}
              style={{display:"flex",alignItems:"center",gap:7,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:9,padding:"10px 18px",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
              <Icon name="percent" size={14}/>Lots
            </button>
          </div>
        </Card>
      )}

      {/* Zone danger — suppression */}
      {!editing && (
        <Card style={{padding:isMobile?"14px":"22px",border:"1px solid #FECACA",background:"#FFFBFB"}}>
          <SH title="Zone dangereuse" subtitle="Actions irréversibles sur ce syndicat"/>
          {!deleting ? (
            <button onClick={() => {setDeleting(true); setDeleteConfirmed(false); setMsg(null);}}
              style={{display:"flex",alignItems:"center",gap:7,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:9,padding:"10px 18px",fontSize:12,fontWeight:700,color:"#DC2626",cursor:"pointer",marginTop:4}}>
              <Icon name="trash" size={14}/>Supprimer ce syndicat
            </button>
          ) : (
            <div style={{marginTop:8,background:"#FEF2F2",borderRadius:10,padding:"14px 16px",border:"1px solid #FECACA"}}>
              <p style={{fontSize:12,color:"#DC2626",fontWeight:700,marginBottom:8}}>⚠️ Supprimer "{selected?.nom}" et toutes ses données (immeubles, lots, utilisateurs) ?</p>
              <p style={{fontSize:11,color:"#64748B",marginBottom:8}}>Cette action est irréversible.</p>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:10,fontSize:11,color:"#DC2626",fontWeight:600}}>
                <input type="checkbox" checked={deleteConfirmed} onChange={e=>setDeleteConfirmed(e.target.checked)}
                  style={{accentColor:"#EF4444",width:16,height:16,cursor:"pointer"}}/>
                Je confirme vouloir supprimer ce syndicat et toutes ses données
              </label>
              <div style={{display:"flex",gap:8}}>
                <button onClick={() => {setDeleting(false); setDeleteConfirmed(false); setMsg(null);}}
                  style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:7,padding:"9px 0",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>Annuler</button>
                <button onClick={confirmDeleteSyndicat} disabled={saving || !deleteConfirmed}
                  style={{flex:2,background:deleteConfirmed?"#EF4444":"#FCA5A5",border:"none",borderRadius:7,padding:"9px 0",fontSize:12,fontWeight:700,color:"#fff",cursor:deleteConfirmed&&!saving?"pointer":"not-allowed",opacity:deleteConfirmed?1:0.6}}>
                  {saving ? "Suppression..." : "Supprimer définitivement"}
                </button>
              </div>
              {msg?.type==="err" && <div style={{fontSize:11,color:"#DC2626",marginTop:8}}>⚠️ {msg.text}</div>}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
