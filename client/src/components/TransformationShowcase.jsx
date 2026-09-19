import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Layers,
  SplitSquareVertical,
  Check,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Clock,
  ShieldCheck,
  Truck,
  Eye,
  X,
} from "lucide-react";

export default function TransformationShowcase({
  config = {},
  whatsappNumber = "573104567890",
  onOpenQuote,
}) {
  const beforeAfter = config?.beforeAfter || {};
  const cleanWaNumber = String(whatsappNumber).replace(/\D/g, "") || "573104567890";

  const projects =
    beforeAfter.projects && beforeAfter.projects.length > 0
      ? beforeAfter.projects
      : [
          {
            id: "kw-wtl892",
            name: "Kenworth T800",
            plate: "WTL-892",
            badge: "ACERO ESPEJO 304",
            beforeImage: "/images/showroom/kenworth_before.jpg",
            afterImage: "/images/showroom/kenworth_after.jpg",
            magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
            summary: 'Bomper artesanal de 20", visera tipo espejo y doble corneta Hadley neumática.',
          },
          {
            id: "mack-vision",
            name: "Mack Vision Elite",
            plate: "MKV-404",
            badge: "CUSTOM BLACK & GOLD",
            beforeImage: "/images/showroom/kenworth_before.jpg",
            afterImage: "/images/showroom/mack_truck_custom.jpg",
            magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
            summary: "Pintura tricapa negro profundo, visera aerodinámica e iluminación LED perimetral.",
          },
          {
            id: "peterbilt-389",
            name: "Peterbilt 389 Classic",
            plate: "PET-389",
            badge: "SHOW TRUCK AMERICANO",
            beforeImage: "/images/showroom/kenworth_before.jpg",
            afterImage: "/images/showroom/peterbilt_truck_custom.jpg",
            magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
            summary: 'Trompa extendida clásica, chimeneas monstruo de 8" y visera estilo americano.',
          },
        ];

  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || "kw-wtl892");
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [viewMode, setViewMode] = useState("after"); // 'after' | 'before' | 'side' | 'slider'
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);

  const hotspots = beforeAfter.hotspots || [
    {
      id: "bumper",
      tag: "BOMPER ARTESANAL",
      title: 'Bomper de 20" en Acero Inoxidable Calibre 10',
      subtitle: "Corte láser de precisión con acabado tipo espejo y acoples de aire ocultos.",
      image: "/images/showroom/detail_bumper_chrome.jpg",
      x: 28,
      y: 78,
    },
    {
      id: "visera",
      tag: "VISERA & CORNETAS",
      title: "Visera Americana Gangsta Calibre 10 & Cornetas",
      subtitle: "Acero inoxidable calidad 304 acompañada de cornetas Hadley neumáticas de 24V.",
      image: "/images/showroom/detail_visera_cornetas.jpg",
      x: 68,
      y: 20,
    },
    {
      id: "rines",
      tag: "RINES & COPAS SPIKES",
      title: "Rines Pulidos Diamantados con Copas Spikes",
      subtitle: "Tratamiento de pulido artesanal a espejo con tuercas cónicas de seguridad.",
      image: "/images/showroom/detail_rines_spikes.jpg",
      x: 48,
      y: 74,
    },
  ];

  const specs = beforeAfter.specs || [
    { icon: "⏱️", label: "Tiempo en Taller", value: "8 Días Hábiles" },
    { icon: "🛡️", label: "Garantía de Obra", value: "De por vida en soldadura TIG" },
    { icon: "💎", label: "Material Principal", value: "Inox 304 Grado Espejo" },
    { icon: "⚡", label: "Nivel de Modificación", value: "Stage 3 (Full Custom)" },
  ];

  const updateSlider = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pct = (x / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e) => {
    setIsDraggingSlider(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateSlider(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingSlider) return;
    updateSlider(e.clientX);
  };

  const handlePointerUp = (e) => {
    setIsDraggingSlider(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const beforeImg = activeProject.beforeImage || beforeAfter.beforeImage || "/images/showroom/kenworth_before.jpg";
  const afterImg = activeProject.afterImage || beforeAfter.afterImage || "/images/showroom/kenworth_after.jpg";

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-7 space-y-6 border border-white/15 shadow-2xl overflow-hidden">
      {/* 1. Selector de Naves Reales */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            Mula en Exhibición:
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProjectId(proj.id);
                setSelectedHotspot(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeProjectId === proj.id
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <span>{proj.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                {proj.plate}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Selector de Modos de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-carbon-900/90 rounded-2xl border border-white/10 overflow-x-auto">
          <button
            onClick={() => {
              setViewMode("after");
              setSelectedHotspot(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "after"
                ? "bg-amber-500 text-carbon-950 shadow-sm font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚡ DESPUÉS (Mellos Pro)
          </button>
          <button
            onClick={() => {
              setViewMode("before");
              setSelectedHotspot(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "before"
                ? "bg-carbon-800 text-white shadow-sm font-black border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛠️ ANTES (Llegada)
          </button>
          <button
            onClick={() => {
              setViewMode("side");
              setSelectedHotspot(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "side"
                ? "bg-carbon-800 text-white shadow-sm font-black border border-white/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🌓 Lado a Lado
          </button>
          <button
            onClick={() => {
              setViewMode("slider");
              setSelectedHotspot(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === "slider"
                ? "bg-carbon-800 text-amber-400 shadow-sm font-black border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔄 Escáner Slider
          </button>
        </div>

        {viewMode === "after" && (
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 self-start sm:self-auto ${
              showHotspots
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                : "bg-carbon-900 border-white/10 text-slate-400"
            }`}
          >
            <span>📍 Puntos Interactivos</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-carbon-950 font-mono">
              {hotspots.length}
            </span>
          </button>
        )}
      </div>

      {/* 3. Escenario Visual Principal */}
      <div className="relative rounded-2xl overflow-hidden bg-carbon-950 border border-white/10 select-none">
        {/* MODO 1: DESPUÉS con Hotspots */}
        {viewMode === "after" && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <img
              src={afterImg}
              alt="Después"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-carbon-950/90 backdrop-blur-md border border-white/10 text-xs font-black text-amber-400">
              ★ ENTREGA MELLOS TRUCK • {activeProject.badge || "100% ACERO ESPEJO 304"}
            </div>

            {/* Puntos Interactivos */}
            {showHotspots &&
              hotspots.map((spot, idx) => (
                <div
                  key={spot.id || idx}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    onClick={() => setSelectedHotspot(selectedHotspot?.id === spot.id ? null : spot)}
                    className="w-8 h-8 rounded-full bg-amber-500 text-carbon-950 font-black text-xs shadow-lg shadow-amber-500/40 flex items-center justify-center hover:scale-125 transition-transform ring-4 ring-amber-500/25 animate-pulse"
                    title={spot.title}
                  >
                    {idx + 1}
                  </button>

                  {/* Popover del Punto */}
                  {selectedHotspot?.id === spot.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 rounded-2xl bg-carbon-900/95 backdrop-blur-md border border-white/20 shadow-2xl z-30 space-y-2 text-left animate-fade-in">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-400">
                          {spot.tag}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotspot(null);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {spot.image && (
                        <div className="h-28 rounded-lg overflow-hidden bg-carbon-950">
                          <img
                            src={spot.image}
                            alt={spot.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <h4 className="font-bold text-xs text-white leading-snug">{spot.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{spot.subtitle}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (onOpenQuote) onOpenQuote(spot.title, activeProject.name);
                        }}
                        className="w-full py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-carbon-950 hover:brightness-110 flex items-center justify-center gap-1"
                      >
                        <span>Cotizar esta pieza</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* MODO 2: SOLO ANTES */}
        {viewMode === "before" && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <img
              src={beforeImg}
              alt="Antes"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-carbon-950/90 backdrop-blur-md border border-white/10 text-xs font-black text-slate-300">
              🛠️ LLEGADA AL TALLER (Original de fábrica)
            </div>
          </div>
        )}

        {/* MODO 3: LADO A LADO */}
        {viewMode === "side" && (
          <div className="grid grid-cols-2 gap-1 w-full aspect-[16/9] overflow-hidden bg-carbon-900">
            <div className="relative h-full overflow-hidden">
              <img src={beforeImg} alt="Antes" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-carbon-950/90 text-[10px] font-bold text-slate-300">
                ANTES
              </span>
            </div>
            <div className="relative h-full overflow-hidden">
              <img src={afterImg} alt="Después" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-carbon-950/90 text-[10px] font-bold text-amber-400">
                DESPUÉS MELLOS PRO
              </span>
            </div>
          </div>
        )}

        {/* MODO 4: ESCÁNER SLIDER INTERACTIVO */}
        {viewMode === "slider" && (
          <div
            ref={sliderContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full aspect-[16/9] overflow-hidden cursor-ew-resize touch-none"
          >
            {/* Imagen de Fondo (Antes) */}
            <img src={beforeImg} alt="Antes" className="w-full h-full object-cover absolute inset-0 pointer-events-none" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-carbon-950/90 text-xs font-bold text-slate-300 pointer-events-none">
              ANTES
            </span>

            {/* Imagen Revelada (Después) con clipPath */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img src={afterImg} alt="Después" className="w-full h-full object-cover pointer-events-none" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-carbon-950/90 text-xs font-bold text-amber-400 pointer-events-none">
                DESPUÉS MELLOS PRO
              </span>
            </div>

            {/* Manija y Línea Divisoria */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-glow-amber pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 text-carbon-950 font-bold text-xs flex items-center justify-center shadow-lg pointer-events-none">
                ↔
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Especificaciones del Taller */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {specs.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-carbon-900 border border-white/5 flex items-center gap-3"
          >
            <span className="text-xl">{item.icon}</span>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block truncate">{item.label}</span>
              <strong className="text-xs text-white font-bold block truncate">{item.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Barra Inferior con Resumen y CTAs */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-white">{activeProject.name}</h3>
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-carbon-950 border border-white/10 text-amber-400">
              {activeProject.plate}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            {activeProject.summary || beforeAfter.truckDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenQuote && (
            <button
              type="button"
              onClick={() => onOpenQuote("Transformación Completa", activeProject.name)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <span>⚡ Cotizar como Esta</span>
            </button>
          )}

          <Link
            to={activeProject.magicLink || "/galeria/Kenworth-T800-Placa-WTL892"}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-carbon-900 text-slate-300 border border-white/10 hover:bg-carbon-850 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Ficha 4K</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
