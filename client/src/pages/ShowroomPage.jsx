import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BeforeAfterSlider from "../components/BeforeAfterSlider";

export default function ShowroomPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("slider"); // 'slider' | 'video' | 'gallery'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShowroomData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/showroom/${slug || "default"}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          // Si el backend no está corriendo en 4000 o dio 404, usamos datos de demostración
          throw new Error("No se pudo conectar a la API");
        }
      } catch (err) {
        console.warn("Utilizando datos de demostración cinematográfica:", err);
        setData({
          workOrder: {
            id: 101,
            clientName: "Don Carlos Rodríguez",
            plate: "WTL-892",
            brand: "Kenworth",
            line: "T800 Aerocab",
            model: "2024",
            color: "Azul Medianoche & Cromo Espejo",
            description:
              "Transformación total: Fabricación de bomper de acero inoxidable cromado de 20 pulgadas con cortes láser y luces LED integradas, visera americana de acero, doble corneta de aire Hadley, estribos pulidos tipo espejo, iluminación perimetral ámbar y pulido cerámico de cabina.",
            status: "Entregado",
            date: new Date().toISOString(),
            slug: slug || "Kenworth-T800-Placa-WTL892",
          },
          showcase: {
            beforeAfter: [
              {
                id: 1,
                title: "Frontal & Cabina: Bomper de Acero de 20\", Visera y Cornetas",
                before_url: "/images/showroom/kenworth_before.jpg",
                after_url: "/images/showroom/kenworth_after.jpg",
              },
            ],
            cinematicVideo: {
              title: "Tomas Aéreas Dron DJI - Kenworth T800",
              url: "http://localhost:4000/api/stream/video/cinematic_kenworth_demo.mp4",
              thumbnail_url: "/images/showroom/kenworth_after.jpg",
            },
            photos: [
              {
                id: 1,
                title: "Bomper de Acero Inoxidable de 20\" con Luces LED Embebidas & Soldadura TIG",
                url: "/images/showroom/detail_bumper_chrome.jpg",
              },
              {
                id: 2,
                title: "Visera Americana en Acero Espejo & Doble Corneta Hadley",
                url: "/images/showroom/detail_visera_cornetas.jpg",
              },
              {
                id: 3,
                title: "Rines Pulidos Alcoa, Spikes en Punta & Luces Ámbar de Bajo Chasis",
                url: "/images/showroom/detail_rines_spikes.jpg",
              },
            ],
          },
          sharing: {
            whatsappShareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
              `¡Mira la transformación de mi nave en Mellos Truck! 🔥🚛\n👉 ${window.location.href}`
            )}`,
            directUrl: window.location.href,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShowroomData();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="showroom-loading-screen">
        <div className="showroom-spinner"></div>
        <p>CARGANDO SHOWROOM CINEMATOGRÁFICO...</p>
      </div>
    );
  }

  const { workOrder, showcase } = data || {};
  const currentBeforeAfter = showcase?.beforeAfter?.[0];

  return (
    <div className="showroom-page">
      {/* 1. Header Minimalista & Marca */}
      <header className="showroom-nav">
        <div className="showroom-nav-inner">
          <Link to="/" className="showroom-brand">
            <span className="brand-badge">MT</span>
            <span className="brand-text">MELLOS TRUCK</span>
          </Link>
          <div className="showroom-header-actions">
            <button onClick={handleCopyLink} className="btn-secondary-dark">
              {copied ? "✓ ¡Enlace copiado!" : "🔗 Copiar Magic Link"}
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `¡Pillate cómo quedó mi nave en Mellos Truck! 🔥🚛 Mira el video y la comparativa:\n${window.location.href}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-glow"
            >
              <span className="wa-icon">💬</span> Compartir en WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Cinematográfico con Ficha del Vehículo */}
      <section className="showroom-hero">
        <div className="showroom-hero-meta">
          <div className="meta-badge-status">
            <span className="status-dot"></span> {workOrder?.status || "PROYECTO TERMINADO"}
          </div>
          <h1 className="showroom-title">
            {workOrder?.brand} {workOrder?.line}
          </h1>
          <div className="showroom-plate-badge">
            <span className="plate-flag">🇨🇴</span>
            <span className="plate-code">{workOrder?.plate || "WTL-892"}</span>
          </div>
          <p className="showroom-owner">
            Propietario / Cliente: <strong>{workOrder?.clientName}</strong>
          </p>
        </div>

        {/* Pestañas de Navegación del Showroom */}
        <div className="showroom-tabs">
          <button
            className={`showroom-tab-btn ${activeTab === "slider" ? "active" : ""}`}
            onClick={() => setActiveTab("slider")}
          >
            ⚡ Antes y Después (Interactivo)
          </button>
          <button
            className={`showroom-tab-btn ${activeTab === "video" ? "active" : ""}`}
            onClick={() => setActiveTab("video")}
          >
            🎬 Video Cinematográfico (4K Stream)
          </button>
          <button
            className={`showroom-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            📸 Detalles de Acero & Cromo ({showcase?.photos?.length || 0})
          </button>
        </div>

        {/* 3. Contenedor Principal de Medios Fluidos */}
        <div className="showroom-media-wrapper">
          {activeTab === "slider" && currentBeforeAfter && (
            <div className="showroom-slider-section">
              <BeforeAfterSlider
                beforeImage={currentBeforeAfter.before_url}
                afterImage={currentBeforeAfter.after_url}
                beforeLabel="ANTES (Llegada al taller)"
                afterLabel="DESPUÉS (Obra Mellos Truck)"
                aspectRatio="16/9"
              />
              <div className="slider-caption">
                <p className="caption-title">{currentBeforeAfter.title}</p>
                <p className="caption-instruction">
                  ↔️ Arrastra o toca la línea amarilla neón para deslizar la comparativa sin lag.
                </p>
              </div>
            </div>
          )}

          {activeTab === "video" && (
            <div className="showroom-video-section">
              <div className="video-player-container">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={showcase?.cinematicVideo?.thumbnail_url}
                  className="cinematic-video-element"
                >
                  <source
                    src={showcase?.cinematicVideo?.url || "http://localhost:4000/api/stream/video/cinematic.mp4"}
                    type="video/mp4"
                  />
                  Tu navegador no soporta reproducción de video HTML5.
                </video>
              </div>
              <div className="video-stream-badge">
                <span className="stream-dot"></span> Streaming fluido HTTP 206 Partial Content (Optimizado para tomas aéreas y alta tasa de bits)
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="showroom-grid">
              {showcase?.photos?.map((photo, index) => (
                <div key={index} className="showroom-photo-card">
                  <img src={photo.url} alt={photo.title} loading="lazy" decoding="async" />
                  <div className="photo-overlay">
                    <p>{photo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Ficha Técnica de Modificaciones & Materiales */}
      <section className="showroom-details-section">
        <div className="details-card">
          <div className="details-header">
            <h3>🛠️ Resumen de Trabajos Realizados</h3>
            <span className="details-serial">Orden #{workOrder?.id}</span>
          </div>
          <p className="details-description">{workOrder?.description}</p>

          <div className="details-specs-grid">
            <div className="spec-box">
              <span className="spec-label">Marca & Chasis</span>
              <span className="spec-value">{workOrder?.brand} {workOrder?.line}</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Color y Acabados</span>
              <span className="spec-value">{workOrder?.color || "Personalizado"}</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Trabajos Clave</span>
              <span className="spec-value">Bomper Acero • Visera • LED</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Garantía de Taller</span>
              <span className="spec-value text-amber-400">Certificada Mellos Truck</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Llamado a la Acción Comercial (Viralización) */}
      <footer className="showroom-footer-cta">
        <div className="cta-box">
          <h2>¿Quieres una transformación de este nivel para tu camión?</h2>
          <p>
            En Mellos Truck fabricamos accesorios a medida, bompers de acero inoxidable y personalización que impone respeto en carretera.
          </p>
          <div className="cta-actions">
            <Link to="/" className="btn-cta-primary">
              ⚡ Cotizar Mi Mula Ahora
            </Link>
            <a
              href="https://wa.me/573000000000?text=Hola%20Mellos%20Truck,%20vi%20la%20transformaci%C3%B3n%20en%20el%20showroom%20y%20quiero%20cotizar%20mi%20veh%C3%ADculo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-whatsapp"
            >
              💬 Hablar con un Asesor por WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
