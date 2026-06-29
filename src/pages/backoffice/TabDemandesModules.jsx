import { useState, useEffect } from "react";
import { useApp } from "../../contexts/AppContext.jsx";
import {
  loadDemandes, updateDemandeStatut,
  loadAllModules, loadAllPackages,
  createModule, updateModule, deleteModule,
  createPackage, updatePackage, deletePackage,
} from "../../services/modulesService.js";

const STATUT_LABELS = { en_attente: "En attente", approuve: "Approuvé", rejete: "Rejeté" };
const STATUT_COLORS = {
  en_attente: { bg: "#FFF7ED", color: "#EA580C", border: "#FED7AA" },
  approuve: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  rejete: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  background: "#fff",
};

export const TabDemandesModules = ({ isMobile }) => {
  const { user } = useApp();
  const [demandes, setDemandes] = useState([]);
  const [modules, setModules] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("demandes");
  const [msg, setMsg] = useState(null);

  // Formulaire réponse
  const [reponses, setReponses] = useState({});

  // Formulaire nouveau module
  const [newMod, setNewMod] = useState({ nom: "", description: "", icon: "📦", categorie: "base" });
  const [newPkg, setNewPkg] = useState({ nom: "", description: "", prix_mensuel: 0, max_lots: null, modules_ids: [] });

  const reload = async () => {
    setLoading(true);
    const [dems, mods, pkgs] = await Promise.all([
      loadDemandes(), loadAllModules(), loadAllPackages(),
    ]);
    setDemandes(dems);
    setModules(mods);
    setPackages(pkgs);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const handleStatut = async (id, statut) => {
    setMsg(null);
    try {
      await updateDemandeStatut(id, {
        statut,
        reponseAdmin: reponses[id] || null,
        valideParId: user?.id,
      });
      setMsg({ type: "success", text: `Demande ${statut === "approuve" ? "approuvée" : "rejetée"} !` });
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: "Erreur : " + e.message });
    }
  };

  const handleCreateModule = async () => {
    if (!newMod.nom.trim()) return;
    try {
      await createModule(newMod);
      setNewMod({ nom: "", description: "", icon: "📦", categorie: "base" });
      setMsg({ type: "success", text: "Module créé !" });
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      await deleteModule(id);
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const handleToggleModule = async (mod) => {
    try {
      await updateModule(mod.id, { actif: !mod.actif });
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const handleCreatePackage = async () => {
    if (!newPkg.nom.trim()) return;
    try {
      await createPackage(newPkg);
      setNewPkg({ nom: "", description: "", prix_mensuel: 0, max_lots: null, modules_ids: [] });
      setMsg({ type: "success", text: "Package créé !" });
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await deletePackage(id);
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const handleTogglePackage = async (pkg) => {
    try {
      await updatePackage(pkg.id, { actif: !pkg.actif });
      await reload();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Chargement…</div>;

  const pendingCount = demandes.filter((d) => d.statut === "en_attente").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "#0F2044", borderRadius: 13, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>📋</span>
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>Demandes & Catalogue</h2>
          <p style={{ fontSize: 10, color: "#4A6480", margin: 0, marginTop: 2 }}>Gérez les demandes de modules et le catalogue de packages</p>
        </div>
        {pendingCount > 0 && (
          <div style={{
            marginLeft: "auto", background: "#FEF2F2", color: "#DC2626",
            padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 800,
          }}>
            {pendingCount} en attente
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "demandes", label: `Demandes (${pendingCount})` },
          { id: "historique", label: "Historique" },
          { id: "modules_catalog", label: "Modules" },
          { id: "packages_catalog", label: "Packages" },
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

      {/* ── Vue : Demandes en attente ── */}
      {view === "demandes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demandes.filter((d) => d.statut === "en_attente").length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 13 }}>
              Aucune demande en attente de validation.
            </div>
          )}
          {demandes
            .filter((d) => d.statut === "en_attente")
            .map((d) => {
              const demandeModules = modules.filter((m) => (d.modules_selectionnes || []).includes(m.id));
              const demandePkg = packages.find((p) => p.id === d.package_id);
              return (
                <div key={d.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : ""}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F2044" }}>
                        Syndicat : {d.syndicat_id?.slice(0, 8)}…
                      </div>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                      background: "#FFF7ED", color: "#EA580C", border: "1px solid #FED7AA",
                    }}>
                      En attente
                    </span>
                  </div>

                  {demandePkg && (
                    <div style={{ fontSize: 12, marginBottom: 8 }}>
                      <strong>Package :</strong> {demandePkg.nom} ({demandePkg.prix_mensuel > 0 ? `${demandePkg.prix_mensuel.toLocaleString()} FCFA/mois` : "Sur devis"})
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
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
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8 }}>
                      <strong>Message :</strong> {d.commentaire}
                    </div>
                  )}

                  {/* Réponse + actions */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, display: "block" }}>
                      Réponse (optionnel)
                    </label>
                    <textarea
                      value={reponses[d.id] || ""}
                      onChange={(e) => setReponses({ ...reponses, [d.id]: e.target.value })}
                      placeholder="Ajoutez un commentaire pour le demandeur…"
                      style={{ ...inputStyle, minHeight: 50, resize: "vertical" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleStatut(d.id, "approuve")}
                      style={{
                        background: "#16A34A", color: "#fff", border: "none", borderRadius: 8,
                        padding: "10px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleStatut(d.id, "rejete")}
                      style={{
                        background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
                        borderRadius: 8, padding: "10px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Vue : Historique ── */}
      {view === "historique" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demandes.filter((d) => d.statut !== "en_attente").length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 13 }}>
              Aucune demande traitée pour le moment.
            </div>
          )}
          {demandes
            .filter((d) => d.statut !== "en_attente")
            .map((d) => {
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
                      {STATUT_LABELS[d.statut]}
                    </span>
                  </div>
                  {demandePkg && <div style={{ fontSize: 12, marginBottom: 6 }}><strong>Package :</strong> {demandePkg.nom}</div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {demandeModules.map((m) => (
                      <span key={m.id} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 9, background: "#F1F5F9", color: "#334155" }}>
                        {m.icon} {m.nom}
                      </span>
                    ))}
                  </div>
                  {d.reponse_admin && (
                    <div style={{ fontSize: 12, padding: "8px 12px", borderRadius: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155" }}>
                      <strong>Réponse :</strong> {d.reponse_admin}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ── Vue : Gestion Modules ── */}
      {view === "modules_catalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Formulaire ajout */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", marginBottom: 12 }}>Ajouter un module</h4>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 80px 120px auto", gap: 8, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Nom</label>
                <input style={inputStyle} value={newMod.nom} onChange={(e) => setNewMod({ ...newMod, nom: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Description</label>
                <input style={inputStyle} value={newMod.description} onChange={(e) => setNewMod({ ...newMod, description: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Icône</label>
                <input style={inputStyle} value={newMod.icon} onChange={(e) => setNewMod({ ...newMod, icon: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Catégorie</label>
                <select style={inputStyle} value={newMod.categorie} onChange={(e) => setNewMod({ ...newMod, categorie: e.target.value })}>
                  <option value="base">Base</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Entreprise</option>
                </select>
              </div>
              <button onClick={handleCreateModule} style={{
                background: "#0F2044", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
              }}>
                + Ajouter
              </button>
            </div>
          </div>

          {/* Liste des modules */}
          {modules.map((mod) => (
            <div key={mod.id} style={{
              background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 12, opacity: mod.actif ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 20 }}>{mod.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F2044" }}>{mod.nom}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{mod.description}</div>
              </div>
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                background: "#F1F5F9", color: "#64748B",
              }}>
                {mod.categorie}
              </span>
              <button onClick={() => handleToggleModule(mod)} style={{
                background: mod.actif ? "#FEF2F2" : "#F0FDF4",
                color: mod.actif ? "#DC2626" : "#16A34A",
                border: "none", borderRadius: 6, padding: "6px 10px",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}>
                {mod.actif ? "Désactiver" : "Activer"}
              </button>
              <button onClick={() => handleDeleteModule(mod.id)} style={{
                background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
                borderRadius: 6, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Vue : Gestion Packages ── */}
      {view === "packages_catalog" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Formulaire ajout */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", marginBottom: 12 }}>Ajouter un package</h4>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 120px 100px", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Nom</label>
                <input style={inputStyle} value={newPkg.nom} onChange={(e) => setNewPkg({ ...newPkg, nom: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Description</label>
                <input style={inputStyle} value={newPkg.description} onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Prix / mois</label>
                <input type="number" style={inputStyle} value={newPkg.prix_mensuel} onChange={(e) => setNewPkg({ ...newPkg, prix_mensuel: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 2 }}>Max lots</label>
                <input type="number" style={inputStyle} value={newPkg.max_lots || ""} onChange={(e) => setNewPkg({ ...newPkg, max_lots: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>Modules inclus</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {modules.filter((m) => m.actif).map((m) => {
                  const included = (newPkg.modules_ids || []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        const ids = newPkg.modules_ids || [];
                        setNewPkg({
                          ...newPkg,
                          modules_ids: included ? ids.filter((id) => id !== m.id) : [...ids, m.id],
                        });
                      }}
                      style={{
                        padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600, cursor: "pointer",
                        background: included ? "#0F2044" : "#F1F5F9",
                        color: included ? "#fff" : "#334155",
                        border: included ? "1px solid #0F2044" : "1px solid #E2E8F0",
                      }}
                    >
                      {m.icon} {m.nom}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={handleCreatePackage} style={{
              background: "#0F2044", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              + Ajouter le package
            </button>
          </div>

          {/* Liste packages */}
          {packages.map((pkg) => {
            const pkgModules = modules.filter((m) => (pkg.modules_ids || []).includes(m.id));
            return (
              <div key={pkg.id} style={{
                background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 18,
                opacity: pkg.actif ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F2044" }}>{pkg.nom}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{pkg.description}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleTogglePackage(pkg)} style={{
                      background: pkg.actif ? "#FEF2F2" : "#F0FDF4",
                      color: pkg.actif ? "#DC2626" : "#16A34A",
                      border: "none", borderRadius: 6, padding: "6px 10px",
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>
                      {pkg.actif ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={() => handleDeletePackage(pkg.id)} style={{
                      background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
                      borderRadius: 6, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}>
                      Supprimer
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#0F2044" }}>
                    {pkg.prix_mensuel > 0 ? `${pkg.prix_mensuel.toLocaleString()} FCFA/mois` : "Sur devis"}
                  </span>
                  {pkg.max_lots && (
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>Max {pkg.max_lots} lots</span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {pkgModules.map((m) => (
                    <span key={m.id} style={{
                      padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600,
                      background: "#F1F5F9", color: "#334155",
                    }}>
                      {m.icon} {m.nom}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
