import { useState } from "react";
import { Card, SH, Input } from "../../components/ui/index.js";

export const TabAnnonces = ({isMobile, state, dispatch}) => {
  const [txt,setTxt]     = useState("");
  const [type,setType]   = useState("info");
  const [titre,setTitre] = useState("");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{padding:isMobile?"13px":"18px"}}>
        <SH title="Publier une Annonce"/>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <Input label="Titre" value={titre} onChange={e=>setTitre(e.target.value)} placeholder="Ex: Coupure d'eau prévue le 20/05"/>
          <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Contenu du message..."
            style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 12px",fontSize:12,color:"#0F2044",outline:"none",resize:"vertical",minHeight:66,fontFamily:"inherit",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {[["info","📢 Information","info"],["alerte","⚠️ Alerte","alerte"],["info","🔧 Travaux","info"]].map((t,i) => (
              <button key={i} onClick={() => setType(t[2])}
                style={{background:type===t[2]?"#E0F2FE":"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:7,padding:"6px 11px",fontSize:11,fontWeight:600,color:"#0F2044",cursor:"pointer"}}>{t[1]}</button>
            ))}
            <button onClick={() => {if(titre && txt) {dispatch({type:"ADD_ANNONCE",data:{titre,message:txt,type}}); setTitre(""); setTxt("");}}}
              style={{marginLeft:"auto",background:"#10B981",border:"none",borderRadius:7,padding:"6px 16px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>Publier</button>
          </div>
        </div>
      </Card>
      <Card style={{padding:isMobile?"13px":"18px"}}>
        <SH title="Historique des Annonces"/>
        {state.annonces.map(a => (
          <div key={a.id} style={{display:"flex",gap:10,padding:"10px 0",borderTop:"1px solid #F8FAFC"}}>
            <div style={{fontSize:14}}>{a.type==="alerte"?"⚠️":"📢"}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:2}}><span style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{a.titre}</span><span style={{fontSize:9,color:"#94A3B8"}}>{a.date}</span></div>
              <p style={{fontSize:11,color:"#64748B",margin:0}}>{a.message}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
