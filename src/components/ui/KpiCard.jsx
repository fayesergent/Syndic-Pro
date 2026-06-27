import { Icon } from "./Icon.jsx";

export const KpiCard = ({label, value, sub, icon, accent, trend, compact}) => (
  <div style={{background:"#fff",borderRadius:13,padding:compact?"14px 12px":"20px 18px",border:"1px solid #E2E8F0",flex:1,minWidth:0,boxShadow:"0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(15,32,68,0.05)",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:accent,borderRadius:"13px 0 0 13px"}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:compact?8:10}}>
      <div style={{background:accent+"18",borderRadius:7,padding:compact?6:7,color:accent,display:"flex"}}><Icon name={icon} size={compact?15:17}/></div>
      {trend && <span style={{fontSize:9,fontWeight:700,color:trend>0?"#DC2626":"#059669",background:trend>0?"#FEF2F2":"#ECFDF5",padding:"2px 6px",borderRadius:20}}>{trend>0?"▲":"▼"}{Math.abs(trend)}%</span>}
    </div>
    <div style={{fontSize:compact?15:19,fontWeight:800,color:"#0F2044",letterSpacing:"-0.02em",lineHeight:1.1}}>{value}</div>
    <div style={{fontSize:compact?9:11,color:"#94A3B8",marginTop:2,fontWeight:500}}>{label}</div>
    {sub && <div style={{fontSize:9,color:"#64748B",marginTop:4,borderTop:"1px solid #F1F5F9",paddingTop:4}}>{sub}</div>}
  </div>
);
