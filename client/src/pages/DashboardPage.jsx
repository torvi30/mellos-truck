import { useAuth } from "../contexts/AuthContext.jsx";

function DashboardPage() {
    const { user } = useAuth();
    const adminName = user?.displayName || user?.email || "Administrador";
  
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Bienvenido, {adminName}</p>
        </div>
  
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Cotizaciones</h3>
            <p>Gestión comercial</p>
          </div>
  
          <div className="stat-card">
            <h3>Clientes</h3>
            <p>Base de contactos</p>
          </div>
  
          <div className="stat-card">
            <h3>Vehículos</h3>
            <p>Historial por placa</p>
          </div>
  
          <div className="stat-card">
            <h3>Mellos Pro</h3>
            <p>Sistema operativo en línea</p>
          </div>
        </div>
      </div>
    );
  }
  
  export default DashboardPage;