export const SPill = ({paid}) => (
  <span style={{background:paid?"#ECFDF5":"#FEF2F2",color:paid?"#059669":"#DC2626",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,whiteSpace:"nowrap"}}>
    {paid ? "✓ PAYÉ" : "✗ IMPAYÉ"}
  </span>
);
