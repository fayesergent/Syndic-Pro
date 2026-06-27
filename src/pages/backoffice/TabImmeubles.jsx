import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext.jsx";
import { loadImmeubles, loadLots, createImmeuble, createLots, updateImmeuble, deleteImmeuble, createProprietaireAccounts } from "../../services/supabaseService.js";
import { Card, SH, Input, Icon } from "../../components/ui/index.js";
import { fmtN } from "../../utils/formatters.js";
import { downloadModeleExcel, parseModeleExcel, computeCotisationsTantieme } from "../../utils/excelTemplate.js";

const BLANK = {nom:"", adresse:"", reference_tf:"", ville:"", nb_lots:"", budget_mensuel:"", mode_cotisation:"fixe"};

export const TabImmeubles = ({isMobile, syndicatId: syndicatIdProp}) => {
  const {syndicatId: ctxSyndicatId, selectedImmeuble, changeImmeuble} = useApp();
  const syndicatId = syndicatIdProp ?? ctxSyndicatId;

  const [immeubles, setImmeubles] = useState([]);
  const [lotsCount, setLotsCount] = useState({});
  const [loadingList, setLoadingList] = useState(false);

  const reloadImmeubles = async () => {
    if(!syndicatId) return;
    setLoadingList(true);
    const fetched = await loadImmeubles(syndicatId);
    setImmeubles(fetched);
    // Charger le vrai nombre de lots pour chaque immeuble
    const counts = {};
    await Promise.all(fetched.map(async imm => {
      const lots = await loadLots(imm.id);
      counts[imm.id] = lots.length;
    }));
    setLotsCount(counts);
    setLoadingList(false);
  };

  useEffect(() => { reloadImmeubles(); }, [syndicatId]);

  const [mode, setMode]          = useState("list");
  const [form, setForm]          = useState(BLANK);
  const [editId, setEditId]      = useState(null);
  const [saving, setSaving]      = useState(false);
  const [deleting, setDeleting]  = useState(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [msg, setMsg]            = useState(null);

  // Excel import state
  const [importedLots, setImportedLots] = useState([]);
  const [excelMsg, setExcelMsg]         = useState(null);
  const [accountsResult, setAccountsResult] = useState(null);

  const F = (k, v) => setForm(f => ({...f, [k]: v}));

  const openCreate = () => {
    setForm(BLANK);
    setEditId(null);
    setImportedLots([]);
    setExcelMsg(null);
    setMode("create");
    setMsg(null);
  };

  const openEdit = (imm) => {
    setForm({
      nom:            imm.nom || "",
      adresse:        imm.adresse || "",
      reference_tf:   imm.reference_fonciere || "",
      ville:          imm.ville || "",
      nb_lots:        imm.nb_lots !== undefined && imm.nb_lots !== null ? String(imm.nb_lots) : "",
      budget_mensuel: imm.budget_mensuel !== undefined && imm.budget_mensuel !== null ? String(imm.budget_mensuel) : "",
      mode_cotisation: imm.mode_cotisation === "tantieme" ? "tantieme" : "fixe",
    });
    setEditId(imm.id);
    setImportedLots([]);
    setExcelMsg(null);
    setMode("edit");
    setMsg(null);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setExcelMsg(null);
    try {
      const lots = await parseModeleExcel(file);
      setImportedLots(lots);
      // Auto-remplir nb_lots depuis le fichier
      F("nb_lots", String(lots.length));
      // Calculer le budget total si les cotisations sont renseignées
      const totalCot = lots.reduce((s, l) => s + (Number(l.cotisation) || 0), 0);
      if(totalCot > 0) F("budget_mensuel", String(totalCot));
      setExcelMsg({type:"ok", text:`${lots.length} lots importés depuis le fichier Excel.`});
    } catch(err) {
      setExcelMsg({type:"err", text:err.message});
    }
    e.target.value = "";
  };

  const save = async () => {
    if(!form.nom?.trim()) { setMsg({type:"err", text:"Le nom est requis."}); return; }
    setSaving(true);
    try {
      if(mode === "create") {
        const nbLots = importedLots.length || (form.nb_lots ? Number(form.nb_lots) : 0);
        const immeuble = await createImmeuble({
          syndicatId,
          nom:              form.nom,
          adresse:          form.adresse,
          reference_fonciere: form.reference_tf,
          ville:            form.ville,
          nb_lots:          nbLots,
          budget_mensuel:   form.budget_mensuel,
          mode_cotisation:  form.mode_cotisation,
        });
        // Créer les lots importés depuis Excel + comptes propriétaires
        if(importedLots.length && immeuble?.id) {
          const isTantieme = form.mode_cotisation === "tantieme";
          const baseLots = importedLots.map(l => ({
            numero:     Number(l.numero),
            appart:     l.appart || l.appartement || "",
            etage:      l.etage || "",
            proprio:    l.proprio || "",
            email:      l.email || "",
            telephone:  l.telephone || "",
            tantieme:   Number(l.tantieme || 0),
            cotisation: Number(l.cotisation || 0),
          }));
          const finalLots = isTantieme
            ? computeCotisationsTantieme(baseLots, Number(form.budget_mensuel || 0))
            : baseLots;
          await createLots(immeuble.id, syndicatId, finalLots);

          // Créer automatiquement les comptes propriétaires
          const lotsWithEmail = importedLots.filter(l => l.email?.trim());
          if(lotsWithEmail.length) {
            const res = await createProprietaireAccounts(importedLots, syndicatId, immeuble.id);
            setAccountsResult(res);
          }
        }
      } else {
        await updateImmeuble(editId, {
          nom:            form.nom,
          adresse:        form.adresse  || null,
          reference_tf:   form.reference_tf || null,
          ville:          form.ville    || null,
          nb_lots:        form.nb_lots  ? Number(form.nb_lots) : null,
          budget_mensuel: form.budget_mensuel ? Number(form.budget_mensuel) : null,
          mode_cotisation: form.mode_cotisation,
        });
      }
      setImportedLots([]);
      setExcelMsg(null);
      await reloadImmeubles();
      setMode("list");
      setMsg({type:"ok", text: mode==="create"
        ? `Immeuble créé${importedLots.length ? ` avec ${importedLots.length} lots` : ""}.`
        : "Immeuble mis à jour."});
      setTimeout(() => setMsg(null), 4000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (imm) => {
    if(!deleteConfirmed) {
      setMsg({type:"err", text:"Veuillez cocher la case de confirmation."});
      return;
    }
    setSaving(true);
    try {
      await deleteImmeuble(imm.id);
      await reloadImmeubles();
      setDeleting(null);
      setDeleteConfirmed(false);
      setMsg({type:"ok", text:"Immeuble supprimé."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {msg && mode==="list" && (
        <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626"}}>
          {msg.type==="ok"?"✅ ":"⚠️ "}{msg.text}
        </div>
      )}

      {/* Résumé des comptes propriétaires créés */}
      {accountsResult && (accountsResult.created.length > 0 || accountsResult.failed.length > 0) && (
        <Card style={{padding:isMobile?"14px":"18px",border:"1px solid #BBF7D0",background:"#F0FDF4"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#059669",marginBottom:6}}>
                👥 {accountsResult.created.length} compte{accountsResult.created.length > 1 ? "s" : ""} propriétaire{accountsResult.created.length > 1 ? "s" : ""} créé{accountsResult.created.length > 1 ? "s" : ""}
              </div>
              <div style={{fontSize:11,color:"#065F46",marginBottom:8}}>
                Mot de passe par défaut : <strong style={{background:"#ECFDF5",padding:"2px 8px",borderRadius:5,fontFamily:"monospace",letterSpacing:"0.05em"}}>{accountsResult.defaultPassword}</strong>
              </div>
              <div style={{fontSize:10,color:"#64748B",marginBottom:8}}>Les propriétaires pourront changer leur mot de passe à la première connexion.</div>
            </div>
            <button onClick={() => setAccountsResult(null)} style={{background:"none",border:"none",color:"#059669",cursor:"pointer",fontSize:16,padding:0,flexShrink:0}}>✕</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {accountsResult.created.map((u, i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#065F46"}}>
                <span style={{color:"#10B981"}}>✓</span>
                <span style={{fontWeight:600}}>Lot #{u.lot}</span>
                <span>{u.nom}</span>
                <span style={{color:"#94A3B8"}}>({u.email})</span>
              </div>
            ))}
            {accountsResult.failed.map((u, i) => (
              <div key={`f${i}`} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#DC2626"}}>
                <span>✗</span>
                <span style={{fontWeight:600}}>Lot #{u.lot}</span>
                <span>{u.email} — {u.error}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Formulaire création / édition ─────────────────────────────────────── */}
      {(mode==="create" || mode==="edit") && (
        <Card style={{padding:isMobile?"14px":"22px"}}>
          <SH title={mode==="create" ? "Créer un immeuble" : "Modifier l'immeuble"}/>
          {msg && (
            <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626",marginBottom:14}}>
              {msg.type==="ok"?"✅ ":"⚠️ "}{msg.text}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              <Input label="Nom de l'immeuble *" value={form.nom} onChange={e=>F("nom",e.target.value)} placeholder="Ex: Résidence Les Cocotiers"/>
              <Input label="Ville" value={form.ville} onChange={e=>F("ville",e.target.value)} placeholder="Ex: Dakar"/>
              <Input label="Adresse" value={form.adresse} onChange={e=>F("adresse",e.target.value)} placeholder="Ex: Almadies"/>
              <Input label="Référence TF" value={form.reference_tf} onChange={e=>F("reference_tf",e.target.value)} placeholder="Ex: TF 12345/DK"/>
              <Input label="Nb lots" value={form.nb_lots} onChange={e=>F("nb_lots",e.target.value)} type="number" placeholder="0"/>
              <Input label="Budget mensuel (FCFA)" value={form.budget_mensuel} onChange={e=>F("budget_mensuel",e.target.value)} type="number" placeholder="0"/>
            </div>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:6}}>Base de calcul des cotisations</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[
                  {v:"tantieme", t:"Au tantième", d:"Réparti selon le tantième des lots"},
                  {v:"fixe",     t:"Montant fixe", d:"Cotisation saisie par lot"},
                ].map(o => (
                  <button key={o.v} type="button" onClick={()=>F("mode_cotisation",o.v)}
                    style={{textAlign:"left",border:`1.5px solid ${form.mode_cotisation===o.v?"#10B981":"#E2E8F0"}`,background:form.mode_cotisation===o.v?"#F0FDF4":"#F8FAFC",borderRadius:10,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{fontSize:12,fontWeight:700,color:form.mode_cotisation===o.v?"#059669":"#0F2044"}}>{o.t}</div>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{o.d}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Import Excel (création uniquement) ──────────────────────── */}
            {mode === "create" && (
              <div style={{background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:10,padding:"12px 14px"}}>
                <p style={{fontSize:11,fontWeight:700,color:"#0369A1",marginBottom:4}}>Importer les lots depuis Excel</p>
                <p style={{fontSize:10,color:"#64748B",marginBottom:10}}>Téléchargez le modèle, remplissez-le avec vos lots, puis importez-le. Le nombre de lots et le budget seront calculés automatiquement.</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button type="button" onClick={() => downloadModeleExcel(Number(form.nb_lots) || 10)}
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
                {importedLots.length > 0 && (
                  <div style={{marginTop:10,maxHeight:180,overflowY:"auto",border:"1px solid #E2E8F0",borderRadius:8,background:"#fff"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                      <thead>
                        <tr style={{background:"#F8FAFC",position:"sticky",top:0}}>
                          {["#","Désignation","Étage","Propriétaire","Tantième","Cotisation"].map(h => (
                            <th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:700,color:"#64748B",borderBottom:"1px solid #E2E8F0"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importedLots.map((l, i) => (
                          <tr key={i} style={{borderBottom:"1px solid #F1F5F9"}}>
                            <td style={{padding:"5px 8px",color:"#10B981",fontWeight:700}}>{l.numero}</td>
                            <td style={{padding:"5px 8px"}}>{l.appart || "—"}</td>
                            <td style={{padding:"5px 8px"}}>{l.etage || "—"}</td>
                            <td style={{padding:"5px 8px"}}>{l.proprio || "—"}</td>
                            <td style={{padding:"5px 8px"}}>{l.tantieme || "—"}</td>
                            <td style={{padding:"5px 8px"}}>{l.cotisation || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={() => {setMode("list"); setImportedLots([]); setExcelMsg(null);}}
                style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                Annuler
              </button>
              <button onClick={save} disabled={saving}
                style={{flex:2,background:saving?"#6EE7B7":"#10B981",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:saving?"not-allowed":"pointer"}}>
                {saving ? "Enregistrement..." : mode==="create"
                  ? (importedLots.length ? `Créer l'immeuble + ${importedLots.length} lots` : "Créer l'immeuble")
                  : "Enregistrer"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Liste des immeubles ──────────────────────────────────────────────── */}
      {mode === "list" && (
        <Card style={{padding:isMobile?"14px":"22px"}}>
          <SH title={`Immeubles (${immeubles.length})`}
            subtitle="Gérez les bâtiments de votre syndicat"
            action={
              <button onClick={openCreate}
                style={{display:"flex",alignItems:"center",gap:5,background:"#0F2044",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                <Icon name="plus" size={13}/>Immeuble
              </button>
            }
          />
          {loadingList ? (
            <div style={{textAlign:"center",padding:"24px 0",color:"#94A3B8"}}>
              <p style={{fontSize:12}}>Chargement...</p>
            </div>
          ) : immeubles.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 0",color:"#94A3B8"}}>
              <Icon name="building" size={32}/>
              <p style={{fontSize:13,marginTop:10}}>Aucun immeuble. Créez le premier.</p>
              <button onClick={openCreate}
                style={{marginTop:12,background:"#0F2044",border:"none",borderRadius:9,padding:"9px 18px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                + Créer un immeuble
              </button>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
              {immeubles.map(imm => {
                const realLotCount = lotsCount[imm.id] ?? imm.nb_lots ?? 0;
                return (
                <div key={imm.id} style={{border:"1px solid #E2E8F0",borderRadius:11,padding:"14px 16px",background:"#fff",position:"relative"}}>
                  {!syndicatIdProp && selectedImmeuble?.id === imm.id && (
                    <span style={{position:"absolute",top:10,right:10,fontSize:8,background:"#ECFDF5",color:"#059669",padding:"2px 6px",borderRadius:10,fontWeight:700}}>SÉLECTIONNÉ</span>
                  )}
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                    <div style={{width:38,height:38,borderRadius:9,background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon name="building" size={18}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:"#0F2044",marginBottom:1}}>{imm.nom}</div>
                      <div style={{fontSize:10,color:"#64748B"}}>{imm.ville ? `${imm.ville} — ` : ""}{imm.adresse || "—"}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                    {[
                      ["Nb lots",  realLotCount || "—"],
                      ["Budget",   imm.budget_mensuel ? `${fmtN(imm.budget_mensuel)} FCFA` : "—"],
                      ["Réf TF",   imm.reference_fonciere || "—"],
                      ["Cotis.",   imm.mode_cotisation === "tantieme" ? "Tantième" : "Fixe"],
                    ].map(([k,v]) => (
                      <div key={k} style={{background:"#F8FAFC",borderRadius:7,padding:"6px 9px"}}>
                        <div style={{fontSize:8,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"}}>{k}</div>
                        <div style={{fontSize:11,fontWeight:600,color:"#0F2044",marginTop:1}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    {!syndicatIdProp && (
                      <button onClick={() => changeImmeuble(imm)}
                        style={{flex:1,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"7px 0",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                        Sélectionner
                      </button>
                    )}
                    <button onClick={() => openEdit(imm)}
                      style={{background:"#EEF2FF",border:"none",borderRadius:8,padding:"7px 11px",fontSize:11,color:"#4F46E5",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <Icon name="edit" size={12}/>Modifier
                    </button>
                    <button onClick={() => {setDeleting(imm); setDeleteConfirmed(false); setMsg(null);}}
                      style={{background:"#FEF2F2",border:"none",borderRadius:8,padding:"7px 9px",color:"#EF4444",cursor:"pointer",display:"flex",alignItems:"center"}}>
                      <Icon name="trash" size={13}/>
                    </button>
                  </div>
                  {/* Confirmation suppression */}
                  {deleting?.id === imm.id && (
                    <div style={{marginTop:12,background:"#FEF2F2",borderRadius:9,padding:"12px 14px",border:"1px solid #FECACA"}}>
                      <p style={{fontSize:11,color:"#DC2626",fontWeight:700,marginBottom:8}}>⚠️ Supprimer "{imm.nom}" et tous ses lots ?</p>
                      <p style={{fontSize:10,color:"#64748B",marginBottom:8}}>Cette action est irréversible.</p>
                      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:10,fontSize:11,color:"#DC2626",fontWeight:600}}>
                        <input type="checkbox" checked={deleteConfirmed} onChange={e=>setDeleteConfirmed(e.target.checked)}
                          style={{accentColor:"#EF4444",width:16,height:16,cursor:"pointer"}}/>
                        Je confirme vouloir supprimer cet immeuble
                      </label>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={() => {setDeleting(null); setDeleteConfirmed(false);}}
                          style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:7,padding:"8px 0",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>Annuler</button>
                        <button onClick={() => confirmDelete(imm)} disabled={saving || !deleteConfirmed}
                          style={{flex:2,background:deleteConfirmed?"#EF4444":"#FCA5A5",border:"none",borderRadius:7,padding:"8px 0",fontSize:12,fontWeight:700,color:"#fff",cursor:deleteConfirmed&&!saving?"pointer":"not-allowed",opacity:deleteConfirmed?1:0.6}}>
                          {saving ? "Suppression..." : "Supprimer définitivement"}
                        </button>
                      </div>
                      {msg?.type==="err" && <div style={{fontSize:11,color:"#DC2626",marginTop:7}}>⚠️ {msg.text}</div>}
                    </div>
                  )}
                </div>
              );})}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
