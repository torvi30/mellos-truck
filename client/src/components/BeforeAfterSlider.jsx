import React, { useState, useRef, useCallback, useEffect } from "react";

/**
 * Componente: BeforeAfterSlider (Showroom Cinematográfico Mellos Truck)
 * 
 * Optimizado para imágenes 4K / alta resolución:
 * - Aceleración por GPU vía CSS clip-path (evita repintados continuos de canvas o re-layouts)
 * - Renderizado sincronizado con requestAnimationFrame a 60/120 fps
 * - decoding="async" y loading="lazy" nativo para evitar congelamiento de hilo principal
 * - Soporte unificado táctil y ratón con PointerEvents y pointer capture
 * - Navegación accesible mediante teclado (flechas izquierda/derecha)
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "ANTES (Taller)",
  afterLabel = "DESPUÉS (Mellos Truck)",
  aspectRatio = "16/9",
  className = "",
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false });
  const containerRef = useRef(null);
  const rafId = useRef(null);

  // Manejador de movimiento optimizado con requestAnimationFrame
  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;

    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      setSliderPosition(percentage);
    });
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
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
    } catch {
      // Ignorar si el pointer ya fue liberado
    }
  };

  // Accesibilidad por teclado
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const allLoaded = imagesLoaded.before && imagesLoaded.after;

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Comparativa de antes y después"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`before-after-container select-none relative overflow-hidden rounded-xl border border-neutral-800 shadow-2xl bg-neutral-950 ${className}`}
      style={{
        aspectRatio,
        touchAction: "none",
        cursor: isDragging ? "ew-resize" : "grab",
      }}
    >
      {/* Skeleton de Carga Fluido */}
      {!allLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-900 animate-pulse text-amber-500 font-mono text-sm tracking-wider">
          <div className="flex items-center gap-3">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            CARGANDO ALTA RESOLUCIÓN...
          </div>
        </div>
      )}

      {/* 1. Imagen ANTES (Fondo Base) */}
      <img
        src={beforeImage}
        alt="Estado inicial del vehículo"
        decoding="async"
        loading="lazy"
        onLoad={() => setImagesLoaded((prev) => ({ ...prev, before: true }))}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="badge-before absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md bg-black/70 text-neutral-300 border border-neutral-700">
        {beforeLabel}
      </div>

      {/* 2. Imagen DESPUÉS (Capa Superior con Aceleración GPU via clip-path) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
          WebkitClipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)`,
          willChange: "clip-path",
        }}
      >
        <img
          src={afterImage}
          alt="Vehículo personalizado por Mellos Truck"
          decoding="async"
          loading="lazy"
          onLoad={() => setImagesLoaded((prev) => ({ ...prev, after: true }))}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="badge-after absolute top-4 right-4 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-md bg-amber-500/90 text-black border border-amber-400 shadow-lg shadow-amber-500/20">
          {afterLabel}
        </div>
      </div>

      {/* 3. Línea Divisoria y Manija Táctil */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Línea Neón Industrial */}
        <div className="w-[3px] h-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"></div>

        {/* Manija de Acero Cepillado */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-amber-400 bg-neutral-900 shadow-xl flex items-center justify-center transition-transform ${
            isDragging ? "scale-110 shadow-amber-500/40" : "hover:scale-105"
          }`}
        >
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <span>◀</span>
            <span className="w-1 h-3 bg-amber-400 rounded-sm"></span>
            <span>▶</span>
          </div>
        </div>
      </div>

      {/* Indicador inferior sutil */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[11px] text-neutral-400 font-mono border border-neutral-800 pointer-events-none">
        {Math.round(sliderPosition)}% Transformación
      </div>
    </div>
  );
}
