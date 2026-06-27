import { useState } from "react";
import { fmtN } from "../../utils/formatters.js";
import { Card, SH, SPill, Icon } from "../../components/ui/index.js";

export const TabCotisations = ({isMobile, tots, nbPayes, nbImpayes, pct, dispatch, setRecu}) => {
  const [modeMap, setModeMap] = useState({});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {[{l:"Payés",v:`${nbPayes}/13`,c:"#10B981"},{l:"Impayés",v:`${nbImpayes} lots`,c:"#EF4444"},{l:"Taux",v:`${pct}%`,c:"#3B82F6"}].map((s,i) => (
          <div key={i} style={{flex:1,background:"#fff",borderRadius:10,padding:"12px 10px",border:"1px solid #E2E8F0",textAlign:"center"}}>
            <div style={{fontSize:isMobile?15:17,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:"#94A3B8",marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      <Card style={{padding:isMobile?"12px":"16px"}}>
        <SH title="Validation des Paiements — Mai 2026"/>
        {isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tots.map(l => (
              <div key={l.lot} style={{border:`1px solid ${l.montant>0?"#BBF7D0":"#FECACA"}`,borderRadius:11,padding:"11px 13px",background:l.montant>0?"#F0FDF4":"#FFF5F5"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:"#0F2044"}}>Lot #{l.lot} — {l.appart}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{l.proprio}</div>
                  </div>
                  <SPill paid={l.montant>0}/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{fmtN(l.cotisation)} FCFA</div>
                  <div style={{display:"flex",gap:6}}>
                    <select value={modeMap[l.lot]||"Wave"} onChange={e => setModeMap({...modeMap,[l.lot]:e.target.value})}
                      style={{border:"1px solid #E2E8F0",borderRadius:7,padding:"6px 8px",fontSize:11,outline:"none",background:"#fff",minHeight:34}}>
                      <option>Wave</option><option>OM</option><option>Espèces</option>
                    </select>
                    <button onClick={() => {
                        if(l.montant > 0) { setRecu({...l, montant:l.montant, mode:l.mode}); return; }
                        const mode = modeMap[l.lot] || "Wave";
                        dispatch({type:"VALIDER_PAIEMENT", lot:l.lot, montant:l.cotisation, mode});
                        setRecu({...l, montant:l.cotisation, mode});
                      }}
                      style={{background:l.montant>0?"#F1F5F9":"#0F2044",border:"none",borderRadius:8,padding:"0 14px",fontSize:11,fontWeight:700,color:l.montant>0?"#94A3B8":"#fff",cursor:"pointer",minHeight:34,whiteSpace:"nowrap"}}>
                      {l.montant > 0 ? "Reçu ✓" : "Valider"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Lot","Appartement","Propriétaire","Cotisation","Statut","Mode","Action"].map(h => (
                <th key={h} style={{fontSize:9,color:"#64748B",fontWeight:700,textAlign:"left",padding:"8px 10px",letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tots.map(l => (
                <tr key={l.lot} style={{borderTop:"1px solid #F1F5F9"}}>
                  <td style={{padding:"9px 10px",fontSize:12,fontWeight:800,color:"#10B981"}}>#{l.lot}</td>
                  <td style={{padding:"9px 10px",fontSize:12,color:"#0F2044"}}>{l.appart}</td>
                  <td style={{padding:"9px 10px",fontSize:12,fontWeight:600,color:"#0F2044"}}>{l.proprio}</td>
                  <td style={{padding:"9px 10px",fontSize:12,color:"#0F2044"}}>{fmtN(l.cotisation)}</td>
                  <td style={{padding:"9px 10px"}}><SPill paid={l.montant>0}/></td>
                  <td style={{padding:"9px 10px"}}>
                    <select value={modeMap[l.lot]||"Wave"} onChange={e => setModeMap({...modeMap,[l.lot]:e.target.value})}
                      style={{border:"1px solid #E2E8F0",borderRadius:6,padding:"4px 6px",fontSize:11,outline:"none",background:"#fff"}}>
                      <option>Wave</option><option>OM</option><option>Espèces</option>
                    </select>
                  </td>
                  <td style={{padding:"9px 10px"}}>
                    <button onClick={() => {
                        if(l.montant > 0) { setRecu({...l, montant:l.montant, mode:l.mode}); return; }
                        const mode = modeMap[l.lot] || "Wave";
                        dispatch({type:"VALIDER_PAIEMENT", lot:l.lot, montant:l.cotisation, mode});
                        setRecu({...l, montant:l.cotisation, mode});
                      }}
                      style={{background:l.montant>0?"#F1F5F9":"#0F2044",border:"none",borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:700,color:l.montant>0?"#94A3B8":"#fff",cursor:"pointer"}}>
                      {l.montant > 0 ? "✓ Reçu" : "Valider"}
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
