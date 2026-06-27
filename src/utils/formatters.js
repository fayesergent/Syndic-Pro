export const fmt  = n => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
export const fmtN = n => new Intl.NumberFormat("fr-FR").format(n);
export const fmtS = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(0)+"k" : String(n);
export const today5 = () => new Date().toLocaleDateString("fr-FR").slice(0,5);
