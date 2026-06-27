export const MB = ({mode}) => {
  const c = {Wave:{bg:"#EFF6FF",t:"#1D4ED8"}, OM:{bg:"#FFF7ED",t:"#C2410C"}, Cash:{bg:"#F0FDF4",t:"#15803D"}, "Espèces":{bg:"#F0FDF4",t:"#15803D"}, "-":{bg:"#F1F5F9",t:"#64748B"}};
  const col = c[mode] || c["-"];
  return <span style={{background:col.bg,color:col.t,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{mode}</span>;
};
