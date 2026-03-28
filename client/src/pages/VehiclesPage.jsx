import { useEffect, useState } from "react";
import { getVehiclesRequest } from "../api/api";

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("mellos_token");

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await getVehiclesRequest(token);
        setVehicles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando vehículos:", error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Vehículos</h1>
        <p>Registro de vehículos por cliente</p>
      </div>

      {loading ? (
        <p>Cargando vehículos...</p>
      ) : vehicles.length === 0 ? (
        <p>No hay vehículos registrados aún.</p>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Línea</th>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>{vehicle.id}</td>
                  <td>{vehicle.plate}</td>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.line || "-"}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.client_name}</td>
                  <td>{vehicle.client_phone}</td>
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