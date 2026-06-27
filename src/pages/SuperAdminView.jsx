import { useState } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmt, fmtN, fmtS } from "../utils/formatters.js";
import { getStats } from "../utils/statsHelpers.js";
import { useApp } from "../contexts/AppContext.jsx";
import { Card, SH, Input, CTip } from "../components/ui/index.js";

export const SuperAdminView = ({isMobile, state, dispatch}) => {
  const {lots, selectedImmeuble} = useApp();
  const [draft,setDraft]   = useState(0);
  const [saved,setSaved]   = useState(false);
  const {totalAttendu}     = getStats(state.paiements, lots);
  const totalTantieme      = lots.reduce((s, l) => s + l.tantieme, 0) || 10000;
  const immeubleNom        = selectedImmeuble?.nom || "Immeuble";
  const totalDepRegle      = state.depenses.filter(d => d.statut === "regle").reduce((s,d) => s + d.montant, 0);
  const chargesData = [
    {name:"Gardiennage", prevu:210000, reel:210000},
    {name:"Nettoyage",   prevu:70000,  reel:70000},
    {name:"Ascenseur",   prevu:60000,  reel:60000},
    {name:"Woyofal",     prevu:100000, reel:100000},
    {name:"Sen'Eau",     prevu:60000,  reel:119476},
  ];
  const ops      = ["wave","om","free"];
  const opLabels = {wave:"Wave Money", om:"Orange Money", free:"Free Money"};
  const opColors = {wave:"#1D4ED8", om:"#C2410C", free:"#059669"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isMobile?14:20}}>
      <Card style={{padding:isMobile?"14px":"22px"}}>
        <SH title="Paramètres Financiers" subtitle={`Super Admin — ${immeubleNom}`}/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
          <div style={{background:"#F8FAFC",borderRadius:11,padding:14}}>
            <label style={{fontSize:9,fontWeight:700,color:"#64748B",letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:9}}>Frais de Service Mensuel</label>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <input type="number" value={draft} onChange={e => {setDraft(Number(e.target.value)); setSaved(false);}}
                style={{flex:1,border:"2px solid #10B981",borderRadius:7,padding:"9px 11px",fontSize:14,fontWeight:700,color:"#0F2044",outline:"none",fontFamily:"inherit"}}/>
              <span style={{fontSize:11,color:"#64748B",fontWeight:600}}>FCFA</span>
            </div>
            <button onClick={() => setSaved(true)} style={{marginTop:9,background:"#0F2044",border:"none",borderRadius:7,padding:"8px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
              {saved ? "✓ Enregistré" : "Enregistrer"}
            </button>
          </div>
          <div style={{background:"#F8FAFC",borderRadius:11,padding:14}}>
            <label style={{fontSize:9,fontWeight:700,color:"#64748B",letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:9}}>Infos Résidence</label>
            {[["Nom","Résidence Hélène"],["Référence TF","8.323/GR Grand Dakar"],["Lots","13 appartements"],["Tantièmes","10 000"],["Budget annuel","7 498 000 FCFA"]].map(([k,v]) => (
              <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11}}><span style={{color:"#94A3B8"}}>{k}</span><span style={{color:"#0F2044",fontWeight:600}}>{v}</span></div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{padding:isMobile?"14px":"22px"}}>
        <SH title="💳 Comptes Marchands" subtitle="Numéros pour encaissement et paiements via mobile money"/>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr",gap:12}}>
          {ops.map(op => {
            const cm = state.comptesMarchands[op];
            return (
              <div key={op} style={{background:"#F8FAFC",borderRadius:11,padding:14,border:`1px solid ${cm.actif?"#BBF7D0":"#E2E8F0"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:opColors[op]}}>{opLabels[op]}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}} onClick={() => dispatch({type:"UPD_MARCHANDS",op,data:{...cm,actif:!cm.actif}})}>
                    <div style={{width:28,height:16,borderRadius:99,background:cm.actif?"#10B981":"#E2E8F0",position:"relative",transition:"background 0.2s"}}>
                      <div style={{position:"absolute",top:2,left:cm.actif?12:2,width:12,height:12,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                    </div>
                    <span style={{fontSize:9,color:cm.actif?"#10B981":"#94A3B8",fontWeight:700}}>{cm.actif?"ACTIF":"INACTIF"}</span>
                  </div>
                </div>
                <Input label="Numéro de compte" value={cm.numero} onChange={e => dispatch({type:"UPD_MARCHANDS",op,data:{...cm,numero:e.target.value}})} placeholder="7XXXXXXXX"/>
                <div style={{marginTop:7}}>
                  <Input label={op==="om"?"Business ID":"Till ID / Identifiant"} value={op==="om"?cm.businessId||"":cm.tillId||""} onChange={e => dispatch({type:"UPD_MARCHANDS",op,data:{...cm,[op==="om"?"businessId":"tillId"]:e.target.value}})} placeholder="ID marchand"/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:"#EFF6FF",borderRadius:9,padding:"9px 12px",marginTop:12}}>
          <p style={{fontSize:10,color:"#1D4ED8",margin:0,fontWeight:500}}>ℹ️ Ces numéros seront utilisés automatiquement dans les flux de paiements entrants (cotisations) et sortants (prestataires). Intégration API Wave/OM requise en production.</p>
        </div>
      </Card>

      <Card style={{padding:isMobile?"12px 10px":"18px"}}>
        <SH title="Prévisionnel vs Réel — Mai 2026" subtitle="Analyse par poste de charge"/>
        <ResponsiveContainer width="100%" height={isMobile?160:200}>
          <BarChart data={chargesData} margin={{top:4,right:4,left:-14,bottom:0}} barSize={isMobile?13:17}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmtS} tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false} width={34}/>
            <Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
            <Bar dataKey="prevu" name="Prévisionnel" fill="#D1D5DB" radius={[4,4,0,0]}/>
            <Bar dataKey="reel" name="Réel" radius={[4,4,0,0]}>
              {chargesData.map((e,i) => <Cell key={i} fill={e.reel > e.prevu ? "#EF4444" : "#10B981"}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{padding:isMobile?"12px":"18px"}}>
        <SH title="Répartition des Tantièmes" subtitle="Grille de cotisation — 13 lots"/>
        {isMobile ? (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {lots.map(l => (
              <div key={l.lot} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"#F8FAFC",borderRadius:8}}>
                <div><div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}><span style={{color:"#10B981"}}>#{l.lot}</span> · {l.proprio}</div><div style={{fontSize:9,color:"#94A3B8"}}>{l.appart} · {l.tantieme} tantièmes</div></div>
                <div style={{fontSize:12,fontWeight:800,color:"#0F2044"}}>{fmtN(l.cotisation)}</div>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"#F0FDF4",borderRadius:8,border:"1px solid #10B981"}}>
              <span style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>TOTAL</span>
              <span style={{fontSize:12,fontWeight:800,color:"#10B981"}}>{fmtN(totalAttendu)} FCFA</span>
            </div>
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#F8FAFC"}}>
              {["Lot","Appartement","Propriétaire","Étage","Tantièmes","Quote-part","Cotisation"].map(h => (
                <th key={h} style={{fontSize:9,color:"#64748B",fontWeight:700,textAlign:"left",padding:"7px 10px",letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {lots.map(l => (
                <tr key={l.lot} style={{borderTop:"1px solid #F1F5F9"}}>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:800,color:"#10B981"}}>#{l.lot}</td>
                  <td style={{padding:"8px 10px",fontSize:12,color:"#0F2044"}}>{l.appart}</td>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:"#0F2044"}}>{l.proprio}</td>
                  <td style={{padding:"8px 10px",fontSize:11,color:"#64748B"}}>{l.etage}</td>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:600}}>{l.tantieme}</td>
                  <td style={{padding:"8px 10px",fontSize:11,color:"#64748B"}}>{((l.tantieme/totalTantieme)*100).toFixed(1)}%</td>
                  <td style={{padding:"8px 10px",fontSize:12,fontWeight:700,color:"#0F2044"}}>{fmtN(l.cotisation)} FCFA</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr style={{background:"#F0FDF4",borderTop:"2px solid #10B981"}}>
              <td colSpan={4} style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#0F2044"}}>TOTAL</td>
              <td style={{padding:"8px 10px",fontSize:11,fontWeight:700}}>10 000</td>
              <td style={{padding:"8px 10px",fontSize:11,fontWeight:700}}>100%</td>
              <td style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#10B981"}}>{fmtN(totalAttendu)} FCFA</td>
            </tr></tfoot>
          </table>
        )}
      </Card>
    </div>
  );
};
