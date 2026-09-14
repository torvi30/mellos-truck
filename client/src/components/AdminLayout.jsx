import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      {/* 1. Header Móvil (< 900px) */}
      <header className="admin-mobile-topbar">
        <Link to="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontWeight: "900",
              fontSize: "0.95rem",
            }}
          >
            MT
          </div>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: "900", color: "#f8fafc" }}>MELLOS TRUCK</div>
            <div style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: "700" }}>PANEL TALLER</div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            to="/"
            target="_blank"
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.08)",
              color: "#cbd5e1",
              fontSize: "0.75rem",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            🌐 Web
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* 2. Sidebar de Escritorio (> 900px) */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
                fontWeight: "900",
                fontSize: "1.1rem",
              }}
            >
              MT
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", margin: 0, color: "#f8fafc", letterSpacing: "0.05em" }}>
                MELLOS TRUCK
              </h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#f59e0b", fontWeight: "700" }}>
                TALLER & CONTAINER
              </p>
            </div>
          </Link>
        </div>

        {/* Los 4 Pilares Estratégicos de Gestión */}
        <nav className="admin-nav">
          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", padding: "0 8px 4px 8px", letterSpacing: "0.08em" }}>
            MÓDULOS PRINCIPALES
          </div>

          {/* 1. Dashboard */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(245, 158, 11, 0.15)" : "#18181b",
              border: isActive ? "1px solid #f59e0b" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#f59e0b" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>📊</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Dashboard</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Métricas operativas</div>
            </div>
          </NavLink>

          {/* 2. Taller & Mulas */}
          <NavLink
            to="/admin/workshop"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(249, 115, 22, 0.15)" : "#18181b",
              border: isActive ? "1px solid #f97316" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#f97316" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>🛠️</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Taller & Mulas</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Kanban y trazabilidad</div>
            </div>
          </NavLink>

          {/* 3. Inventario Container */}
          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(56, 189, 248, 0.15)" : "#18181b",
              border: isActive ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#38bdf8" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>📦</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Inventario Container</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Repuestos & stock crítico</div>
            </div>
          </NavLink>

          {/* 4. Showroom & Magic Links */}
          <NavLink
            to="/admin/studio"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(251, 191, 36, 0.15)" : "#18181b",
              border: isActive ? "1px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#fbbf24" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>⚡</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Showroom & Magic Links</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Difusión por WhatsApp</div>
            </div>
          </NavLink>

          {/* Separador */}
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "14px 4px 10px 4px" }}></div>

          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", padding: "0 8px 4px 8px", letterSpacing: "0.08em" }}>
            COMUNICACIÓN
          </div>

          {/* 5. Cotizaciones Web */}
          <NavLink
            to="/admin/quotes"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              background: isActive ? "rgba(74, 222, 128, 0.15)" : "transparent",
              border: isActive ? "1px solid #4ade80" : "1px solid transparent",
              color: isActive ? "#4ade80" : "#94a3b8",
              fontWeight: isActive ? "800" : "500",
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.1rem" }}>💬</span>
            <span>Cotizaciones Web</span>
          </NavLink>
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: "600",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            🌐 Ver Sitio Público
          </Link>

          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* 3. Contenido Principal */}
      <main className="admin-content">
        <Outlet />
      </main>

      {/* 4. Barra de Navegación Inferior Móvil (< 900px) */}
      <nav className="admin-mobile-bottombar">
        <NavLink to="/admin" end className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/workshop" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>🛠️</span>
          <span>Taller</span>
        </NavLink>
        <NavLink to="/admin/inventory" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>📦</span>
          <span>Container</span>
        </NavLink>
        <NavLink to="/admin/studio" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <span>Showroom</span>
        </NavLink>
        <NavLink to="/admin/quotes" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>💬</span>
          <span>Cotizaciones</span>
        </NavLink>
      </nav>
    </div>
  );
}