import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext.jsx";
import { loadModules, loadPackages, createDemande, loadDemandes } from "../../services/modulesService.js";

const CATEGORIE_LABELS = { base: "Base", premium: "Premium", enterprise: "Entreprise" };
const CATEGORIE_COLORS = {
  base: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  premium: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  enterprise: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
};
const STATUT_LABELS = { en_attente: "En attente", approuve: "Approuvé", rejete: "Rejeté" };
const STATUT_COLORS = {
  en_attente: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  approuve: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  rejete: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export const TabModules = ({ isMobile }) => {
  const { user, syndicatId } = useApp();
  const [modules, setModules] = useState([]);
  const [packages, setPackages] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);
  const [view, setView] = useState("catalogue");

  useEffect(() => {
    Promise.all([loadModules(), loadPackages(), syndicatId ? loadDemandes(syndicatId) : []]).then(
      ([mods, pkgs, dems]) => {
        setModules(mods);
        setPackages(pkgs);
        setDemandes(Array.isArray(dems) ? dems : []);
        setLoading(false);
      }
    ).catch(() => setLoading(false));
  }, [syndicatId]);

  const toggleModule = (id) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedModules(pkg.modules_ids || []);
  };

  const handleSubmit = async () => {
    if (!syndicatId || !user) return;
    setSending(true);
    setMsg(null);
    try {
      await createDemande({
        syndicatId,
        demandeurId: user.id,
        packageId: selectedPackage?.id || null,
        modulesIds: selectedModules,
        commentaire,
      });
      setMsg({ type: "success", text: "Demande envoyée ! Le super administrateur la validera prochainement." });
      setSelectedPackage(null);
      setSelectedModules([]);
      setCommentaire("");
      const dems = await loadDemandes(syndicatId);
      setDemandes(Array.isArray(dems) ? dems : []);
    } catch (e) {
      setMsg({ type: "error", text: "Erreur : " + e.message });
    }
    setSending(false);
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Chargement des modules…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "#0F2044", borderRadius: 13, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>📦</span>
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>Modules & Packages</h2>
          <p style={{ fontSize: 10, color: "#4A6480", margin: 0, marginTop: 2 }}>Sélectionnez vos modules et soumettez votre choix pour validation</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "catalogue", label: "Catalogue" },
          { id: "demandes", label: `Mes demandes (${demandes.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              background: view === t.id ? "#0F2044" : "#F1F5F9",
              color: view === t.id ? "#fff" : "#334155",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: msg.type === "success" ? "#F0FDF4" : "#FEF2F2",
          color: msg.type === "success" ? "#16A34A" : "#DC2626",
          border: `1px solid ${msg.type === "success" ? "#BBF7D0" : "#FECACA"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "inherit" }}>✕</button>
        </div>
      )}

      {view === "catalogue" && (
        <>
          {/* Packages recommandés */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F2044", margin: 0 }}>Packages recommandés</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => selectPackage(pkg)}
                  style={{
                    background: isSelected ? "#0F2044" : "#fff",
                    borderRadius: 12, padding: 20, cursor: "pointer",
                    border: isSelected ? "2px solid #C49A3C" : "1px solid #E2E8F0",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "#fff" : "#0F2044", marginBottom: 6 }}>
                    {pkg.nom}
                  </div>
                  <div style={{ fontSize: 12, color: isSelected ? "rgba(255,255,255,.7)" : "#64748B", marginBottom: 12, lineHeight: 1.5 }}>
                    {pkg.description}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: isSelected ? "#C49A3C" : "#0F2044", marginBottom: 4 }}>
                    {pkg.prix_mensuel > 0 ? `${pkg.prix_mensuel.toLocaleString()} FCFA` : "Sur devis"}
                    {pkg.prix_mensuel > 0 && <span style={{ fontSize: 12, fontWeight: 400, color: isSelected ? "rgba(255,255,255,.5)" : "#94A3B8" }}>/mois</span>}
                  </div>
                  {pkg.max_lots && (
                    <div style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,.5)" : "#94A3B8" }}>
                      Jusqu'à {pkg.max_lots} lots
                    </div>
                  )}
                  <div style={{ marginTop: 12, fontSize: 11, color: isSelected ? "#C49A3C" : "#16A34A", fontWeight: 600 }}>
                    {(pkg.modules_ids || []).length} modules inclus
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catalogue des modules */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F2044", margin: "8px 0 0" }}>Tous les modules disponibles</h3>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
            Cochez les modules souhaités ou sélectionnez un package ci-dessus pour pré-remplir.
          </p>

          {["base", "premium", "enterprise"].map((cat) => {
            const catModules = modules.filter((m) => m.categorie === cat);
            if (!catModules.length) return null;
            const catColor = CATEGORIE_COLORS[cat];
            return (
              <div key={cat}>
                <div style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 99,
                  fontSize: 10, fontWeight: 700, marginBottom: 10,
                  background: catColor.bg, color: catColor.color, border: `1px solid ${catColor.border}`,
                }}>
                  {CATEGORIE_LABELS[cat]}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                  {catModules.map((mod) => {
                    const checked = selectedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        style={{
                          background: checked ? "#F0FDF4" : "#fff",
                          border: checked ? "2px solid #16A34A" : "1px solid #E2E8F0",
                          borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                          display: "flex", gap: 12, alignItems: "flex-start",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                          border: checked ? "2px solid #16A34A" : "2px solid #CBD5E1",
                          background: checked ? "#16A34A" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 12, fontWeight: 800,
                        }}>
                          {checked && "✓"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 16 }}>{mod.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F2044" }}>{mod.nom}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>{mod.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Formulaire de demande */}
          {selectedModules.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 20, marginTop: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F2044", marginBottom: 12 }}>
                Soumettre votre sélection ({selectedModules.length} module{selectedModules.length > 1 ? "s" : ""})
              </h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, display: "block" }}>
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Précisez vos besoins ou contraintes particulières…"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    border: "1px solid #E2E8F0", fontSize: 13, minHeight: 70,
                    resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{
                  background: "#0F2044", color: "#fff", border: "none", borderRadius: 8,
                  padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? "Envoi en cours…" : "Envoyer la demande au super admin"}
              </button>
            </div>
          )}
        </>
      )}

      {view === "demandes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demandes.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 13 }}>
              Aucune demande pour le moment. Sélectionnez des modules dans le catalogue pour commencer.
            </div>
          )}
          {demandes.map((d) => {
            const statColor = STATUT_COLORS[d.statut] || STATUT_COLORS.en_attente;
            const demandeModules = modules.filter((m) => (d.modules_selectionnes || []).includes(m.id));
            const demandePkg = packages.find((p) => p.id === d.package_id);
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : ""}
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: statColor.bg, color: statColor.color, border: `1px solid ${statColor.border}`,
                  }}>
                    {STATUT_LABELS[d.statut] || d.statut}
                  </span>
                </div>
                {demandePkg && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", marginBottom: 8 }}>
                    Package : {demandePkg.nom}
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {demandeModules.map((m) => (
                    <span key={m.id} style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                      background: "#F1F5F9", color: "#334155", border: "1px solid #E2E8F0",
                    }}>
                      {m.icon} {m.nom}
                    </span>
                  ))}
                </div>
                {d.commentaire && (
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8, lineHeight: 1.5 }}>
                    <strong>Commentaire :</strong> {d.commentaire}
                  </div>
                )}
                {d.reponse_admin && (
                  <div style={{
                    fontSize: 12, padding: "8px 12px", borderRadius: 8,
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                    color: "#334155", lineHeight: 1.5,
                  }}>
                    <strong>Réponse admin :</strong> {d.reponse_admin}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
