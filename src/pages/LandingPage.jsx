import { useState } from "react";

export const LandingPage = ({ onSignup, onLogin, isMobile }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F7F4EF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --navy: #1A2744;
          --navy-2: #243558;
          --gold: #C49A3C;
          --gold-lt: #E8C96A;
          --gold-text: #8A6518;
          --cream: #F7F4EF;
          --cream-2: #EDE9E2;
          --ink: #1A1A1A;
          --muted: #5E6977;
          --border: #DDD9D0;
          --white: #FFFFFF;
          --green: #16A34A;
          --r: 16px;
          --r-sm: 12px;
          --r-md: 20px;
          --r-lg: 24px;
        }

        /* Remove the browser's default body margin so #root fills the full
           viewport width and lines up with the position:fixed header.
           Reserve the scrollbar gutter so both share the same available
           width and their centered 1100px containers line up exactly. */
        html {
          scrollbar-gutter: stable;
        }
        body {
          margin: 0;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.8); }
        }

        @keyframes float-left {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes float-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        /* Hover effects */
        .nav-link:hover {
          color: rgba(255,255,255,1) !important;
        }

        .feat-card {
          cursor: pointer;
        }

        .feat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }

        .sec-card {
          cursor: pointer;
        }

        .sec-card:hover {
          background: rgba(255,255,255,.07);
        }

        .price-card {
          cursor: pointer;
        }

        .price-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(26,39,68,.12);
        }

        .testi-card {
          cursor: pointer;
        }

        .testi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }

        .problem-item {
          cursor: pointer;
        }

        .problem-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
          border-color: #CBD5E1;
        }

        .footer-link:hover {
          color: rgba(255,255,255,1) !important;
        }

        .social-link {
          cursor: pointer;
        }

        .social-link:hover {
          background: rgba(255,255,255,.15) !important;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(26,39,68,.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.07)"
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "64px"
        }}>
          <button onClick={scrollToTop} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "transparent", border: "none", cursor: "pointer", padding: 0
          }}>
            <div style={{
              width: "34px", height: "34px", background: "var(--gold)",
              borderRadius: "8px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", fontWeight: "800"
            }}>SP</div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "19px", fontWeight: "700", color: "#fff", letterSpacing: "-.3px"
            }}>SyndicPro</span>
          </button>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <a href="#fonctionnalites" className="nav-link" style={{ color: "rgba(255,255,255,.82)", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s" }}>Fonctionnalités</a>
              <a href="#tarifs" className="nav-link" style={{ color: "rgba(255,255,255,.82)", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s" }}>Tarifs</a>
              <a href="#securite" className="nav-link" style={{ color: "rgba(255,255,255,.82)", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s" }}>Sécurité</a>
              <a href="#faq" className="nav-link" style={{ color: "rgba(255,255,255,.82)", textDecoration: "none", fontSize: "14px", fontWeight: "500", transition: "color 0.2s" }}>FAQ</a>
              <button onClick={onLogin} style={{
                background: "transparent", color: "rgba(255,255,255,.9)",
                padding: "8px 16px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", border: "1px solid rgba(255,255,255,.25)", cursor: "pointer",
                transition: "all 0.2s"
              }}>Se connecter</button>
              <button onClick={onSignup} style={{
                background: "var(--gold)", color: "var(--navy)",
                padding: "8px 20px", borderRadius: "8px",
                fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer",
                transition: "all 0.2s"
              }} onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                 onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}>Créer mon compte</button>
            </div>
          )}
          {isMobile && (
            <button onClick={onSignup} style={{
              background: "var(--gold)", color: "var(--navy)",
              padding: "6px 16px", borderRadius: "8px",
              fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer"
            }}>Créer un compte</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: "100vh",
        background: "var(--navy)",
        display: "flex", alignItems: "center",
        padding: isMobile ? "100px 16px 60px" : "120px 24px 80px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background effects */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "-20%", right: "-10%",
            width: "700px", height: "700px",
            background: "radial-gradient(circle, rgba(196,154,60,.12) 0%, transparent 65%)",
            borderRadius: "50%"
          }} />
          <div style={{
            position: "absolute", bottom: "-15%", left: "-5%",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(196,154,60,.07) 0%, transparent 65%)",
            borderRadius: "50%"
          }} />
        </div>

        <div style={{
          position: "relative",
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "40px" : "80px", alignItems: "center",
          maxWidth: "1100px", margin: "0 auto", width: "100%"
        }}>
          {/* Hero Content */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(196,154,60,.15)", border: "1px solid rgba(196,154,60,.35)",
              color: "var(--gold-lt)", padding: "6px 16px", borderRadius: "99px",
              fontSize: "12px", fontWeight: "600", letterSpacing: ".06em",
              textTransform: "uppercase", marginBottom: "28px"
            }}>
              <span style={{
                width: "6px", height: "6px", background: "var(--gold)",
                borderRadius: "50%", animation: "pulse 2s infinite"
              }} />
              Solution SaaS pour le Sénégal
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "32px" : "clamp(38px, 5vw, 62px)",
              fontWeight: "800", color: "#fff", lineHeight: "1.1",
              letterSpacing: "-.5px", marginBottom: "24px"
            }}>
              Gérez vos <em style={{ fontStyle: "normal", color: "var(--gold-lt)" }}>copropriétés</em> en toute simplicité
            </h1>

            <p style={{
              color: "rgba(255,255,255,.78)", fontSize: "17px",
              lineHeight: "1.75", marginBottom: "40px", fontWeight: "300"
            }}>
              Le logiciel dédié aux syndics professionnels et bénévoles au Sénégal : comptabilité réglementaire, convocations AG, gestion des charges et assistant IA. Solution complète et 100% locale.
            </p>

            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={onSignup} style={{
                background: "var(--gold)", color: "var(--navy)",
                padding: isMobile ? "14px 24px" : "17px 36px",
                borderRadius: isMobile ? "10px" : "12px",
                fontSize: isMobile ? "15px" : "17px", fontWeight: "700",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(196,154,60,.3)",
                whiteSpace: "nowrap"
              }}>Commencer gratuitement</button>
              <button style={{
                color: "rgba(255,255,255,.8)",
                border: "2px solid rgba(255,255,255,.25)",
                padding: isMobile ? "14px 24px" : "16px 32px",
                borderRadius: isMobile ? "10px" : "12px",
                fontSize: isMobile ? "15px" : "17px", fontWeight: "500",
                background: "transparent", cursor: "pointer",
                whiteSpace: "nowrap"
              }}>Voir la démo</button>
            </div>

            <div style={{ marginTop: "36px", display: "flex", alignItems: "center", gap: "12px", color: "rgba(255,255,255,.82)", fontSize: "13px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {["AS", "MD", "BC", "SF"].map((initials, i) => (
                  <span key={i} style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    border: "2px solid var(--navy)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: "700", color: "#fff",
                    marginLeft: i === 0 ? "0" : "-6px",
                    background: ["#5B6FA8", "#7B5EA7", "#3D7D6A", "#B87333"][i]
                  }}>{initials}</span>
                ))}
              </div>
              <span>Déjà adopté par 50+ copropriétés à Dakar</span>
            </div>
          </div>

          {/* Hero Visual */}
          {!isMobile && (
            <div style={{ position: "relative" }}>
              <div style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: "var(--r-md)", padding: "28px",
                backdropFilter: "blur(8px)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "24px"
                }}>
                  <div style={{
                    color: "rgba(255,255,255,.5)", fontSize: "12px",
                    fontWeight: "600", textTransform: "uppercase", letterSpacing: ".08em"
                  }}>Vue d'ensemble</div>
                  <div style={{
                    background: "rgba(22,163,74,.2)", color: "#4ade80",
                    fontSize: "11px", fontWeight: "700", padding: "3px 10px",
                    borderRadius: "99px"
                  }}>À jour</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px", fontWeight: "700", color: "#fff", lineHeight: "1"
                    }}>32</div>
                    <div style={{ color: "rgba(255,255,255,.4)", fontSize: "11px", marginTop: "4px" }}>Immeubles actifs</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,.06)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px", fontWeight: "700", color: "#fff", lineHeight: "1"
                    }}>847</div>
                    <div style={{ color: "rgba(255,255,255,.4)", fontSize: "11px", marginTop: "4px" }}>Lots gérés</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: "700"
                    }}>U</div>
                    <div style={{
                      padding: "8px 12px", borderRadius: "10px",
                      fontSize: "12px", lineHeight: "1.5",
                      background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.75)"
                    }}>Quel est le solde actuel de l'immeuble Résidence Almadies ?</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: "row-reverse" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "var(--gold)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px"
                    }}>🤖</div>
                    <div style={{
                      padding: "8px 12px", borderRadius: "10px",
                      fontSize: "12px", lineHeight: "1.5",
                      background: "rgba(196,154,60,.2)", color: "rgba(255,255,255,.9)"
                    }}>Solde : 12.450.000 FCFA. 3 impayés en cours. Taux de recouvrement : 94%</div>
                  </div>
                </div>
              </div>

              {/* Float badges */}
              <div style={{
                position: "absolute", left: "-40px", bottom: "60px",
                background: "var(--white)", borderRadius: "12px", padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,.2)",
                display: "flex", alignItems: "center", gap: "10px",
                whiteSpace: "nowrap", animation: "float-left 4s ease-in-out infinite"
              }}>
                <span style={{ fontSize: "22px" }}>💰</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)", lineHeight: "1.3" }}>Économie moyenne</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "400" }}>1.5M FCFA/an vs syndic</div>
                </div>
              </div>
              <div style={{
                position: "absolute", right: "-20px", top: "40px",
                background: "var(--white)", borderRadius: "12px", padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,.2)",
                display: "flex", alignItems: "center", gap: "10px",
                whiteSpace: "nowrap", animation: "float-right 4s ease-in-out infinite 1s"
              }}>
                <span style={{ fontSize: "22px" }}>⚡</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)", lineHeight: "1.3" }}>Installation 24h</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "400" }}>Migration gratuite</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Proof Bar */}
      <div style={{
        background: "var(--white)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "20px 16px" : "20px 24px"
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: isMobile ? "20px" : "40px", flexWrap: "wrap"
        }}>
          {[
            { icon: "🛡️", text: "Conforme OHADA" },
            { icon: "🔒", text: "Données au Sénégal" },
            { icon: "📊", text: "Comptabilité certifiée" },
            { icon: "🤖", text: "Assistant IA intégré" },
            !isMobile && { icon: "📞", text: "Support local" }
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "8px",
              color: "var(--navy)", fontSize: isMobile ? "12px" : "13px", fontWeight: "600"
            }}>
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Problem Section */}
      <section style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--cream)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "56px" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: "14px"
            }}>Le problème</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 44px)",
              fontWeight: "700", color: "var(--navy)",
              lineHeight: "1.15", letterSpacing: "-.3px", marginBottom: "16px"
            }}>Votre syndic vous coûte<br />trop cher pour ce qu'il fait.</h2>
            <p style={{
              fontSize: "17px", color: "var(--muted)",
              fontWeight: "300", lineHeight: "1.7", maxWidth: "700px"
            }}>
              Les honoraires explosent, la réactivité disparaît. Il existe une alternative légale, plus économique — et SyndicPro la rend accessible à tous au Sénégal.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "32px" : "48px",
            alignItems: "start"
          }}>
            {/* Problems List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  icon: "💸",
                  title: "Honoraires opaques en hausse constante",
                  desc: "500.000 à 1.500.000 FCFA/an pour un immeuble standard. Avec des frais \"extra\" qui s'accumulent à chaque intervention."
                },
                {
                  icon: "⏰",
                  title: "Réactivité inexistante",
                  desc: "Une fuite, un ascenseur en panne — et vous attendez des semaines une réponse par email."
                },
                {
                  icon: "📋",
                  title: "Comptes illisibles, AG inutiles",
                  desc: "Des documents complexes conçus pour décourager les questions plutôt que pour informer les copropriétaires."
                },
                {
                  icon: "🚪",
                  title: "Changer de syndic = un parcours du combattant",
                  desc: "Vote en AG, délai de préavis, récupération des archives… Personne ne vous guide dans la transition."
                }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: isMobile ? "16px 14px" : "18px 20px",
                  transition: "all 0.2s ease"
                }} className="problem-item">
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(239,68,68,.08)",
                    border: "1px solid rgba(239,68,68,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0
                  }}>{item.icon}</div>
                  <div>
                    <h3 style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--navy)",
                      marginBottom: "6px",
                      lineHeight: "1.3"
                    }}>{item.title}</h3>
                    <p style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      lineHeight: "1.5"
                    }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Solution Box */}
            <div style={{
              background: "var(--navy)",
              borderRadius: "var(--r-md)",
              padding: isMobile ? "32px 24px" : "40px 36px",
              color: "#fff"
            }}>
              <h3 style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "700",
                marginBottom: "24px",
                color: "var(--gold-lt)"
              }}>La solution : le syndic moderne avec SyndicPro</h3>
              <ul style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "32px"
              }}>
                {[
                  "Vous gérez votre immeuble vous-même, avec nos outils",
                  "L'IA répond à toutes vos questions en français ou wolof",
                  "La comptabilité OHADA, les AG et les relances sont automatisées",
                  "Nous prenons en charge votre transition depuis votre ancien syndic",
                  "Un juriste disponible par téléphone pour les cas complexes"
                ].map((text, i) => (
                  <li key={i} style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                    display: "flex",
                    gap: "10px",
                    color: "rgba(255,255,255,.9)"
                  }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0 }}>✓</span>
                    {text}
                  </li>
                ))}
              </ul>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                paddingTop: "24px",
                borderTop: "1px solid rgba(255,255,255,.15)"
              }}>
                {[
                  { num: "−70%", label: "sur vos charges" },
                  { num: "48h", label: "pour être opérationnel" },
                  { num: "0 FCFA", label: "frais de migration" }
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: isMobile ? "24px" : "28px",
                      fontWeight: "700",
                      color: "var(--gold-lt)",
                      marginBottom: "4px"
                    }}>{stat.num}</div>
                    <div style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,.6)",
                      lineHeight: "1.3"
                    }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--white)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: "14px"
            }}>Fonctionnalités</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 44px)",
              fontWeight: "700", color: "var(--navy)",
              lineHeight: "1.15", letterSpacing: "-.3px", marginBottom: "16px"
            }}>Tout ce dont un syndic a besoin. Dans un seul outil.</h2>
            <p style={{
              fontSize: "17px", color: "var(--muted)",
              fontWeight: "300", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto"
            }}>
              De la comptabilité à la gestion des travaux, SyndicPro couvre toutes vos obligations avec un assistant IA pour vous guider.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "24px"
          }}>
            {[
              {
                icon: "📊",
                title: "Comptabilité & trésorerie",
                desc: "Plan comptable OHADA, appels de fonds, suivi bancaire et clôture d'exercice en quelques clics."
              },
              {
                icon: "👥",
                title: "Assemblées générales",
                desc: "Convocations automatiques, gestion des votes, PV généré par l'IA. Conformité garantie."
              },
              {
                icon: "🤖",
                title: "Assistant IA 24h/24",
                desc: "Posez vos questions en français ou en wolof. L'IA lit votre base de données en temps réel."
              },
              {
                icon: "🔧",
                title: "Tickets & travaux",
                desc: "Suivi des incidents, gestion des devis, carnet d'entretien, recherche d'artisans qualifiés."
              },
              {
                icon: "🔔",
                title: "Relances automatiques",
                desc: "Détection des impayés, envoi de relances graduées sans intervention manuelle."
              },
              {
                icon: "📱",
                title: "Espace copropriétaire",
                desc: "Application mobile pour chaque copropriétaire : solde, historique, tickets, documents."
              }
            ].map((feat, i) => (
              <div key={i} className="feat-card" style={{
                background: "var(--cream)", borderRadius: "var(--r)", padding: "32px",
                border: "1px solid var(--border)", transition: "all .3s"
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "var(--r-sm)",
                  background: "var(--white)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "20px", fontSize: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,.06)"
                }}>{feat.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "600", color: "var(--navy)", marginBottom: "8px" }}>{feat.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: "1.65" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section - Adapted for Senegal */}
      <section id="securite" style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--navy)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--gold-lt)", marginBottom: "14px"
            }}>Sécurité & Conformité</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 44px)",
              fontWeight: "700", color: "#fff",
              lineHeight: "1.15", letterSpacing: "-.3px", marginBottom: "16px"
            }}>Conforme. Sécurisé. Certifié.</h2>
            <p style={{
              fontSize: "17px", color: "rgba(255,255,255,.78)",
              fontWeight: "300", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto"
            }}>
              La gestion d'une copropriété engage votre responsabilité. SyndicPro est conçu pour vous protéger selon la législation sénégalaise.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: "24px"
          }}>
            {[
              {
                icon: "⚖️",
                title: "Conforme au droit sénégalais",
                desc: "Application stricte des dispositions du Code des Obligations Civiles et Commerciales (COCC) en matière de copropriété."
              },
              {
                icon: "📋",
                title: "Comptabilité OHADA",
                desc: "Respect du plan comptable OHADA et des normes SYSCOHADA pour une comptabilité conforme et auditée."
              },
              {
                icon: "🔐",
                title: "Données hébergées au Sénégal",
                desc: "Serveurs locaux à Dakar. Chiffrement AES-256, sauvegardes quotidiennes, conformité DPD (Direction Protection Données)."
              },
              {
                icon: "👨‍⚖️",
                title: "Expert juridique disponible",
                desc: "Un juriste spécialisé en droit immobilier sénégalais disponible pour répondre à vos questions complexes."
              },
              {
                icon: "🏦",
                title: "Traçabilité bancaire",
                desc: "Intégration avec les banques locales (BICIS, SGBS, BOA, etc.) pour une réconciliation automatique sécurisée."
              },
              {
                icon: "📞",
                title: "Support local en français & wolof",
                desc: "Équipe basée à Dakar, disponible en français et en wolof pour vous accompagner au quotidien."
              }
            ].map((item, i) => (
              <div key={i} className="sec-card" style={{
                background: "rgba(255,255,255,.05)", borderRadius: "var(--r)",
                padding: "28px", border: "1px solid rgba(255,255,255,.1)",
                transition: "all .3s"
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "var(--r-sm)",
                  background: "rgba(196,154,60,.15)", border: "1px solid rgba(196,154,60,.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "16px", fontSize: "24px"
                }}>{item.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#fff", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,.7)", lineHeight: "1.65" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--cream)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: "14px"
            }}>Tarifs transparents</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 44px)",
              fontWeight: "700", color: "var(--navy)",
              lineHeight: "1.15", letterSpacing: "-.3px", marginBottom: "16px"
            }}>Un prix fixe. Pas de surprise.</h2>
            <p style={{
              fontSize: "17px", color: "var(--muted)",
              fontWeight: "300", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto"
            }}>
              Tarif adapté au marché sénégalais. Un forfait mensuel en FCFA, tout inclus.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "24px", alignItems: "end"
          }}>
            {[
              {
                name: "Essentiel",
                lots: "Jusqu'à 15 lots",
                price: "29.000",
                tag: "Essentiel",
                features: [
                  "Comptabilité complète OHADA",
                  "Gestion des copropriétaires",
                  "Convocations & PV d'AG",
                  "Relances impayés",
                  "Espace copropriétaire mobile",
                  "Support par email"
                ],
                cta: "Commencer",
                featured: false
              },
              {
                name: "Confort",
                lots: "16 à 30 lots",
                price: "49.000",
                tag: "⭐ Populaire",
                features: [
                  "Tout l'Essentiel",
                  "Assistant IA illimité",
                  "Gestion appels d'offres",
                  "Carnet d'entretien complet",
                  "Rapports financiers avancés",
                  "Support téléphonique"
                ],
                cta: "Commencer",
                featured: true
              },
              {
                name: "Sur-mesure",
                lots: "Plus de 30 lots",
                price: "Sur devis",
                tag: "Sur-mesure",
                features: [
                  "Tout le Confort",
                  "Multi-immeubles",
                  "Compte bancaire dédié",
                  "Juriste attitré",
                  "Formation sur site",
                  "SLA prioritaire 4h"
                ],
                cta: "Nous contacter",
                featured: false
              }
            ].map((plan, i) => (
              <div key={i} className="price-card" style={{
                background: plan.featured ? "var(--navy)" : "var(--white)",
                borderRadius: "var(--r-md)", padding: "36px",
                border: `1px solid ${plan.featured ? "var(--navy)" : "var(--border)"}`,
                transform: plan.featured ? "scale(1.04)" : "none",
                boxShadow: plan.featured ? "0 20px 60px rgba(26,39,68,.25)" : "none",
                transition: "all .3s"
              }}>
                <div style={{
                  background: plan.featured ? "rgba(196,154,60,.2)" : "rgba(26,39,68,.08)",
                  color: plan.featured ? "var(--gold-lt)" : "var(--navy)",
                  fontSize: "11px", fontWeight: "700", padding: "4px 12px",
                  borderRadius: "99px", display: "inline-block", marginBottom: "16px"
                }}>{plan.tag}</div>

                <div style={{
                  fontSize: "24px", fontWeight: "700",
                  color: plan.featured ? "#fff" : "var(--navy)",
                  marginBottom: "8px"
                }}>{plan.name}</div>

                <div style={{
                  fontSize: "13px", color: plan.featured ? "rgba(255,255,255,.6)" : "var(--muted)",
                  marginBottom: "24px"
                }}>{plan.lots}</div>

                <div style={{ marginBottom: "20px" }}>
                  {plan.price !== "Sur devis" ? (
                    <>
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "42px", fontWeight: "700",
                        color: plan.featured ? "#fff" : "var(--navy)"
                      }}>{plan.price}</span>
                      <span style={{
                        fontSize: "16px",
                        color: plan.featured ? "rgba(255,255,255,.6)" : "var(--muted)"
                      }}> FCFA/mois</span>
                    </>
                  ) : (
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "36px", fontWeight: "700",
                      color: "var(--navy)"
                    }}>{plan.price}</span>
                  )}
                </div>

                <div style={{
                  fontSize: "12px",
                  color: plan.featured ? "rgba(255,255,255,.6)" : "var(--muted)",
                  marginBottom: "20px"
                }}>✓ 14 jours d'essai gratuits</div>

                <div style={{
                  height: "1px",
                  background: plan.featured ? "rgba(255,255,255,.1)" : "var(--border)",
                  marginBottom: "24px"
                }} />

                <ul style={{ listStyle: "none", marginBottom: "32px" }}>
                  {plan.features.map((feature, j) => (
                    <li key={j} style={{
                      fontSize: "14px", marginBottom: "12px",
                      color: plan.featured ? "rgba(255,255,255,.85)" : "var(--ink)",
                      display: "flex", gap: "8px"
                    }}>
                      <span style={{ color: plan.featured ? "var(--gold-lt)" : "var(--green)" }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button onClick={onSignup} style={{
                  width: "100%",
                  background: plan.featured ? "var(--gold)" : "var(--navy)",
                  color: plan.featured ? "var(--navy)" : "#fff",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer"
                }}>{plan.cta} →</button>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: "center", marginTop: "40px",
            fontSize: "13px", color: "var(--muted)"
          }}>
            Pas de frais cachés · Résiliation à tout moment · Support inclus
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--cream)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: "14px"
            }}>Témoignages</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 40px)",
              fontWeight: "700", color: "var(--navy)",
              lineHeight: "1.15", letterSpacing: "-.3px", marginBottom: "16px"
            }}>Ils ont franchi le pas</h2>
            <p style={{
              fontSize: "17px", color: "var(--muted)",
              fontWeight: "300", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto"
            }}>
              Des présidents de conseil syndical et gestionnaires d'immeubles à Dakar comme vous.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "24px"
          }}>
            {[
              {
                stars: 5,
                text: "Notre ancien syndic nous coûtait 850.000 FCFA/an. Avec SyndicPro, on paie 49.000 FCFA/mois et on gère tout nous-mêmes. La migration a pris 48h et le support était disponible à chaque étape.",
                initials: "AM",
                name: "Amadou M.",
                role: "Président CS — 24 lots, Almadies"
              },
              {
                stars: 5,
                text: "Ce que j'apprécie le plus, c'est l'IA. Je pose mes questions en wolof, elle me répond avec les chiffres exacts de notre copropriété. C'est comme avoir un expert comptable disponible 24h/24.",
                initials: "FB",
                name: "Fatou B.",
                role: "Gestionnaire — 18 lots, Mermoz"
              },
              {
                stars: 5,
                text: "L'AG de mars était la première que j'organisais seul. Convocations envoyées en 3 clics, PV généré automatiquement. Zéro erreur de procédure. Je ne retournerai jamais à un syndic classique.",
                initials: "IK",
                name: "Ibrahima K.",
                role: "Président CS — 16 lots, Plateau"
              }
            ].map((testimonial, i) => (
              <div key={i} className="testi-card" style={{
                background: "var(--white)",
                borderRadius: "var(--r)",
                padding: isMobile ? "28px 24px" : "32px 28px",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                transition: "all .3s"
              }}>
                <div style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "16px",
                  fontSize: "18px",
                  color: "var(--gold)"
                }}>
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p style={{
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "var(--ink)",
                  marginBottom: "24px",
                  flex: 1
                }}>"{testimonial.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--navy)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "var(--gold)",
                    flexShrink: 0
                  }}>{testimonial.initials}</div>
                  <div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--navy)",
                      marginBottom: "2px"
                    }}>{testimonial.name}</div>
                    <div style={{
                      fontSize: "12px",
                      color: "var(--muted)"
                    }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--white)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ marginBottom: isMobile ? "40px" : "64px", textAlign: "center" }}>
            <div style={{
              fontSize: "11px", fontWeight: "700", letterSpacing: ".12em",
              textTransform: "uppercase", color: "var(--navy)", marginBottom: "14px"
            }}>Questions fréquentes</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? "28px" : "clamp(28px, 4vw, 40px)",
              fontWeight: "700", color: "var(--navy)",
              lineHeight: "1.15", letterSpacing: "-.3px"
            }}>Tout ce que vous voulez savoir sur SyndicPro</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                q: "Qu'est-ce que SyndicPro ?",
                a: "SyndicPro est un logiciel de gestion de copropriété conçu pour les <strong>syndics professionnels et bénévoles au Sénégal</strong>. Il couvre la comptabilité OHADA, les assemblées générales, la gestion des charges et intègre un <strong>assistant IA</strong> pour vous accompagner dans toutes vos démarches."
              },
              {
                q: "Combien coûte SyndicPro ?",
                a: "SyndicPro est disponible à partir de <strong>29.000 FCFA/mois</strong> (formule Essentiel pour jusqu'à 15 lots). La formule Confort est à 49.000 FCFA/mois (16-30 lots). Les deux formules incluent un essai gratuit de 14 jours sans engagement et sans carte bancaire."
              },
              {
                q: "SyndicPro est-il conforme à la législation sénégalaise ?",
                a: "Oui, totalement. SyndicPro respecte le <strong>Code des Obligations Civiles et Commerciales (COCC)</strong> du Sénégal et applique les normes <strong>OHADA</strong> pour la comptabilité. Toutes les procédures (AG, convocations, votes) sont conformes à la réglementation en vigueur."
              },
              {
                q: "SyndicPro convient-il à ma taille de copropriété ?",
                a: "SyndicPro s'adapte aux copropriétés de <strong>2 à 100 lots</strong>. Il est particulièrement efficace pour les petites et moyennes copropriétés (5 à 50 lots) qui souhaitent une gestion moderne et professionnelle."
              },
              {
                q: "Peut-on migrer depuis notre système actuel vers SyndicPro ?",
                a: "Oui. Notre équipe à Dakar accompagne la transition : récupération des données comptables, paramétrage de la copropriété, formation des utilisateurs. La migration est <strong>gratuite et prise en charge</strong> par nos experts."
              },
              {
                q: "Faut-il des compétences comptables pour utiliser SyndicPro ?",
                a: "Non. SyndicPro est conçu pour des <strong>non-comptables</strong>. La saisie des dépenses, la répartition des charges et la clôture d'exercice sont guidées pas à pas. L'assistant IA répond à vos questions en temps réel, en français ou en wolof."
              },
              {
                q: "SyndicPro remplace-t-il vraiment un syndic professionnel ?",
                a: "SyndicPro est utilisé autant par les <strong>syndics professionnels</strong> que par les <strong>syndics bénévoles</strong>. Pour la grande majorité des copropriétés de moins de 50 lots, il couvre toutes les obligations : comptabilité OHADA, AG, gestion des charges, relances, espace copropriétaire."
              },
              {
                q: "Combien de temps prend la gestion avec SyndicPro ?",
                a: "En moyenne, nos utilisateurs consacrent <strong>1 à 2 heures par mois</strong> à la gestion courante. La préparation d'une AG prend environ 2 heures avec SyndicPro grâce à l'automatisation et l'assistant IA."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Oui. Vos données sont hébergées sur des <strong>serveurs locaux à Dakar</strong> avec chiffrement AES-256 et sauvegardes quotidiennes. Nous sommes conformes aux normes de la Direction de la Protection des Données (DPD) du Sénégal. Vos données ne quittent jamais le territoire sénégalais."
              },
              {
                q: "Puis-je intégrer SyndicPro avec ma banque ?",
                a: "Oui. SyndicPro s'intègre avec les principales banques sénégalaises (<strong>BICIS, SGBS, BOA, Ecobank, UBA</strong>, etc.) pour la réconciliation bancaire automatique et le suivi des paiements en temps réel."
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "var(--cream)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r)",
                overflow: "hidden"
              }}>
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: "100%",
                    padding: isMobile ? "16px 20px" : "20px 28px",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{
                    fontSize: isMobile ? "15px" : "16px",
                    fontWeight: "600",
                    color: "var(--navy)",
                    flex: 1,
                    paddingRight: "16px"
                  }}>{item.q}</span>
                  <span style={{
                    fontSize: "24px",
                    fontWeight: "300",
                    color: "var(--gold)",
                    transition: "transform 0.3s",
                    transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                    flexShrink: 0
                  }}>+</span>
                </button>
                <div style={{
                  maxHeight: openFaq === i ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease-in-out"
                }}>
                  <div style={{
                    padding: isMobile ? "0 20px 20px" : "0 28px 24px",
                    fontSize: "14px",
                    lineHeight: "1.7",
                    color: "var(--muted)"
                  }} dangerouslySetInnerHTML={{ __html: item.a }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: isMobile ? "60px 16px" : "96px 24px", background: "var(--navy)", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? "28px" : "clamp(32px, 4vw, 48px)",
            fontWeight: "700", color: "#fff",
            lineHeight: "1.15", marginBottom: "20px"
          }}>
            Prêt à moderniser la gestion de vos copropriétés ?
          </h2>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,.78)",
            lineHeight: "1.7", marginBottom: "40px"
          }}>
            14 jours d'essai gratuits. Sans carte bancaire. Migration depuis votre système actuel prise en charge.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onSignup} style={{
              background: "var(--gold)", color: "var(--navy)",
              padding: isMobile ? "14px 28px" : "17px 36px",
              borderRadius: "12px",
              fontSize: isMobile ? "15px" : "17px", fontWeight: "700",
              border: "none", cursor: "pointer"
            }}>Créer mon compte gratuitement</button>
            <button style={{
              color: "rgba(255,255,255,.8)",
              border: "2px solid rgba(255,255,255,.25)",
              padding: isMobile ? "14px 24px" : "16px 32px",
              borderRadius: "12px",
              fontSize: isMobile ? "15px" : "17px", fontWeight: "500",
              background: "transparent", cursor: "pointer"
            }}>Contactez-nous →</button>
          </div>
          <p style={{
            marginTop: "32px", fontSize: "13px",
            color: "rgba(255,255,255,.5)"
          }}>
            Support 7j/7 · Aucun engagement · Formation incluse
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: isMobile ? "50px 16px 40px" : "80px 24px 40px", background: "var(--navy-2)", color: "rgba(255,255,255,.7)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Footer Top */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr",
            gap: isMobile ? "40px" : "48px",
            marginBottom: "48px"
          }}>
            {/* Company Info */}
            <div>
              <button onClick={scrollToTop} style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, marginBottom: "16px"
              }}>
                <div style={{
                  width: "38px", height: "38px", background: "var(--gold)",
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "22px", fontWeight: "800"
                }}>SP</div>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px", fontWeight: "700", color: "#fff", letterSpacing: "-.3px"
                }}>SyndicPro</span>
              </button>
              <p style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "20px", color: "rgba(255,255,255,.6)" }}>
                La solution moderne de gestion de copropriété pour le Sénégal. Conforme OHADA, assistant IA intégré, support local.
              </p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <a href="#" className="social-link" style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,.1)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                  fontSize: "18px", transition: "all .3s"
                }}>𝕏</a>
                <a href="#" className="social-link" style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,.1)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                  fontSize: "18px", transition: "all .3s"
                }}>in</a>
                <a href="#" className="social-link" style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,.1)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                  fontSize: "18px", transition: "all .3s"
                }}>f</a>
              </div>
            </div>

            {/* Product */}
            {!isMobile && (
              <>
                <div>
                  <h4 style={{
                    fontSize: "13px", fontWeight: "700", color: "#fff",
                    marginBottom: "16px", textTransform: "uppercase",
                    letterSpacing: ".08em"
                  }}>Produit</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li><a href="#fonctionnalites" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Fonctionnalités</a></li>
                    <li><a href="#tarifs" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Tarifs</a></li>
                    <li><a href="#securite" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Sécurité</a></li>
                    <li><a href="#faq" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>FAQ</a></li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h4 style={{
                    fontSize: "13px", fontWeight: "700", color: "#fff",
                    marginBottom: "16px", textTransform: "uppercase",
                    letterSpacing: ".08em"
                  }}>Ressources</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Documentation</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Guide de démarrage</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Vidéos tutoriels</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Blog</a></li>
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 style={{
                    fontSize: "13px", fontWeight: "700", color: "#fff",
                    marginBottom: "16px", textTransform: "uppercase",
                    letterSpacing: ".08em"
                  }}>Entreprise</h4>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>À propos</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Contact</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Carrières</a></li>
                    <li><a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", fontSize: "14px", transition: "color .2s" }}>Partenaires</a></li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Footer Bottom */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,.1)",
            paddingTop: "28px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "16px"
          }}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,.5)" }}>
              © 2026 SyndicPro. Tous droits réservés. Dakar, Sénégal 🇸🇳
            </div>
            <div style={{
              display: "flex",
              gap: isMobile ? "16px" : "24px",
              flexWrap: "wrap",
              fontSize: "13px"
            }}>
              <a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", transition: "color .2s" }}>Mentions légales</a>
              <a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", transition: "color .2s" }}>Confidentialité</a>
              <a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", transition: "color .2s" }}>CGV</a>
              <a href="#" className="footer-link" style={{ color: "rgba(255,255,255,.65)", textDecoration: "none", transition: "color .2s" }}>Cookies</a>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            justifyContent: "center",
            gap: isMobile ? "16px" : "32px",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "12px", color: "rgba(255,255,255,.5)"
            }}>
              <span style={{ fontSize: "16px" }}>🛡️</span>
              Conforme OHADA
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "12px", color: "rgba(255,255,255,.5)"
            }}>
              <span style={{ fontSize: "16px" }}>🔒</span>
              Hébergé au Sénégal
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "12px", color: "rgba(255,255,255,.5)"
            }}>
              <span style={{ fontSize: "16px" }}>✓</span>
              Certifié DPD
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              fontSize: "12px", color: "rgba(255,255,255,.5)"
            }}>
              <span style={{ fontSize: "16px" }}>📞</span>
              Support local
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
