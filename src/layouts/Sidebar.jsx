import { Icon } from "../components/ui/Icon.jsx";

export const Sidebar = ({isDrawer, tab, navItems, signsPending, user, rl, logout, go, syndicatNom, onClose}) => {
  const currentYear = new Date().getFullYear();
  const displayName = syndicatNom || "Syndicat";

  return (
  <aside style={{width:isDrawer?255:215,background:"#0F2044",display:"flex",flexDirection:"column",height:"100vh",...(isDrawer?{position:"fixed",top:0,left:0,zIndex:90}:{position:"fixed",top:0,left:0})}}>
    <div style={{padding:"20px 16px 16px",borderBottom:"1px solid #1E3A5F",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:32,height:32,borderRadius:8,background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="building" size={17}/></div>
        <div>
          <div style={{fontSize:12,fontWeight:800,color:"#fff",lineHeight:1.2}}>{displayName}</div>
          <div style={{fontSize:9,color:"#10B981",fontWeight:700,letterSpacing:"0.06em"}}>{currentYear}</div>
        </div>
      </div>
      {isDrawer && <button onClick={onClose} style={{background:"#1E3A5F",border:"none",borderRadius:6,padding:6,color:"#94A3B8",cursor:"pointer",display:"flex",minHeight:30,minWidth:30,alignItems:"center",justifyContent:"center"}}><Icon name="close" size={14}/></button>}
    </div>
    <nav style={{flex:1,padding:"12px 9px",display:"flex",flexDirection:"column",gap:2}}>
      <p style={{fontSize:8,color:"#3D5A80",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 8px 4px"}}>Navigation</p>
      {navItems.map(item => (
        <button key={item.id} onClick={() => go(item.id)}
          style={{display:"flex",alignItems:"center",gap:8,padding:"10px 10px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",background:tab===item.id?"#10B981":"transparent",color:tab===item.id?"#fff":"#94A3B8",position:"relative",minHeight:isDrawer?44:36}}>
          <Icon name={item.icon}/>
          <span style={{fontSize:12,fontWeight:tab===item.id?700:500}}>{item.label}</span>
          {item.id==="concierge" && signsPending > 0 && <span style={{marginLeft:"auto",background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:99,padding:"1px 6px",minWidth:16,textAlign:"center"}}>{signsPending}</span>}
          {tab===item.id && !signsPending && <div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"#fff"}}/>}
        </button>
      ))}
    </nav>
    <div style={{padding:"12px 14px",borderTop:"1px solid #1E3A5F"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:"#1E3A5F",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#10B981",flexShrink:0}}>{user.name[0]}</div>
        <div style={{minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div><span style={{fontSize:8,background:rl.bg+"30",color:rl.color,padding:"1px 6px",borderRadius:10,fontWeight:700}}>{rl.label}</span></div>
      </div>
      <button onClick={logout} style={{width:"100%",background:"#1E3A5F",border:"none",borderRadius:7,padding:"7px 0",fontSize:11,fontWeight:600,color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,minHeight:32}}>
        <Icon name="logout" size={12}/>Déconnexion
      </button>
    </div>
  </aside>
  );
};
