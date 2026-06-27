import { useState } from "react";
import { fmt, fmtN } from "../../utils/formatters.js";
import { Icon, Card, SH, Input } from "../../components/ui/index.js";

export const TabPrestataires = ({isMobile, state, dispatch}) => {
  const [showForm,setShowForm] = useState(false);
  const [editId,setEditId]     = useState(null);
  const [payModal,setPayModal] = useState(null);
  const [payMode,setPayMode]   = useState("Wave");
  const blank = {nom:"",contact:"",tel:"",adresse:"",montant:"",mode:"Wave",wave:"",om:"",ini:"",col:"#10B981"};
  const [form,setForm]         = useState(blank);
  const F = (k,v) => setForm(f => ({...f,[k]:v}));

  const save = () => {
    if(!form.nom || !form.montant) return;
    if(editId) { dispatch({type:"UPD_PRESTA",id:editId,data:{...form,montant:Number(form.montant)}}); setEditId(null); }
    else dispatch({type:"ADD_PRESTA",data:{...form,montant:Number(form.montant),ini:form.nom.slice(0,2).toUpperCase()}});
    setForm(blank); setShowForm(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
        <div><h2 style={{fontSize:13,fontWeight:700,color:"#0F2044",margin:0}}>Prestataires de l'Immeuble</h2><p style={{fontSize:10,color:"#94A3B8",margin:"2px 0 0"}}>{state.prestataires.length} prestataires enregistrés</p></div>
        <button onClick={() => {setShowForm(!showForm); setEditId(null); setForm(blank);}}
          style={{display:"flex",alignItems:"center",gap:5,background:"#0F2044",border:"none",borderRadius:8,padding:"7px 13px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer"}}>
          <Icon name="plus" size={13}/>{showForm?"Annuler":"Ajouter"}
        </button>
      </div>
      {showForm && (
        <Card style={{padding:isMobile?"13px":"18px",border:"1px solid #E0F2FE"}}>
          <SH title={editId?"Modifier Prestataire":"Nouveau Prestataire"}/>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:10}}>
            <Input label="Nom du prestataire" value={form.nom} onChange={e=>F("nom",e.target.value)} placeholder="Ex: OTIS Ascenseurs"/>
            <Input label="Contact" value={form.contact} onChange={e=>F("contact",e.target.value)} placeholder="Nom du responsable"/>
            <Input label="Téléphone" value={form.tel} onChange={e=>F("tel",e.target.value)} placeholder="+221 77 000 00 00"/>
            <Input label="Adresse" value={form.adresse} onChange={e=>F("adresse",e.target.value)} placeholder="Quartier, Dakar"/>
            <Input label="Montant mensuel (FCFA)" value={form.montant} onChange={e=>F("montant",e.target.value)} type="number" placeholder="0"/>
            <div>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Mode de paiement</label>
              <select value={form.mode} onChange={e=>F("mode",e.target.value)} style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:12,outline:"none",background:"#F8FAFC",fontFamily:"inherit"}}>
                <option>Wave</option><option>OM</option><option>Espèces</option><option>Chèque</option>
              </select>
            </div>
            <Input label="Numéro Wave" value={form.wave} onChange={e=>F("wave",e.target.value)} placeholder="7XXXXXXXX"/>
            <Input label="Numéro OM" value={form.om} onChange={e=>F("om",e.target.value)} placeholder="7XXXXXXXX"/>
          </div>
          <button onClick={save} style={{background:"#10B981",border:"none",borderRadius:9,padding:"10px 20px",fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
            {editId?"Mettre à jour":"Enregistrer le prestataire"}
          </button>
        </Card>
      )}
      {payModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(15,32,68,0.6)",zIndex:200,display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:isMobile?"20px 20px 0 0":18,padding:isMobile?"22px 18px 28px":28,width:isMobile?"100%":340,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            {isMobile && <div style={{width:32,height:3,background:"#E2E8F0",borderRadius:2,margin:"0 auto 16px"}}/>}
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:payModal.col+"20",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:16,fontWeight:800,color:payModal.col}}>{payModal.ini}</div>
              <h3 style={{fontSize:15,fontWeight:800,color:"#0F2044",margin:0}}>Payer {payModal.nom}</h3>
              <p style={{fontSize:11,color:"#94A3B8",marginTop:2}}>Montant mensuel habituel : {fmt(payModal.montant)}</p>
            </div>
            <div style={{background:"#F8FAFC",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
              {payModal.wave && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{color:"#94A3B8"}}>Wave</span><span style={{color:"#1D4ED8",fontWeight:700}}>+221 {payModal.wave}</span></div>}
              {payModal.om   && <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:"#94A3B8"}}>OM</span><span style={{color:"#C2410C",fontWeight:700}}>+221 {payModal.om}</span></div>}
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5}}>Opérateur</label>
              <select value={payMode} onChange={e=>setPayMode(e.target.value)} style={{width:"100%",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 10px",fontSize:13,outline:"none",background:"#F8FAFC",fontFamily:"inherit"}}>
                <option>Wave</option><option>OM</option><option>Espèces</option><option>Chèque</option>
              </select>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setPayModal(null)} style={{flex:1,background:"#F1F5F9",border:"none",borderRadius:9,padding:"10px 0",fontSize:12,fontWeight:600,color:"#64748B",cursor:"pointer"}}>Annuler</button>
              <button onClick={() => {
                  dispatch({type:"PAYER_PRESTA",pid:payModal.id,label:payModal.nom,montant:payModal.montant,mode:payMode});
                  setPayModal(null);
                }} style={{flex:2,background:"#10B981",border:"none",borderRadius:9,padding:"10px 0",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
        {state.prestataires.map(p => (
          <Card key={p.id} style={{padding:isMobile?"13px":"16px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
              <div style={{width:42,height:42,borderRadius:11,background:p.col+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:p.col,flexShrink:0}}>{p.ini}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800,color:"#0F2044",marginBottom:2}}>{p.nom}</div>
                <div style={{fontSize:10,color:"#64748B"}}>{p.contact}</div>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <button onClick={() => {setEditId(p.id); setForm({...p,montant:String(p.montant)}); setShowForm(true);}}
                  style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,padding:5,color:"#64748B",cursor:"pointer",display:"flex"}}><Icon name="edit" size={13}/></button>
                <button onClick={() => dispatch({type:"DEL_PRESTA",id:p.id})}
                  style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:6,padding:5,color:"#EF4444",cursor:"pointer",display:"flex"}}><Icon name="trash" size={13}/></button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"#64748B"}}><Icon name="phone" size={12}/>{p.tel}</div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"#64748B"}}><Icon name="mappin" size={12}/>{p.adresse}</div>
              {p.wave && <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"#1D4ED8",fontWeight:600}}><Icon name="wave" size={12}/>Wave: {p.wave}</div>}
              {p.om   && <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"#C2410C",fontWeight:600}}>OM: {p.om}</div>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid #F1F5F9"}}>
              <div><div style={{fontSize:14,fontWeight:800,color:"#0F2044"}}>{fmtN(p.montant)}</div><div style={{fontSize:9,color:"#94A3B8"}}>FCFA / mois · {p.mode}</div></div>
              <button onClick={() => setPayModal(p)}
                style={{background:"#0F2044",border:"none",borderRadius:8,padding:"8px 14px",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                <Icon name="send" size={12}/>Payer
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
