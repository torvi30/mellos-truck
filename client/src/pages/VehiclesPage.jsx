import { useEffect, useMemo, useState } from "react";
import {
  getVehiclesRequest,
  createVehicleRequest,
  getClientsRequest,
} from "../api/api";

function VehiclesPage() {

  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    client_id: "",
    plate: "",
    brand: "",
    line: "",
    model: "",
    vehicle_type: "",
    color: "",
    notes: "",
  });

  const vehicleTypes = [
    "Tractomula",
    "Camión",
    "Turbo",
    "Furgón",
    "Remolque",
    "Volqueta",
    "Bus",
    "Buseta",
    "Camioneta",
    "Automóvil",
    "Otro",
  ];

  const loadVehicles = async () => {
    try {
      const data = await getVehiclesRequest();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClientsRequest();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClients([]);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadClients();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return vehicles;

    return vehicles.filter((vehicle) => {
      return (
        (vehicle.plate || "").toLowerCase().includes(term) ||
        (vehicle.brand || "").toLowerCase().includes(term) ||
        (vehicle.line || "").toLowerCase().includes(term) ||
        (vehicle.vehicle_type || "").toLowerCase().includes(term) ||
        (vehicle.client_name || "").toLowerCase().includes(term) ||
        (vehicle.client_phone || "").toLowerCase().includes(term)
      );
    });
  }, [vehicles, search]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const selectedClient = clients.find((client) => client.id === form.client_id);
      const payload = {
        ...form,
        client_name: selectedClient?.name || null,
        client_phone: selectedClient?.phone || null,
      };
      const data = await createVehicleRequest(payload);

      if (data.vehicleId) {
        setMessage("Vehículo creado correctamente");
        setForm({
          client_id: "",
          plate: "",
          brand: "",
          line: "",
          model: "",
          vehicle_type: "",
          color: "",
          notes: "",
        });
        await loadVehicles();
      } else {
        setMessage(data.message || "No se pudo crear el vehículo");
      }
    } catch (error) {
      console.error("Error creando vehículo:", error);
      setMessage("Error de conexión con el servidor");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Vehículos</h1>
        <p>Registro, búsqueda y control por placa y cliente</p>
      </div>

      <div className="page-top-grid">
        <div className="form-card">
          <h2>Nuevo vehículo</h2>

          <form className="quote-admin-form" onSubmit={handleCreateVehicle}>
            <div className="form-grid">
              <select
                name="client_id"
                value={form.client_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="plate"
                placeholder="Placa"
                value={form.plate}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="brand"
                placeholder="Marca"
                value={form.brand}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="line"
                placeholder="Línea"
                value={form.line}
                onChange={handleChange}
              />

              <input
                type="text"
                name="model"
                placeholder="Modelo"
                value={form.model}
                onChange={handleChange}
              />

              <select
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                required
              >
                <option value="">Tipo de vehículo</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="color"
                placeholder="Color"
                value={form.color}
                onChange={handleChange}
              />
            </div>

            <textarea
              name="notes"
              placeholder="Notas del vehículo"
              value={form.notes}
              onChange={handleChange}
              rows="4"
            />

            <button type="submit" className="primary-btn">
              Guardar vehículo
            </button>

            {message && <p className="form-message">{message}</p>}
          </form>
        </div>

        <div className="form-card">
          <h2>Resumen rápido</h2>

          <div className="mini-stats">
            <div className="mini-stat-card">
              <strong>{vehicles.length}</strong>
              <span>Total vehículos</span>
            </div>

            <div className="mini-stat-card">
              <strong>{filteredVehicles.length}</strong>
              <span>Resultado búsqueda</span>
            </div>
          </div>

          <div className="search-box">
            <label>Buscar vehículo</label>
            <input
              type="text"
              placeholder="Placa, cliente, teléfono, marca o tipo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ height: "24px" }} />

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : filteredVehicles.length === 0 ? (
        <p>No hay vehículos para mostrar.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Línea</th>
                <th>Modelo</th>
                <th>Tipo</th>
                <th>Color</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.plate}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.line || "-"}</td>
                  <td>{vehicle.model || "-"}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.color || "-"}</td>
                  <td>{vehicle.client_name}</td>
                  <td>{vehicle.client_phone}</td>
                  <td>{vehicle.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VehiclesPage;