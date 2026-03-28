import { useEffect, useState } from "react";
import { getClientsRequest } from "../api/api";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("mellos_token");

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClientsRequest(token);
        setClients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando clientes:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Listado general de clientes</p>
      </div>

      {loading ? (
        <p>Cargando clientes...</p>
      ) : clients.length === 0 ? (
        <p>No hay clientes registrados aún.</p>
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
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.phone}</td>
                  <td>{client.whatsapp || "-"}</td>
                  <td>{client.city || "-"}</td>
                  <td>{client.company || "-"}</td>
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