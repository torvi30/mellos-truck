import { useEffect, useState } from "react";
import { createQuoteRequest, getGalleryRequest } from "../api/api";

function PublicHome() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    service: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [catalogImages, setCatalogImages] = useState([]);
  const [vehicleImages, setVehicleImages] = useState([]);

  const services = [
    {
      title: "Accesorios para pesados",
      text: "Soluciones y accesorios para tractomulas, camiones y vehículos pesados con enfoque en presencia, utilidad y estilo.",
    },
    {
      title: "Luces y personalización",
      text: "Montaje y asesoría en iluminación, detalles exteriores y elementos que elevan el impacto visual del vehículo.",
    },
    {
      title: "Atención rápida",
      text: "Cotización clara, contacto por WhatsApp y acompañamiento para que el cliente no se pierda en el proceso.",
    },
  ];

  const reasons = [
    "Atención directa y rápida",
    "Enfoque en vehículos pesados",
    "Imagen más profesional para el cliente",
    "Proceso simple de cotización",
  ];

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await getGalleryRequest();
        setCatalogImages(Array.isArray(data.catalog) ? data.catalog : []);
        setVehicleImages(Array.isArray(data.vehicles) ? data.vehicles : []);
      } catch (error) {
        console.error("Error cargando imágenes públicas:", error);
      }
    };

    loadGallery();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createQuoteRequest({
        client_name: form.name,
        phone: form.phone,
        city: null,
        vehicle_type: "No especificado",
        plate: null,
        service: form.service,
        details: form.details,
      });

      setMessage("✅ Cotización enviada correctamente. Te contactaremos pronto.");
      setForm({
        name: "",
        phone: "",
        service: "",
        details: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Error enviando la cotización. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page">
      <header className="public-header">
        <div className="public-container header-inner">
          <div className="brand-box">
            <div className="brand-logo">MT</div>
            <div>
              <h2>Mellos Trucks</h2>
              <p>Accesorios y soluciones para pesados</p>
            </div>
          </div>

          <nav className="public-nav">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#galeria">Galería</a>
            <a href="#cotizar">Cotizar</a>
          </nav>

          <a
            className="primary-btn header-btn"
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </header>

      <section className="hero-section" id="inicio">
        <div className="public-container hero-grid">
          <div className="hero-copy">
            <span className="hero-badge">Mellos Pro</span>
            <h1>
              Accesorios, presencia y soluciones para vehículos pesados
            </h1>
            <p>
              En Mellos Trucks llevamos cada proyecto con enfoque visual,
              atención rápida y una presentación profesional. No solo vendemos
              piezas: ayudamos a que el vehículo se vea más fuerte, más serio y
              más comercial.
            </p>

            <div className="hero-actions">
              <a href="#cotizar" className="primary-btn">
                Solicitar cotización
              </a>
              <a href="#galeria" className="secondary-btn">
                Ver trabajos
              </a>
            </div>

            <div className="hero-metrics">
              <div className="metric-card">
                <strong>+ Impacto</strong>
                <span>Más presencia visual</span>
              </div>
              <div className="metric-card">
                <strong>+ Orden</strong>
                <span>Cotización más clara</span>
              </div>
              <div className="metric-card">
                <strong>+ Venta</strong>
                <span>Canal directo por WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-panel hero-panel-main">
              <span>Proyecto premium</span>
              <h3>Diseño, accesorios y presencia en carretera</h3>
            </div>
            <div className="hero-panel hero-panel-small top-right">
              <span>Atención rápida</span>
            </div>
            <div className="hero-panel hero-panel-small bottom-left">
              <span>Cotización directa</span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section" id="servicios">
        <div className="public-container">
          <div className="section-heading">
            <span>Servicios</span>
            <h2>Lo que hacemos para que Mellos se vea duro</h2>
            <p>
              La idea es transmitir potencia, orden y confianza. Esta página no
              solo debe verse bien: debe hacer que el cliente escriba y pida
              cotización.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={index}>
                <div className="service-number">0{index + 1}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section dark-section">
        <div className="public-container reasons-grid">
          <div>
            <div className="section-heading left">
              <span>Por qué Mellos</span>
              <h2>Una marca que debe verse pesada y profesional</h2>
              <p>
                El objetivo de esta landing es que el cliente sienta que está
                tratando con un negocio serio, fuerte y bien montado.
              </p>
            </div>
          </div>

          <div className="reasons-list">
            {reasons.map((item, index) => (
              <div className="reason-item" key={index}>
                <div className="reason-check">✓</div>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section" id="catalogo">
        <div className="public-container">
          <div className="section-heading">
            <span>Catálogo</span>
            <h2>Lo que venden y lo que se puede mostrar</h2>
            <p>
              Aquí van las piezas, accesorios y productos que ofrecen para que
              el cliente vea lo que puede conseguir.
            </p>
          </div>

          <div className="gallery-grid">
            {catalogImages.length > 0 ? (
              catalogImages.map((item) => (
                <div className="gallery-card" key={item.path}>
                  <img src={item.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div className="gallery-overlay">
                    <h3>{item.name}</h3>
                    <p>Catálogo</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay imágenes de catálogo aún.</p>
            )}
          </div>
        </div>
      </section>

      <section className="public-section dark-section" id="vehiculos">
        <div className="public-container">
          <div className="section-heading">
            <span>Vehículos</span>
            <h2>Cómo quedan los vehículos después del trabajo</h2>
            <p>
              Esta sección muestra la parte visual del resultado final: el
              vehículo ya transformado y listo para llamar la atención.
            </p>
          </div>

          <div className="gallery-grid">
            {vehicleImages.length > 0 ? (
              vehicleImages.map((item) => (
                <div className="gallery-card" key={item.path}>
                  <img src={item.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div className="gallery-overlay">
                    <h3>{item.name}</h3>
                    <p>Vehículo</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay imágenes de vehículos aún.</p>
            )}
          </div>
        </div>
      </section>

      <section className="public-section accent-section" id="cotizar">
        <div className="public-container quote-wrapper">
          <div className="quote-copy">
            <span>Cotizar</span>
            <h2>Cuéntanos qué necesitas y te respondemos por WhatsApp</h2>
            <p>
              Esto lo dejamos listo para que el cliente escriba sin pensar
              demasiado. Después lo conectamos al backend para guardar la
              solicitud en el panel admin.
            </p>
          </div>

          <div className="quote-card">
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="service"
              placeholder="Servicio que necesitas"
              value={form.service}
              onChange={handleChange}
            />

            <textarea
              name="details"
              rows="5"
              placeholder="Describe lo que buscas"
              value={form.details}
              onChange={handleChange}
            />

            <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Enviando..." : "Enviar cotización"}
            </button>

            {message && <p className="form-message">{message}</p>}
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="public-container footer-grid">
          <div>
            <h3>Mellos Trucks</h3>
            <p>
              Soluciones y accesorios para vehículos pesados con una imagen más
              seria, profesional y vendedora.
            </p>
          </div>

          <div>
            <h4>Navegación</h4>
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#galeria">Galería</a>
            <a href="#cotizar">Cotizar</a>
          </div>

          <div>
            <h4>Contacto</h4>
            <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="/admin/login">Panel admin</a>
          </div>
        </div>
      </footer>

      <a
        className="floating-whatsapp"
        href="https://wa.me/573000000000"
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
    </div>
  );
}

export default PublicHome;