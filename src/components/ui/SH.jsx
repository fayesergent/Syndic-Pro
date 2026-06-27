export const SH = ({title, subtitle, action}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:14}}>
    <div>
      <h2 style={{fontSize:13,fontWeight:700,color:"#0F2044",margin:0,letterSpacing:"-0.01em"}}>{title}</h2>
      {subtitle && <p style={{fontSize:10,color:"#94A3B8",margin:"2px 0 0"}}>{subtitle}</p>}
    </div>
    {action}
  </div>
);
