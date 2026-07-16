import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Mellos Admin</h2>
          <p>Panel de control</p>
        </div>

        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/quotes">Cotizaciones</Link>
          <Link to="/admin/clients">Clientes</Link>
          <Link to="/admin/vehicles">Vehículos</Link>
          <Link to="/admin/gallery">Catálogo / Galería</Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;