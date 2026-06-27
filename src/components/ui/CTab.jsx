import { Icon } from "./Icon.jsx";

export const CTab = ({tabs, active, onChange, isMobile}) => (
  <div style={{display:"flex",gap:isMobile?4:6,flexWrap:"wrap",marginBottom:16,background:"#F8FAFC",borderRadius:10,padding:4}}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        style={{display:"flex",alignItems:"center",gap:5,padding:isMobile?"6px 9px":"7px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:isMobile?10:11,fontWeight:active===t.id?700:500,background:active===t.id?"#0F2044":"transparent",color:active===t.id?"#fff":"#64748B",whiteSpace:"nowrap",minHeight:30,position:"relative"}}>
        <Icon name={t.icon} size={13}/>
        {t.label}
        {t.badge > 0 && <span style={{position:"absolute",top:2,right:2,width:7,height:7,borderRadius:"50%",background:"#EF4444",border:"1.5px solid #fff"}}/>}
      </button>
    ))}
  </div>
);
