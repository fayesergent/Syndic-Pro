import { useState } from "react";
import { Icon, Card, SH } from "../../components/ui/index.js";

export const TabSignalements = ({isMobile, state, dispatch, lots = []}) => {
  const [reponses,setReponses] = useState({});
  const prive = state.signalements.filter(s => s.statut === "prive");
  const publi = state.signalements.filter(s => s.statut === "public");

  const findLot = lot => lots.find(x => x.lot === lot);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {prive.length > 0 && (
        <Card style={{padding:isMobile?"13px":"18px",border:"1px solid #FED7AA"}}>
          <SH title={`🔒 Signalements Privés (${prive.length})`} subtitle="Visibles uniquement par vous"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {prive.map(s => {
              const l = findLot(s.lot);
              return (
                <div key={s.id} style={{background:"#FFFBEB",borderRadius:10,padding:"12px 14px",border:"1px solid #FDE68A"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{s.proprio} — Lot #{s.lot} · {l?.appart}</div>
                      <div style={{fontSize:9,color:"#94A3B8"}}>Signalé le {s.dateCreation}</div>
                    </div>
                  </div>
                  <p style={{fontSize:12,color:"#64748B",marginBottom:s.photo?8:10}}>{s.description}</p>
                  {s.photo && <img src={s.photo} alt="" style={{width:"100%",maxHeight:120,objectFit:"cover",borderRadius:8,marginBottom:10}}/>}
                  {s.reponse && <div style={{background:"#EFF6FF",borderRadius:8,padding:"7px 10px",fontSize:11,color:"#1D4ED8",marginBottom:8}}>↩️ Réponse envoyée : {s.reponse}</div>}
                  <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                    <button onClick={() => dispatch({type:"RENDRE_PUBLIC",id:s.id})}
                      style={{display:"flex",alignItems:"center",gap:5,background:"#10B981",border:"none",borderRadius:7,padding:"6px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                      <Icon name="eye" size={12}/>Rendre public
                    </button>
                    {!s.reponse && (
                      <div style={{display:"flex",gap:5,flex:1}}>
                        <input placeholder="Votre réponse privée au propriétaire..." value={reponses[s.id]||""} onChange={e => setReponses({...reponses,[s.id]:e.target.value})}
                          style={{flex:1,border:"1.5px solid #E2E8F0",borderRadius:7,padding:"6px 10px",fontSize:11,outline:"none",fontFamily:"inherit",minWidth:0}}/>
                        <button onClick={() => {if(reponses[s.id]) dispatch({type:"REPONDRE_SIG",id:s.id,reponse:reponses[s.id]});}}
                          style={{background:"#0F2044",border:"none",borderRadius:7,padding:"6px 10px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                          <Icon name="send" size={11}/>Envoyer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      {publi.length > 0 && (
        <Card style={{padding:isMobile?"13px":"18px"}}>
          <SH title={`📢 Signalements Publics (${publi.length})`} subtitle="Visibles par tous les propriétaires"/>
          {publi.map(s => {
            const l = findLot(s.lot);
            return (
              <div key={s.id} style={{background:"#F8FAFC",borderRadius:9,padding:"11px 13px",border:"1px solid #E2E8F0",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0F2044",marginBottom:3}}>Lot #{s.lot} · {l?.appart} — {s.dateCreation}</div>
                <p style={{fontSize:11,color:"#64748B",margin:0}}>{s.description}</p>
                {s.photo && <img src={s.photo} alt="" style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:7,marginTop:7}}/>}
              </div>
            );
          })}
        </Card>
      )}
      {state.signalements.length === 0 && (
        <Card style={{padding:"32px 20px"}}>
          <div style={{textAlign:"center",color:"#94A3B8"}}><Icon name="flag" size={32}/><p style={{fontSize:13,marginTop:10}}>Aucun signalement reçu</p></div>
        </Card>
      )}
    </div>
  );
};
