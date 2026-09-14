import React, { useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import { showSuccessToast, showErrorToast, showConfirmAlert } from "../utils/alerts";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api`
  : "http://localhost:4000/api";

const PRESET_TRUCKS = [
  { name: "Kenworth T800 (Azul Showroom)", url: "/images/showroom/kenworth_after.jpg" },
  { name: "Mack Vision Elite (Rojo Rubí)", url: "/images/showroom/mack_truck_custom.jpg" },
  { name: "Peterbilt 389 (Verde Esmeralda)", url: "/images/showroom/peterbilt_truck_custom.jpg" },
  { name: "Bomper Detalle Acero 304", url: "/images/showroom/detail_bumper_chrome.jpg" },
  { name: "Kenworth Original (Llegada)", url: "/images/showroom/kenworth_before.jpg" },
];

export default function LandingEditorPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "contact" | "announcement" | "metrics" | "slider"
  const [config, setConfig] = useState(null);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const pinboardRef = React.useRef(null);

  const handlePinboardClick = (e) => {
    if (!pinboardRef.current) return;
    const currentHotspots = config?.beforeAfter?.hotspots || [];
    if (currentHotspots.length === 0) return;
    const targetIdx = activeHotspotIndex < currentHotspots.length ? activeHotspotIndex : 0;

    const rect = pinboardRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    let pctX = Math.round((clickX / rect.width) * 100);
    let pctY = Math.round((clickY / rect.height) * 100);
    if (pctX < 0) pctX = 0;
    if (pctX > 100) pctX = 100;
    if (pctY < 0) pctY = 0;
    if (pctY > 100) pctY = 100;

    const newHotspots = [...currentHotspots];
    newHotspots[targetIdx] = {
      ...newHotspots[targetIdx],
      x: pctX,
      y: pctY,
    };
    setConfig({
      ...config,
      beforeAfter: {
        ...config.beforeAfter,
        hotspots: newHotspots,
      },
    });
    showSuccessToast(`Punto #${targetIdx + 1} (${newHotspots[targetIdx].tag || "Accesorio"}) ubicado en (${pctX}%, ${pctY}%)`);
  };

  const handleAddHotspot = () => {
    const currentHotspots = config?.beforeAfter?.hotspots || [];
    const newSpot = {
      id: `spot_${Date.now()}`,
      tag: "LUCES ESTACIONARIAS",
      title: "Luces de Galería LED Ambar (Estacionarias)",
      subtitle: "Instalación de luces perimetrales de alta potencia en cabina y visera.",
      image: "/images/showroom/detail_visera_cornetas.jpg",
      x: 52,
      y: 20,
    };
    const updated = [...currentHotspots, newSpot];
    setConfig({
      ...config,
      beforeAfter: {
        ...config.beforeAfter,
        hotspots: updated,
      },
    });
    setActiveHotspotIndex(updated.length - 1);
    showSuccessToast("¡Punto creado! Haz clic sobre la foto para posicionarlo donde van las estacionarias.");
  };

  const handleDeleteHotspot = (indexToDelete) => {
    const currentHotspots = config?.beforeAfter?.hotspots || [];
    if (currentHotspots.length <= 1) {
      showErrorToast("Debe haber al menos 1 punto interactivo.");
      return;
    }
    const updated = currentHotspots.filter((_, idx) => idx !== indexToDelete);
    setConfig({
      ...config,
      beforeAfter: {
        ...config.beforeAfter,
        hotspots: updated,
      },
    });
    setActiveHotspotIndex(Math.max(0, indexToDelete - 1));
    showSuccessToast("Punto interactivo eliminado.");
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/settings/landing`);
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Error cargando configuración:", err);
      showErrorToast("Error al cargar la configuración de la landing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
      const res = await fetch(`${API_BASE}/settings/landing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        showSuccessToast("¡Página principal actualizada y en vivo con éxito!");
      } else {
        showErrorToast(data.message || "Error al guardar");
      }
    } catch (err) {
      console.error("Error guardando:", err);
      showErrorToast("No se pudo conectar con el servidor para guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirm = await showConfirmAlert(
      "¿Restaurar configuración original?",
      "Se restablecerán todos los textos, imágenes y métricas a los valores recomendados de fábrica."
    );
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
      const res = await fetch(`${API_BASE}/settings/landing/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        showSuccessToast("Configuración restablecida a los valores originales");
      }
    } catch (err) {
      console.error("Error restableciendo:", err);
      showErrorToast("Error al restablecer la configuración");
    }
  };

  if (loading || !config) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem auto" }}></div>
        <p>Cargando consola de personalización web...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "5rem" }}>
      {/* 1. Header de la Consola */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "1.2rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.4rem" }}>🎨</span>
            <h1 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#f8fafc", margin: 0 }}>
              Personalizar Landing Page Web
            </h1>
          </div>
          <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
            Modifica en tiempo real textos, números de WhatsApp, imágenes y promociones de la portada sin tocar código.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "0.65rem 1rem",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#cbd5e1",
              fontSize: "0.82rem",
              fontWeight: "700",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>👁️</span>
            <span>Ver Web en Vivo</span>
          </a>

          <button
            onClick={handleReset}
            style={{
              padding: "0.65rem 0.9rem",
              borderRadius: "8px",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
            title="Restaurar a los textos de fábrica"
          >
            🔄 Restaurar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="primary-btn"
            style={{
              padding: "0.65rem 1.4rem",
              fontSize: "0.88rem",
              fontWeight: "900",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>💾</span>
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </div>

      {/* 2. Selector de Pestañas */}
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          { id: "hero", label: "🚛 Hero & Portada", icon: "⚡" },
          { id: "contact", label: "📱 WhatsApp & Contacto", icon: "💬" },
          { id: "announcement", label: "📣 Barra de Anuncio", icon: "🔥" },
          { id: "metrics", label: "🏆 Métricas de Confianza", icon: "⭐" },
          { id: "slider", label: "⚡ Slider Antes/Después", icon: "🔄" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: "10px",
              border: "none",
              background: activeTab === tab.id ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#18181b",
              color: activeTab === tab.id ? "#000" : "#94a3b8",
              fontWeight: activeTab === tab.id ? "900" : "600",
              fontSize: "0.84rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Contenido de las Pestañas */}

      {/* TAB 1: HERO & PORTADA */}
      {activeTab === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "#14161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "#f59e0b", fontWeight: "900", margin: "0 0 1rem 0" }}>
              1. Textos Principales del Hero
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Badge Superior (Píldora pequeña)
                </label>
                <input
                  type="text"
                  value={config.hero.badgeText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, badgeText: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fbbf24",
                    fontWeight: "800",
                    fontSize: "0.88rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Gran Titular H1 (Impacto Principal)
                </label>
                <input
                  type="text"
                  value={config.hero.headline}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, headline: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(245,158,11,0.3)",
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: "1.05rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Párrafo Descriptivo
                </label>
                <textarea
                  rows="3"
                  value={config.hero.subtitle}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: { ...config.hero, subtitle: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#cbd5e1",
                    fontSize: "0.86rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Texto Botón Principal (CTA 1)
                  </label>
                  <input
                    type="text"
                    value={config.hero.ctaPrimaryText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, ctaPrimaryText: e.target.value },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#f59e0b",
                      fontWeight: "800",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Texto Botón Secundario (CTA 2)
                  </label>
                  <input
                    type="text"
                    value={config.hero.ctaSecondaryText}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: { ...config.hero, ctaSecondaryText: e.target.value },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#cbd5e1",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ficha de la Mula Protagonista del Hero */}
          <div style={{ background: "#14161f", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "#f59e0b", fontWeight: "900", margin: "0 0 1rem 0" }}>
              2. Mula Destacada en la Tarjeta de Portada
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.4rem" }}>
                  Foto de la Tractomula (16:9)
                </label>
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", marginBottom: "0.75rem", height: "160px", background: "#000" }}>
                  <img
                    src={config.hero.featuredTruck.imageUrl}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <ImageUploader
                  currentImage={config.hero.featuredTruck.imageUrl}
                  onUploadComplete={(url) =>
                    setConfig({
                      ...config,
                      hero: {
                        ...config.hero,
                        featuredTruck: { ...config.hero.featuredTruck, imageUrl: url },
                      },
                    })
                  }
                />

                <div style={{ marginTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700" }}>O selecciona un preset:</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                    {PRESET_TRUCKS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            hero: {
                              ...config.hero,
                              featuredTruck: { ...config.hero.featuredTruck, imageUrl: preset.url },
                            },
                          })
                        }
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#cbd5e1",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          fontSize: "0.72rem",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        🚚 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Etiqueta Superior
                  </label>
                  <input
                    type="text"
                    value={config.hero.featuredTruck.tag}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: {
                          ...config.hero,
                          featuredTruck: { ...config.hero.featuredTruck, tag: e.target.value },
                        },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fbbf24",
                      fontWeight: "800",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Modelo del Camión (Ej: Kenworth T800 Aerocab)
                  </label>
                  <input
                    type="text"
                    value={config.hero.featuredTruck.title}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: {
                          ...config.hero,
                          featuredTruck: { ...config.hero.featuredTruck, title: e.target.value },
                        },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Accesorios Destacados
                  </label>
                  <input
                    type="text"
                    value={config.hero.featuredTruck.specs}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: {
                          ...config.hero,
                          featuredTruck: { ...config.hero.featuredTruck, specs: e.target.value },
                        },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    Enlace / Magic Link Showroom
                  </label>
                  <input
                    type="text"
                    value={config.hero.featuredTruck.magicLink}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        hero: {
                          ...config.hero,
                          featuredTruck: { ...config.hero.featuredTruck, magicLink: e.target.value },
                        },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#38bdf8",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHATSAPP & CONTACTO */}
      {activeTab === "contact" && (
        <div style={{ background: "#14161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "#22c55e", fontWeight: "900", margin: "0 0 1.2rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>💬</span> Configuración Central de WhatsApp & Redes
          </h3>

          <div
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "10px",
              padding: "0.9rem",
              marginBottom: "1.5rem",
              fontSize: "0.82rem",
              color: "#86efac",
            }}
          >
            <strong>💡 Sincronización Automática:</strong> Al cambiar este número telefónico, se actualizarán en caliente todos los botones de la página principal (botón de la cabecera, botón flotante, cotizaciones de productos de la Tienda Container y formulario rápido).
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#f8fafc", marginBottom: "0.4rem" }}>
                Número Oficial de WhatsApp (Con código de país 57 sin símbolos ni espacios) *
              </label>
              <input
                type="text"
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value.replace(/\D/g, "") })}
                placeholder="Ej: 573104567890"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid #22c55e",
                  color: "#22c55e",
                  fontWeight: "900",
                  fontSize: "1.1rem",
                }}
              />
              <span style={{ display: "block", fontSize: "0.72rem", color: "#94a3b8", marginTop: "4px" }}>
                Formato: 57 + celular de 10 dígitos (Ej: 573104567890 para el 310 456 7890).
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Mensaje de Saludo Predeterminado
              </label>
              <textarea
                rows="2"
                value={config.whatsappDefaultMsg}
                onChange={(e) => setConfig({ ...config, whatsappDefaultMsg: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Usuario de Instagram
                </label>
                <input
                  type="text"
                  value={config.instagramUser}
                  onChange={(e) => setConfig({ ...config, instagramUser: e.target.value })}
                  placeholder="@mellos_trucks"
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Enlace Completo de Instagram
                </label>
                <input
                  type="text"
                  value={config.instagramUrl}
                  onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                  placeholder="https://www.instagram.com/mellos_trucks/"
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#38bdf8",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Ubicación / Ciudad del Taller (Mostrada en Footer)
              </label>
              <input
                type="text"
                value={config.locationText}
                onChange={(e) => setConfig({ ...config, locationText: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BARRA DE ANUNCIO */}
      {activeTab === "announcement" && (
        <div style={{ background: "#14161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "#f59e0b", fontWeight: "900", margin: 0 }}>
              📣 Barra Superior de Anuncio Promocional
            </h3>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "800", color: config.announcementBar.enabled ? "#34d399" : "#64748b" }}>
              <input
                type="checkbox"
                checked={config.announcementBar.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, enabled: e.target.checked },
                  })
                }
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              {config.announcementBar.enabled ? "ACTIVADA EN VIVO" : "DESACTIVADA"}
            </label>
          </div>

          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 0 }}>
            Muestra una barra delgada y elegante en el tope de la página para campañas de descuento, avisos de cupos o lanzamientos de nuevos accesorios.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Badge / Etiqueta Llamativa
              </label>
              <input
                type="text"
                value={config.announcementBar.badgeText}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, badgeText: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f59e0b",
                  fontWeight: "800",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Mensaje del Anuncio
              </label>
              <input
                type="text"
                value={config.announcementBar.message}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, message: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#f8fafc",
                  fontSize: "0.88rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Texto del Botón
                </label>
                <input
                  type="text"
                  value={config.announcementBar.buttonText}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBar: { ...config.announcementBar, buttonText: e.target.value },
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f8fafc",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                  Destino del Enlace
                </label>
                <input
                  type="text"
                  value={config.announcementBar.link}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBar: { ...config.announcementBar, link: e.target.value },
                    })
                  }
                  placeholder="#cotizar o URL completa"
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#0a0c10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#38bdf8",
                    fontSize: "0.85rem",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MÉTRICAS DE CONFIANZA */}
      {activeTab === "metrics" && (
        <div style={{ background: "#14161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "#f59e0b", fontWeight: "900", margin: "0 0 1rem 0" }}>
            🏆 Las 3 Tarjetas de Confianza del Hero
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: 0 }}>
            Estos datos aportan credibilidad inmediata a los dueños de flotas que visitan la web.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {config.metrics.map((metric, index) => (
              <div
                key={index}
                style={{
                  background: "#0b0d13",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "1.2rem",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#f59e0b", fontWeight: "800", textTransform: "uppercase" }}>
                  Métrica #{index + 1}
                </span>

                <div style={{ marginTop: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                    Cifra / Título
                  </label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => {
                      const newMetrics = [...config.metrics];
                      newMetrics[index].value = e.target.value;
                      setConfig({ ...config, metrics: newMetrics });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>
                    Leyenda / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => {
                      const newMetrics = [...config.metrics];
                      newMetrics[index].label = e.target.value;
                      setConfig({ ...config, metrics: newMetrics });
                    }}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "6px",
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#cbd5e1",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SLIDER ANTES Y DESPUÉS */}
      {activeTab === "slider" && (
        <div style={{ background: "#14161f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", color: "#f59e0b", fontWeight: "900", margin: "0 0 1rem 0" }}>
            ⚡ Comparador Interactivo de la Portada
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#ef4444", marginBottom: "0.35rem" }}>
                Foto "ANTES" (Llegada al Taller)
              </label>
              <div style={{ height: "160px", borderRadius: "10px", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "0.6rem" }}>
                <img src={config.beforeAfter.beforeImage} alt="Antes" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <ImageUploader
                currentImage={config.beforeAfter.beforeImage}
                onUploadComplete={(url) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, beforeImage: url },
                  })
                }
              />
              <input
                type="text"
                value={config.beforeAfter.beforeLabel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, beforeLabel: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  marginTop: "0.6rem",
                  padding: "0.6rem",
                  borderRadius: "6px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  fontSize: "0.8rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#22c55e", marginBottom: "0.35rem" }}>
                Foto "DESPUÉS" (Transformación Mellos Truck)
              </label>
              <div style={{ height: "160px", borderRadius: "10px", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "0.6rem" }}>
                <img src={config.beforeAfter.afterImage} alt="Después" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <ImageUploader
                currentImage={config.beforeAfter.afterImage}
                onUploadComplete={(url) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, afterImage: url },
                  })
                }
              />
              <input
                type="text"
                value={config.beforeAfter.afterLabel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, afterLabel: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  marginTop: "0.6rem",
                  padding: "0.6rem",
                  borderRadius: "6px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  fontSize: "0.8rem",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Título del Vehículo (Ej: Kenworth T800 • Placa WTL-892)
              </label>
              <input
                type="text"
                value={config.beforeAfter.truckTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, truckTitle: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "0.88rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.35rem" }}>
                Descripción de la Transformación Realizada
              </label>
              <input
                type="text"
                value={config.beforeAfter.truckDescription}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    beforeAfter: { ...config.beforeAfter, truckDescription: e.target.value },
                  })
                }
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "8px",
                  background: "#0a0c10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            {/* Ficha de Especificaciones de Taller */}
            <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.2rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "900", color: "#f59e0b", marginBottom: "0.8rem" }}>
                🛡️ Ficha Técnica de Taller (Garantía, Materiales & Tiempos)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.9rem" }}>
                {(config.beforeAfter?.specs || []).map((spec, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      background: "#0d0f17",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "0.8rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>{spec.icon}</span>
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const newSpecs = [...(config.beforeAfter.specs || [])];
                          newSpecs[sIdx].label = e.target.value;
                          setConfig({
                            ...config,
                            beforeAfter: { ...config.beforeAfter, specs: newSpecs },
                          });
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px solid #334155",
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          width: "100%",
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...(config.beforeAfter.specs || [])];
                        newSpecs[sIdx].value = e.target.value;
                        setConfig({
                          ...config,
                          beforeAfter: { ...config.beforeAfter, specs: newSpecs },
                        });
                      }}
                      style={{
                        background: "#161b26",
                        border: "1px solid #283244",
                        borderRadius: "6px",
                        padding: "0.5rem 0.7rem",
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        width: "100%",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Puntos Neón Interactivos (Hotspots) con Ubicación Visual & Subida de Fotos */}
            <div style={{ marginTop: "1.4rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "900", color: "#f59e0b", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📍</span>
                    <span>Puntos Neón Interactivos (Hotspots de Accesorios)</span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                    Agrega, ubica y sube fotos para cualquier mejora (estacionarias, bomper, visera, rines, etc.).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddHotspot}
                  className="primary-btn"
                  style={{
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.82rem",
                    fontWeight: "900",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <span>➕</span>
                  <span>Agregar Nuevo Punto (Ej: Estacionarias)</span>
                </button>
              </div>

              {/* 1. Pizarra Visual Interactiva: Haz Clic en la Foto para Ubicar el Punto */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1rem" }}>🎯</span>
                    <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: "800" }}>
                      UBICADOR VISUAL: Haz clic en cualquier parte de la foto para mover el Punto #{activeHotspotIndex + 1} (
                      {config.beforeAfter?.hotspots?.[activeHotspotIndex]?.tag || "Accesorio"})
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700" }}>
                    X: {config.beforeAfter?.hotspots?.[activeHotspotIndex]?.x || 50}% | Y: {config.beforeAfter?.hotspots?.[activeHotspotIndex]?.y || 50}%
                  </span>
                </div>

                {/* Contenedor Interactivo con la Foto de la Mula */}
                <div
                  ref={pinboardRef}
                  onClick={handlePinboardClick}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    maxHeight: "420px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "crosshair",
                    border: "2px solid rgba(245, 158, 11, 0.4)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                    background: "#000",
                  }}
                  title="Haz clic sobre cualquier parte de la mula para ubicar el punto seleccionado"
                >
                  <img
                    src={config.beforeAfter?.afterImage || "/images/showroom/kenworth_after.jpg"}
                    alt="Mula Mellos Truck"
                    style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                  />

                  {/* Pines renderizados sobre la foto */}
                  {(config.beforeAfter?.hotspots || []).map((spot, idx) => (
                    <div
                      key={spot.id || idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspotIndex(idx);
                      }}
                      style={{
                        position: "absolute",
                        top: `${spot.y}%`,
                        left: `${spot.x}%`,
                        transform: "translate(-50%, -50%)",
                        cursor: "pointer",
                        zIndex: activeHotspotIndex === idx ? 25 : 15,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: activeHotspotIndex === idx ? "36px" : "28px",
                          height: activeHotspotIndex === idx ? "36px" : "28px",
                          borderRadius: "50%",
                          background: activeHotspotIndex === idx ? "#f59e0b" : "#10141e",
                          border: activeHotspotIndex === idx ? "2.5px solid #fff" : "2px solid #f59e0b",
                          color: activeHotspotIndex === idx ? "#000" : "#f59e0b",
                          fontWeight: "900",
                          fontSize: activeHotspotIndex === idx ? "0.9rem" : "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: activeHotspotIndex === idx
                            ? "0 0 20px rgba(245, 158, 11, 0.9), 0 0 0 4px rgba(245, 158, 11, 0.3)"
                            : "0 0 10px rgba(0,0,0,0.8)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span
                        style={{
                          marginTop: "3px",
                          background: "rgba(0,0,0,0.85)",
                          border: "1px solid rgba(245, 158, 11, 0.5)",
                          color: "#fbbf24",
                          fontSize: "0.62rem",
                          fontWeight: "800",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {spot.tag || `PUNTO ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Píldoras Selectoras de Puntos */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.2rem" }}>
                {(config.beforeAfter?.hotspots || []).map((spot, idx) => (
                  <button
                    key={spot.id || idx}
                    type="button"
                    onClick={() => setActiveHotspotIndex(idx)}
                    style={{
                      background: activeHotspotIndex === idx ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#141722",
                      color: activeHotspotIndex === idx ? "#000" : "#cbd5e1",
                      border: activeHotspotIndex === idx ? "1px solid #f59e0b" : "1px solid #283244",
                      fontWeight: "800",
                      fontSize: "0.82rem",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>📍 Punto {idx + 1}:</span>
                    <span>{spot.tag || `Accesorio ${idx + 1}`}</span>
                  </button>
                ))}
              </div>

              {/* 3. Panel de Edición Detallada del Punto Seleccionado */}
              {config.beforeAfter?.hotspots?.[activeHotspotIndex] && (
                <div
                  style={{
                    background: "#0e111a",
                    border: "1.5px solid rgba(245, 158, 11, 0.35)",
                    borderRadius: "14px",
                    padding: "1.2rem 1.4rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                        color: "#000",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: "900",
                        fontSize: "0.9rem",
                      }}>
                        {activeHotspotIndex + 1}
                      </span>
                      <div>
                        <strong style={{ color: "#fff", fontSize: "0.95rem" }}>
                          Configurando Punto #{activeHotspotIndex + 1}: {config.beforeAfter.hotspots[activeHotspotIndex].tag}
                        </strong>
                        <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
                          Sube la foto macro y personaliza el título y texto que verá el cliente.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteHotspot(activeHotspotIndex)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        color: "#ef4444",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Eliminar Punto
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "1.5rem" }}>
                    {/* Subida de Imagen del Accesorio */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#f59e0b", marginBottom: "0.4rem" }}>
                        📸 Foto Macro del Accesorio
                      </label>
                      <div style={{ height: "120px", borderRadius: "8px", overflow: "hidden", background: "#000", border: "1px solid #334155", marginBottom: "0.5rem" }}>
                        <img
                          src={config.beforeAfter.hotspots[activeHotspotIndex].image}
                          alt="Detalle accesorio"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <ImageUploader
                        currentImage={config.beforeAfter.hotspots[activeHotspotIndex].image}
                        onUploadComplete={(url) => {
                          const newHotspots = [...config.beforeAfter.hotspots];
                          newHotspots[activeHotspotIndex].image = url;
                          setConfig({
                            ...config,
                            beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                          });
                          showSuccessToast("Foto del accesorio actualizada");
                        }}
                      />
                    </div>

                    {/* Campos de Información */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.3rem" }}>
                            Etiqueta Corta (TAG en mayúsculas)
                          </label>
                          <input
                            type="text"
                            value={config.beforeAfter.hotspots[activeHotspotIndex].tag}
                            onChange={(e) => {
                              const newHotspots = [...config.beforeAfter.hotspots];
                              newHotspots[activeHotspotIndex].tag = e.target.value.toUpperCase();
                              setConfig({
                                ...config,
                                beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                              });
                            }}
                            placeholder="EJ: LUCES ESTACIONARIAS"
                            style={{
                              width: "100%",
                              padding: "0.6rem",
                              borderRadius: "6px",
                              background: "#161b26",
                              border: "1px solid #283244",
                              color: "#fbbf24",
                              fontWeight: "900",
                              fontSize: "0.82rem",
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.3rem" }}>
                            Título del Accesorio
                          </label>
                          <input
                            type="text"
                            value={config.beforeAfter.hotspots[activeHotspotIndex].title}
                            onChange={(e) => {
                              const newHotspots = [...config.beforeAfter.hotspots];
                              newHotspots[activeHotspotIndex].title = e.target.value;
                              setConfig({
                                ...config,
                                beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                              });
                            }}
                            placeholder="EJ: Luces de Galería LED Ambar (Estacionarias)"
                            style={{
                              width: "100%",
                              padding: "0.6rem",
                              borderRadius: "6px",
                              background: "#161b26",
                              border: "1px solid #283244",
                              color: "#fff",
                              fontWeight: "800",
                              fontSize: "0.82rem",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", marginBottom: "0.3rem" }}>
                          Descripción / Especificaciones del Accesorio
                        </label>
                        <input
                          type="text"
                          value={config.beforeAfter.hotspots[activeHotspotIndex].subtitle}
                          onChange={(e) => {
                            const newHotspots = [...config.beforeAfter.hotspots];
                            newHotspots[activeHotspotIndex].subtitle = e.target.value;
                            setConfig({
                              ...config,
                              beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                            });
                          }}
                          placeholder="EJ: Montaje de luces sandía de alta potencia en visera y cabina."
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            borderRadius: "6px",
                            background: "#161b26",
                            border: "1px solid #283244",
                            color: "#cbd5e1",
                            fontSize: "0.82rem",
                          }}
                        />
                      </div>

                      {/* Ajuste Manual de Coordenadas X / Y */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", background: "#080a10", padding: "0.8rem", borderRadius: "8px", border: "1px solid #1e2433" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "800" }}>↔️ Posición Horizontal (X)</span>
                            <span style={{ fontSize: "0.72rem", color: "#f59e0b", fontWeight: "900" }}>{config.beforeAfter.hotspots[activeHotspotIndex].x}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.beforeAfter.hotspots[activeHotspotIndex].x}
                            onChange={(e) => {
                              const newHotspots = [...config.beforeAfter.hotspots];
                              newHotspots[activeHotspotIndex].x = Number(e.target.value);
                              setConfig({
                                ...config,
                                beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                              });
                            }}
                            style={{ width: "100%", accentColor: "#f59e0b" }}
                          />
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "800" }}>↕️ Posición Vertical (Y)</span>
                            <span style={{ fontSize: "0.72rem", color: "#f59e0b", fontWeight: "900" }}>{config.beforeAfter.hotspots[activeHotspotIndex].y}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.beforeAfter.hotspots[activeHotspotIndex].y}
                            onChange={(e) => {
                              const newHotspots = [...config.beforeAfter.hotspots];
                              newHotspots[activeHotspotIndex].y = Number(e.target.value);
                              setConfig({
                                ...config,
                                beforeAfter: { ...config.beforeAfter, hotspots: newHotspots },
                              });
                            }}
                            style={{ width: "100%", accentColor: "#f59e0b" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Barra Flotante Inferior de Guardado */}
      <div
        style={{
          position: "sticky",
          bottom: "16px",
          marginTop: "2rem",
          background: "rgba(18, 20, 26, 0.95)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: "14px",
          padding: "0.9rem 1.4rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 10px 35px rgba(0,0,0,0.8)",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <span style={{ fontSize: "0.82rem", color: "#cbd5e1", fontWeight: "700" }}>
            Los cambios se reflejarán de inmediato en la portada pública al guardar.
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="primary-btn"
            style={{
              padding: "0.7rem 1.6rem",
              fontSize: "0.88rem",
              fontWeight: "900",
              cursor: "pointer",
            }}
          >
            {saving ? "Guardando en Vivo..." : "💾 Guardar Cambios Ahora"}
          </button>
        </div>
      </div>
    </div>
  );
}
