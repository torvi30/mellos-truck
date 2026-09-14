import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MagicLinksStudioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    plate: "",
    brand: "Kenworth",
    line: "T800 Aerocab",
    model: "2024",
    color: "Azul Metalizado",
    description: "Fabricación de bomper en acero inoxidable de 20 pulgadas, visera americana y cornetas.",
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/kenworth_after.jpg",
    video_url: "/api/stream/video/cinematic_kenworth_demo.mp4",
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/showroom");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn("Cargando proyectos locales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/showroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await loadProjects();
        setShowModal(false);
        setForm({
          clientName: "",
          phone: "",
          plate: "",
          brand: "Kenworth",
          line: "T800 Aerocab",
          model: "2024",
          color: "",
          description: "",
          before_url: "/images/showroom/kenworth_before.jpg",
          after_url: "/images/showroom/kenworth_after.jpg",
          video_url: "/api/stream/video/cinematic_kenworth_demo.mp4",
        });
      }
    } catch (err) {
      console.error("Error creando proyecto:", err);
    }
  };

  const handleCopy = (url, slug) => {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="studio-container">
      {/* Header del Studio */}
      <div className="studio-header">
        <div>
          <h1>Studio de Showrooms & Magic Links</h1>
          <p>
            Genera enlaces comerciales exclusivos para los clientes de las mulas terminadas en el taller.
          </p>
        </div>
        <button className="primary-btn pulse-btn" onClick={() => setShowModal(true)}>
          ⚡ + Emitir Nuevo Magic Link
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="studio-stats-row">
        <div className="studio-stat-card">
          <span className="stat-num">{projects.length}</span>
          <span className="stat-label">Showrooms Publicados</span>
        </div>
        <div className="studio-stat-card">
          <span className="stat-num">
            {projects.reduce((acc, p) => acc + (p.views || 0), 0)}
          </span>
          <span className="stat-label">Visualizaciones Totales</span>
        </div>
        <div className="studio-stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Streaming 206 Operativo</span>
        </div>
      </div>

      {/* Listado de Magic Links Activos */}
      <div className="studio-card-wrapper">
        <h2>Mulas Registradas en el Showroom</h2>

        {loading ? (
          <p className="loading-text">Cargando proyectos del showroom...</p>
        ) : (
          <div className="studio-projects-grid">
            {projects.map((project) => (
              <div className="studio-project-item" key={project.id}>
                <div className="item-thumbnail-box">
                  <img src={project.after_url} alt={project.plate} />
                  <span className="item-plate-pill">{project.plate}</span>
                  <span className="item-status-pill">{project.status}</span>
                </div>

                <div className="item-details">
                  <h3>
                    {project.brand} {project.line}
                  </h3>
                  <p className="item-owner">
                    Cliente: <strong>{project.clientName}</strong> {project.phone ? `(${project.phone})` : ""}
                  </p>
                  <p className="item-desc">{project.description}</p>

                  <div className="item-link-box">
                    <span className="item-url-text">{project.magicUrl}</span>
                    <button
                      onClick={() => handleCopy(project.magicUrl, project.slug)}
                      className="btn-copy-sm"
                    >
                      {copiedSlug === project.slug ? "✓ Copiado" : "Copiar"}
                    </button>
                  </div>

                  <div className="item-actions">
                    <a
                      href={project.whatsappShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-item-wa"
                    >
                      💬 Enviar por WhatsApp
                    </a>
                    <Link
                      to={`/galeria/${project.slug}`}
                      target="_blank"
                      className="btn-item-view"
                    >
                      👁️ Ver Showroom
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Crear Nuevo Magic Link */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>⚡ Emitir Magic Link para Mula Terminada</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group-row">
                <div className="form-field">
                  <label>Placa del Vehículo *</label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="Ej: WTL-892"
                    value={form.plate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Nombre del Dueño / Cliente *</label>
                  <input
                    type="text"
                    name="clientName"
                    placeholder="Ej: Don Carlos Rodríguez"
                    value={form.clientName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>WhatsApp del Cliente</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Ej: 573101234567"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Marca de la Mula *</label>
                  <select name="brand" value={form.brand} onChange={handleChange}>
                    <option value="Kenworth">Kenworth</option>
                    <option value="Mack">Mack</option>
                    <option value="International">International</option>
                    <option value="Freightliner">Freightliner</option>
                    <option value="Peterbilt">Peterbilt</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>Línea / Modelo</label>
                  <input
                    type="text"
                    name="line"
                    placeholder="Ej: T800 Aerocab / Vision"
                    value={form.line}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Color & Acabados</label>
                  <input
                    type="text"
                    name="color"
                    placeholder="Ej: Azul Noche Metalizado"
                    value={form.color}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Descripción de los Trabajos Realizados</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Detalla bomper, visera, luces LED, rines instalados..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  🚀 Publicar y Emitir Magic Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
