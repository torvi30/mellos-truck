import { useEffect, useMemo, useState } from "react";
import { getClientsRequest, createClientRequest } from "../api/api";

function ClientsPage() {

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    city: "",
    company: "",
    notes: "",
  });

  const loadClients = async () => {
    try {
      const data = await getClientsRequest();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return clients;

    return clients.filter((client) => {
      return (
        (client.name || "").toLowerCase().includes(term) ||
        (client.phone || "").toLowerCase().includes(term) ||
        (client.whatsapp || "").toLowerCase().includes(term) ||
        (client.city || "").toLowerCase().includes(term) ||
        (client.company || "").toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await createClientRequest(form);

      if (data.clientId) {
        setMessage("Cliente creado correctamente");
        setForm({
          name: "",
          phone: "",
          whatsapp: "",
          city: "",
          company: "",
          notes: "",
        });
        await loadClients();
      } else {
        setMessage(data.message || "No se pudo crear el cliente");
      }
    } catch (error) {
      console.error("Error creando cliente:", error);
      setMessage("Error de conexión con el servidor");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Registro, control y búsqueda de clientes</p>
      </div>

      <div className="page-top-grid">
        <div className="form-card">
          <h2>Nuevo cliente</h2>

          <form className="quote-admin-form" onSubmit={handleCreateClient}>
            <div className="form-grid">
              <input
                type="text"
                name="name"
                placeholder="Nombre del cliente"
                value={form.name}
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
                name="whatsapp"
                placeholder="WhatsApp"
                value={form.whatsapp}
                onChange={handleChange}
              />

              <input
                type="text"
                name="city"
                placeholder="Ciudad"
                value={form.city}
                onChange={handleChange}
              />

              <input
                type="text"
                name="company"
                placeholder="Empresa"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="notes"
              placeholder="Notas del cliente"
              value={form.notes}
              onChange={handleChange}
              rows="4"
            />

            <button type="submit" className="primary-btn">
              Guardar cliente
            </button>

            {message && <p className="form-message">{message}</p>}
          </form>
        </div>

        <div className="form-card">
          <h2>Resumen rápido</h2>

          <div className="mini-stats">
            <div className="mini-stat-card">
              <strong>{clients.length}</strong>
              <span>Total clientes</span>
            </div>

            <div className="mini-stat-card">
              <strong>{filteredClients.length}</strong>
              <span>Resultado búsqueda</span>
            </div>
          </div>

          <div className="search-box">
            <label>Buscar cliente</label>
            <input
              type="text"
              placeholder="Nombre, teléfono, ciudad o empresa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ height: "24px" }} />

      {loading ? (
        <p>Cargando clientes...</p>
      ) : filteredClients.length === 0 ? (
        <p>No hay clientes para mostrar.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>WhatsApp</th>
                <th>Ciudad</th>
                <th>Empresa</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.phone}</td>
                  <td>{client.whatsapp || "-"}</td>
                  <td>{client.city || "-"}</td>
                  <td>{client.company || "-"}</td>
                  <td>{client.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;