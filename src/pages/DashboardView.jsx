import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fmt, fmtN, fmtS } from "../utils/formatters.js";
import { getStats } from "../utils/statsHelpers.js";
import { monthlyData } from "../data/lotsData.js";
import { useApp } from "../contexts/AppContext.jsx";
import { Icon, KpiCard, Card, SH, MB, CTip } from "../components/ui/index.js";

export const DashboardView = ({isMobile, solde, paiements, depenses, annonces, dispatch, currentUser}) => {
  const {lots} = useApp();
  const isProprietaire = currentUser?.role === "proprietaire";
  const {totalAttendu, totalRecu, valImpayes, nbImpayes, nbPayes, pct} = getStats(paiements, lots);
  const totalDepRegle = depenses.filter(d => d.statut === "regle").reduce((s, d) => s + d.montant, 0);
  const derniersPmt = paiements.filter(p => p.montant > 0).slice(-5).reverse().map(p => { const l = lots.find(x => x.lot === p.lot); return {...p, ...l}; });
  const dernieresD = depenses.filter(d => d.statut === "regle").slice(-5).reverse();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isMobile?14:22}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <KpiCard label="Solde en Caisse"  value={isMobile?fmtS(solde)+" F":fmt(solde)}                  sub="Trésorerie disponible"       icon="wallet"   accent="#10B981" trend={-37} compact={isMobile}/>
        <KpiCard label="Recouvrement Mai" value={`${pct}%`}                                               sub={`${fmtN(totalRecu)} reçus`}  icon="percent"  accent="#3B82F6" trend={-8}  compact={isMobile}/>
        <KpiCard label="Dépenses Mai"     value={isMobile?fmtS(totalDepRegle)+" F":fmt(totalDepRegle)}  sub="Charges réglées ce mois"     icon="trending" accent="#EF4444" trend={24}  compact={isMobile}/>
      </div>
      <Card style={{padding:isMobile?"14px 10px":"20px 18px"}}>
        <SH title="Évolution Financière" subtitle="Recettes vs Dépenses — Fév à Mai 2026"
          action={<span style={{fontSize:10,color:"#10B981",fontWeight:700,background:"#ECFDF5",padding:"2px 8px",borderRadius:20}}>4 mois</span>}/>
        <ResponsiveContainer width="100%" height={isMobile?165:215}>
          <AreaChart data={monthlyData} margin={{top:4,right:4,left:-14,bottom:0}}>
            <defs>
              <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.18}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
              <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0F2044" stopOpacity={0.14}/><stop offset="95%" stopColor="#0F2044" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
            <XAxis dataKey="mois" tick={{fontSize:11,fill:"#94A3B8",fontWeight:600}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={fmtS} tick={{fontSize:10,fill:"#94A3B8"}} axisLine={false} tickLine={false} width={34}/>
            <Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
            <Area type="monotone" dataKey="recettes" name="Recettes" stroke="#10B981" strokeWidth={2.5} fill="url(#gR)" dot={{r:3,fill:"#10B981",strokeWidth:0}} activeDot={{r:5}}/>
            <Area type="monotone" dataKey="depenses" name="Dépenses" stroke="#0F2044" strokeWidth={2.5} fill="url(#gD)" dot={{r:3,fill:"#0F2044",strokeWidth:0}} activeDot={{r:5}}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":isProprietaire?"1fr":"1fr 1fr",gap:isMobile?12:14}}>
        {!isProprietaire && (
          <Card style={{padding:isMobile?"13px":"18px"}}>
            <SH title="Derniers Paiements" subtitle="Cotisations récentes reçues"/>
            {derniersPmt.length === 0 && <p style={{fontSize:12,color:"#94A3B8",textAlign:"center",padding:"16px 0"}}>Aucun paiement encore validé</p>}
            {derniersPmt.map((p,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:i>0?"1px solid #F8FAFC":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#4F46E5",flexShrink:0}}>{(p.proprio||"?")[0]}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{p.proprio}</div><div style={{fontSize:9,color:"#94A3B8"}}>{p.appart}</div></div>
                </div>
                <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>{fmtN(p.montant)}</div><MB mode={p.mode}/></div>
              </div>
            ))}
          </Card>
        )}
        <Card style={{padding:isMobile?"13px":"18px"}}>
          <SH title="Dernières Dépenses" subtitle="Sorties récentes réglées"/>
          {dernieresD.length === 0 && <p style={{fontSize:12,color:"#94A3B8",textAlign:"center",padding:"16px 0"}}>Aucune dépense réglée</p>}
          {dernieresD.map((d,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:i>0?"1px solid #F8FAFC":"none"}}>
              <div><div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{d.label}</div><div style={{fontSize:9,color:"#94A3B8"}}>{d.date} · <span style={{color:d.cat==="fixe"?"#3B82F6":"#A855F7",fontWeight:600}}>{d.cat}</span></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:"#EF4444"}}>−{fmtN(d.montant)}</div><MB mode={d.mode}/></div>
            </div>
          ))}
        </Card>
      </div>
      <Card style={{padding:isMobile?"13px":"18px"}}>
        <SH title="Vie de l'Immeuble" subtitle="Dernières annonces"
          action={<button onClick={() => dispatch({type:"ADD_ANNONCE",data:{titre:"Annonce",message:"Nouvelle annonce publiée.",type:"info"}})} style={{display:"flex",alignItems:"center",gap:4,background:"#0F2044",border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:600,color:"#fff",cursor:"pointer",minHeight:30}}><Icon name="plus" size={12}/>Publier</button>}/>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {annonces.filter(a => a.public).slice(0,3).map((a,i) => (
            <div key={i} style={{display:"flex",gap:10,padding:"10px 12px",borderRadius:9,background:a.type==="alerte"?"#FFF7ED":"#F8FAFC",border:`1px solid ${a.type==="alerte"?"#FED7AA":"#E2E8F0"}`}}>
              <div style={{fontSize:14}}>{a.type==="alerte"?"⚠️":"📢"}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:2}}><span style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>{a.titre}</span><span style={{fontSize:9,color:"#94A3B8",whiteSpace:"nowrap"}}>{a.date}</span></div>
                <p style={{fontSize:11,color:"#64748B",margin:0,lineHeight:1.5}}>{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
