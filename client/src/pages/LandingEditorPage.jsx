import React, { useState, useEffect, useRef } from "react";
import ImageUploader from "../components/ImageUploader";
import { settingsService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast, showConfirmAlert } from "../utils/alerts";
import {
  Sliders,
  Save,
  RotateCcw,
  Sparkles,
  Megaphone,
  Phone,
  BarChart3,
  SplitSquareVertical,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "announcement" | "slider" | "metrics" | "contact"
  const [config, setConfig] = useState(null);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const pinboardRef = useRef(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getLanding();
      if (res.success && res.config) {
        setConfig(res.config);
      }
    } catch (err) {
      console.error("Error cargando configuración:", err);
      showErrorToast("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

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
    pctX = Math.max(0, Math.min(100, pctX));
    pctY = Math.max(0, Math.min(100, pctY));

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
    showSuccessToast(`Punto #${targetIdx + 1} ubicado en (${pctX}%, ${pctY}%)`);
  };

  const handleAddHotspot = () => {
    const currentHotspots = config?.beforeAfter?.hotspots || [];
    const newSpot = {
      id: `spot_${Date.now()}`,
      tag: "NUEVO ACCESORIO",
      title: "Accesorio en Acero Inoxidable",
      subtitle: "Corte láser y pulido espejo artesanal.",
      image: "/images/showroom/detail_bumper_chrome.jpg",
      x: 50,
      y: 50,
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
    showSuccessToast("Punto interactivo agregado. Haz clic en la foto para posicionarlo.");
  };

  const handleDeleteHotspot = (indexToDelete) => {
    const currentHotspots = config?.beforeAfter?.hotspots || [];
    const updated = currentHotspots.filter((_, i) => i !== indexToDelete);
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

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await settingsService.updateLanding(config);
      showSuccessToast("¡Página principal actualizada y en vivo en Firebase!");
    } catch (err) {
      console.error("Error guardando:", err);
      showErrorToast("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await showConfirmAlert(
      "¿Restaurar valores de fábrica?",
      "Se restablecerán todos los textos, imágenes y métricas originales."
    );
    if (!ok) return;

    try {
      const res = await settingsService.resetLanding();
      if (res.success && res.config) {
        setConfig(res.config);
        showSuccessToast("Configuración restablecida con éxito");
      }
    } catch (err) {
      showErrorToast("Error al restablecer configuración");
    }
  };

  if (loading || !config) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Cargando editor visual desde Firebase...</p>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Portada / Hero", icon: Sparkles },
    { id: "announcement", label: "Barra Anuncios", icon: Megaphone },
    { id: "slider", label: "Antes vs Después", icon: SplitSquareVertical },
    { id: "metrics", label: "Métricas", icon: BarChart3 },
    { id: "contact", label: "WhatsApp & Redes", icon: Phone },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header del Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Sliders className="w-4 h-4" />
            <span>Sistema CMS de Contenidos en Tiempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Editor de Portada & Showroom
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Personaliza textos, fotos insignia, puntos interactivos y WhatsApp sin tocar código.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-carbon-900 text-slate-300 border border-white/10 hover:bg-carbon-800 transition-colors flex items-center gap-1.5"
            title="Restablecer configuración de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar en Vivo"}</span>
          </button>
        </div>
      </div>

      {/* 2. Pestañas de Navegación del CMS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Contenido de las Pestañas */}

      {/* TAB 1: HERO / PORTADA */}
      {activeTab === "hero" && (
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Sección Principal (Hero Banner)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Insignia Superior (Badge)</label>
              <input
                type="text"
                value={config.hero.badgeText || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, badgeText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Titular de Gran Impacto (H1)</label>
              <input
                type="text"
                value={config.hero.headline || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    hero: { ...config.hero, headline: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subtítulo Descriptivo</label>
            <textarea
              rows="3"
              value={config.hero.subtitle || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, subtitle: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mula Insignia de Portada</label>
              <ImageUploader
                value={config.hero.featuredTruck?.imageUrl || ""}
                onChange={(url) =>
                  setConfig({
                    ...config,
                    hero: {
                      ...config.hero,
                      featuredTruck: { ...config.hero.featuredTruck, imageUrl: url },
                    },
                  })
                }
                category="hero"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Mula Destacada</label>
                <input
                  type="text"
                  value={config.hero.featuredTruck?.title || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: {
                        ...config.hero,
                        featuredTruck: { ...config.hero.featuredTruck, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Especificaciones de la Mula</label>
                <input
                  type="text"
                  value={config.hero.featuredTruck?.specs || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      hero: {
                        ...config.hero,
                        featuredTruck: { ...config.hero.featuredTruck, specs: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BARRA DE ANUNCIOS */}
      {activeTab === "announcement" && (
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Barra Superior de Notificaciones Promocionales</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={config.announcementBar?.enabled ?? true}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-slate-200">Mostrar Barra Activa</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Insignia (ej: 🔥 CUPOS LIMITADOS)</label>
              <input
                type="text"
                value={config.announcementBar?.badgeText || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, badgeText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Texto del Botón de Acción</label>
              <input
                type="text"
                value={config.announcementBar?.buttonText || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcementBar: { ...config.announcementBar, buttonText: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje Principal del Anuncio</label>
            <input
              type="text"
              value={config.announcementBar?.message || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  announcementBar: { ...config.announcementBar, message: e.target.value },
                })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      )}

      {/* TAB 3: ANTES VS DESPUÉS & HOTSPOTS INTERACTIVOS */}
      {activeTab === "slider" && (
        <div className="glass-card p-6 rounded-2xl space-y-6 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-amber-400" />
                <span>Puntos Interactivos (Hotspots) en la Mula</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Haz clic directamente en la foto para fijar la ubicación del accesorio (Bomper, Visera, Rines).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddHotspot}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950 transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Punto</span>
            </button>
          </div>

          {/* Tablero Visual (Pinboard Interactivo) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              Pinboard Interactivo: Haz clic sobre la mula para ubicar el punto seleccionado
            </span>
            <div
              ref={pinboardRef}
              onClick={handlePinboardClick}
              className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden cursor-crosshair border border-white/20 select-none bg-carbon-950"
            >
              <img
                src={config.beforeAfter?.afterImage || "/images/showroom/kenworth_after.jpg"}
                alt="Pinboard"
                className="w-full h-auto object-cover pointer-events-none"
              />
              {/* Render de los Puntos */}
              {(config.beforeAfter?.hotspots || []).map((spot, idx) => (
                <div
                  key={spot.id || idx}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-transform ${
                    activeHotspotIndex === idx
                      ? "bg-amber-500 text-carbon-950 ring-4 ring-amber-500/40 scale-125 z-20"
                      : "bg-carbon-950 text-white border border-white/30 z-10"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotIndex(idx);
                  }}
                  title={spot.title}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Selector de Punto a Editar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(config.beforeAfter?.hotspots || []).map((spot, idx) => (
                <button
                  key={spot.id || idx}
                  type="button"
                  onClick={() => setActiveHotspotIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeHotspotIndex === idx
                      ? "bg-amber-500 text-carbon-950"
                      : "bg-carbon-900 text-slate-300 border border-white/10"
                  }`}
                >
                  <span>Punto #{idx + 1}: {spot.tag || "Accesorio"}</span>
                  <span className="text-[10px] opacity-75 font-mono">({spot.x}%, {spot.y}%)</span>
                </button>
              ))}
            </div>

            {/* Formulario del Punto Activo */}
            {config.beforeAfter?.hotspots && config.beforeAfter.hotspots[activeHotspotIndex] && (
              <div className="p-4 rounded-xl bg-carbon-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-400">
                    Editando Punto #{activeHotspotIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteHotspot(activeHotspotIndex)}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar este punto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Etiqueta (Badge)</label>
                    <input
                      type="text"
                      value={config.beforeAfter.hotspots[activeHotspotIndex].tag || ""}
                      onChange={(e) => {
                        const spots = [...config.beforeAfter.hotspots];
                        spots[activeHotspotIndex].tag = e.target.value;
                        setConfig({
                          ...config,
                          beforeAfter: { ...config.beforeAfter, hotspots: spots },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-carbon-950 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Pieza</label>
                    <input
                      type="text"
                      value={config.beforeAfter.hotspots[activeHotspotIndex].title || ""}
                      onChange={(e) => {
                        const spots = [...config.beforeAfter.hotspots];
                        spots[activeHotspotIndex].title = e.target.value;
                        setConfig({
                          ...config,
                          beforeAfter: { ...config.beforeAfter, hotspots: spots },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-carbon-950 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Calibre</label>
                  <input
                    type="text"
                    value={config.beforeAfter.hotspots[activeHotspotIndex].subtitle || ""}
                    onChange={(e) => {
                      const spots = [...config.beforeAfter.hotspots];
                      spots[activeHotspotIndex].subtitle = e.target.value;
                      setConfig({
                        ...config,
                        beforeAfter: { ...config.beforeAfter, hotspots: spots },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-carbon-950 border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MÉTRICAS */}
      {activeTab === "metrics" && (
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Métricas de Confianza de Portada</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(config.metrics || []).map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-carbon-900 border border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400">Métrica #{idx + 1}</span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Valor (ej: +1,200 o 100%)</label>
                  <input
                    type="text"
                    value={m.value || ""}
                    onChange={(e) => {
                      const next = [...config.metrics];
                      next[idx].value = e.target.value;
                      setConfig({ ...config, metrics: next });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-carbon-950 border border-white/10 text-xs text-white font-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Etiqueta Descriptiva</label>
                  <input
                    type="text"
                    value={m.label || ""}
                    onChange={(e) => {
                      const next = [...config.metrics];
                      next[idx].label = e.target.value;
                      setConfig({ ...config, metrics: next });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-carbon-950 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTACTO & WHATSAPP */}
      {activeTab === "contact" && (
        <div className="glass-card p-6 rounded-2xl space-y-5 border border-white/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Configuración de Contacto & Redes</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número de WhatsApp (con código de país, ej: 573104567890)</label>
              <input
                type="text"
                value={config.whatsappNumber || ""}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usuario de Instagram</label>
              <input
                type="text"
                value={config.instagramUser || ""}
                onChange={(e) => setConfig({ ...config, instagramUser: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mensaje Predeterminado de WhatsApp al Cotizar</label>
            <input
              type="text"
              value={config.whatsappDefaultMsg || ""}
              onChange={(e) => setConfig({ ...config, whatsappDefaultMsg: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección / Ubicación de Talleres</label>
            <input
              type="text"
              value={config.locationText || ""}
              onChange={(e) => setConfig({ ...config, locationText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
