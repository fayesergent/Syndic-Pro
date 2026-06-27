import { fmt, today5 } from "../utils/formatters.js";

export const ModalRecu = ({p, onClose, isMobile}) => {
  if(!p) return null;
  const ref = `RH-${Date.now().toString().slice(-6)}`;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,32,68,0.65)",zIndex:200,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:isMobile?"20px 20px 0 0":18,padding:isMobile?"22px 18px 30px":28,width:isMobile?"100%":340,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        {isMobile && <div style={{width:32,height:3,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px"}}/>}
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"#ECFDF5",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",color:"#10B981",fontSize:18}}>✓</div>
          <h3 style={{fontSize:15,fontWeight:800,color:"#0F2044",margin:0}}>Reçu de Paiement</h3>
          <p style={{fontSize:10,color:"#94A3B8",marginTop:2}}>Résidence Hélène 2026</p>
        </div>
        <div style={{background:"#F8FAFC",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
          {[["Référence",ref],["Propriétaire",p.proprio],["Appartement",p.appart],["Montant",fmt(p.montant)],["Mode",p.mode],["Date",today5()+"/26"]].map(([k,v]) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
              <span style={{color:"#94A3B8"}}>{k}</span>
              <span style={{color:"#0F2044",fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:"#0F2044",borderRadius:9,padding:"9px 12px",textAlign:"center",marginBottom:12}}>
          <p style={{color:"#10B981",fontSize:9,fontWeight:700,margin:0,letterSpacing:"0.05em"}}>MESSAGE WHATSAPP PRÊT</p>
          <p style={{color:"#CBD5E1",fontSize:9,margin:"4px 0 0",lineHeight:1.5}}>✅ Reçu #{ref} — {p.proprio} — Lot {p.lot} — {fmt(p.montant)} — {p.mode} — {today5()}/26 — Rés. Hélène</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>Fermer</button>
          <button style={{flex:2,background:"#10B981",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>📤 Partager</button>
        </div>
      </div>
    </div>
  );
};
