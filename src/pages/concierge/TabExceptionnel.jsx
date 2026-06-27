import { useState, useRef } from "react";
import { fmt, fmtN } from "../../utils/formatters.js";
import { readImage } from "../../utils/imageReader.js";
import { VOTE_OPTIONS } from "../../data/seedData.js";
import { Icon, Card, SH, Input } from "../../components/ui/index.js";

export const TabExceptionnel = ({isMobile, state, dispatch, lots = []}) => {
  const [show,setShow]             = useState(false);
  const [cause,setCause]           = useState("");
  const [impacts,setImpacts]       = useState("");
  const [montantExc,setMontantExc] = useState("");
  const [photo,setPhoto]           = useState(null);
  const fileRef                    = useRef();

  const totalTantieme = lots.reduce((s, l) => s + l.tantieme, 0) || 10000;
  const repartition   = lots.map(l => ({
    ...l,
    part: Math.round((l.tantieme / totalTantieme) * Number(montantExc || 0)),
  }));

  const create = () => {
    if(!cause || !montantExc) return;
    dispatch({type:"CREER_COTISATION_EXC", data:{
      cause, impacts, montant:Number(montantExc), photo,
      repartition: repartition.map(r => ({lot:r.lot, lotId:r.lotId, part:r.part})),
    }});
    setCause(""); setImpacts(""); setMontantExc(""); setPhoto(null); setShow(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
        <div><h2 style={{fontSize:13,fontWeight:700,color:"#0F2044",margin:0}}>Appels de Cotisation Exceptionnels</h2><p style={{fontSize:10,color:"#94A3B8",margin:"2px 0 0"}}>Pour travaux ou dépenses non récurrentes</p></div>
        <button onClick={() => setShow(!show)}
          style={{display:"flex",alignItems:"center",gap:5,background:show?"#F1F5F9":"#EF4444",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:show?"#64748B":"#fff",cursor:"pointer"}}>
          <Icon name="alert" size={13}/>{show?"Annuler":"Nouvel Appel"}
        </button>
      </div>
      {show && (
        <Card style={{padding:isMobile?"13px":"18px",border:"2px solid #FECACA"}}>
          <SH title="Nouvelle Cotisation Exceptionnelle"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Input label="Cause du problème" value={cause} onChange={e=>setCause(e.target.value)} placeholder="Ex: Fissures façade Nord, remplacement pompe"/>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Description des impacts</label>
              <textarea value={impacts} onChange={e=>setImpacts(e.target.value)} placeholder="Décrire les impacts sur l'immeuble et la sécurité des résidents..."
                style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 12px",fontSize:12,color:"#0F2044",outline:"none",resize:"vertical",minHeight:70,fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <Input label="Montant total estimé (FCFA)" value={montantExc} onChange={e=>setMontantExc(e.target.value)} type="number" placeholder="0"/>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:6}}>Photo du problème (optionnel)</label>
              <div style={{display:"flex",gap:9,alignItems:"center"}}>
                <button onClick={() => fileRef.current.click()}
                  style={{display:"flex",alignItems:"center",gap:6,background:"#F8FAFC",border:"1.5px dashed #E2E8F0",borderRadius:9,padding:"9px 14px",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                  <Icon name="camera" size={14}/>Choisir une photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => e.target.files[0] && readImage(e.target.files[0], setPhoto)}/>
                {photo && <span style={{fontSize:10,color:"#10B981",fontWeight:600}}>✓ Photo chargée</span>}
              </div>
              {photo && <img src={photo} alt="preview" style={{marginTop:8,maxHeight:120,borderRadius:8,objectFit:"cover",width:"100%"}}/>}
            </div>
            {Number(montantExc) > 0 && lots.length > 0 && (
              <div style={{background:"#F8FAFC",borderRadius:10,padding:"10px 12px"}}>
                <p style={{fontSize:10,fontWeight:700,color:"#0F2044",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Répartition par lot (tantièmes)</p>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr",gap:5}}>
                  {repartition.map(r => (
                    <div key={r.lot} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 7px",background:"#fff",borderRadius:6}}>
                      <span style={{color:"#64748B"}}>Lot #{r.lot}</span>
                      <span style={{fontWeight:700,color:"#0F2044"}}>{fmtN(r.part)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={create} style={{background:"#EF4444",border:"none",borderRadius:9,padding:"11px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <Icon name="send" size={14}/>Envoyer le vote aux propriétaires
            </button>
          </div>
        </Card>
      )}
      {state.cotisationsExc.length === 0 && !show && (
        <Card style={{padding:"32px 20px"}}>
          <div style={{textAlign:"center",color:"#94A3B8"}}><Icon name="vote" size={32}/><p style={{fontSize:13,marginTop:10}}>Aucun appel exceptionnel en cours</p></div>
        </Card>
      )}
      {state.cotisationsExc.map(c => {
        const nbVotes = Object.keys(c.votes).length;
        const pctVote = lots.length > 0 ? Math.round((nbVotes / lots.length) * 100) : 0;
        return (
          <Card key={c.id} style={{padding:isMobile?"13px":"18px",border:"1px solid #FED7AA"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:"#0F2044"}}>{c.cause}</div>
                <div style={{fontSize:10,color:"#94A3B8"}}>Créé le {c.dateCreation} · {fmt(c.montant)}</div>
              </div>
              <span style={{fontSize:9,background:c.statut==="vote"?"#FEF3C7":"#F0FDF4",color:c.statut==="vote"?"#92400E":"#059669",padding:"3px 8px",borderRadius:20,fontWeight:700}}>
                {c.statut === "vote" ? "VOTE EN COURS" : "CLOS"}
              </span>
            </div>
            {c.photo && <img src={c.photo} alt="" style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:8,marginBottom:10}}/>}
            {c.impacts && <p style={{fontSize:11,color:"#64748B",marginBottom:10}}>{c.impacts}</p>}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:10,color:"#64748B"}}>Participation au vote</span>
                <span style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>{nbVotes}/{lots.length} lots</span>
              </div>
              <div style={{background:"#F1F5F9",borderRadius:99,height:6,overflow:"hidden"}}>
                <div style={{width:`${pctVote}%`,background:"#F59E0B",borderRadius:99,height:"100%"}}/>
              </div>
            </div>
            {Object.keys(c.votes).length > 0 && (
              <div style={{background:"#FFFBEB",borderRadius:9,padding:"8px 10px",marginBottom:10}}>
                <p style={{fontSize:9,fontWeight:700,color:"#92400E",marginBottom:5,textTransform:"uppercase"}}>Résultats du vote</p>
                {Object.entries(c.votes).map(([lot, dateVote]) => {
                  const opt = VOTE_OPTIONS.find(o => o.id === dateVote) || {label:dateVote};
                  const l   = lots.find(x => x.lot === Number(lot));
                  return <div key={lot} style={{fontSize:11,color:"#0F2044",marginBottom:2}}><b>{l?.proprio || `Lot #${lot}`}</b> → {opt.label}</div>;
                })}
              </div>
            )}
            {c.statut === "vote" && (
              <button onClick={() => dispatch({type:"CLORE_VOTE",id:c.id})}
                style={{background:"#0F2044",border:"none",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                Clore le vote
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
};
