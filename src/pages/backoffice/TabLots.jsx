import { useState, useCallback, useEffect } from "react";
import { useApp } from "../../contexts/AppContext.jsx";
import { loadImmeubles, loadLots, addLot, updateLot, deleteLot } from "../../services/supabaseService.js";
import { Card, SH, Icon } from "../../components/ui/index.js";
import { fmtN } from "../../utils/formatters.js";

const EMPTY_LOT = {numero:"", appartement:"", etage:"", proprio:"", tantieme:"", cotisation_mensuelle:"", superficie_m2:""};

// Cellule éditable inline
const Cell = ({value, onChange, type="text", placeholder=""}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if(editing) return (
    <input
      autoFocus
      type={type}
      value={draft}
      onChange={e=>setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e=>{ if(e.key==="Enter") commit(); if(e.key==="Escape") {setDraft(value); setEditing(false);} }}
      style={{width:"100%",border:"1.5px solid #10B981",borderRadius:6,padding:"5px 8px",fontSize:12,outline:"none",background:"#fff",fontFamily:"inherit",boxSizing:"border-box"}}
    />
  );
  return (
    <div onClick={()=>{setDraft(value); setEditing(true);}}
      style={{cursor:"text",padding:"5px 8px",borderRadius:6,minHeight:28,fontSize:12,color:value?"#0F2044":"#94A3B8",background:"transparent",transition:"background 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >
      {value || <span style={{color:"#CBD5E1",fontStyle:"italic"}}>{placeholder}</span>}
    </div>
  );
};

export const TabLots = ({isMobile, syndicatId: syndicatIdProp}) => {
  const {
    syndicatId:  ctxSyndicatId,
    immeubleId:  ctxImmeubleId,
    lots:        ctxLots,
    reloadLots:  ctxReloadLots,
    selectedImmeuble,
  } = useApp();

  const isOverride = !!syndicatIdProp;
  const syndicatId = syndicatIdProp ?? ctxSyndicatId;

  // ── État en mode override (syndicat différent de celui de l'admin) ──────────
  const [overrideImmeubles, setOverrideImmeubles] = useState([]);
  const [overrideImmeuble,  setOverrideImmeuble]  = useState(null); // {id, nom}
  const [overrideLots,      setOverrideLots]      = useState([]);
  const [loadingOverride,   setLoadingOverride]   = useState(false);

  // Charger les immeubles du syndicat sélectionné en mode override
  useEffect(() => {
    if(!isOverride || !syndicatId) return;
    loadImmeubles(syndicatId).then(setOverrideImmeubles);
    setOverrideImmeuble(null);
    setOverrideLots([]);
    setRows(null);
    setDirty(new Set());
  }, [syndicatId, isOverride]);

  // Charger les lots quand l'immeuble change en mode override
  useEffect(() => {
    if(!isOverride || !overrideImmeuble) return;
    setLoadingOverride(true);
    loadLots(overrideImmeuble.id).then(data => {
      setOverrideLots(data);
      setRows(null);
      setDirty(new Set());
      setLoadingOverride(false);
    });
  }, [overrideImmeuble?.id]);

  // Valeurs effectives selon le mode
  const immeubleId = isOverride ? (overrideImmeuble?.id ?? null) : ctxImmeubleId;
  const lots       = isOverride ? overrideLots : ctxLots;
  // Immeuble courant (budget + base de cotisation) pour le calcul au tantième
  const currentImmeuble = isOverride ? overrideImmeuble : selectedImmeuble;
  const reloadLots = isOverride
    ? async () => {
        if(!overrideImmeuble) return;
        const data = await loadLots(overrideImmeuble.id);
        setOverrideLots(data);
        setRows(null);
        setDirty(new Set());
      }
    : ctxReloadLots;

  // ── État tableau lots ────────────────────────────────────────────────────────
  const [rows, setRows]         = useState(null);
  const [dirty, setDirty]       = useState(new Set());
  const [saving, setSaving]     = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [msg, setMsg]           = useState(null);

  const localRows = rows !== null ? rows : lots.map(l => ({
    id:                  l.lotId,
    numero:              l.lot,
    appartement:         l.appart || "",
    etage:               l.etage || "",
    proprio:             l.proprio || "",
    tantieme:            l.tantieme || 0,
    cotisation_mensuelle:l.cotisation || 0,
    superficie_m2:       l.superficie_m2 || "",
    isNew:               false,
  }));

  const updateCell = useCallback((idx, field, value) => {
    setRows(prev => {
      const next = [...(prev || localRows)];
      next[idx] = {...next[idx], [field]: value};
      const id = next[idx].id;
      if(id) setDirty(d => new Set([...d, id]));
      else    setDirty(d => new Set([...d, `new_${idx}`]));
      return next;
    });
  }, [localRows]);

  const addRow = () => {
    const maxNum = localRows.reduce((m,r) => Math.max(m, Number(r.numero)||0), 0);
    const newRow = {...EMPTY_LOT, numero:maxNum+1, id:null, isNew:true};
    setRows([...localRows, newRow]);
    setDirty(d => new Set([...d, `new_${localRows.length}`]));
  };

  // ── Recalcule les cotisations au tantième (budget × tantième / total) ────────
  const recalcTantieme = () => {
    const budget = Number(currentImmeuble?.budget_mensuel || 0);
    const total  = localRows.reduce((s,r) => s + (Number(r.tantieme)||0), 0);
    if(!budget) { setMsg({type:"err", text:"Définissez d'abord un budget mensuel pour cet immeuble (onglet Immeubles)."}); return; }
    if(!total)  { setMsg({type:"err", text:"Renseignez les tantièmes avant de calculer."}); return; }
    const next = localRows.map(r => ({
      ...r,
      cotisation_mensuelle: Math.round((budget * (Number(r.tantieme)||0)) / total),
    }));
    setRows(next);
    setDirty(d => {
      const n = new Set(d);
      next.forEach((r,i) => { if(r.id) n.add(r.id); else n.add(`new_${i}`); });
      return n;
    });
    setMsg({type:"ok", text:"Cotisations recalculées au tantième. Sauvegardez pour enregistrer."});
  };

  const deleteRow = async (row, idx) => {
    if(row.isNew || !row.id) {
      const next = localRows.filter((_,i) => i !== idx);
      setRows(next);
      return;
    }
    setSaving(true);
    try {
      await deleteLot(row.id);
      await reloadLots();
      setMsg({type:"ok", text:"Lot supprimé."});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false); setDelConfirm(null);
    }
  };

  const saveAll = async () => {
    if(dirty.size === 0) { setMsg({type:"ok", text:"Aucune modification à enregistrer."}); return; }
    setSaving(true); setMsg(null);
    try {
      const promises = localRows
        .filter((row, idx) => dirty.has(row.id) || dirty.has(`new_${idx}`))
        .map(async row => {
          const data = {
            appartement:          row.appartement,
            etage:                row.etage,
            proprio:              row.proprio,
            tantieme:             Number(row.tantieme||0),
            cotisation_mensuelle: Number(row.cotisation_mensuelle||0),
            superficie_m2:        row.superficie_m2 ? Number(row.superficie_m2) : null,
          };
          if(row.isNew || !row.id) {
            if(!row.appartement) return;
            await addLot(immeubleId, syndicatId, {...data, numero:Number(row.numero)});
          } else {
            await updateLot(row.id, data);
          }
        });
      await Promise.all(promises);
      await reloadLots();
      setDirty(new Set());
      setMsg({type:"ok", text:`${dirty.size} modification(s) enregistrée(s).`});
      setTimeout(() => setMsg(null), 3000);
    } catch(e) {
      setMsg({type:"err", text:e.message});
    } finally {
      setSaving(false);
    }
  };

  const totalTantieme   = localRows.reduce((s,r) => s + (Number(r.tantieme)||0), 0);
  const totalCotisation = localRows.reduce((s,r) => s + (Number(r.cotisation_mensuelle)||0), 0);

  const COLS = [
    {key:"numero",              label:"#",           type:"number", placeholder:"1",   width:"5%"},
    {key:"appartement",         label:"Désignation", type:"text",   placeholder:"RDC droite", width:"18%"},
    {key:"etage",               label:"Étage",       type:"text",   placeholder:"RDC", width:"9%"},
    {key:"proprio",             label:"Propriétaire",type:"text",   placeholder:"Nom", width:"18%"},
    {key:"tantieme",            label:"Tantième",    type:"number", placeholder:"0",   width:"10%"},
    {key:"cotisation_mensuelle",label:"Cotisation",  type:"number", placeholder:"0",   width:"13%"},
    {key:"superficie_m2",       label:"m²",          type:"number", placeholder:"0",   width:"9%"},
  ];

  // ── Sélecteur d'immeuble (mode override, aucun immeuble encore sélectionné) ──
  if(isOverride && !overrideImmeuble) return (
    <Card style={{padding:isMobile?"14px":"22px"}}>
      <SH
        title="Sélectionner un immeuble"
        subtitle="Choisissez l'immeuble dont vous voulez gérer les lots"
      />
      {overrideImmeubles.length === 0 ? (
        <div style={{textAlign:"center",padding:"24px 0",color:"#94A3B8"}}>
          <Icon name="building" size={28}/>
          <p style={{fontSize:13,marginTop:10}}>Aucun immeuble dans ce syndicat.</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
          {overrideImmeubles.map(imm => (
            <button key={imm.id} onClick={() => setOverrideImmeuble(imm)}
              style={{display:"flex",alignItems:"center",gap:12,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:10,padding:"12px 16px",cursor:"pointer",textAlign:"left"}}>
              <div style={{width:34,height:34,borderRadius:8,background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="building" size={16}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#0F2044"}}>{imm.nom}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>{imm.ville || imm.adresse || "—"}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );

  // ── Pas d'immeuble sélectionné (mode normal, AppContext) ────────────────────
  if(!immeubleId) return (
    <Card style={{padding:"32px 20px"}}>
      <div style={{textAlign:"center",color:"#94A3B8"}}>
        <Icon name="building" size={28}/>
        <p style={{fontSize:13,marginTop:10}}>Sélectionnez un immeuble dans le header pour gérer ses lots.</p>
      </div>
    </Card>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Immeuble actif en mode override */}
      {isOverride && overrideImmeuble && (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={() => setOverrideImmeuble(null)}
            style={{background:"#F1F5F9",border:"none",borderRadius:8,padding:"7px 12px",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
            ← Changer d'immeuble
          </button>
          <span style={{fontSize:12,color:"#94A3B8"}}>/ <strong style={{color:"#0F2044"}}>{overrideImmeuble.nom}</strong></span>
        </div>
      )}

      {msg && (
        <div style={{background:msg.type==="ok"?"#F0FDF4":"#FEF2F2",border:`1px solid ${msg.type==="ok"?"#BBF7D0":"#FECACA"}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:msg.type==="ok"?"#059669":"#DC2626"}}>
          {msg.type==="ok"?"✅ ":"⚠️ "}{msg.text}
        </div>
      )}

      {loadingOverride ? (
        <Card style={{padding:"24px",textAlign:"center",color:"#94A3B8"}}>
          <p style={{fontSize:12}}>Chargement des lots...</p>
        </Card>
      ) : (
        <Card style={{padding:isMobile?"13px 11px":"18px"}}>
          <SH
            title={`Lots — ${localRows.length} appartements`}
            subtitle={dirty.size > 0 ? `${dirty.size} modification(s) non sauvegardée(s)` : "Cliquez sur une cellule pour la modifier"}
            action={
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {currentImmeuble?.mode_cotisation === "tantieme" && (
                  <button onClick={recalcTantieme}
                    style={{display:"flex",alignItems:"center",gap:5,background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:600,color:"#1D4ED8",cursor:"pointer"}}>
                    <Icon name="percent" size={12}/>Calcul tantième
                  </button>
                )}
                <button onClick={addRow}
                  style={{display:"flex",alignItems:"center",gap:5,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"7px 11px",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                  <Icon name="plus" size={12}/>Lot
                </button>
                <button onClick={saveAll} disabled={saving || dirty.size===0}
                  style={{display:"flex",alignItems:"center",gap:5,background:dirty.size>0?"#10B981":"#E2E8F0",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:dirty.size>0?"#fff":"#94A3B8",cursor:dirty.size>0?"pointer":"not-allowed"}}>
                  {saving ? "Sauvegarde..." : `💾 Sauvegarder${dirty.size>0?" ("+dirty.size+")":""}`}
                </button>
              </div>
            }
          />

          {isMobile ? (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {localRows.map((row, idx) => (
                <div key={row.id||idx} style={{border:`1px solid ${dirty.has(row.id)||dirty.has(`new_${idx}`)?"#BBF7D0":"#E2E8F0"}`,borderRadius:11,padding:"12px 14px",background:dirty.has(row.id)||dirty.has(`new_${idx}`)?"#F0FDF4":"#fff",position:"relative"}}>
                  {(dirty.has(row.id)||dirty.has(`new_${idx}`)) && (
                    <span style={{position:"absolute",top:8,right:8,fontSize:8,background:"#10B981",color:"#fff",padding:"1px 5px",borderRadius:8,fontWeight:700}}>MODIFIÉ</span>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    {COLS.map(col => (
                      <div key={col.key}>
                        <div style={{fontSize:8,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:3}}>{col.label}</div>
                        <Cell value={String(row[col.key]||"")} onChange={v=>updateCell(idx,col.key,v)} type={col.type} placeholder={col.placeholder}/>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => delConfirm===idx ? deleteRow(row,idx) : setDelConfirm(idx)}
                    style={{background:delConfirm===idx?"#EF4444":"#FEF2F2",border:"none",borderRadius:7,padding:"6px 12px",fontSize:11,fontWeight:700,color:delConfirm===idx?"#fff":"#EF4444",cursor:"pointer",width:"100%"}}>
                    {delConfirm===idx ? "Confirmer suppression" : "🗑 Supprimer"}
                  </button>
                  {delConfirm===idx && (
                    <button onClick={()=>setDelConfirm(null)} style={{background:"#F1F5F9",border:"none",borderRadius:7,padding:"6px 12px",fontSize:11,color:"#64748B",cursor:"pointer",width:"100%",marginTop:5}}>Annuler</button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#F8FAFC"}}>
                    {COLS.map(col => (
                      <th key={col.key} style={{fontSize:9,color:"#64748B",fontWeight:700,textAlign:"left",padding:"8px 6px",letterSpacing:"0.06em",textTransform:"uppercase",width:col.width}}>{col.label}</th>
                    ))}
                    <th style={{width:"5%"}}/>
                  </tr>
                </thead>
                <tbody>
                  {localRows.map((row, idx) => {
                    const isDirty = dirty.has(row.id) || dirty.has(`new_${idx}`);
                    return (
                      <tr key={row.id||idx} style={{borderTop:"1px solid #F1F5F9",background:isDirty?"#F0FDF4":"transparent"}}>
                        {COLS.map(col => (
                          <td key={col.key} style={{padding:"2px 4px"}}>
                            <Cell value={String(row[col.key]||"")} onChange={v=>updateCell(idx,col.key,v)} type={col.type} placeholder={col.placeholder}/>
                          </td>
                        ))}
                        <td style={{padding:"2px 4px"}}>
                          {delConfirm===idx ? (
                            <div style={{display:"flex",gap:4}}>
                              <button onClick={() => deleteRow(row,idx)} style={{background:"#EF4444",border:"none",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:700,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>✓ Oui</button>
                              <button onClick={()=>setDelConfirm(null)} style={{background:"#F1F5F9",border:"none",borderRadius:6,padding:"4px 7px",fontSize:10,color:"#64748B",cursor:"pointer"}}>✕</button>
                            </div>
                          ) : (
                            <button onClick={()=>setDelConfirm(idx)} style={{background:"#FEF2F2",border:"none",borderRadius:6,padding:5,color:"#EF4444",cursor:"pointer",display:"flex"}}>
                              <Icon name="trash" size={13}/>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:"#F0FDF4",borderTop:"2px solid #10B981"}}>
                    <td colSpan={4} style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#0F2044"}}>TOTAUX</td>
                    <td style={{padding:"8px 6px",fontSize:12,fontWeight:800,color:"#0F2044"}}>{fmtN(totalTantieme)}</td>
                    <td style={{padding:"8px 6px",fontSize:11,fontWeight:700,color:"#10B981"}}>{fmtN(totalCotisation)}</td>
                    <td colSpan={2}/>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
