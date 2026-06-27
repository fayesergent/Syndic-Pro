// getStats accepte maintenant `lots` comme second paramètre (depuis AppContext)
// Rétrocompatible : si `lots` n'est pas fourni, retourne des stats vides
export const getStats = (paiements, lots = []) => {
  if(!lots.length) {
    return {tots:[], totalAttendu:0, totalRecu:0, impayes:[], valImpayes:0, nbImpayes:0, nbPayes:0, pct:0};
  }
  const tots = lots.map(l => {
    const p = paiements.find(x => x.lot === l.lot);
    return {...l, montant:p?.montant||0, mode:p?.mode||"-"};
  });
  const totalAttendu = tots.reduce((s, l) => s + l.cotisation, 0);
  const totalRecu    = tots.reduce((s, l) => s + (l.montant || 0), 0);
  const payes        = tots.filter(l => l.montant && l.montant > 0);
  const impayes      = tots.filter(l => !l.montant || l.montant === 0);
  const valImpayes   = impayes.reduce((s, l) => s + l.cotisation, 0);
  const pct = totalAttendu > 0 ? Math.round((totalRecu / totalAttendu) * 100) : 0;
  return {tots, totalAttendu, totalRecu, impayes, valImpayes, nbImpayes:impayes.length, nbPayes:payes.length, pct};
};
