import React, { useState, useRef, useCallback, useEffect } from "react";

/**
 * Componente: BeforeAfterSlider (Showroom Cinematográfico Mellos Truck)
 * 
 * 100% Estilos CSS Nativos Puros (Sin dependencias de clases externas no compiladas):
 * - Garantiza que las imágenes NUNCA se desborden ni se apilen verticalmente
 * - Aceleración por GPU vía CSS clip-path a 60/120 fps
 * - Barra de selección de vista rápida: [ ⚡ DESPUÉS ] [ 🛠️ ANTES ] [ 🔄 SLIDER ]
 * - Soporte táctil y ratón optimizado sin bloquear el scroll vertical
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "ANTES (Llegada al taller)",
  afterLabel = "DESPUÉS (Mellos Truck)",
  aspectRatio = "16/9",
  className = "",
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState("slider"); // "slider" | "after" | "before"
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false });
  const containerRef = useRef(null);
  const rafId = useRef(null);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setSliderPosition(percentage);
    });
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const allLoaded = imagesLoaded.before && imagesLoaded.after;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      {/* Selector de Modos Rápidos */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
          background: "rgba(16, 20, 28, 0.7)",
          padding: "6px 12px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", letterSpacing: "0.05em" }}>
          COMPARATIVA DE TRANSFORMACIÓN:
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setMode("after")}
            style={{
              background: mode === "after" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#141722",
              color: mode === "after" ? "#000" : "#cbd5e1",
              border: mode === "after" ? "1px solid #f59e0b" : "1px solid #283244",
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "0.76rem",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ⚡ Solo Después
          </button>
          <button
            type="button"
            onClick={() => setMode("before")}
            style={{
              background: mode === "before" ? "#242c3d" : "#141722",
              color: mode === "before" ? "#f1f5f9" : "#cbd5e1",
              border: mode === "before" ? "1px solid #475569" : "1px solid #283244",
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "0.76rem",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🛠️ Solo Antes
          </button>
          <button
            type="button"
            onClick={() => setMode("slider")}
            style={{
              background: mode === "slider" ? "#242c3d" : "#141722",
              color: mode === "slider" ? "#fbbf24" : "#cbd5e1",
              border: mode === "slider" ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid #283244",
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "0.76rem",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            🔄 Deslizador
          </button>
        </div>
      </div>

      {/* Escenario de Comparación Visual Fijo */}
      <div
        ref={containerRef}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Comparativa de antes y después"
        tabIndex={0}
        onPointerDown={mode === "slider" ? handlePointerDown : undefined}
        onPointerMove={mode === "slider" ? handlePointerMove : undefined}
        onPointerUp={mode === "slider" ? handlePointerUp : undefined}
        onPointerCancel={mode === "slider" ? handlePointerUp : undefined}
        className={`before-after-container ${className}`}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          maxHeight: "560px",
          overflow: "hidden",
          borderRadius: "16px",
          border: "1.5px solid rgba(245, 158, 11, 0.35)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(245, 158, 11, 0.08)",
          backgroundColor: "#0a0c10",
          touchAction: "none",
          userSelect: "none",
          cursor: mode === "slider" ? (isDragging ? "ew-resize" : "grab") : "default",
        }}
      >
        {/* Skeleton de carga */}
        {!allLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d1016",
              color: "#f59e0b",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
            }}
          >
            <span>CARGANDO ALTA RESOLUCIÓN 4K...</span>
          </div>
        )}

        {/* 1. Imagen ANTES (Fondo) */}
        <img
          src={beforeImage}
          alt="Estado inicial del vehículo"
          decoding="async"
          loading="lazy"
          onLoad={() => setImagesLoaded((prev) => ({ ...prev, before: true }))}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            display: mode === "after" ? "none" : "block",
          }}
        />
        {mode !== "after" && (
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 10,
              padding: "6px 14px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderRadius: "8px",
              backdropFilter: "blur(12px)",
              background: "rgba(0, 0, 0, 0.85)",
              color: "#cbd5e1",
              border: "1px solid #475569",
              boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
          >
            {beforeLabel}
          </div>
        )}

        {/* 2. Imagen DESPUÉS (Capa Superior con clip-path) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            clipPath:
              mode === "after"
                ? "none"
                : mode === "before"
                ? "inset(0 100% 0 0)"
                : `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
            WebkitClipPath:
              mode === "after"
                ? "none"
                : mode === "before"
                ? "inset(0 100% 0 0)"
                : `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
            willChange: "clip-path",
            display: mode === "before" ? "none" : "block",
          }}
        >
          <img
            src={afterImage}
            alt="Vehículo personalizado por Mellos Truck"
            decoding="async"
            loading="lazy"
            onLoad={() => setImagesLoaded((prev) => ({ ...prev, after: true }))}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              zIndex: 10,
              padding: "6px 14px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderRadius: "8px",
              backdropFilter: "blur(12px)",
              background: "rgba(0, 0, 0, 0.85)",
              color: "#fbbf24",
              border: "1px solid #f59e0b",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.35)",
            }}
          >
            {afterLabel}
          </div>
        </div>

        {/* 3. Línea Divisoria y Manija (Solo en modo Slider) */}
        {mode === "slider" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${sliderPosition}%`,
              transform: "translateX(-50%)",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            {/* Línea Neón */}
            <div
              style={{
                width: "3px",
                height: "100%",
                background: "#f59e0b",
                boxShadow: "0 0 16px rgba(245, 158, 11, 0.9)",
              }}
            />

            {/* Manija Circular */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#11141c",
                border: "2.5px solid #f59e0b",
                boxShadow: "0 0 22px rgba(245, 158, 11, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                color: "#f59e0b",
                fontSize: "0.72rem",
                fontWeight: 900,
              }}
            >
              <span>◀</span>
              <span style={{ width: "2px", height: "12px", background: "#f59e0b", borderRadius: "1px" }} />
              <span>▶</span>
            </div>
          </div>
        )}

        {/* Indicador de porcentaje inferior */}
        {mode === "slider" && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 15,
              padding: "3px 12px",
              borderRadius: "999px",
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              color: "#94a3b8",
              fontFamily: "monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
              border: "1px solid #222938",
              pointerEvents: "none",
            }}
          >
            {Math.round(sliderPosition)}% Revelado
          </div>
        )}
      </div>
    </div>
  );
}
