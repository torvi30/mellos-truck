import React from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user, role, switchRole, isWorkshop } = useAuth();

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
              background: isWorkshop
                ? "linear-gradient(135deg, #f97316, #ea580c)"
                : "linear-gradient(135deg, #f59e0b, #ef4444)",
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
            <div style={{ fontSize: "0.65rem", color: isWorkshop ? "#f97316" : "#f59e0b", fontWeight: "700" }}>
              {isWorkshop ? "🛠️ MODO PATIO" : "👔 GERENCIA"}
            </div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Quick role toggle móvil */}
          <button
            onClick={() => switchRole(isWorkshop ? "admin" : "workshop")}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              background: isWorkshop ? "rgba(249,115,22,0.15)" : "rgba(245,158,11,0.15)",
              border: isWorkshop ? "1px solid #f97316" : "1px solid #f59e0b",
              color: isWorkshop ? "#f97316" : "#f59e0b",
              fontSize: "0.7rem",
              fontWeight: "800",
              cursor: "pointer",
            }}
            title="Alternar entre modo Gerencia y modo Taller"
          >
            {isWorkshop ? "🛠️ Patio" : "👔 Admin"}
          </button>

          <Link
            to="/"
            target="_blank"
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.08)",
              color: "#cbd5e1",
              fontSize: "0.72rem",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            🌐 Web
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "5px 8px",
              borderRadius: "6px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.72rem",
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
                background: isWorkshop
                  ? "linear-gradient(135deg, #f97316, #ea580c)"
                  : "linear-gradient(135deg, #f59e0b, #ef4444)",
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
              <p style={{ margin: 0, fontSize: "0.75rem", color: isWorkshop ? "#f97316" : "#f59e0b", fontWeight: "700" }}>
                TALLER & CONTAINER
              </p>
            </div>
          </Link>
        </div>

        {/* Switch Selector de Rol Operativo */}
        <div style={{ padding: "0 4px 14px 4px" }}>
          <div
            style={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "4px",
              display: "flex",
              gap: "4px",
            }}
          >
            <button
              onClick={() => switchRole("admin")}
              style={{
                flex: 1,
                padding: "7px 6px",
                borderRadius: "7px",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: "800",
                cursor: "pointer",
                background: !isWorkshop ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                color: !isWorkshop ? "#000" : "#94a3b8",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              title="Vista Ejecutiva: Margen de ganancias, facturación completa y administración"
            >
              <span>👔</span> Gerencia
            </button>
            <button
              onClick={() => switchRole("workshop")}
              style={{
                flex: 1,
                padding: "7px 6px",
                borderRadius: "7px",
                border: "none",
                fontSize: "0.75rem",
                fontWeight: "800",
                cursor: "pointer",
                background: isWorkshop ? "linear-gradient(135deg, #f97316, #ea580c)" : "transparent",
                color: isWorkshop ? "#000" : "#94a3b8",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
              title="Vista de Taller: Enfocada en operaciones mecánicas, fotos, repuestos y tiempos sin cifras financieras confidenciales"
            >
              <span>🛠️</span> Patio
            </button>
          </div>
          <div style={{ fontSize: "0.68rem", color: isWorkshop ? "#f97316" : "#64748b", marginTop: "5px", textAlign: "center", fontWeight: "600" }}>
            {isWorkshop ? "🔒 Modo Patio: Cifras financieras ocultas" : "🔓 Modo Gerencia: Acceso financiero total"}
          </div>
        </div>

        {/* Los Módulos Estratégicos de Gestión */}
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
              padding: "11px 14px",
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
              padding: "11px 14px",
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
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Kanban, fotos 4K y patio</div>
            </div>
          </NavLink>

          {/* 3. CRM Clientes & Flotas */}
          <NavLink
            to="/admin/clients"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(168, 85, 247, 0.15)" : "#18181b",
              border: isActive ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#c084fc" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>👥</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Clientes & Flotas</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Directorio y fidelización</div>
            </div>
          </NavLink>

          {/* 4. Inventario Container */}
          <NavLink
            to="/admin/inventory"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
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

          {/* 5. Showroom & Magic Links */}
          <NavLink
            to="/admin/studio"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
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

          {/* 6. Personalizar Web */}
          <NavLink
            to="/admin/landing"
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 14px",
              borderRadius: "10px",
              textDecoration: "none",
              background: isActive ? "rgba(236, 72, 153, 0.15)" : "#18181b",
              border: isActive ? "1px solid #ec4899" : "1px solid rgba(255, 255, 255, 0.05)",
              color: isActive ? "#f472b6" : "#e2e8f0",
              fontWeight: isActive ? "800" : "600",
              transition: "all 0.2s ease",
            })}
          >
            <span style={{ fontSize: "1.2rem" }}>🎨</span>
            <div>
              <div style={{ fontSize: "0.9rem" }}>Personalizar Web</div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Hero, WhatsApp & portadas</div>
            </div>
          </NavLink>

          {/* Separador */}
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "10px 4px" }}></div>

          <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", padding: "0 8px 4px 8px", letterSpacing: "0.08em" }}>
            COMUNICACIÓN
          </div>

          {/* 6. Cotizaciones Web */}
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
        {isWorkshop && (
          <div
            style={{
              background: "linear-gradient(90deg, rgba(249,115,22,0.15), rgba(0,0,0,0.4))",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              borderRadius: "10px",
              padding: "8px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.1rem" }}>🛠️</span>
              <span style={{ fontSize: "0.8rem", color: "#fdba74", fontWeight: "700" }}>
                Modo Patio & Mecánica Activo — Vista operativa limpia (Márgenes financieros confidenciales protegidos).
              </span>
            </div>
            <button
              onClick={() => switchRole("admin")}
              style={{
                background: "rgba(249, 115, 22, 0.2)",
                border: "1px solid #f97316",
                color: "#ffedd5",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "0.72rem",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Cambiar a Vista Gerencial 👔
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* 4. Barra de Navegación Inferior Móvil (< 900px) */}
      <nav className="admin-mobile-bottombar">
        <NavLink to="/admin" end className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>📊</span>
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/admin/workshop" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>🛠️</span>
          <span>Taller</span>
        </NavLink>
        <NavLink to="/admin/clients" className={({ isActive }) => `admin-mobile-nav-item ${isActive ? "active" : ""}`}>
          <span style={{ fontSize: "1.2rem" }}>👥</span>
          <span>Clientes</span>
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
          <span>Cotizar</span>
        </NavLink>
      </nav>
    </div>
  );
}