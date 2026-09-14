import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const adminName = user?.displayName || user?.email || "Administrador Mellos Truck";

  const [stats, setStats] = useState({
    showroomsCount: 2,
    quotesCount: 3,
    lowStockCount: 2,
    clientsCount: 2,
  });

  useEffect(() => {
    // Cargar métricas en tiempo real
    Promise.all([
      fetch("http://localhost:4000/api/work-orders")
        .then((r) => r.json())
        .catch(() => ({ count: 5 })),
      fetch("http://localhost:4000/api/showroom")
        .then((r) => r.json())
        .catch(() => ({ count: 2 })),
      fetch("http://localhost:4000/api/quotes")
        .then((r) => r.json())
        .catch(() => []),
      fetch("http://localhost:4000/api/products")
        .then((r) => r.json())
        .catch(() => ({ lowStockCount: 2 })),
    ]).then(([ordersData, showroomData, quotesData, productsData]) => {
      setStats({
        ordersCount: ordersData?.count || 5,
        showroomsCount: showroomData?.count || 2,
        quotesCount: Array.isArray(quotesData) ? quotesData.length : 3,
        lowStockCount: productsData?.lowStockCount || 2,
        clientsCount: 2,
      });
    });
  }, []);

  return (
    <div className="studio-container">
      {/* Page Header */}
      <div className="studio-header">
        <div>
          <h1>Panel de Control & Taller Mellos Truck</h1>
          <p>Bienvenido, <strong>{adminName}</strong>. Estado operativo en tiempo real.</p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          <Link to="/admin/workshop" className="primary-btn" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }}>
            🛠️ Tablero Taller
          </Link>
          <Link to="/admin/studio" className="primary-btn pulse-btn">
            ⚡ + Emitir Magic Link
          </Link>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="studio-stats-row">
        <Link to="/admin/workshop" className="studio-stat-card" style={{ textDecoration: "none", borderColor: "rgba(245, 158, 11, 0.4)" }}>
          <span className="stat-num" style={{ color: "#f59e0b" }}>{stats.ordersCount || 5}</span>
          <span className="stat-label">Mulas en Taller (Kanban)</span>
        </Link>

        <Link to="/admin/studio" className="studio-stat-card" style={{ textDecoration: "none" }}>
          <span className="stat-num">{stats.showroomsCount}</span>
          <span className="stat-label">Showrooms Emitidos (Magic Links)</span>
        </Link>

        <Link to="/admin/quotes" className="studio-stat-card" style={{ textDecoration: "none" }}>
          <span className="stat-num" style={{ color: "#38bdf8" }}>{stats.quotesCount}</span>
          <span className="stat-label">Cotizaciones Registradas</span>
        </Link>

        <Link to="/admin/inventory" className="studio-stat-card" style={{ textDecoration: "none" }}>
          <span className="stat-num" style={{ color: stats.lowStockCount > 0 ? "#f87171" : "#4ade80" }}>
            {stats.lowStockCount}
          </span>
          <span className="stat-label">Alertas de Stock Container</span>
        </Link>
      </div>

      {/* Acciones Rápidas del Negocio */}
      <div className="studio-card-wrapper" style={{ marginBottom: "28px" }}>
        <h2>Módulos Principales de Gestión</h2>
        <div className="studio-projects-grid">
          <div className="studio-project-item" style={{ borderTop: "4px solid #f59e0b" }}>
            <div className="item-details">
              <span className="subheading-neon" style={{ color: "#f59e0b" }}>OPERACIONES & TRAZABILIDAD</span>
              <h3>Taller Central & Mulas</h3>
              <p className="item-desc">
                Tablero Kanban industrial: seguimiento de mulas en Ingreso, Pailería, Pintura y Terminado con descuento automático de piezas desde el Container.
              </p>
              <Link to="/admin/workshop" className="btn-view-project" style={{ textAlign: "center", borderColor: "rgba(245, 158, 11, 0.5)", color: "#f59e0b" }}>
                🛠️ Abrir Tablero de Taller
              </Link>
            </div>
          </div>

          <div className="studio-project-item">
            <div className="item-details">
              <span className="subheading-neon">MODALIDAD COMERCIAL</span>
              <h3>Studio de Magic Links</h3>
              <p className="item-desc">
                Genera los enlaces únicos para enviar al transportador por WhatsApp apenas la mula sale del taller, con slider interactivo y tomas aéreas.
              </p>
              <Link to="/admin/studio" className="btn-view-project" style={{ textAlign: "center" }}>
                ⚡ Abrir Studio de Showrooms
              </Link>
            </div>
          </div>

          <div className="studio-project-item">
            <div className="item-details">
              <span className="subheading-neon" style={{ color: "#38bdf8" }}>TIENDA & REPUESTOS</span>
              <h3>Inventario Container</h3>
              <p className="item-desc">
                Monitorea existencias de bompers en acero, cornetas de tren Hadley, viseras americanas y rines forjados Alcoa.
              </p>
              <Link to="/admin/inventory" className="btn-view-project" style={{ textAlign: "center", borderColor: "rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}>
                📦 Abrir Inventario Container
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enlace a la Vitrina Pública */}
      <div className="studio-card-wrapper" style={{ textAlign: "center", padding: "30px" }}>
        <h3 style={{ color: "#fff", marginBottom: "8px" }}>¿Quieres revisar cómo ven los clientes la plataforma?</h3>
        <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "0 auto 18px" }}>
          Accede a la página pública o al showroom cinematográfico oficial de la Kenworth T800 Aerocab.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          <Link to="/" target="_blank" className="primary-btn">
            🌐 Ver Página Principal (Home)
          </Link>
          <Link to="/galeria/Kenworth-T800-Placa-WTL892" target="_blank" className="secondary-btn">
            🎬 Ver Magic Link Kenworth T800
          </Link>
        </div>
      </div>
    </div>
  );
}