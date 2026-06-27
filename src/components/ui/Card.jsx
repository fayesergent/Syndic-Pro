export const Card = ({children, style={}}) => (
  <div style={{background:"#fff",borderRadius:13,border:"1px solid #E2E8F0",boxShadow:"0 1px 3px rgba(0,0,0,0.03)",...style}}>
    {children}
  </div>
);
