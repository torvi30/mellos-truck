import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/**
 * Componente: TransformationShowcase
 * 
 * Estudio Cinemático de Transformaciones Mellos Truck:
 * - 4 Modos de visualización: 'after' (Completa Pro) | 'before' (Ingreso) | 'side' (Lado a Lado) | 'slider' (Escáner Interactivo)
 * - Puntos Neón Interactivos (Hotspots) con fotos macro y cotización directa por WhatsApp
 * - Selector de Naves Reales (Kenworth T800, Mack Vision, Peterbilt 389)
 * - Ficha técnica de especificaciones de taller (Días, Materiales, Garantía)
 * - 100% Touch friendly y responsive
 */
export default function TransformationShowcase({
  config = {},
  whatsappNumber = "573104567890",
}) {
  const beforeAfter = config?.beforeAfter || {};
  const cleanWaNumber = String(whatsappNumber).replace(/\D/g, "") || "573104567890";

  // Lista de proyectos disponibles (desde config o fallbacks de alta calidad)
  const projects = beforeAfter.projects && beforeAfter.projects.length > 0
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
          summary: "Bomper artesanal de 20\", visera tipo espejo y doble corneta Hadley neumática.",
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
          summary: "Trompa extendida clásica, chimeneas monstruo de 8\" y visera estilo americano.",
        },
      ];

  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || "kw-wtl892");
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Modos de visualización: 'after' | 'before' | 'side' | 'slider'
  const [viewMode, setViewMode] = useState("after");
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  // Estado del Slider interactivo
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef(null);

  // Hotspots disponibles (asociados a la personalización)
  const hotspots = beforeAfter.hotspots || [
    {
      id: "bumper",
      tag: "BOMPER ARTESANAL",
      title: "Bomper de 20\" en Acero Inoxidable Calibre 10",
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

  // Ficha técnica de especificaciones de taller
  const specs = beforeAfter.specs || [
    { icon: "⏱️", label: "Tiempo en Taller", value: "8 Días Hábiles" },
    { icon: "🛡️", label: "Garantía de Obra", value: "De por vida en soldadura TIG" },
    { icon: "💎", label: "Material Principal", value: "Inox 304 Grado Espejo" },
    { icon: "⚡", label: "Nivel de Modificación", value: "Stage 3 (Full Custom)" },
  ];

  // Manejo fluido de arrastre para el modo Slider
  const updateSlider = useCallback((clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pct = (x / rect.width) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    setSliderPos(pct);
  }, []);

  const handlePointerDown = (e) => {
    setIsDraggingSlider(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignorar fallback
    }
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
    } catch {
      // Ignorar fallback
    }
  };

  // Enlace directo de WhatsApp para el accesorio seleccionado en el hotspot
  const getHotspotWaLink = (hotspot) => {
    const text = encodeURIComponent(
      `¡Hola Mellos Truck! 🚛 Vi en el estudio de transformaciones el accesorio "${hotspot.title}" de la ${activeProject.name} (Placa ${activeProject.plate}). ¿Cuánto cuesta y qué tiempo toma instalarlo?`
    );
    return `https://wa.me/${cleanWaNumber}?text=${text}`;
  };

  // Enlace directo de WhatsApp para el proyecto completo
  const getProjectWaLink = () => {
    const text = encodeURIComponent(
      `¡Hola Mellos Truck! 🚛 Vi la transformación de la nave "${activeProject.name}" (Placa ${activeProject.plate}) y quiero cotizar una personalización similar para mi camión.`
    );
    return `https://wa.me/${cleanWaNumber}?text=${text}`;
  };

  const beforeImg = activeProject.beforeImage || beforeAfter.beforeImage || "/images/showroom/kenworth_before.jpg";
  const afterImg = activeProject.afterImage || beforeAfter.afterImage || "/images/showroom/kenworth_after.jpg";

  return (
    <div className="transformation-showcase-root">
      {/* 1. Barra de Selector de Naves Reales */}
      <div className="showcase-projects-bar">
        <span className="projects-bar-label">PROYECTO EN EXHIBICIÓN:</span>
        <div className="projects-tabs">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProjectId(p.id);
                setSelectedHotspot(null);
              }}
              className={`project-tab-btn ${activeProjectId === p.id ? "active" : ""}`}
            >
              <span className="tab-truck-icon">🚛</span>
              <span className="tab-truck-name">{p.name}</span>
              <span className="tab-truck-plate">{p.plate}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Barra Superior de Control de Vistas (Switcher) */}
      <div className="showcase-control-bar">
        <div className="view-mode-pills" role="tablist" aria-label="Modo de visualización">
          <button
            role="tab"
            aria-selected={viewMode === "after"}
            onClick={() => {
              setViewMode("after");
              setSelectedHotspot(null);
            }}
            className={`mode-pill ${viewMode === "after" ? "active-after" : ""}`}
            title="Ver la nave terminada en su máxima resolución"
          >
            <span className="pill-dot glow-amber"></span>
            <span>⚡ DESPUÉS (Mellos Pro)</span>
          </button>

          <button
            role="tab"
            aria-selected={viewMode === "before"}
            onClick={() => {
              setViewMode("before");
              setSelectedHotspot(null);
            }}
            className={`mode-pill ${viewMode === "before" ? "active-before" : ""}`}
            title="Ver cómo llegó la nave al taller"
          >
            <span>🛠️ ANTES (Llegada al taller)</span>
          </button>

          <button
            role="tab"
            aria-selected={viewMode === "side"}
            onClick={() => {
              setViewMode("side");
              setSelectedHotspot(null);
            }}
            className={`mode-pill ${viewMode === "side" ? "active-side" : ""}`}
            title="Comparar ambas fotos lado a lado"
          >
            <span>🌓 LADO A LADO</span>
          </button>

          <button
            role="tab"
            aria-selected={viewMode === "slider"}
            onClick={() => {
              setViewMode("slider");
              setSelectedHotspot(null);
            }}
            className={`mode-pill ${viewMode === "slider" ? "active-slider" : ""}`}
            title="Deslizar suavemente con la manija interactiva"
          >
            <span>🔄 ESCÁNER INTERACTIVO</span>
          </button>
        </div>

        {/* Toggle de Puntos Hotspot (solo en modo after) */}
        {viewMode === "after" && (
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`hotspot-toggle-btn ${showHotspots ? "active" : ""}`}
            title="Mostrar u ocultar puntos interactivos de piezas"
          >
            <span>📍</span>
            <span>{showHotspots ? "Ocultar Mejoras" : "Ver Mejoras Instaladas"}</span>
            <span className="hotspot-count-pill">{hotspots.length}</span>
          </button>
        )}
      </div>

      {/* 3. Escenario Cinemático Principal */}
      <div className="showcase-cinema-stage">
        {/* MODO 1: SOLO DESPUÉS (Full 4K con Hotspots) */}
        {viewMode === "after" && (
          <div className="stage-view-single">
            <img
              src={afterImg}
              alt={`Transformación completa ${activeProject.name}`}
              className="stage-main-image"
              loading="eager"
            />
            <div className="stage-badge-tag tag-after">
              <span className="badge-glow-star">★</span>
              <span>ENTREGA MELLOS TRUCK • {activeProject.badge || "100% ACERO ESPEJO 304"}</span>
            </div>

            {/* Puntos Neón Interactivos (Hotspots) */}
            {showHotspots &&
              hotspots.map((hotspot, idx) => (
                <div
                  key={hotspot.id}
                  style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%` }}
                  className="hotspot-pin-wrapper"
                >
                  <button
                    onClick={() =>
                      setSelectedHotspot(selectedHotspot?.id === hotspot.id ? null : hotspot)
                    }
                    className={`hotspot-pin-btn ${
                      selectedHotspot?.id === hotspot.id ? "active-pin" : ""
                    }`}
                    aria-label={`Ver accesorio: ${hotspot.title}`}
                  >
                    <span className="hotspot-radar"></span>
                    <span className="hotspot-core">{idx + 1}</span>
                  </button>
                  <span className="hotspot-pill-label">{hotspot.tag}</span>
                </div>
              ))}

            {/* Modal / Tarjeta Flotante de Detalle del Hotspot */}
            {selectedHotspot && (
              <div className="hotspot-popover-card">
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="popover-close-btn"
                  title="Cerrar detalle"
                >
                  ✕
                </button>
                <div className="popover-img-box">
                  <img
                    src={selectedHotspot.image}
                    alt={selectedHotspot.title}
                    className="popover-img"
                  />
                  <span className="popover-tag">{selectedHotspot.tag}</span>
                </div>
                <div className="popover-body">
                  <h4>{selectedHotspot.title}</h4>
                  <p>{selectedHotspot.subtitle}</p>
                  <div className="popover-actions">
                    <a
                      href={getHotspotWaLink(selectedHotspot)}
                      target="_blank"
                      rel="noreferrer"
                      className="popover-wa-btn"
                    >
                      <span>💬</span>
                      <span>Cotizar este Accesorio</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODO 2: SOLO ANTES (Llegada a Taller) */}
        {viewMode === "before" && (
          <div className="stage-view-single">
            <img
              src={beforeImg}
              alt={`Estado inicial ${activeProject.name}`}
              className="stage-main-image"
              loading="eager"
            />
            <div className="stage-badge-tag tag-before">
              <span>🛠️ INGRESO A TALLER • ESTADO DE FÁBRICA / DESGASTE</span>
            </div>

            <div className="before-diagnostic-card">
              <h5>📋 Diagnóstico Inicial de Taller:</h5>
              <ul>
                <li>❌ Bomper original estándar sin pulir ni protección.</li>
                <li>❌ Visera de lámina sin aerodinámica ni brillo espejo.</li>
                <li>❌ Ausencia de iluminación perimetral y cornetas neumáticas.</li>
              </ul>
              <button
                onClick={() => setViewMode("after")}
                className="btn-see-transformation-fast"
              >
                ⚡ Ver Transformación Mellos Truck ➜
              </button>
            </div>
          </div>
        )}

        {/* MODO 3: LADO A LADO (Dual Screen) */}
        {viewMode === "side" && (
          <div className="stage-view-side-by-side">
            {/* Tarjeta ANTES */}
            <div className="side-card side-before">
              <div className="side-img-wrapper">
                <img
                  src={beforeImg}
                  alt={`Antes ${activeProject.name}`}
                  className="side-img"
                />
                <div className="side-badge-pill pill-before">
                  🛠️ 1. LLEGADA AL TALLER
                </div>
              </div>
              <div className="side-card-info">
                <strong>Estado Inicial de Fábrica</strong>
                <p>Piezas estándar, sin personalización en acero inoxidable ni accesorios.</p>
              </div>
            </div>

            {/* Tarjeta DESPUÉS */}
            <div className="side-card side-after">
              <div className="side-img-wrapper">
                <img
                  src={afterImg}
                  alt={`Después ${activeProject.name}`}
                  className="side-img"
                />
                <div className="side-badge-pill pill-after">
                  ⚡ 2. ENTREGA MELLOS TRUCK
                </div>
              </div>
              <div className="side-card-info">
                <strong>Transformación Artesanal Completa</strong>
                <p>Bomper 20" espejo, visera americana, doble corneta Hadley y rines diamantados.</p>
              </div>
            </div>
          </div>
        )}

        {/* MODO 4: ESCÁNER INTERACTIVO (Slider Mejorado) */}
        {viewMode === "slider" && (
          <div
            ref={sliderContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="stage-view-slider"
            style={{ touchAction: "none" }}
          >
            {/* Fondo: Imagen Antes */}
            <img
              src={beforeImg}
              alt="Antes"
              className="slider-base-img"
              loading="eager"
            />
            <div className="slider-label-pill label-left">
              🛠️ {beforeAfter.beforeLabel || "ANTES (Taller)"}
            </div>

            {/* Capa Superior Recortada: Imagen Después */}
            <div
              className="slider-reveal-layer"
              style={{
                clipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)`,
                WebkitClipPath: `inset(0 calc(100% - ${sliderPos}%) 0 0)`,
              }}
            >
              <img
                src={afterImg}
                alt="Después"
                className="slider-reveal-img"
                loading="eager"
              />
              <div className="slider-label-pill label-right">
                ⚡ {beforeAfter.afterLabel || "DESPUÉS (Mellos Truck)"}
              </div>
            </div>

            {/* Línea Divisoria Neón y Manija de Control */}
            <div
              className="slider-divider-line"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="slider-handle-knob">
                <span className="knob-arrow">◀</span>
                <span className="knob-bar"></span>
                <span className="knob-arrow">▶</span>
              </div>
            </div>

            <div className="slider-percentage-pill">
              {Math.round(sliderPos)}% Revelado
            </div>
          </div>
        )}
      </div>

      {/* 4. Ficha Técnica de Taller (Especificaciones de Obra) */}
      <div className="showcase-specs-grid">
        {specs.map((item, idx) => (
          <div key={idx} className="spec-metric-card">
            <span className="spec-icon">{item.icon}</span>
            <div className="spec-info">
              <span className="spec-label">{item.label}</span>
              <strong className="spec-value">{item.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Barra Inferior con Resumen y CTAs de Alta Conversión */}
      <div className="showcase-bottom-bar">
        <div className="bottom-summary-info">
          <div className="summary-title-row">
            <h3>{activeProject.name}</h3>
            <span className="summary-plate-badge">{activeProject.plate}</span>
          </div>
          <p>{activeProject.summary || beforeAfter.truckDescription}</p>
        </div>

        <div className="bottom-action-buttons">
          <a
            href={getProjectWaLink()}
            target="_blank"
            rel="noreferrer"
            className="btn-quote-transformation"
          >
            <span>💬</span>
            <span>Cotizar Transformación como Esta</span>
          </a>

          <Link
            to={activeProject.magicLink || "/galeria/Kenworth-T800-Placa-WTL892"}
            className="btn-view-showroom-meta"
          >
            <span>🎬</span>
            <span>Ver Ficha 4K en Showroom</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
