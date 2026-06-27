export const MOCK_USERS = [
  {email:"admin@helene2026.com",         password:"SyndicAdmin2026",    role:"superadmin",   name:"Super Admin",     lots:[]},
  {email:"concierge@helene2026.com",     password:"SyndicConcierg2026", role:"concierge",    name:"Mamadou Sarr",    lots:[]},
  {email:"babacar.diop@helene2026.com",  password:"SyndicLot01",        role:"proprietaire", name:"Babacar Diop",    lots:[1,2]},
  {email:"absatou.toure@helene2026.com", password:"SyndicLot03",        role:"proprietaire", name:"Absatou Touré",   lots:[3]},
  {email:"oumoul.faye@helene2026.com",   password:"SyndicLot04",        role:"proprietaire", name:"Oumoul Faye",     lots:[4]},
  {email:"zeinab.diop@helene2026.com",   password:"SyndicLot05",        role:"proprietaire", name:"Zeinab Diop",     lots:[5]},
  {email:"birane.gueye@helene2026.com",  password:"SyndicLot06",        role:"proprietaire", name:"Birane Gueye",    lots:[6]},
  {email:"wore.diop@helene2026.com",     password:"SyndicLot07",        role:"proprietaire", name:"Wore Diop",       lots:[7]},
  {email:"yves@helene2026.com",          password:"SyndicLot08",        role:"proprietaire", name:"Yves",            lots:[8]},
  {email:"mariama.toure@helene2026.com", password:"SyndicLot09",        role:"proprietaire", name:"Mariama Touré",   lots:[9]},
  {email:"ndiaye.samb@helene2026.com",   password:"SyndicLot10",        role:"proprietaire", name:"Ndiaye Samb",     lots:[10]},
  {email:"marie.dieye@helene2026.com",   password:"SyndicLot11",        role:"proprietaire", name:"Marie Dieye",     lots:[11]},
  {email:"diop.fils@helene2026.com",     password:"SyndicLot12",        role:"proprietaire", name:"M. Diop et fils", lots:[12]},
  {email:"mme.fall@helene2026.com",      password:"SyndicLot13",        role:"proprietaire", name:"Mme Fall",        lots:[13]},
];

export const ROLE_TABS = {
  superadmin:   ["dashboard", "admin", "backoffice"],
  admin:        ["dashboard", "backoffice"],
  concierge:    ["dashboard", "concierge"],
  proprietaire: ["dashboard", "proprio"],
};

export const ROLE_LABELS = {
  superadmin:   {label:"Super Admin",    color:"#7C3AED", bg:"#EDE9FE"},
  admin:        {label:"Admin",          color:"#0F2044", bg:"#E0F2FE"},
  concierge:    {label:"Concierge",      color:"#0369A1", bg:"#E0F2FE"},
  proprietaire: {label:"Propriétaire",   color:"#059669", bg:"#ECFDF5"},
};
