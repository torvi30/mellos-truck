import { useEffect, useState } from "react";
import {
  getQuotesRequest,
  updateQuoteStatusRequest,
} from "../api/api";

function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("mellos_token");

  const loadQuotes = async () => {
    try {
      const data = await getQuotesRequest(token);
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

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuoteStatusRequest(token, id, status);
      loadQuotes();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Cotizaciones</h1>
        <p>Seguimiento de solicitudes recibidas</p>
      </div>

      {loading ? (
        <p>Cargando cotizaciones...</p>
      ) : quotes.length === 0 ? (
        <p>No hay cotizaciones todavía.</p>
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
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
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
                    <select
                      value={quote.status}
                      onChange={(e) =>
                        handleStatusChange(quote.id, e.target.value)
                      }
                    >
                      <option value="nueva">Nueva</option>
                      <option value="contactado">Contactado</option>
                      <option value="en revision">En revisión</option>
                      <option value="cotizada">Cotizada</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="convertida">Convertida</option>
                    </select>
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