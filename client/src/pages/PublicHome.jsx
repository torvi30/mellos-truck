import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import { showSuccessToast, showErrorToast } from "../utils/alerts";

export default function PublicHome() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Medellín",
    vehicle_type: "Kenworth T800",
    plate: "",
    service: "Bomper de Acero Inoxidable & Visera",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setLiveProducts(data.products);
        }
      })
      .catch((err) => console.warn("Usando catálogo estático destacado:", err));
  }, []);

  const services = [
    {
      title: "Fabricación de Bompers en Acero",
      text: "Diseño y fabricación a medida de bompers de 18\" a 22\" en lámina de acero inoxidable calidad 304, corte láser computarizado, soldadura TIG pulida e iluminación LED integrada.",
      badge: "Especialidad de la Casa",
    },
    {
      title: "Viseras Americanas & Cornetas",
      text: "Montaje de viseras estilo americano en acero espejo (Drop Visors), cornetas de tren Hadley con pulmones de aire y luces de gálibo tipo sandía (watermelon LEDs).",
      badge: "Lujo & Estilo",
    },
    {
      title: "Latonería, Pintura & Estética Pesada",
      text: "Intervenciones estéticas de cabina, restauración de chasis, pulido cerámico para camiones de exhibición y personalización de estribos y tanques de combustible.",
      badge: "Acabado Showroom",
    },
    {
      title: "Tienda Container de Lujos & Repuestos",
      text: "Punto de venta físico y distribución de rines cromados Alcoa, tapas de espárragos tipo spike, tuberías de escape cromadas y accesorios eléctricos.",
      badge: "Punto Físico",
    },
  ];

  const featuredProducts = [
    {
      title: "Bomper de Acero Inoxidable 20\" con Luces LED",
      category: "Estructura & Cromo",
      image: "/images/showroom/detail_bumper_chrome.jpg",
      description: "Acero inoxidable 304 calibre pesado, corte láser de precisión, luces LED ámbar impermeables IP68 y acabado espejo.",
      price: 3500000,
    },
    {
      title: "Visera Americana Drop Visor & Doble Corneta",
      category: "Cabina & Lujo",
      image: "/images/showroom/detail_visera_cornetas.jpg",
      description: "Visera americana con ajuste aerodinámico para Kenworth, Mack e International, con base para cornetas de alta resonancia.",
      price: 1800000,
    },
    {
      title: "Rines Pulidos Alcoa con Spikes Cromados",
      category: "Ruedas & Ejes",
      image: "/images/showroom/detail_rines_spikes.jpg",
      description: "Rines de aluminio forjado pulido espejo, copas cromadas y espárragos en punta para un look agresivo y respetado en ruta.",
      price: 4200000,
    },
  ];

  const displayProducts = liveProducts.length > 0
    ? liveProducts.map((p) => ({
        title: p.nombre,
        category: p.categoria || "Accesorio",
        image: p.imagen_url || "/images/showroom/detail_bumper_chrome.jpg",
        description: p.descripcion || `Stock disponible: ${p.stock} unidades en el Container.`,
        price: p.precio_venta,
      }))
    : featuredProducts;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showErrorToast("Por favor ingresa tu nombre y número de WhatsApp");
      setMessage("⚠️ Por favor ingresa al menos tu nombre y número de WhatsApp.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:4000/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.name,
          phone: form.phone,
          city: form.city || "No especificada",
          vehicle_type: form.vehicle_type,
          plate: form.plate || null,
          service: form.service,
          details: form.details || "Cotización solicitada desde la página principal",
        }),
      });

      if (response.ok) {
        showSuccessToast("¡Solicitud enviada! Conectando con asesor...");
      }
    } catch (err) {
      console.warn("Registrando localmente:", err);
    } finally {
      setLoading(false);
      setMessage("✅ ¡Solicitud enviada! Te estamos conectando con un asesor por WhatsApp...");

      // Redirigir a WhatsApp con el mensaje pre-cargado
      const waText = encodeURIComponent(
        `¡Hola Mellos Truck! 🚛🔥\nQuiero cotizar para mi vehículo:\n- Nombre: ${form.name}\n- Mula/Camión: ${form.vehicle_type} (Placa: ${form.plate || "Sin especificar"})\n- Servicio: ${form.service}\n- Ciudad: ${form.city}\n- Detalles: ${form.details || "Quiero más información de precios y tiempos."}`
      );
      window.open(`https://wa.me/573000000000?text=${waText}`, "_blank");
    }
  };

  return (
    <div className="public-page">
      {/* 1. Header Pro */}
      <header className="public-header">
        <div className="public-container header-inner">
          <Link to="/" className="brand-box">
            <div className="brand-logo">MT</div>
            <div>
              <h2>MELLOS TRUCK</h2>
              <p>Taller de Modificaciones & Tienda Container</p>
            </div>
          </Link>

          <nav className="public-nav">
            <a href="#transformacion">Showroom & Transformaciones</a>
            <a href="#catalogo">Tienda Container</a>
            <a href="#cotizar">Cotizar Mula</a>
          </nav>

          <div className="header-cta-group">
            <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="btn-header-magic">
              ⚡ Ver Showroom 4K
            </Link>
            <a
              className="primary-btn header-btn"
              href="https://wa.me/573000000000?text=Hola%20Mellos%20Truck,%20quiero%20cotizar%20accesorios%20para%20mi%20cami%C3%B3n"
              target="_blank"
              rel="noreferrer"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Principal Cinematográfico */}
      <section className="hero-section" id="inicio">
        <div className="public-container hero-grid">
          <div className="hero-copy">
            <div className="hero-badge-container">
              <span className="hero-badge-dot"></span>
              <span className="hero-badge">LÍDERES EN MODIFICACIÓN DE PESADOS</span>
            </div>
            <h1>
              POTENCIA, ACERO & PRESENCIA PARA TU TRACTOMULA
            </h1>
            <p>
              En <strong>Mellos Truck</strong> convertimos tu vehículo de carga pesada en una verdadera obra de arte en carretera. Fabricación artesanal de bompers en acero inoxidable, viseras americanas, iluminación LED y lujos que imponen respeto en cualquier ruta.
            </p>

            <div className="hero-actions">
              <a href="#cotizar" className="primary-btn pulse-btn">
                ⚡ Cotizar Mi Nave Ahora
              </a>
              <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="secondary-btn">
                🎬 Explorar Showroom 4K
              </Link>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <strong>100% Acero</strong>
                <span>Inoxidable Calidad 304</span>
              </div>
              <div className="metric-card">
                <strong>+1,200</strong>
                <span>Mulas Transformadas</span>
              </div>
              <div className="metric-card">
                <strong>Garantía</strong>
                <span>De Taller & Soldadura TIG</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-featured-image-wrapper">
              <img
                src="/images/showroom/kenworth_after.jpg"
                alt="Kenworth T800 Personalizada por Mellos Truck"
                className="hero-main-truck-img"
              />
              <div className="hero-image-overlay-card">
                <span className="overlay-tag">PROYECTO DESTACADO</span>
                <h4>Kenworth T800 Aerocab</h4>
                <p>Bomper 20" • Visera Espejo • Doble Corneta</p>
                <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="overlay-link">
                  Ver Magic Link del Vehículo ➜
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Slider Interactivo "Antes y Después" Destacado en el Home */}
      <section className="public-section transformacion-section" id="transformacion">
        <div className="public-container">
          <div className="section-heading">
            <span className="subheading-neon">EL CAMBIO HABLA POR SÍ SOLO</span>
            <h2>Intervención Real de Taller: Antes vs. Después</h2>
            <p>
              Desliza la manija amarilla para ver la transformación de esta Kenworth T800: desde su llegada con bomper de fábrica hasta la entrega con acero cromado tipo espejo y accesorios de lujo.
            </p>
          </div>

          <div className="home-slider-wrapper">
            <BeforeAfterSlider
              beforeImage="/images/showroom/kenworth_before.jpg"
              afterImage="/images/showroom/kenworth_after.jpg"
              beforeLabel="ANTES (Llegada al taller)"
              afterLabel="DESPUÉS (Mellos Truck)"
              aspectRatio="16/9"
            />
            <div className="slider-bottom-meta">
              <div className="meta-left">
                <strong>Kenworth T800 • Placa WTL-892</strong>
                <p>Transformación completa de estética, iluminación perimetral y bomper de acero inoxidable.</p>
              </div>
              <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="btn-view-project">
                🎬 Ver Video & Ficha Completa del Proyecto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3.1 Flota de Transformaciones Reales */}
      <section className="public-section" style={{ background: "linear-gradient(180deg, #0b0c0f 0%, #12141a 100%)", padding: "4.5rem 0", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="public-container">
          <div className="section-heading">
            <span className="subheading-neon">PROYECTOS ENTREGADOS EN TALLER</span>
            <h2>Naves que Ya Dominan las Carreteras</h2>
            <p>
              Explora las transformaciones artesanales más imponentes de Colombia: Kenworth, Mack y Peterbilt modificadas con orgullo en Mellos Truck.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "1.8rem", marginTop: "2rem" }}>
            {/* Kenworth T800 */}
            <div style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(245, 158, 11, 0.25)", background: "#14161c", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "relative", height: "200px" }}>
                <img src="/images/showroom/kenworth_after.jpg" alt="Kenworth T800" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)", color: "#000", fontWeight: "900", fontSize: "0.85rem", letterSpacing: "0.14em", padding: "0.2rem 0.6rem", borderRadius: "4px", border: "1.5px solid #000" }}>
                  WTL-892
                </div>
              </div>
              <div style={{ padding: "1.4rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: "800", textTransform: "uppercase" }}>KENWORTH • ACERO ESPEJO 304</span>
                <h3 style={{ margin: "0.4rem 0 0.6rem 0", fontSize: "1.2rem", color: "#fff", fontWeight: "900" }}>Kenworth T800 Aerocab</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.4" }}>
                  Bomper artesanal de 20" con corte láser, visera americana tipo espejo y doble corneta Hadley 24V.
                </p>
                <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="primary-btn" style={{ display: "block", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem" }}>
                  ⚡ Ver Showroom 4K
                </Link>
              </div>
            </div>

            {/* Mack Vision Elite */}
            <div style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(251, 146, 60, 0.25)", background: "#14161c", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "relative", height: "200px" }}>
                <img src="/images/showroom/mack_truck_custom.jpg" alt="Mack Vision" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)", color: "#000", fontWeight: "900", fontSize: "0.85rem", letterSpacing: "0.14em", padding: "0.2rem 0.6rem", borderRadius: "4px", border: "1.5px solid #000" }}>
                  SZZ-514
                </div>
              </div>
              <div style={{ padding: "1.4rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#fb923c", fontWeight: "800", textTransform: "uppercase" }}>MACK • ROJO RUBÍ METALIZADO</span>
                <h3 style={{ margin: "0.4rem 0 0.6rem 0", fontSize: "1.2rem", color: "#fff", fontWeight: "900" }}>Mack Vision Elite</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.4" }}>
                  Tuberías de escape gemelas pulidas, rines con spikes en punta y bomper americano de diseño envolvente.
                </p>
                <Link to="/galeria/Mack-Vision-Placa-SZZ514" className="primary-btn" style={{ display: "block", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #fb923c, #ea580c)", color: "#000" }}>
                  ⚡ Ver Showroom 4K
                </Link>
              </div>
            </div>

            {/* Peterbilt 389 */}
            <div style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid rgba(52, 211, 153, 0.25)", background: "#14161c", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "relative", height: "200px" }}>
                <img src="/images/showroom/peterbilt_truck_custom.jpg" alt="Peterbilt 389" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "12px", left: "12px", background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)", color: "#000", fontWeight: "900", fontSize: "0.85rem", letterSpacing: "0.14em", padding: "0.2rem 0.6rem", borderRadius: "4px", border: "1.5px solid #000" }}>
                  UFT-621
                </div>
              </div>
              <div style={{ padding: "1.4rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "800", textTransform: "uppercase" }}>PETERBILT • VERDE ESMERALDA</span>
                <h3 style={{ margin: "0.4rem 0 0.6rem 0", fontSize: "1.2rem", color: "#fff", fontWeight: "900" }}>Peterbilt 389 Pride & Class</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: "1.4" }}>
                  Pintura poliuretano de alta resistencia, rines Alcoa pulidos espejo y visera americana en acero inoxidable.
                </p>
                <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="primary-btn" style={{ display: "block", textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #10b981, #059669)", color: "#000" }}>
                  ⚡ Ver Showroom 4K
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Módulo Showroom & Magic Link Explanation */}
      <section className="public-section dark-section" id="showroom">
        <div className="public-container magic-link-feature-grid">
          <div className="magic-copy">
            <span className="subheading-neon">TECNOLOGÍA DIFERENCIADORA</span>
            <h2>El Magic Link: Tu Camión con su Propia Página Web</h2>
            <p>
              Cada vez que una tractomula sale de nuestro taller, generamos un <strong>enlace público exclusivo de solo lectura</strong> con su placa y marca.
            </p>
            <ul className="magic-perks-list">
              <li>
                <span className="perk-icon">⚡</span>
                <div>
                  <strong>Slider interactivo de tu vehículo</strong>
                  <p>Muestra el cambio exacto de tu mula a tus colegas y amigos.</p>
                </div>
              </li>
              <li>
                <span className="perk-icon">🎬</span>
                <div>
                  <strong>Video cinemático en 4K sin pausas</strong>
                  <p>Tomas aéreas en dron reproducidas al instante gracias a streaming HTTP 206.</p>
                </div>
              </li>
              <li>
                <span className="perk-icon">💬</span>
                <div>
                  <strong>Botón directo de compartir por WhatsApp</strong>
                  <p>Presume tu nave con un solo clic en tus grupos de camioneros.</p>
                </div>
              </li>
            </ul>

            <Link to="/galeria/Kenworth-T800-Placa-WTL892" className="primary-btn">
              🔥 Probar Demostración en Vivo
            </Link>
          </div>

          <div className="magic-preview-card">
            <div className="magic-card-header">
              <span className="window-dot red"></span>
              <span className="window-dot yellow"></span>
              <span className="window-dot green"></span>
              <span className="magic-url-bar">mellostruck.com/galeria/Kenworth-T800-Placa-WTL892</span>
            </div>
            <div className="magic-card-body">
              <img src="/images/showroom/kenworth_after.jpg" alt="Showroom Preview" />
              <div className="magic-card-info">
                <h4>Kenworth T800 Aerocab</h4>
                <p>Placa: WTL-892 • Cliente: Don Carlos Rodríguez</p>
                <div className="magic-card-tags">
                  <span>Bomper 20"</span>
                  <span>Visera Acero</span>
                  <span>Luces LED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Catálogo Tienda Container & Accesorios */}
      <section className="public-section" id="catalogo">
        <div className="public-container">
          <div className="section-heading">
            <span className="subheading-neon">TIENDA CONTAINER & PRODUCTOS</span>
            <h2>Lujos & Accesorios Listos para Instalar</h2>
            <p>
              En nuestro Container encuentras piezas fabricadas con la más alta calidad de acero inoxidable y marcas reconocidas de iluminación pesada.
            </p>
          </div>

          <div className="products-showcase-grid">
            {displayProducts.map((prod, index) => (
              <div className="product-showcase-card" key={index}>
                <div className="product-img-wrapper">
                  <img src={prod.image} alt={prod.title} loading="lazy" decoding="async" />
                  <span className="product-category-tag">{prod.category}</span>
                </div>
                <div className="product-content">
                  <h3>{prod.title}</h3>
                  {prod.price && (
                    <div style={{ color: "#f59e0b", fontWeight: "900", fontSize: "1.1rem", marginBottom: "0.4rem" }}>
                      ${parseFloat(prod.price).toLocaleString("es-CO")} COP
                    </div>
                  )}
                  <p>{prod.description}</p>
                  <a
                    href={`https://wa.me/573000000000?text=Hola%20Mellos%20Truck,%20estoy%20interesado%20en%20el%20producto:%20${encodeURIComponent(
                      prod.title
                    )}${prod.price ? `%20(Precio:%20$${parseFloat(prod.price).toLocaleString("es-CO")}%20COP)` : ""}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-product-inquire"
                  >
                    💬 Consultar en WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Servicios de Taller Especializado */}
      <section className="public-section dark-section" id="servicios">
        <div className="public-container">
          <div className="section-heading">
            <span className="subheading-neon">SERVICIOS DE TALLER</span>
            <h2>Lo que Hacemos para que tu Mula Imponga Respeto</h2>
            <p>
              Trabajamos con las marcas más exigentes: Kenworth, Mack, International, Freightliner y Peterbilt.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={index}>
                <span className="service-badge-pill">{service.badge}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Cotizador Rápido Directo a WhatsApp */}
      <section className="public-section accent-section" id="cotizar">
        <div className="public-container quote-wrapper">
          <div className="quote-copy">
            <span className="subheading-neon">COTIZADOR RÁPIDO</span>
            <h2>¿Listo para Personalizar tu Mula?</h2>
            <p>
              Completa los datos de tu vehículo y te respondemos de inmediato con la propuesta técnica y costos por WhatsApp.
            </p>

            <div className="quote-trust-points">
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>Asesoría personalizada por maestros paileros</span>
              </div>
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>Tiempos de entrega claros y garantizados</span>
              </div>
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>Envíos e instalaciones a nivel nacional</span>
              </div>
            </div>
          </div>

          <div className="quote-card">
            <h3 className="quote-card-title">Solicitar Cotización de Taller</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group-row">
                <div className="form-field">
                  <label>Nombre o Empresa *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ej: Don Carlos / Transportes SAS"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Número de WhatsApp *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Ej: 310 123 4567"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>Vehículo / Modelo</label>
                  <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
                    <option value="Kenworth T800">Kenworth T800</option>
                    <option value="Kenworth W900">Kenworth W900</option>
                    <option value="Kenworth T680">Kenworth T680</option>
                    <option value="Mack Vision / Anthem">Mack Vision / Anthem</option>
                    <option value="International Prostar / LT">International Prostar / LT</option>
                    <option value="Freightliner Cascadia / Coronado">Freightliner Cascadia / Coronado</option>
                    <option value="Otro Vehículo Pesado">Otro Vehículo Pesado</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Placa del Vehículo</label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="Ej: WTL-892"
                    value={form.plate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Servicio o Accesorio Deseado</label>
                <select name="service" value={form.service} onChange={handleChange}>
                  <option value="Bomper de Acero Inoxidable (18-22 Pulgadas)">
                    Bomper de Acero Inoxidable (18-22 Pulgadas)
                  </option>
                  <option value="Visera Americana & Juego de Cornetas">
                    Visera Americana & Juego de Cornetas
                  </option>
                  <option value="Transformación Completa (Bomper + Visera + Luces)">
                    Transformación Completa (Bomper + Visera + Luces)
                  </option>
                  <option value="Rines Cromados & Accesorios de Ruedas">
                    Rines Cromados & Accesorios de Ruedas
                  </option>
                  <option value="Latonería, Pintura & Embellecimiento">
                    Latonería, Pintura & Embellecimiento
                  </option>
                  <option value="Repuestos / Lujos Tienda Container">
                    Repuestos / Lujos Tienda Container
                  </option>
                </select>
              </div>

              <div className="form-field">
                <label>Detalles o requerimientos especiales</label>
                <textarea
                  name="details"
                  rows="3"
                  placeholder="¿Algún corte láser, luces LED o diseño específico que tengas en mente?"
                  value={form.details}
                  onChange={handleChange}
                />
              </div>

              <button className="primary-btn form-submit-btn" type="submit" disabled={loading}>
                {loading ? "Procesando..." : "⚡ Enviar y Chatear por WhatsApp"}
              </button>

              {message && <p className="form-message">{message}</p>}
            </form>
          </div>
        </div>
      </section>

      {/* 8. Footer Pro */}
      <footer className="public-footer">
        <div className="public-container footer-grid">
          <div>
            <div className="brand-box footer-brand">
              <div className="brand-logo">MT</div>
              <h3>MELLOS TRUCK</h3>
            </div>
            <p>
              El taller líder en fabricación de bompers de acero inoxidable, viseras americanas y personalización estética para tractomulas y vehículos de carga pesada.
            </p>
            <p className="footer-ig">
              Síguenos en Instagram:{" "}
              <a href="https://www.instagram.com/mellos_trucks/" target="_blank" rel="noreferrer">
                @mellos_trucks
              </a>
            </p>
          </div>

          <div>
            <h4>Showroom & Taller</h4>
            <Link to="/galeria/Kenworth-T800-Placa-WTL892">Proyecto Kenworth T800</Link>
            <a href="#transformacion">Slider Antes y Después</a>
            <a href="#catalogo">Tienda Container</a>
            <a href="#servicios">Servicios de Acero</a>
          </div>

          <div>
            <h4>Atención & Contacto</h4>
            <a
              href="https://wa.me/573000000000?text=Hola%20Mellos%20Truck,%20quiero%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank"
              rel="noreferrer"
            >
              💬 WhatsApp Ventas Directas
            </a>
            <p className="footer-location">📍 Medellín, Colombia</p>
            <Link to="/admin/login" className="footer-admin-link">
              🔐 Acceso Administrativo
            </Link>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Mellos Truck. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Botón Flotante de WhatsApp */}
      <a
        className="floating-whatsapp"
        href="https://wa.me/573000000000?text=Hola%20Mellos%20Truck,%20quiero%20cotizar%20mi%20cami%C3%B3n"
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
      >
        <span>💬</span>
        <span className="wa-text">Cotizar en WhatsApp</span>
      </a>
    </div>
  );
}