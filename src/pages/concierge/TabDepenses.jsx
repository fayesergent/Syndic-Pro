import { useState } from "react";
import { fmt, fmtN, today5 } from "../../utils/formatters.js";
import { Icon, Card, SH, Input, MB } from "../../components/ui/index.js";

export const TabDepenses = ({isMobile, state, dispatch}) => {
  const [label,setLabel]   = useState("");
  const [montant,setMontant] = useState("");
  const [cat,setCat]       = useState("fixe");
  const [modeD,setModeD]   = useState("Wave");
  const [statut,setStatut] = useState("regle");
  const [pid,setPid]       = useState("");
  const [modeVal,setModeVal] = useState({});

  const totalRegle   = state.depenses.filter(d => d.statut === "regle").reduce((s,d) => s + d.montant, 0);
  const totalPending = state.depenses.filter(d => d.statut === "pending").reduce((s,d) => s + d.montant, 0);

  const add = () => {
    if(!label || !montant) return;
    dispatch({type:"AJOUTER_DEPENSE", data:{label, montant:Number(montant), mode:statut==="regle"?modeD:"-", date:statut==="regle"?today5():"-", cat, statut, pid:pid?Number(pid):null}});
    setLabel(""); setMontant("");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {[{l:"Réglées",v:fmt(totalRegle),c:"#0F2044"},{l:"En attente",v:fmt(totalPending),c:"#D97706"},{l:"Total",v:fmt(totalRegle+totalPending),c:"#64748B"}].map((s,i) => (
          <div key={i} style={{flex:1,background:"#fff",borderRadius:10,padding:"10px 8px",border:"1px solid #E2E8F0",textAlign:"center"}}>
            <div style={{fontSize:isMobile?10:11,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:8,color:"#94A3B8",marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      <Card style={{padding:isMobile?"13px":"18px",border:"1px solid #E0F2FE"}}>
        <SH title="Saisir une Dépense" subtitle="Nouvelle charge à enregistrer"/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:10}}>
          <Input label="Libellé" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Facture SENELEC"/>
          <Input label="Montant (FCFA)" value={montant} onChange={e => setMontant(e.target.value)} type="number" placeholder="0"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {label:"Catégorie",           value:cat,    onChange:e=>setCat(e.target.value),    options:["fixe","variable","exceptionnel"]},
            {label:"Statut",              value:statut, onChange:e=>setStatut(e.target.value), options:["regle","pending"]},
            {label:"Mode de paiement",    value:modeD,  onChange:e=>setModeD(e.target.value),  options:["Wave","OM","Espèces","Chèque"]},
            {label:"Prestataire (optionnel)", value:pid, onChange:e=>setPid(e.target.value),    options:["", ...state.prestataires.map(p=>p.id)], labels:["— Aucun —", ...state.prestataires.map(p=>p.nom)]},
          ].map((s,i) => (
            <div key={i}>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>{s.label}</label>
              <select value={s.value} onChange={s.onChange} style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",background:"#F8FAFC",fontFamily:"inherit"}}>
                {(s.labels||s.options).map((o,j) => <option key={j} value={s.options[j]}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={add} style={{background:"#0F2044",border:"none",borderRadius:9,padding:"10px 20px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          <Icon name="plus" size={14}/>{statut==="regle"?"Enregistrer (réglée — solde débité)":"Enregistrer (en attente)"}
        </button>
      </Card>
      <Card style={{padding:isMobile?"12px":"16px"}}>
        <SH title="Dépenses — Mai 2026" subtitle={`${state.depenses.length} lignes enregistrées`}/>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {state.depenses.map(d => (
            <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 10px",borderRadius:9,background:d.statut==="regle"?"#F8FAFC":"#FFFBEB",border:`1px solid ${d.statut==="regle"?"#E2E8F0":"#FDE68A"}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{d.label}</div>
                <div style={{fontSize:9,color:"#94A3B8",marginTop:1}}>
                  {d.statut==="regle"?`✓ Réglé le ${d.date} · ${d.mode}`:"⚠️ En attente de paiement"} · <span style={{color:d.cat==="fixe"?"#3B82F6":d.cat==="variable"?"#A855F7":"#F59E0B",fontWeight:600}}>{d.cat}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:800,color:d.statut==="regle"?"#0F2044":"#D97706"}}>{fmtN(d.montant)}</div>
                </div>
                {d.statut === "pending" && (
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    <select value={modeVal[d.id]||"Wave"} onChange={e => setModeVal({...modeVal,[d.id]:e.target.value})}
                      style={{border:"1px solid #E2E8F0",borderRadius:6,padding:"4px 6px",fontSize:10,outline:"none",background:"#fff"}}>
                      <option>Wave</option><option>OM</option><option>Espèces</option><option>Chèque</option>
                    </select>
                    <button onClick={() => dispatch({type:"VALIDER_DEPENSE", id:d.id, mode:modeVal[d.id]||"Wave"})}
                      style={{background:"#10B981",border:"none",borderRadius:6,padding:"5px 9px",fontSize:10,fontWeight:700,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Payer</button>
                  </div>
                )}
                <button onClick={() => dispatch({type:"SUPPRIMER_DEPENSE", id:d.id})}
                  style={{background:"#FEF2F2",border:"none",borderRadius:6,padding:5,color:"#EF4444",cursor:"pointer",display:"flex"}}><Icon name="trash" size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
