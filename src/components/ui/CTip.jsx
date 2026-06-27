import { fmtS } from "../../utils/formatters.js";

export const CTip = ({active, payload, label}) => {
  if(!active || !payload?.length) return null;
  return (
    <div style={{background:"#0F2044",border:"1px solid #1E3A5F",borderRadius:10,padding:"9px 13px",minWidth:145}}>
      <p style={{color:"#94A3B8",fontSize:10,marginBottom:5,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase"}}>{label}</p>
      {payload.map((p,i) => (
        <div key={i} style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:2}}>
          <span style={{color:p.color,fontSize:11}}>{p.name}</span>
          <span style={{color:"#F1F5F9",fontSize:11,fontWeight:700}}>{fmtS(p.value)}</span>
        </div>
      ))}
    </div>
  );
};
