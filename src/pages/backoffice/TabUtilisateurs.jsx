import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext.jsx";
import { supabase } from "../../services/supabase.js";
import {
  listUsersBySyndicat,
  updateUserProfile,
  invokeAdminUsers,
  loadImmeubles,
  loadLots,
} from "../../services/supabaseService.js";
import { ROLE_LABELS } from "../../data/authData.js";
import { Card, SH, Input, Icon } from "../../components/ui/index.js";

const ROLES = ["admin","superadmin","concierge","proprietaire"];
const BLANK_FORM = {email:"",password:"",nomComplet:"",role:"proprietaire",immeubleIds:[],lotsIds:[]};

// ─── Composants définis au NIVEAU MODULE (jamais recréés à chaque render) ────

const Modal = ({title, onClose, children, isMobile}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(15,32,68,0.65)",zIndex:200,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
    <div style={{background:"#fff",borderRadius:isMobile?"20px 20px 0 0":18,padding:isMobile?"22px 18px 28px":28,width:isMobile?"100%":"min(520px,95vw)",maxHeight:isMobile?"90vh":"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
      {isMobile && <div style={{width:32,height:3,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h3 style={{fontSize:15,fontWeight:800,color:"#0F2044",margin:0}}>{title}</h3>
        <button onClick={onClose} style={{background:"#F1F5F9",border:"none",borderRadius:8,padding:6,color:"#64748B",cursor:"pointer",display:"flex"}}><Icon name="close" size={15}/></button>
      </div>
      {children}
    </div>
  </div>
);

const RoleBadge = ({role}) => {
  const rl = ROLE_LABELS[role] || {label:role,color:"#64748B",bg:"#F1F5F9"};
  return <span style={{fontSize:9,background:rl.bg,color:rl.color,padding:"2px 8px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{rl.label}</span>;
};

// ─── Formulaire défini au NIVEAU MODULE avec props explicites ─────────────────
// IMPORTANT : ne jamais définir ce composant à l'intérieur d'un autre composant.
// Si défini à l'intérieur, React le recrée à chaque render → unmount/remount →
// perte de focus sur les inputs à chaque frappe.

const UserForm = ({
  isMobile, isCreate,
  form, onFieldChange,
  saving, msg,
  immeubles, lots,
  onSubmit, onCancel,
  onResetPwd, onDelete,
}) => {
  const toggleId = (arr, id) =>
    arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {msg && (
        <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626"}}>
          {msg.type==="ok"?"✅ ":"⚠️ "}{msg.text}
        </div>
      )}

      <Input label="Email *" value={form.email} onChange={e=>onFieldChange("email",e.target.value)} type="email" placeholder="utilisateur@example.com"/>
      {isCreate && (
        <Input label="Mot de passe * (min. 8 caractères)" value={form.password} onChange={e=>onFieldChange("password",e.target.value)} type="password" placeholder="••••••••"/>
      )}
      <Input label="Nom complet *" value={form.nomComplet} onChange={e=>onFieldChange("nomComplet",e.target.value)} placeholder="Prénom Nom"/>

      {/* Sélecteur de rôle */}
      <div>
        <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Rôle</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {ROLES.map(r => {
            const rl = ROLE_LABELS[r];
            return (
              <button key={r} onClick={()=>onFieldChange("role",r)}
                style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${form.role===r?rl.color:"#E2E8F0"}`,background:form.role===r?rl.bg:"#fff",color:form.role===r?rl.color:"#64748B",fontSize:11,fontWeight:form.role===r?700:500,cursor:"pointer"}}>
                {rl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Immeubles pour concierge/superadmin */}
      {form.role !== "proprietaire" && immeubles.length > 0 && (
        <div>
          <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:7}}>Immeubles accessibles</label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {immeubles.map(imm => (
              <label key={imm.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:"#0F2044"}}>
                <input
                  type="checkbox"
                  checked={form.immeubleIds.includes(imm.id)}
                  onChange={()=>onFieldChange("immeubleIds", toggleId(form.immeubleIds, imm.id))}
                  style={{accentColor:"#10B981",width:14,height:14}}
                />
                {imm.nom}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Lots pour propriétaire */}
      {form.role === "proprietaire" && lots.length > 0 && (
        <div>
          <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:7}}>Lots assignés</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,maxHeight:180,overflowY:"auto"}}>
            {lots.map(l => (
              <label key={l.lotId} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:11,color:"#0F2044",padding:"4px 7px",borderRadius:7,background:form.lotsIds.includes(l.lotId)?"#ECFDF5":"#F8FAFC",border:`1px solid ${form.lotsIds.includes(l.lotId)?"#BBF7D0":"#E2E8F0"}`}}>
                <input
                  type="checkbox"
                  checked={form.lotsIds.includes(l.lotId)}
                  onChange={()=>onFieldChange("lotsIds", toggleId(form.lotsIds, l.lotId))}
                  style={{accentColor:"#10B981"}}
                />
                <span><b>#{l.lot}</b> {l.appart}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Boutons action */}
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <button onClick={onCancel}
          style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
          Annuler
        </button>
        <button onClick={onSubmit} disabled={saving}
          style={{flex:2,background:saving?"#6EE7B7":"#10B981",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:saving?"not-allowed":"pointer"}}>
          {saving ? "Enregistrement..." : isCreate ? "Créer l'utilisateur" : "Enregistrer"}
        </button>
      </div>

      {/* Actions supplémentaires édition */}
      {!isCreate && (
        <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={onResetPwd}
            style={{display:"flex",alignItems:"center",gap:5,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:600,color:"#C2410C",cursor:"pointer"}}>
            <Icon name="key" size={12}/>Réinitialiser MDP
          </button>
          <button onClick={onDelete} disabled={saving}
            style={{display:"flex",alignItems:"center",gap:5,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:600,color:"#DC2626",cursor:"pointer"}}>
            <Icon name="trash" size={12}/>Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Formulaire reset mot de passe (niveau module) ────────────────────────────
const ResetPwdForm = ({saving, newPwd, onPwdChange, onSubmit, msg}) => (
  <div style={{display:"flex",flexDirection:"column",gap:12}}>
    {msg && (
      <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626"}}>
        {msg.text}
      </div>
    )}
    <Input label="Nouveau mot de passe (min. 8 caractères)" value={newPwd} onChange={e=>onPwdChange(e.target.value)} type="password" placeholder="••••••••"/>
    <button onClick={onSubmit} disabled={saving}
      style={{background:saving?"#6EE7B7":"#F59E0B",border:"none",borderRadius:9,padding:"11px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>
      {saving ? "Réinitialisation..." : "🔑 Réinitialiser le mot de passe"}
    </button>
  </div>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export const TabUtilisateurs = ({isMobile, syndicatId: syndicatIdProp}) => {
  const {syndicatId: ctxSyndicatId, immeubles: ctxImmeubles, lots: ctxLots} = useApp();
  const syndicatId = syndicatIdProp ?? ctxSyndicatId;
  const isOverride = !!syndicatIdProp;

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [modal, setModal]       = useState(null); // null | "create" | "edit" | "resetpwd"
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(BLANK_FORM);
  const [newPwd, setNewPwd]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState(null);

  // ── Mode override : charger les immeubles et lots du syndicat sélectionné ────
  const [overrideImmeubles, setOverrideImmeubles] = useState([]);
  const [overrideLots, setOverrideLots]           = useState([]);

  const reload = async () => {
    setLoading(true);
    const data = await listUsersBySyndicat(syndicatId);
    setUsers(data);
    setLoading(false);
  };


  // ── Charger les immeubles/lots du syndicat override si nécessaire ────────────
  useEffect(() => {
    if(!syndicatId) return;
    reload();

    if(isOverride) {
      // Charger immeubles et lots du syndicat sélectionné
      (async () => {
        const imms = await loadImmeubles(syndicatId);
        setOverrideImmeubles(imms);

        const allLots = [];
        for(const imm of imms) {
          const immLots = await loadLots(imm.id);
          allLots.push(...immLots);
        }
        setOverrideLots(allLots);
      })();
    }
  }, [syndicatId, isOverride]);

  // ── Utiliser immeubles/lots du contexte OU du syndicat override ──────────────
  const immeubles = isOverride ? overrideImmeubles : ctxImmeubles;
  const lots = isOverride ? overrideLots : ctxLots;

  // ── Mise à jour d'un seul champ du formulaire ──────────────────────────────
  const handleFieldChange = (key, value) => {
    setForm(f => ({...f, [key]: value}));
  };

  const openCreate = () => {
    setForm(BLANK_FORM);
    setSelected(null);
    setModal("create");
    setMsg(null);
  };
  const openEdit = (u) => {
    setSelected(u);
    setForm({
      email:       u.email,
      password:    "",
      nomComplet:  u.nomComplet,
      role:        u.role,
      immeubleIds: u.immeubleIds || [],
      lotsIds:     u.lotsIds     || [],
    });
    setModal("edit");
    setMsg(null);
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setMsg(null);
    setNewPwd("");
  };

  // ── Créer un utilisateur ───────────────────────────────────────────────────
  const createUser = async () => {
    if(!form.email || !form.password || !form.nomComplet) {
      setMsg({type:"err", text:"Email, mot de passe et nom complet sont requis."}); return;
    }
    if(form.password.length < 8) {
      setMsg({type:"err", text:"Le mot de passe doit faire au moins 8 caractères."}); return;
    }
    setSaving(true); setMsg(null);
    const emailTrim = form.email.trim().toLowerCase();

    // Essai 1 : edge function
    try {
      await invokeAdminUsers("create", {
        email:       emailTrim,
        password:    form.password,
        nomComplet:  form.nomComplet,
        role:        form.role,
        syndicatId:  syndicatId,
        immeubleIds: form.immeubleIds,
        lotsIds:     form.lotsIds,
      });
      await reload();
      closeModal();
      setMsg({type:"ok", text:`Utilisateur ${emailTrim} créé avec succès.`});
      setTimeout(() => setMsg(null), 4000);
      setSaving(false);
      return;
    } catch(_) {}

    // Essai 2 : signUp direct + profil
    try {
      const {data: {session: origSession}} = await supabase.auth.getSession();
      const {data, error} = await supabase.auth.signUp({
        email: emailTrim,
        password: form.password,
        options: { data: { nom_complet: form.nomComplet } },
      });
      if(error) throw error;
      if(data?.user) {
        await supabase.from("profiles").upsert({
          id:             data.user.id,
          syndicat_id:    syndicatId,
          immeuble_id:    form.immeubleIds[0] || null,
          immeubles_ids:  form.immeubleIds,
          nom_complet:    form.nomComplet,
          email:          emailTrim,
          role:           form.role,
          lots_ids:       form.lotsIds,
        }, {onConflict:"id"});
        // Restaurer la session admin
        if(origSession) {
          await supabase.auth.setSession({
            access_token: origSession.access_token,
            refresh_token: origSession.refresh_token,
          });
        }
      }
      await reload();
      closeModal();
      setMsg({type:"ok", text:`Utilisateur ${emailTrim} créé avec succès.`});
      setTimeout(() => setMsg(null), 4000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  // ── Modifier un utilisateur ────────────────────────────────────────────────
  const saveEdit = async () => {
    if(!form.nomComplet) { setMsg({type:"err", text:"Le nom est requis."}); return; }
    setSaving(true); setMsg(null);
    try {
      await updateUserProfile(selected.id, {
        nomComplet:  form.nomComplet,
        role:        form.role,
        immeubleIds: form.immeubleIds,
        lotsIds:     form.lotsIds,
      });
      if(form.email && form.email !== selected.email) {
        await invokeAdminUsers("update_email", {userId:selected.id, newEmail:form.email.trim()});
      }
      await reload();
      closeModal();
      setMsg({type:"ok", text:"Utilisateur mis à jour."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  // ── Réinitialiser le mot de passe ──────────────────────────────────────────
  const resetPassword = async () => {
    if(!newPwd || newPwd.length < 8) {
      setMsg({type:"err", text:"Mot de passe min. 8 caractères."}); return;
    }
    setSaving(true); setMsg(null);
    try {
      await invokeAdminUsers("update_password", {userId:selected.id, newPassword:newPwd});
      setNewPwd("");
      setModal("edit");
      setMsg({type:"ok", text:"Mot de passe réinitialisé."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  // ── Supprimer un utilisateur ───────────────────────────────────────────────
  const deleteUser = async () => {
    if(!selected) return;
    setSaving(true); setMsg(null);
    try {
      await invokeAdminUsers("delete", {userId:selected.id});
      await reload();
      closeModal();
      setMsg({type:"ok", text:`Utilisateur ${selected.email} supprimé.`});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Message hors modal */}
      {msg && !modal && (
        <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626"}}>
          {msg.type==="ok"?"✅ ":"⚠️ "}{msg.text}
        </div>
      )}

      {/* Modal création */}
      {modal === "create" && (
        <Modal title="Créer un utilisateur" onClose={closeModal} isMobile={isMobile}>
          <UserForm
            isMobile={isMobile} isCreate={true}
            form={form} onFieldChange={handleFieldChange}
            saving={saving} msg={msg}
            immeubles={immeubles} lots={lots}
            onSubmit={createUser} onCancel={closeModal}
            onResetPwd={null} onDelete={null}
          />
        </Modal>
      )}

      {/* Modal édition */}
      {modal === "edit" && selected && (
        <Modal title={`Modifier — ${selected.nomComplet || selected.email}`} onClose={closeModal} isMobile={isMobile}>
          <UserForm
            isMobile={isMobile} isCreate={false}
            form={form} onFieldChange={handleFieldChange}
            saving={saving} msg={msg}
            immeubles={immeubles} lots={lots}
            onSubmit={saveEdit} onCancel={closeModal}
            onResetPwd={() => { setMsg(null); setModal("resetpwd"); }}
            onDelete={deleteUser}
          />
        </Modal>
      )}

      {/* Modal reset mot de passe */}
      {modal === "resetpwd" && selected && (
        <Modal title={`Réinitialiser MDP — ${selected.email}`} onClose={() => setModal("edit")} isMobile={isMobile}>
          <ResetPwdForm
            saving={saving} newPwd={newPwd}
            onPwdChange={setNewPwd}
            onSubmit={resetPassword}
            msg={msg}
          />
        </Modal>
      )}

      {/* Tableau des utilisateurs */}
      <Card style={{padding:isMobile?"13px 11px":"18px"}}>
        <SH
          title={`Utilisateurs (${filtered.length})`}
          subtitle="Gérez les accès à votre syndicat"
          action={
            <button onClick={openCreate}
              style={{display:"flex",alignItems:"center",gap:5,background:"#0F2044",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              <Icon name="plus" size={13}/>Utilisateur
            </button>
          }
        />

        {/* Filtres */}
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:16}}>
          {["all","superadmin","concierge","proprietaire"].map(r => {
            const rl = r==="all" ? {label:"Tous",color:"#64748B",bg:"#F1F5F9"} : ROLE_LABELS[r];
            const count = r==="all" ? users.length : users.filter(u=>u.role===r).length;
            return (
              <button key={r} onClick={()=>setFilter(r)}
                style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${filter===r?rl.color:"#E2E8F0"}`,background:filter===r?rl.bg:"#fff",color:filter===r?rl.color:"#64748B",fontSize:10,fontWeight:filter===r?700:500,cursor:"pointer"}}>
                {rl.label} <span style={{opacity:0.7}}>({count})</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#94A3B8"}}>
            <p style={{fontSize:12}}>Chargement des utilisateurs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"32px 0",color:"#94A3B8"}}>
            <Icon name="users" size={28}/>
            <p style={{fontSize:13,marginTop:10}}>Aucun utilisateur.</p>
          </div>
        ) : isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(u => (
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"#F8FAFC",border:"1px solid #E2E8F0"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#10B981",flexShrink:0}}>
                  {(u.nomComplet||u.email)[0].toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#0F2044",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.nomComplet||u.email}</div>
                  <div style={{fontSize:10,color:"#94A3B8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{u.email}</div>
                  <div style={{marginTop:3}}><RoleBadge role={u.role}/></div>
                </div>
                <button onClick={() => openEdit(u)}
                  style={{background:"#EEF2FF",border:"none",borderRadius:8,padding:"7px 9px",color:"#4F46E5",cursor:"pointer",display:"flex"}}>
                  <Icon name="edit" size={13}/>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Utilisateur","Email","Rôle","Immeubles","Lots","Depuis",""].map(h=>(
                <th key={h} style={{fontSize:9,color:"#64748B",fontWeight:700,textAlign:"left",padding:"8px 10px",letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{borderTop:"1px solid #F1F5F9"}}>
                  <td style={{padding:"10px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:"#0F2044",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#10B981",flexShrink:0}}>
                        {(u.nomComplet||u.email)[0].toUpperCase()}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{u.nomComplet||"(sans nom)"}</div>
                    </div>
                  </td>
                  <td style={{padding:"10px 10px",fontSize:11,color:"#64748B"}}>{u.email}</td>
                  <td style={{padding:"10px 10px"}}><RoleBadge role={u.role}/></td>
                  <td style={{padding:"10px 10px",fontSize:10,color:"#64748B"}}>{u.immeubleIds?.length||0}</td>
                  <td style={{padding:"10px 10px",fontSize:10,color:"#64748B"}}>{u.lotsIds?.length||0}</td>
                  <td style={{padding:"10px 10px",fontSize:10,color:"#94A3B8"}}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{padding:"10px 10px"}}>
                    <button onClick={() => openEdit(u)}
                      style={{display:"flex",alignItems:"center",gap:4,background:"#EEF2FF",border:"none",borderRadius:7,padding:"5px 10px",fontSize:10,fontWeight:600,color:"#4F46E5",cursor:"pointer"}}>
                      <Icon name="edit" size={11}/>Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
