export const INIT_LOTS_PAIEMENTS = [
  {lot:1, montant:0,     mode:"-"},
  {lot:2, montant:0,     mode:"-"},
  {lot:3, montant:42200, mode:"Wave"},
  {lot:4, montant:53900, mode:"Espèces"},
  {lot:5, montant:0,     mode:"-"},
  {lot:6, montant:53900, mode:"OM"},
  {lot:7, montant:42500, mode:"Wave"},
  {lot:8, montant:54600, mode:"OM"},
  {lot:9, montant:42000, mode:"Cash"},
  {lot:10,montant:54236, mode:"Wave"},
  {lot:11,montant:42200, mode:"Wave"},
  {lot:12,montant:0,     mode:"-"},
  {lot:13,montant:56800, mode:"Wave"},
];

export const INIT_DEPENSES = [
  {id:1, label:"Woyofal",          montant:100000, mode:"Wave",    date:"01/05", cat:"variable", statut:"regle",   pid:4},
  {id:2, label:"Sen'Eau",          montant:119476, mode:"Wave",    date:"02/05", cat:"variable", statut:"regle",   pid:5},
  {id:3, label:"Gardiennage",      montant:210000, mode:"Espèces", date:"03/05", cat:"fixe",     statut:"regle",   pid:1},
  {id:4, label:"Nettoyage",        montant:70000,  mode:"Espèces", date:"03/05", cat:"fixe",     statut:"regle",   pid:2},
  {id:5, label:"Ascenseur",        montant:60000,  mode:"Wave",    date:"03/05", cat:"fixe",     statut:"regle",   pid:3},
  {id:6, label:"Honoraire Syndic", montant:177000, mode:"-",       date:"-",     cat:"fixe",     statut:"pending", pid:null},
  {id:7, label:"Fonds Réserve",    montant:60000,  mode:"-",       date:"-",     cat:"variable", statut:"pending", pid:null},
];

export const INIT_PRESTA = [
  {id:1, nom:"Gardiennage DACCESS", contact:"Ousmane Ndiaye", tel:"+221 77 123 45 67", adresse:"Rue 10 Mermoz, Dakar",      montant:210000, mode:"Espèces", wave:"",          om:"",          ini:"GD", col:"#0F2044"},
  {id:2, nom:"Propre+ Nettoyage",   contact:"Aissatou Fall",  tel:"+221 76 987 65 43", adresse:"Almadies, Dakar",            montant:70000,  mode:"Wave",    wave:"76987654",  om:"",          ini:"PN", col:"#10B981"},
  {id:3, nom:"OTIS Ascenseurs SN",  contact:"Thierno Ba",     tel:"+221 33 867 12 34", adresse:"Zone Industrielle, Dakar",  montant:60000,  mode:"OM",      wave:"",          om:"77567890",  ini:"OT", col:"#3B82F6"},
  {id:4, nom:"SENELEC / Woyofal",   contact:"Agence Mermoz",  tel:"+221 33 839 99 99", adresse:"Agence Mermoz, Dakar",      montant:100000, mode:"Wave",    wave:"338399999", om:"",          ini:"SL", col:"#F59E0B"},
  {id:5, nom:"SDE / Sen'Eau",       contact:"Service Client", tel:"+221 33 839 77 77", adresse:"Agence Plateau, Dakar",     montant:60000,  mode:"Wave",    wave:"338397777", om:"",          ini:"SE", col:"#06B6D4"},
];

export const INIT_ANNONCES = [
  {id:1, titre:"Maintenance ascenseur",   date:"12/05/26", type:"alerte", message:"L'ascenseur sera en maintenance le 15/05 de 9h à 12h.",          public:true},
  {id:2, titre:"Réunion de copropriété",  date:"05/05/26", type:"info",   message:"Réunion prévue le 28/05 à 18h30 — salle commune.",               public:true},
  {id:3, titre:"Nettoyage renforcé",      date:"01/05/26", type:"info",   message:"Nettoyage complet des parties communes lundi et jeudi.",          public:true},
];

export const VOTE_OPTIONS = [
  {id:"m0",    label:"Fin du mois en cours"},
  {id:"m1",    label:"Fin du mois prochain"},
  {id:"m3",    label:"Dans 3 mois"},
  {id:"m6",    label:"Dans 6 mois"},
  {id:"autre", label:"Autre (préciser)"},
];
