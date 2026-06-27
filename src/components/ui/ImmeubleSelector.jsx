import { useApp } from "../../contexts/AppContext.jsx";

export const ImmeubleSelector = ({isMobile}) => {
  const {immeubles, selectedImmeuble, changeImmeuble, user} = useApp();

  // N'afficher que si l'utilisateur a accès à plusieurs immeubles
  if(!immeubles.length || immeubles.length <= 1) return null;
  if(user?.role === "proprietaire") return null;

  return (
    <select
      value={selectedImmeuble?.id || ""}
      onChange={e => {
        const imm = immeubles.find(i => i.id === e.target.value);
        if(imm) changeImmeuble(imm);
      }}
      style={{
        border:"1px solid #BBF7D0", borderRadius:7,
        padding:isMobile?"4px 6px":"5px 9px",
        fontSize:isMobile?9:11, fontWeight:600,
        color:"#059669", background:"#F0FDF4",
        cursor:"pointer", outline:"none", fontFamily:"inherit",
        maxWidth:isMobile?100:160,
      }}
    >
      {immeubles.map(imm => (
        <option key={imm.id} value={imm.id}>{imm.nom}</option>
      ))}
    </select>
  );
};
