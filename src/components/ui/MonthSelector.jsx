import { useApp } from "../../contexts/AppContext.jsx";

// Génère les 24 derniers mois + 2 mois futurs
function generateMonths() {
  const months = [];
  const now = new Date();
  for(let i = -2; i <= 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("fr-FR", {month:"short", year:"numeric"});
    months.push({value, label});
  }
  return months;
}

const MONTHS = generateMonths();

export const MonthSelector = ({isMobile}) => {
  const {currentMois, setCurrentMois} = useApp();

  return (
    <select
      value={currentMois}
      onChange={e => setCurrentMois(e.target.value)}
      style={{
        border:"1px solid #E2E8F0", borderRadius:7,
        padding:isMobile?"4px 6px":"5px 9px",
        fontSize:isMobile?9:11, fontWeight:600,
        color:"#0F2044", background:"#F8FAFC",
        cursor:"pointer", outline:"none", fontFamily:"inherit",
        maxWidth:isMobile?90:130,
      }}
    >
      {MONTHS.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  );
};
