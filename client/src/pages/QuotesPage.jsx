import { useEffect, useMemo, useState } from "react";
import {
  getQuotesRequest,
  updateQuoteStatusRequest,
  createQuoteRequest,
  convertQuoteRequest,
} from "../api/api";

function QuotesPage() {

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    city: "",
    vehicle_type: "",
    plate: "",
    service: "",
    details: "",
  });

  const statuses = [
    "nueva",
    "contactado",
    "en revision",
    "cotizada",
    "aprobada",
    "rechazada",
    "convertida",
  ];

  const statusLabelMap = {
    nueva: "Nueva",
    contactado: "Contactado",
    "en revision": "En revisión",
    cotizada: "Cotizada",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    convertida: "Convertida",
  };

  const getStatusClass = (status) => {
    const map = {
      nueva: "status-badge status-nueva",
      contactado: "status-badge status-contactado",
      "en revision": "status-badge status-revision",
      cotizada: "status-badge status-cotizada",
      aprobada: "status-badge status-aprobada",
      rechazada: "status-badge status-rechazada",
      convertida: "status-badge status-convertida",
    };

    return map[status] || "status-badge";
  };

  const loadQuotes = async () => {
    try {
      const data = await getQuotesRequest();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    if (statusFilter !== "todos") {
      result = result.filter((quote) => quote.status === statusFilter);
    }

    const term = search.trim().toLowerCase();

    if (!term) return result;

    return result.filter((quote) => {
      return (
        (quote.client_name || "").toLowerCase().includes(term) ||
        (quote.phone || "").toLowerCase().includes(term) ||
        (quote.city || "").toLowerCase().includes(term) ||
        (quote.vehicle_type || "").toLowerCase().includes(term) ||
        (quote.plate || "").toLowerCase().includes(term) ||
        (quote.service || "").toLowerCase().includes(term) ||
        (quote.details || "").toLowerCase().includes(term)
      );
    });
  }, [quotes, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: quotes.length,
      nuevas: quotes.filter((q) => q.status === "nueva").length,
      aprobadas: quotes.filter((q) => q.status === "aprobada").length,
      convertidas: quotes.filter((q) => q.status === "convertida").length,
    };
  }, [quotes]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await createQuoteRequest(form);

      if (data.quoteId) {
        setMessage("Cotización creada correctamente");
        setForm({
          client_name: "",
          phone: "",
          city: "",
          vehicle_type: "",
          plate: "",
          service: "",
          details: "",
        });
        await loadQuotes();
      } else {
        setMessage(data.message || "No se pudo crear la cotización");
      }
    } catch (error) {
      console.error("Error creando cotización:", error);
      setMessage("Error de conexión con el servidor");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuoteStatusRequest(id, status);
      await loadQuotes();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  const handleConvertQuote = async (id) => {
    try {
      const data = await convertQuoteRequest(id);

      if (data.clientId) {
        if (data.vehicleCreated) {
          setMessage("Cotización convertida: cliente y vehículo creados correctamente");
        } else if (data.clientAlreadyExisted) {
          setMessage("Cotización convertida: el cliente ya existía y se actualizó el estado");
        } else {
          setMessage("Cotización convertida a cliente correctamente");
        }

        await loadQuotes();
      } else {
        setMessage(data.message || "No se pudo convertir la cotización");
      }
    } catch (error) {
      console.error("Error convirtiendo cotización:", error);
      setMessage("Error al convertir la cotización");
    }
  };

  const handleContactWhatsApp = async (quote) => {
    const rawPhone = String(quote.phone || "").replace(/\D/g, "");

    if (!rawPhone) {
      setMessage("La cotización no tiene teléfono válido");
      return;
    }

    const phone = rawPhone.startsWith("57") ? rawPhone : `57${rawPhone}`;

    const text = `Hola ${quote.client_name}, te escribimos desde Mellos Trucks sobre tu solicitud de cotización.

Servicio: ${quote.service}
Vehículo: ${quote.vehicle_type}
Placa: ${quote.plate || "No registrada"}
Ciudad: ${quote.city}
Detalle: ${quote.details}

Queremos continuar con tu atención.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    if (quote.status === "nueva") {
      await handleStatusChange(quote.id, "contactado");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Cotizaciones</h1>
        <p>Registro, búsqueda y gestión del flujo comercial</p>
      </div>

      <div className="page-top-grid">
        <div className="form-card">
          <h2>Nueva cotización</h2>

          <form className="quote-admin-form" onSubmit={handleCreateQuote}>
            <div className="form-grid">
              <input
                type="text"
                name="client_name"
                placeholder="Nombre del cliente"
                value={form.client_name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="city"
                placeholder="Ciudad"
                value={form.city}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="vehicle_type"
                placeholder="Tipo de vehículo"
                value={form.vehicle_type}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="plate"
                placeholder="Placa"
                value={form.plate}
                onChange={handleChange}
              />

              <input
                type="text"
                name="service"
                placeholder="Servicio solicitado"
                value={form.service}
                onChange={handleChange}
                required
              />
            </div>

            <textarea
              name="details"
              placeholder="Describe lo que necesita el cliente"
              value={form.details}
              onChange={handleChange}
              rows="4"
              required
            />

            <button type="submit" className="primary-btn">
              Guardar cotización
            </button>

            {message && <p className="form-message">{message}</p>}
          </form>
        </div>

        <div className="form-card">
          <h2>Resumen rápido</h2>

          <div className="mini-stats">
            <div className="mini-stat-card">
              <strong>{counts.total}</strong>
              <span>Total cotizaciones</span>
            </div>

            <div className="mini-stat-card">
              <strong>{counts.nuevas}</strong>
              <span>Nuevas</span>
            </div>

            <div className="mini-stat-card">
              <strong>{counts.aprobadas}</strong>
              <span>Aprobadas</span>
            </div>

            <div className="mini-stat-card">
              <strong>{counts.convertidas}</strong>
              <span>Convertidas</span>
            </div>
          </div>

          <div className="search-box">
            <label>Buscar cotización</label>
            <input
              type="text"
              placeholder="Cliente, placa, ciudad, servicio o detalle"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ height: "14px" }} />

          <div className="search-box">
            <label>Filtrar por estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="todos">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabelMap[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ height: "24px" }} />

      {loading ? (
        <p>Cargando cotizaciones...</p>
      ) : filteredQuotes.length === 0 ? (
        <p>No hay cotizaciones para mostrar.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Vehículo</th>
                <th>Placa</th>
                <th>Servicio</th>
                <th>Detalle</th>
                <th>Estado</th>
                <th>Acciones rápidas</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.id}</td>
                  <td>{quote.client_name}</td>
                  <td>{quote.phone}</td>
                  <td>{quote.city}</td>
                  <td>{quote.vehicle_type}</td>
                  <td>{quote.plate || "-"}</td>
                  <td>{quote.service}</td>
                  <td>{quote.details}</td>
                  <td>
                    <div className="status-cell">
                      <span className={getStatusClass(quote.status)}>
                        {statusLabelMap[quote.status]}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="quick-actions">
                      <button
                        type="button"
                        className="quick-btn quick-btn-blue"
                        onClick={() => handleContactWhatsApp(quote)}
                      >
                        Contactar
                      </button>

                      <button
                        type="button"
                        className="quick-btn quick-btn-green"
                        onClick={() =>
                          handleStatusChange(quote.id, "aprobada")
                        }
                      >
                        Aprobar
                      </button>

                      <button
                        type="button"
                        className="quick-btn quick-btn-red"
                        onClick={() =>
                          handleStatusChange(quote.id, "rechazada")
                        }
                      >
                        Rechazar
                      </button>

                      <button
                        type="button"
                        className="quick-btn quick-btn-gold"
                        onClick={() => handleConvertQuote(quote.id)}
                      >
                        Convertir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default QuotesPage;