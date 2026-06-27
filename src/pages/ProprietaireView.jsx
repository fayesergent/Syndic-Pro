import { useState, useRef } from "react";
import { fmt, fmtN } from "../utils/formatters.js";
import { readImage } from "../utils/imageReader.js";
import { getStats } from "../utils/statsHelpers.js";
import { useApp } from "../contexts/AppContext.jsx";
import { VOTE_OPTIONS } from "../data/seedData.js";
import { Icon, Card, SH, CTab, MB } from "../components/ui/index.js";

export const ProprietaireView = ({isMobile, state, dispatch, defaultLot, currentUser=null}) => {
  const {lots} = useApp();
  const isRestricted   = currentUser?.role === "proprietaire";
  const firstLot       = lots[0]?.lot ?? 1;
  const [selectedLot,setSelectedLot] = useState(defaultLot ?? firstLot);
  const lot = lots.find(l => l.lot === selectedLot) || lots[0];
  const pmt = state.paiements.find(p => p.lot === (lot?.lot||1)) || {montant:0, mode:"-"};
  const {totalAttendu, totalRecu, impayes, valImpayes, nbImpayes, nbPayes, pct} = getStats(state.paiements, lots);
  const totalTantieme  = lots.reduce((s, l) => s + l.tantieme, 0) || 10000;

  if(!lot) return <div style={{padding:20,color:"#94A3B8",textAlign:"center"}}>Chargement...</div>;

  const historique = [
    {mois:"Fév", montant:lot.cotisation, statut:true,            mode:"Wave"},
    {mois:"Mar", montant:lot.cotisation, statut:true,            mode:"OM"},
    {mois:"Avr", montant:lot.cotisation, statut:true,            mode:"Wave"},
    {mois:"Mai", montant:pmt.montant>0?pmt.montant:lot.cotisation, statut:pmt.montant>0, mode:pmt.mode},
  ];
  const totalPaye       = historique.filter(h => h.statut).reduce((s,h) => s + h.montant, 0);
  const totalAttenduIndiv = lot.cotisation * 4;
  const pctIndiv        = Math.round((totalPaye / totalAttenduIndiv) * 100);
  const pctColor        = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";

  const [showSig,setShowSig]     = useState(false);
  const [sigDesc,setSigDesc]     = useState("");
  const [sigPhoto,setSigPhoto]   = useState(null);
  const sigFileRef               = useRef();
  const sendSig = () => {
    if(!sigDesc) return;
    dispatch({type:"ADD_SIGNALEMENT", data:{lot:lot.lot, proprio:lot.proprio, appart:lot.appart, description:sigDesc, photo:sigPhoto}});
    setSigDesc(""); setSigPhoto(null); setShowSig(false);
  };

  const [votes,setVotes]         = useState({});
  const [voteAutres,setVoteAutres] = useState({});
  const mySignalements   = isRestricted ? state.signalements.filter(s => s.lot === selectedLot) : [];
  const cotExcActives    = state.cotisationsExc.filter(c => c.statut === "vote");
  const publiSignalements = state.signalements.filter(s => s.statut === "public");

  const [propTab,setPropTab] = useState("accueil");
  const propTabs = [
    {id:"accueil",      label:"Accueil",      icon:"proprio"},
    {id:"repartition",  label:"Répartition",  icon:"percent"},
    {id:"signalements", label:"Signalements", icon:"flag"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:isMobile?14:20}}>
      {showSig && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,32,68,0.65)",zIndex:200,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:isMobile?"20px 20px 0 0":18,padding:isMobile?"22px 18px 28px":28,width:isMobile?"100%":400,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            {isMobile && <div style={{width:32,height:3,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px"}}/>}
            <h3 style={{fontSize:15,fontWeight:800,color:"#0F2044",marginBottom:4}}>📸 Signaler un Problème</h3>
            <p style={{fontSize:11,color:"#94A3B8",marginBottom:14}}>Lot #{lot.lot} · {lot.appart} — visible uniquement par le concierge</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <textarea value={sigDesc} onChange={e=>setSigDesc(e.target.value)} placeholder="Décrivez le problème constaté (panne, dégradation, nuisance...)..."
                style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 12px",fontSize:12,color:"#0F2044",outline:"none",resize:"vertical",minHeight:80,fontFamily:"inherit",boxSizing:"border-box"}}/>
              <div>
                <button onClick={() => sigFileRef.current.click()}
                  style={{display:"flex",alignItems:"center",gap:6,background:"#F8FAFC",border:"1.5px dashed #E2E8F0",borderRadius:9,padding:"9px 14px",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                  <Icon name="camera" size={14}/>Joindre une photo
                </button>
                <input ref={sigFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => e.target.files[0] && readImage(e.target.files[0], setSigPhoto)}/>
                {sigPhoto && <img src={sigPhoto} alt="" style={{marginTop:8,maxHeight:100,borderRadius:8,objectFit:"cover",width:"100%"}}/>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={() => {setShowSig(false); setSigDesc(""); setSigPhoto(null);}} style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>Annuler</button>
                <button onClick={sendSig} style={{flex:2,background:"#0F2044",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>Envoyer au concierge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isRestricted ? (
        <Card style={{padding:isMobile?"12px":"18px"}}>
          <SH title="Sélecteur de Lot" subtitle="Navigation (Admin / Concierge)"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {lots.map(l => (
              <button key={l.lot} onClick={() => setSelectedLot(l.lot)}
                style={{background:selectedLot===l.lot?"#0F2044":"#F8FAFC",border:`1px solid ${selectedLot===l.lot?"#0F2044":"#E2E8F0"}`,borderRadius:7,padding:isMobile?"6px 9px":"6px 11px",fontSize:isMobile?10:11,fontWeight:600,color:selectedLot===l.lot?"#fff":"#64748B",cursor:"pointer",whiteSpace:"nowrap",minHeight:30}}>
                #{l.lot} {l.proprio.split(" ")[0]}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card style={{padding:isMobile?"12px":"18px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <h2 style={{fontSize:14,fontWeight:800,color:"#0F2044",margin:0}}>Mon Appartement</h2>
              <p style={{fontSize:11,color:"#94A3B8",margin:"3px 0 0"}}>Lot #{lot.lot} · {lot.appart} · {lot.etage}</p>
            </div>
            <div style={{display:"flex",gap:9,alignItems:"center"}}>
              <div style={{background:"#ECFDF5",borderRadius:10,padding:"8px 12px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:800,color:"#10B981"}}>{lot.tantieme}</div>
                <div style={{fontSize:9,color:"#059669",fontWeight:600}}>tantièmes · {((lot.tantieme/10000)*100).toFixed(1)}%</div>
              </div>
              <button onClick={() => {setPropTab("signalements"); setShowSig(true);}}
                style={{display:"flex",alignItems:"center",gap:5,background:"#EF4444",border:"none",borderRadius:9,padding:"8px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                <Icon name="flag" size={13}/>Signaler
              </button>
            </div>
          </div>
        </Card>
      )}

      <CTab tabs={propTabs} active={propTab} onChange={setPropTab} isMobile={isMobile}/>

      {propTab === "accueil" && (<>
        <Card style={{padding:isMobile?"13px":"18px"}}>
          <SH title="📢 Annonces de l'Immeuble" subtitle="Dernières communications du syndic"/>
          {state.annonces.filter(a => a.public).length === 0 && <p style={{fontSize:11,color:"#94A3B8",textAlign:"center",padding:"12px 0"}}>Aucune annonce</p>}
          {state.annonces.filter(a => a.public).slice(0,4).map((a,i) => (
            <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderTop:i>0?"1px solid #F8FAFC":"none"}}>
              <div style={{fontSize:15,flexShrink:0}}>{a.type==="alerte"?"⚠️":"📢"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{a.titre}</span>
                  <span style={{fontSize:9,color:"#94A3B8",whiteSpace:"nowrap"}}>{a.date}</span>
                </div>
                <p style={{fontSize:11,color:"#64748B",margin:0,lineHeight:1.5}}>{a.message}</p>
              </div>
            </div>
          ))}
        </Card>

        <div style={{background:"#0F2044",borderRadius:14,padding:isMobile?"16px 14px":"22px 20px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"#10B98115",pointerEvents:"none"}}/>
          <div style={{position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><h2 style={{fontSize:isMobile?13:14,fontWeight:700,color:"#fff",margin:0}}>Recouvrement Immeuble</h2><p style={{fontSize:10,color:"#4A6480",margin:"2px 0 0"}}>Cotisations Mai 2026 — 13 lots</p></div>
              <span style={{fontSize:10,background:"#10B98125",color:"#10B981",fontWeight:700,padding:"3px 9px",borderRadius:20,border:"1px solid #10B98140"}}>{pct}% collecté</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:isMobile?8:10,marginBottom:14}}>
              {[{label:"Attendu",value:isMobile?fmtN(totalAttendu):fmtN(totalAttendu),sub:`${lots.length} lots`,color:"#94A3B8"},
                {label:"Reçu",   value:isMobile?fmtN(totalRecu):fmtN(totalRecu),      sub:`${nbPayes} payés`,     color:"#10B981"},
                {label:"Impayés",value:isMobile?fmtN(valImpayes):fmtN(valImpayes),    sub:`${nbImpayes} lots`,    color:"#EF4444"},
              ].map((m,i) => (
                <div key={i} style={{background:"#1E3A5F",borderRadius:9,padding:isMobile?"9px 8px":"11px 13px"}}>
                  <div style={{fontSize:isMobile?11:13,fontWeight:800,color:m.color,lineHeight:1.2,marginBottom:2}}>{m.value}</div>
                  <div style={{fontSize:9,color:"#64748B",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{m.label}</div>
                  <div style={{fontSize:9,color:"#3D5A80",marginTop:1}}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:"#64748B"}}>Taux de recouvrement</span><span style={{fontSize:11,fontWeight:800,color:pctColor}}>{pct}%</span></div>
              <div style={{background:"#1E3A5F",borderRadius:99,height:9,overflow:"hidden"}}><div style={{width:`${pct}%`,background:pctColor,borderRadius:99,height:"100%",transition:"width 0.8s"}}/></div>
            </div>
            <div style={{display:"flex",gap:7,marginTop:11,flexWrap:"wrap"}}>
              <div style={{background:"#10B98120",borderRadius:7,padding:"4px 9px",fontSize:9,color:"#10B981",fontWeight:700,border:"1px solid #10B98130"}}>✓ {nbPayes} lots payés</div>
              {nbImpayes > 0 && <div style={{background:"#EF444420",borderRadius:7,padding:"4px 9px",fontSize:9,color:"#EF4444",fontWeight:700,border:"1px solid #EF444430"}}>✗ {nbImpayes} lot{nbImpayes>1?"s":""} impayé{nbImpayes>1?"s":""}</div>}
            </div>
          </div>
        </div>

        {isRestricted && impayes.length > 0 && (
          <Card style={{padding:isMobile?"12px":"18px",border:"1px solid #FDE68A"}}>
            <SH title="⚠️ Cotisations en attente" subtitle="Informations globales — résidence"/>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1,background:"#FFFBEB",borderRadius:9,padding:"10px 12px",border:"1px solid #FDE68A",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#D97706"}}>{nbImpayes} lot{nbImpayes>1?"s":""}</div><div style={{fontSize:9,color:"#92400E"}}>non réglés</div>
              </div>
              <div style={{flex:1,background:"#FFFBEB",borderRadius:9,padding:"10px 12px",border:"1px solid #FDE68A",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:"#D97706"}}>{fmtN(valImpayes)}</div><div style={{fontSize:9,color:"#92400E"}}>FCFA en attente</div>
              </div>
            </div>
            <p style={{fontSize:10,color:"#94A3B8",marginTop:9,fontStyle:"italic"}}>Les détails sont confidentiels et réservés à la direction du syndic.</p>
          </Card>
        )}
        {!isRestricted && impayes.length > 0 && (
          <Card style={{padding:isMobile?"12px":"18px",border:"1px solid #FECACA"}}>
            <SH title={`⚠️ Impayés Mai — ${nbImpayes} lot${nbImpayes>1?"s":""}`} subtitle={`Total dû : ${fmt(valImpayes)}`}/>
            {impayes.map((l,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",borderRadius:9,background:"#FEF2F2",border:"1px solid #FECACA",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#DC2626"}}>{l.proprio[0]}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{l.proprio}</div><div style={{fontSize:9,color:"#94A3B8"}}>Lot #{l.lot} · {l.appart}</div></div>
                </div>
                <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:800,color:"#DC2626"}}>{fmtN(l.cotisation)}</div><div style={{fontSize:8,color:"#EF4444",fontWeight:700}}>FCFA DÛ</div></div>
              </div>
            ))}
          </Card>
        )}

        {cotExcActives.length > 0 && (
          <Card style={{padding:isMobile?"12px":"18px",border:"2px solid #FED7AA"}}>
            <SH title="🗳️ Vote — Cotisations Exceptionnelles" subtitle="Votre participation est requise"/>
            {cotExcActives.map(c => {
              const myLots = isRestricted ? currentUser.lots : [selectedLot];
              const aVote = myLots.some(lotId => c.votes && c.votes[lotId]);
              const voteInfo = aVote ? myLots.map(lotId => c.votes && c.votes[lotId] ? {lot: lotId, vote: c.votes[lotId]} : null).filter(Boolean)[0] : null;
              return (
                <div key={c.id} style={{background:"#FFFBEB",borderRadius:10,padding:"13px 14px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#0F2044"}}>{c.cause}</div>
                    {aVote && <span style={{fontSize:9,background:"#ECFDF5",color:"#059669",padding:"3px 8px",borderRadius:10,fontWeight:700}}>✓ Voté</span>}
                  </div>
                  <div style={{fontSize:11,color:"#64748B",marginBottom:6}}>{c.impacts}</div>
                  {c.photo && <img src={c.photo} alt="" style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:8,marginBottom:8}}/>}
                  <div style={{background:"#F8FAFC",borderRadius:8,padding:"8px 10px",marginBottom:10}}>
                    <p style={{fontSize:10,fontWeight:700,color:"#0F2044",marginBottom:5}}>Votre part estimée :</p>
                    {myLots.map(lotId => { const r = c.repartition?.find(x => x.lot === lotId); return r ? <div key={lotId} style={{fontSize:12,fontWeight:800,color:"#EF4444"}}>Lot #{lotId} : {fmtN(r.part)} FCFA</div> : null; })}
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>Total travaux : {fmt(c.montant)} · {c.dateCreation}</div>
                  </div>
                  {aVote && voteInfo && (
                    <div style={{background:"#ECFDF5",borderRadius:8,padding:"8px 10px",marginBottom:10,border:"1px solid #BBF7D0"}}>
                      <p style={{fontSize:10,fontWeight:700,color:"#059669",marginBottom:2}}>✓ Votre vote : {voteInfo.vote}</p>
                      <p style={{fontSize:9,color:"#4D7C0F",fontStyle:"italic"}}>Vous pouvez modifier votre vote en sélectionnant une nouvelle option ci-dessous.</p>
                    </div>
                  )}
                  <p style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:6}}>Quand pouvez-vous cotiser ?</p>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {VOTE_OPTIONS.map(opt => (
                      <div key={opt.id}>
                        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:"#0F2044",padding:"5px 0"}}>
                          <input type="radio" name={`vote-${c.id}`} value={opt.id} checked={votes[c.id]===opt.id} onChange={() => setVotes({...votes,[c.id]:opt.id})} style={{accentColor:"#10B981"}}/>
                          {opt.label}
                        </label>
                        {opt.id === "autre" && votes[c.id] === "autre" && (
                          <input placeholder="Précisez..." value={voteAutres[c.id]||""} onChange={e => setVoteAutres({...voteAutres,[c.id]:e.target.value})}
                            style={{marginLeft:22,border:"1px solid #E2E8F0",borderRadius:7,padding:"5px 9px",fontSize:11,outline:"none",width:"80%",fontFamily:"inherit"}}/>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => {
                    const v = votes[c.id]==="autre"?(voteAutres[c.id]||"autre"):votes[c.id];
                    if(!v) {
                      alert("Veuillez sélectionner une option avant de voter");
                      return;
                    }
                    myLots.forEach(lotId => dispatch({type:"VOTER_COT",cid:c.id,lot:lotId,dateVote:v}));
                    alert("Vote enregistré avec succès !");
                  }}
                    style={{marginTop:10,background:votes[c.id]?"#10B981":"#94A3B8",border:"none",borderRadius:8,padding:"9px 18px",fontSize:12,fontWeight:700,color:"#fff",cursor:votes[c.id]?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:6}}
                    disabled={!votes[c.id]}>
                    <Icon name="vote" size={13}/>Confirmer mon vote
                  </button>
                </div>
              );
            })}
          </Card>
        )}

        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"260px 1fr",gap:14}}>
          <div style={{background:"#0F2044",borderRadius:13,padding:isMobile?"14px":"20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>{lot.proprio[0]}</div>
              <div><h3 style={{fontSize:13,fontWeight:800,color:"#fff",margin:0}}>{lot.proprio}</h3><p style={{fontSize:10,color:"#4A6480",margin:0}}>Lot #{lot.lot} · {lot.appart}</p></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr",gap:6}}>
              {[["Étage",lot.etage],["Tantièmes",`${lot.tantieme}/10 000`],["Quote-part",`${((lot.tantieme/10000)*100).toFixed(1)}%`],["Cotisation/mois",`${fmtN(lot.cotisation)} FCFA`],["Payé 2026",`${fmtN(totalPaye)} FCFA`]].map(([k,v]) => (
                <div key={k} style={{background:"#1E3A5F",borderRadius:7,padding:"7px 9px"}}>
                  <div style={{fontSize:8,color:"#4A6480",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:1}}>{k}</div>
                  <div style={{fontSize:11,color:"#F1F5F9",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:"#4A6480"}}>Paiements 2026</span><span style={{fontSize:11,fontWeight:800,color:pctIndiv===100?"#10B981":"#F59E0B"}}>{pctIndiv}%</span></div>
              <div style={{background:"#1E3A5F",borderRadius:99,height:7,overflow:"hidden"}}><div style={{width:`${pctIndiv}%`,background:pctIndiv===100?"#10B981":"#F59E0B",borderRadius:99,height:"100%"}}/></div>
            </div>
          </div>
          <Card style={{padding:isMobile?"12px":"16px"}}>
            <SH title="Mon Historique 2026"/>
            {historique.map((h,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",borderRadius:9,background:h.statut?"#F0FDF4":"#FEF2F2",border:`1px solid ${h.statut?"#BBF7D0":"#FECACA"}`,marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:h.statut?"#10B981":"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0}}>{h.statut?"✓":"✗"}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{h.mois} 2026</div>{h.statut && <MB mode={h.mode}/>}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:800,color:h.statut?"#059669":"#DC2626"}}>{fmtN(h.montant)}</div>
                  <div style={{fontSize:8,color:h.statut?"#059669":"#EF4444",fontWeight:700}}>{h.statut?"FCFA PAYÉ":"FCFA DÛ"}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </>)}

      {propTab === "repartition" && (
        <Card style={{padding:isMobile?"12px":"18px"}}>
          <SH title="Répartition des Charges" subtitle="Tantièmes et cotisations mensuelles par lot — noms non affichés"/>
          <p style={{fontSize:10,color:"#94A3B8",marginBottom:12,fontStyle:"italic"}}>Les noms des propriétaires ne sont pas visibles. Seuls les tantièmes et montants de cotisation sont accessibles à tous.</p>
          {isMobile ? (
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {lots.map(l => (
                <div key={l.lot} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",background:l.lot===selectedLot?"#EFF6FF":"#F8FAFC",borderRadius:9,border:l.lot===selectedLot?"1px solid #BFDBFE":"1px solid transparent"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:800,color:l.lot===selectedLot?"#1D4ED8":"#10B981"}}>#{l.lot}</span>
                      <span style={{fontSize:11,color:"#0F2044"}}>{l.appart}</span>
                      {l.lot===selectedLot && <span style={{fontSize:8,color:"#1D4ED8",fontWeight:700,background:"#DBEAFE",padding:"1px 5px",borderRadius:10}}>MON LOT</span>}
                    </div>
                    <div style={{fontSize:9,color:"#94A3B8"}}>{l.tantieme} tantièmes · {((l.tantieme/totalTantieme)*100).toFixed(1)}%</div>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:"#0F2044"}}>{fmtN(l.cotisation)} F</div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"9px 11px",background:"#F0FDF4",borderRadius:9,border:"1px solid #10B981",marginTop:3}}>
                <span style={{fontSize:11,fontWeight:700,color:"#0F2044"}}>TOTAL — 10 000 tantièmes</span>
                <span style={{fontSize:12,fontWeight:800,color:"#10B981"}}>{fmtN(totalAttendu)} F</span>
              </div>
            </div>
          ) : (
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#F8FAFC"}}>
                {["Lot","Appartement","Étage","Tantièmes","Quote-part","Cotisation / mois"].map(h => (
                  <th key={h} style={{fontSize:9,color:"#64748B",fontWeight:700,textAlign:"left",padding:"8px 10px",letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {lots.map(l => (
                  <tr key={l.lot} style={{borderTop:"1px solid #F1F5F9",background:l.lot===selectedLot?"#EFF6FF":"transparent"}}>
                    <td style={{padding:"9px 10px"}}>
                      <span style={{fontSize:12,fontWeight:800,color:l.lot===selectedLot?"#1D4ED8":"#10B981"}}>#{l.lot}</span>
                      {l.lot===selectedLot && <span style={{fontSize:8,color:"#1D4ED8",fontWeight:700,marginLeft:6,background:"#DBEAFE",padding:"1px 6px",borderRadius:10}}>MON LOT</span>}
                    </td>
                    <td style={{padding:"9px 10px",fontSize:12,color:"#0F2044"}}>{l.appart}</td>
                    <td style={{padding:"9px 10px",fontSize:11,color:"#64748B"}}>{l.etage}</td>
                    <td style={{padding:"9px 10px",fontSize:12,fontWeight:600,color:"#0F2044"}}>{l.tantieme}</td>
                    <td style={{padding:"9px 10px",fontSize:11,color:"#64748B"}}>{((l.tantieme/totalTantieme)*100).toFixed(1)}%</td>
                    <td style={{padding:"9px 10px",fontSize:12,fontWeight:700,color:"#0F2044"}}>{fmtN(l.cotisation)} FCFA</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{background:"#F0FDF4",borderTop:"2px solid #10B981"}}>
                <td colSpan={3} style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#0F2044"}}>TOTAL</td>
                <td style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#0F2044"}}>10 000</td>
                <td style={{padding:"8px 10px",fontSize:11,fontWeight:700,color:"#64748B"}}>100%</td>
                <td style={{padding:"8px 10px",fontSize:11,fontWeight:800,color:"#10B981"}}>{fmtN(totalAttendu)} FCFA</td>
              </tr></tfoot>
            </table>
          )}
        </Card>
      )}

      {propTab === "signalements" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {isRestricted && (
            <Card style={{padding:isMobile?"12px":"16px"}}>
              <SH title="Mes Signalements"
                action={<button onClick={() => setShowSig(true)} style={{display:"flex",alignItems:"center",gap:4,background:"#EF4444",border:"none",borderRadius:7,padding:"6px 12px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}><Icon name="flag" size={12}/>Nouveau signalement</button>}/>
              {mySignalements.length === 0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"#94A3B8"}}>
                  <Icon name="flag" size={28}/>
                  <p style={{fontSize:12,marginTop:8}}>Aucun signalement envoyé pour le moment</p>
                  <button onClick={() => setShowSig(true)} style={{marginTop:8,background:"#EF4444",border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>Signaler un problème</button>
                </div>
              ) : (
                mySignalements.map(s => (
                  <div key={s.id} style={{background:s.statut==="public"?"#F0FDF4":"#F8FAFC",borderRadius:9,padding:"10px 12px",border:`1px solid ${s.statut==="public"?"#BBF7D0":"#E2E8F0"}`,marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:6,marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:600,color:"#0F2044"}}>{s.description.slice(0,70)}{s.description.length>70?"...":""}</span>
                      <span style={{fontSize:9,background:s.statut==="public"?"#ECFDF5":"#F1F5F9",color:s.statut==="public"?"#059669":"#64748B",padding:"2px 7px",borderRadius:10,fontWeight:700,whiteSpace:"nowrap"}}>{s.statut==="public"?"📢 Public":"🔒 Privé"}</span>
                    </div>
                    <div style={{fontSize:9,color:"#94A3B8",marginBottom:s.reponse?6:0}}>Envoyé le {s.dateCreation}</div>
                    {s.reponse && <div style={{background:"#EFF6FF",borderRadius:7,padding:"7px 10px",fontSize:11,color:"#1D4ED8",marginTop:4}}>↩️ Réponse du concierge : {s.reponse}</div>}
                    {!s.reponse && s.statut==="prive" && <div style={{fontSize:10,color:"#94A3B8",fontStyle:"italic",marginTop:4}}>En attente de traitement par le concierge...</div>}
                  </div>
                ))
              )}
            </Card>
          )}
          <Card style={{padding:isMobile?"12px":"16px"}}>
            <SH title="📢 Signalements Publics" subtitle="Visibles par tous les résidents"/>
            {publiSignalements.length === 0 ? (
              <p style={{fontSize:11,color:"#94A3B8",textAlign:"center",padding:"14px 0"}}>Aucun signalement rendu public pour l'instant</p>
            ) : (
              publiSignalements.map(s => (
                <div key={s.id} style={{background:"#F8FAFC",borderRadius:9,padding:"10px 12px",border:"1px solid #E2E8F0",marginBottom:7}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#0F2044",marginBottom:2}}>Lot #{s.lot} · {s.appart} — {s.dateCreation}</div>
                  <p style={{fontSize:11,color:"#64748B",margin:0}}>{s.description}</p>
                  {s.photo && <img src={s.photo} alt="" style={{width:"100%",maxHeight:100,objectFit:"cover",borderRadius:7,marginTop:7}}/>}
                </div>
              ))
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
