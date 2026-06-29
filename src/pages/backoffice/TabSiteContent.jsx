import { useState, useEffect } from "react";
import { loadSiteContent, updateSiteSection, DEFAULT_CONTENT } from "../../services/siteContentService.js";

const SECTIONS = [
  { id: "hero", label: "Hero (Accueil)" },
  { id: "proof_bar", label: "Barre de preuves" },
  { id: "problems", label: "Problèmes & Solution" },
  { id: "features", label: "Fonctionnalités" },
  { id: "security", label: "Sécurité" },
  { id: "pricing", label: "Tarifs" },
  { id: "testimonials", label: "Témoignages" },
  { id: "faq", label: "FAQ" },
  { id: "cta_final", label: "CTA Final" },
  { id: "footer", label: "Pied de page" },
];

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid #E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
  background: "#fff", outline: "none",
};
const textareaStyle = { ...inputStyle, minHeight: 80, resize: "vertical" };
const labelStyle = { fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4, display: "block" };
const cardStyle = {
  background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0",
  padding: "16px 18px", marginBottom: 12,
};
const btnPrimary = {
  background: "#0F2044", color: "#fff", border: "none", borderRadius: 8,
  padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const btnDanger = {
  background: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA",
  borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
};
const btnAdd = {
  background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0",
  borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
};

function ItemListEditor({ items, setItems, fields, emptyItem }) {
  const updateItem = (idx, key, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: val };
    setItems(next);
  };
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const addItem = () => setItems([...items, { ...emptyItem }]);
  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next);
  };
  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next);
  };

  return (
    <div>
      {items.map((item, idx) => (
        <div key={idx} style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F2044" }}>#{idx + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => moveUp(idx)} style={{ ...btnDanger, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }} disabled={idx === 0}>↑</button>
              <button onClick={() => moveDown(idx)} style={{ ...btnDanger, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }} disabled={idx === items.length - 1}>↓</button>
              <button onClick={() => removeItem(idx)} style={btnDanger}>Supprimer</button>
            </div>
          </div>
          {fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 8 }}>
              <label style={labelStyle}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea style={textareaStyle} value={item[f.key] || ""} onChange={(e) => updateItem(idx, f.key, e.target.value)} />
              ) : f.type === "number" ? (
                <input type="number" style={inputStyle} value={item[f.key] || ""} onChange={(e) => updateItem(idx, f.key, Number(e.target.value))} />
              ) : f.type === "checkbox" ? (
                <input type="checkbox" checked={!!item[f.key]} onChange={(e) => updateItem(idx, f.key, e.target.checked)} />
              ) : (
                <input style={inputStyle} value={item[f.key] || ""} onChange={(e) => updateItem(idx, f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={addItem} style={btnAdd}>+ Ajouter un élément</button>
    </div>
  );
}

function StringListEditor({ items, setItems, label }) {
  const update = (idx, val) => {
    const next = [...items];
    next[idx] = val;
    setItems(next);
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={item} onChange={(e) => update(idx, e.target.value)} />
          <button onClick={() => setItems(items.filter((_, i) => i !== idx))} style={btnDanger}>✕</button>
        </div>
      ))}
      <button onClick={() => setItems([...items, ""])} style={{ ...btnAdd, marginTop: 4 }}>+ Ajouter</button>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ── Éditeurs par section ─────────────────────────────────────────────────────

function HeroEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Badge"><input style={inputStyle} value={data.badge || ""} onChange={(e) => set("badge", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Mot mis en valeur (doré)"><input style={inputStyle} value={data.titleHighlight || ""} onChange={(e) => set("titleHighlight", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <FieldGroup label="Bouton principal"><input style={inputStyle} value={data.ctaPrimary || ""} onChange={(e) => set("ctaPrimary", e.target.value)} /></FieldGroup>
      <FieldGroup label="Bouton secondaire"><input style={inputStyle} value={data.ctaSecondary || ""} onChange={(e) => set("ctaSecondary", e.target.value)} /></FieldGroup>
      <FieldGroup label="Preuve sociale"><input style={inputStyle} value={data.socialProof || ""} onChange={(e) => set("socialProof", e.target.value)} /></FieldGroup>
    </>
  );
}

function ProofBarEditor({ data, setData }) {
  return (
    <ItemListEditor
      items={data.items || []}
      setItems={(items) => setData({ ...data, items })}
      fields={[
        { key: "icon", label: "Icône (emoji)", type: "text" },
        { key: "text", label: "Texte", type: "text" },
      ]}
      emptyItem={{ icon: "✓", text: "" }}
    />
  );
}

function ProblemsEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>

      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", margin: "18px 0 10px" }}>Problèmes listés</h4>
      <ItemListEditor
        items={data.items || []}
        setItems={(items) => set("items", items)}
        fields={[
          { key: "icon", label: "Icône", type: "text" },
          { key: "title", label: "Titre", type: "text" },
          { key: "desc", label: "Description", type: "textarea" },
        ]}
        emptyItem={{ icon: "❌", title: "", desc: "" }}
      />

      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", margin: "18px 0 10px" }}>Encadré Solution</h4>
      <FieldGroup label="Titre solution"><input style={inputStyle} value={data.solutionTitle || ""} onChange={(e) => set("solutionTitle", e.target.value)} /></FieldGroup>
      <StringListEditor items={data.solutionPoints || []} setItems={(v) => set("solutionPoints", v)} label="Points de la solution" />

      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", margin: "18px 0 10px" }}>Statistiques</h4>
      <ItemListEditor
        items={data.solutionStats || []}
        setItems={(items) => set("solutionStats", items)}
        fields={[
          { key: "num", label: "Chiffre", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ]}
        emptyItem={{ num: "", label: "" }}
      />
    </>
  );
}

function FeaturesEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <ItemListEditor
        items={data.items || []}
        setItems={(items) => set("items", items)}
        fields={[
          { key: "icon", label: "Icône (emoji)", type: "text" },
          { key: "title", label: "Titre", type: "text" },
          { key: "desc", label: "Description", type: "textarea" },
        ]}
        emptyItem={{ icon: "📦", title: "", desc: "" }}
      />
    </>
  );
}

function SecurityEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <ItemListEditor
        items={data.items || []}
        setItems={(items) => set("items", items)}
        fields={[
          { key: "icon", label: "Icône (emoji)", type: "text" },
          { key: "title", label: "Titre", type: "text" },
          { key: "desc", label: "Description", type: "textarea" },
        ]}
        emptyItem={{ icon: "🔒", title: "", desc: "" }}
      />
    </>
  );
}

function PricingEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const plans = data.plans || [];
  const updatePlan = (idx, key, val) => {
    const next = [...plans];
    next[idx] = { ...next[idx], [key]: val };
    set("plans", next);
  };
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <FieldGroup label="Note de bas"><input style={inputStyle} value={data.footerNote || ""} onChange={(e) => set("footerNote", e.target.value)} /></FieldGroup>

      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", margin: "18px 0 10px" }}>Plans tarifaires</h4>
      {plans.map((plan, idx) => (
        <div key={idx} style={{ ...cardStyle, borderLeft: plan.featured ? "3px solid #C49A3C" : "3px solid #E2E8F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F2044" }}>{plan.name || `Plan ${idx + 1}`}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <label style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                <input type="checkbox" checked={!!plan.featured} onChange={(e) => updatePlan(idx, "featured", e.target.checked)} /> Mis en avant
              </label>
              <button onClick={() => set("plans", plans.filter((_, i) => i !== idx))} style={btnDanger}>Supprimer</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <FieldGroup label="Nom"><input style={inputStyle} value={plan.name || ""} onChange={(e) => updatePlan(idx, "name", e.target.value)} /></FieldGroup>
            <FieldGroup label="Tag"><input style={inputStyle} value={plan.tag || ""} onChange={(e) => updatePlan(idx, "tag", e.target.value)} /></FieldGroup>
            <FieldGroup label="Prix"><input style={inputStyle} value={plan.price || ""} onChange={(e) => updatePlan(idx, "price", e.target.value)} /></FieldGroup>
            <FieldGroup label="Lots"><input style={inputStyle} value={plan.lots || ""} onChange={(e) => updatePlan(idx, "lots", e.target.value)} /></FieldGroup>
            <FieldGroup label="Texte bouton"><input style={inputStyle} value={plan.cta || ""} onChange={(e) => updatePlan(idx, "cta", e.target.value)} /></FieldGroup>
          </div>
          <StringListEditor
            items={plan.features || []}
            setItems={(features) => updatePlan(idx, "features", features)}
            label="Fonctionnalités incluses"
          />
        </div>
      ))}
      <button onClick={() => set("plans", [...plans, { name: "", tag: "", price: "", lots: "", features: [], cta: "Commencer", featured: false }])} style={btnAdd}>
        + Ajouter un plan
      </button>
    </>
  );
}

function TestimonialsEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <ItemListEditor
        items={data.items || []}
        setItems={(items) => set("items", items)}
        fields={[
          { key: "name", label: "Nom", type: "text" },
          { key: "initials", label: "Initiales", type: "text" },
          { key: "role", label: "Rôle / Fonction", type: "text" },
          { key: "stars", label: "Étoiles (1-5)", type: "number" },
          { key: "text", label: "Témoignage", type: "textarea" },
        ]}
        emptyItem={{ name: "", initials: "", role: "", stars: 5, text: "" }}
      />
    </>
  );
}

function FaqEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Label section"><input style={inputStyle} value={data.sectionLabel || ""} onChange={(e) => set("sectionLabel", e.target.value)} /></FieldGroup>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <ItemListEditor
        items={data.items || []}
        setItems={(items) => set("items", items)}
        fields={[
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Réponse (HTML autorisé)", type: "textarea" },
        ]}
        emptyItem={{ q: "", a: "" }}
      />
    </>
  );
}

function CtaFinalEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Titre"><input style={inputStyle} value={data.title || ""} onChange={(e) => set("title", e.target.value)} /></FieldGroup>
      <FieldGroup label="Sous-titre"><textarea style={textareaStyle} value={data.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} /></FieldGroup>
      <FieldGroup label="Bouton principal"><input style={inputStyle} value={data.ctaPrimary || ""} onChange={(e) => set("ctaPrimary", e.target.value)} /></FieldGroup>
      <FieldGroup label="Bouton secondaire"><input style={inputStyle} value={data.ctaSecondary || ""} onChange={(e) => set("ctaSecondary", e.target.value)} /></FieldGroup>
      <FieldGroup label="Note de bas"><input style={inputStyle} value={data.footerNote || ""} onChange={(e) => set("footerNote", e.target.value)} /></FieldGroup>
    </>
  );
}

function FooterEditor({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <>
      <FieldGroup label="Description"><textarea style={textareaStyle} value={data.description || ""} onChange={(e) => set("description", e.target.value)} /></FieldGroup>
      <FieldGroup label="Copyright"><input style={inputStyle} value={data.copyright || ""} onChange={(e) => set("copyright", e.target.value)} /></FieldGroup>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0F2044", margin: "18px 0 10px" }}>Badges de confiance</h4>
      <ItemListEditor
        items={data.trustBadges || []}
        setItems={(items) => set("trustBadges", items)}
        fields={[
          { key: "icon", label: "Icône", type: "text" },
          { key: "text", label: "Texte", type: "text" },
        ]}
        emptyItem={{ icon: "✓", text: "" }}
      />
    </>
  );
}

const EDITORS = {
  hero: HeroEditor,
  proof_bar: ProofBarEditor,
  problems: ProblemsEditor,
  features: FeaturesEditor,
  security: SecurityEditor,
  pricing: PricingEditor,
  testimonials: TestimonialsEditor,
  faq: FaqEditor,
  cta_final: CtaFinalEditor,
  footer: FooterEditor,
};

// ── Composant principal ──────────────────────────────────────────────────────

export const TabSiteContent = ({ isMobile }) => {
  const [activeSection, setActiveSection] = useState("hero");
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSiteContent().then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    setMsg(null);
    try {
      await updateSiteSection(activeSection, content[activeSection]);
      setMsg({ type: "success", text: "Section sauvegardée avec succès !" });
    } catch (e) {
      setMsg({ type: "error", text: "Erreur : " + e.message });
    }
    setSaving(false);
  };

  const handleReset = () => {
    if (!content) return;
    const def = DEFAULT_CONTENT[activeSection];
    if (def) {
      setContent({ ...content, [activeSection]: JSON.parse(JSON.stringify(def)) });
      setMsg({ type: "info", text: "Contenu remis par défaut (non sauvegardé)" });
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Chargement du contenu…</div>;

  const SectionEditor = EDITORS[activeSection];
  const sectionData = content?.[activeSection] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ background: "#0F2044", borderRadius: 13, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#C49A3C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>🌐</span>
        </div>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>Gestion du Site Web</h2>
          <p style={{ fontSize: 10, color: "#4A6480", margin: 0, marginTop: 2 }}>Modifiez le contenu affiché sur la page d'accueil publique</p>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: msg.type === "success" ? "#F0FDF4" : msg.type === "error" ? "#FEF2F2" : "#EFF6FF",
          color: msg.type === "success" ? "#16A34A" : msg.type === "error" ? "#DC2626" : "#2563EB",
          border: `1px solid ${msg.type === "success" ? "#BBF7D0" : msg.type === "error" ? "#FECACA" : "#BFDBFE"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "inherit" }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 16 }}>
        {/* Sélecteur de section */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: 8, height: "fit-content" }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setMsg(null); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: activeSection === s.id ? 700 : 500,
                background: activeSection === s.id ? "#0F2044" : "transparent",
                color: activeSection === s.id ? "#fff" : "#334155",
                marginBottom: 2, transition: "all 0.15s",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Éditeur */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: isMobile ? 16 : 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F2044", margin: 0 }}>
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleReset} style={{ ...btnDanger, fontSize: 12, padding: "8px 14px" }}>
                Réinitialiser
              </button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Enregistrement…" : "Sauvegarder"}
              </button>
            </div>
          </div>

          {SectionEditor && (
            <SectionEditor
              data={sectionData}
              setData={(newData) => setContent({ ...content, [activeSection]: newData })}
            />
          )}
        </div>
      </div>
    </div>
  );
};
