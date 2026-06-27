import * as XLSX from "xlsx";

export const MODE_COTISATION = {
  TANTIEME: "tantieme",
  FIXE:     "fixe",
};

// ─── Calcul des cotisations en mode tantième ─────────────────────────────────

export function computeCotisationsTantieme(lots, budgetMensuel) {
  const total = lots.reduce((s, l) => s + (Number(l.tantieme) || 0), 0);
  if (!total || !budgetMensuel) return lots.map(l => ({ ...l, cotisation: 0 }));
  return lots.map(l => ({
    ...l,
    cotisation: Math.round((Number(budgetMensuel) * (Number(l.tantieme) || 0)) / total),
  }));
}

// ─── Téléchargement du modèle Excel ─────────────────────────────────────────

const HEADERS = ["Numéro", "Désignation", "Étage", "Propriétaire", "Email", "Téléphone", "Tantième", "Cotisation mensuelle"];

export function downloadModeleExcel(nbLots = 10) {
  const rows = Array.from({length: nbLots}, (_, i) => ({
    "Numéro":               i + 1,
    "Désignation":          "",
    "Étage":                "",
    "Propriétaire":         "",
    "Email":                "",
    "Téléphone":            "",
    "Tantième":             "",
    "Cotisation mensuelle": "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows, {header: HEADERS});

  ws["!cols"] = [
    {wch: 8},   // Numéro
    {wch: 22},  // Désignation
    {wch: 10},  // Étage
    {wch: 22},  // Propriétaire
    {wch: 25},  // Email
    {wch: 16},  // Téléphone
    {wch: 10},  // Tantième
    {wch: 20},  // Cotisation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lots");

  const instrData = [
    ["Instructions de remplissage"],
    [""],
    ["Colonne", "Description", "Obligatoire"],
    ["Numéro", "Numéro du lot (1, 2, 3...)", "Oui"],
    ["Désignation", "Ex: Appartement A1, Local commercial RDC", "Oui"],
    ["Étage", "Ex: RDC, 1er, 2e, 3e...", "Non"],
    ["Propriétaire", "Nom complet du propriétaire", "Non"],
    ["Email", "Email du propriétaire (pour lui créer un accès)", "Non"],
    ["Téléphone", "Téléphone du propriétaire", "Non"],
    ["Tantième", "Quote-part du lot (ex: 750 sur 10000)", "Oui"],
    ["Cotisation mensuelle", "Montant mensuel en FCFA (ignoré si mode tantième)", "Selon mode"],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
  wsInstr["!cols"] = [{wch: 22}, {wch: 50}, {wch: 14}];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  XLSX.writeFile(wb, "SyndicPro_Modele_Lots.xlsx");
}

// ─── Lecture d'un fichier Excel uploadé ──────────────────────────────────────

export function parseModeleExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, {type: "array"});

        const sheetName = wb.SheetNames.find(n => n.toLowerCase() !== "instructions") || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, {defval: ""});

        if (!json.length) {
          reject(new Error("Le fichier Excel est vide ou ne contient pas de données."));
          return;
        }

        const lots = json.map((row, i) => {
          const get = (...keys) => {
            for (const k of keys) {
              const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
              if (val !== undefined && val !== "") return String(val).trim();
            }
            return "";
          };

          return {
            numero:     Number(get("Numéro", "Numero", "N°", "No", "numero")) || (i + 1),
            appart:     get("Désignation", "Designation", "Appartement", "Appart", "désignation"),
            etage:      get("Étage", "Etage", "étage", "etage"),
            proprio:    get("Propriétaire", "Proprio", "propriétaire", "proprio"),
            email:      get("Email", "E-mail", "email"),
            telephone:  get("Téléphone", "Telephone", "Tel", "téléphone", "tel"),
            tantieme:   get("Tantième", "Tantieme", "tantième", "tantieme"),
            cotisation: get("Cotisation mensuelle", "Cotisation", "cotisation mensuelle", "cotisation"),
          };
        }).filter(l => l.appart || l.tantieme || l.proprio);

        if (!lots.length) {
          reject(new Error("Aucun lot valide trouvé. Vérifiez que le fichier contient les colonnes attendues."));
          return;
        }

        resolve(lots);
      } catch (err) {
        reject(new Error("Erreur de lecture du fichier Excel : " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsArrayBuffer(file);
  });
}
