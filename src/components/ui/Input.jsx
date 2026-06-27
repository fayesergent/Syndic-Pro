import { useState } from "react";

export const Input = ({label, value, onChange, type="text", placeholder=""}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label style={{fontSize:10,fontWeight:700,color:"#475569",display:"block",marginBottom:5,letterSpacing:"0.02em"}}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",border:`1.5px solid ${focused?"#10B981":"#E2E8F0"}`,borderRadius:9,padding:"9px 12px",fontSize:13,color:"#0F2044",outline:"none",boxSizing:"border-box",background:"#F8FAFC",fontFamily:"inherit"}}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
};
