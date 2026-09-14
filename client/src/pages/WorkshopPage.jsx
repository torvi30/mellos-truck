import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

const STAGES = [
  { id: "Ingreso", title: "INGRESO", subtitle: "Diagnóstico & Desarme", color: "#f59e0b", dotColor: "#fbbf24", progress: 20, icon: "📋" },
  { id: "Taller", title: "TALLER", subtitle: "Pailería & Acero Inox", color: "#f97316", dotColor: "#fb923c", progress: 45, icon: "⚡" },
  { id: "Pintura", title: "PINTURA", subtitle: "Poliuretano & Brillo", color: "#a855f7", dotColor: "#c084fc", progress: 70, icon: "🎨" },
  { id: "Terminado", title: "TERMINADO", subtitle: "Control Calidad & Showroom", color: "#10b981", dotColor: "#34d399", progress: 90, icon: "💎" },
  { id: "Entregado", title: "ENTREGADO", subtitle: "Despachada a Ruta", color: "#38bdf8", dotColor: "#60a5fa", progress: 100, icon: "🚚" },
];

const DEFAULT_TRUCK_IMAGES = {
  Kenworth: "/images/showroom/kenworth_after.jpg",
  Mack: "/images/showroom/mack_truck_custom.jpg",
  Peterbilt: "/images/showroom/peterbilt_truck_custom.jpg",
  International: "/images/showroom/detail_bumper_chrome.jpg",
  Freightliner: "/images/showroom/kenworth_before.jpg",
};

export default function WorkshopPage() {
  const [orders, setOrders] = useState([]);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [activeView, setActiveView] = useState("kanban"); // "kanban" | "history"
  const [printOrderData, setPrintOrderData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileStageFilter, setMobileStageFilter] = useState("all");

  // Modal Ingresar Mula
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    cliente: "",
    telefono: "",
    placa: "",
    marca: "Kenworth",
    linea: "T800 Aerocab",
    color: "",
    costo_mano_obra: "2500000",
    descripcion: "",
  });

  // FICHA TÉCNICA 360° / CONSOLA DE CONTROL TOTAL DE LA MULA
  const [activeTruckDetail, setActiveTruckDetail] = useState(null);
  const [editLaborCost, setEditLaborCost] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Formulario para agregar repuesto desde la ficha
  const [assignForm, setAssignForm] = useState({
    productId: "",
    cantidad: 1,
  });

  // Modal personalizado para confirmar eliminación/cancelación de orden
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);

  // Notificaciones Toast
  const [feedback, setFeedback] = useState(null);

  const showNotification = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resArchived, resProducts] = await Promise.all([
        fetch(`${API_BASE}/work-orders`),
        fetch(`${API_BASE}/work-orders?only_archived=true`),
        fetch(`${API_BASE}/products`),
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.orders || []);
      }

      if (resArchived.ok) {
        const dataArchived = await resArchived.json();
        setArchivedOrders(dataArchived.orders || []);
      }

      if (resProducts.ok) {
        const dataProd = await resProducts.json();
        setProducts(dataProd.products || []);
      }
    } catch (err) {
      console.warn("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Abrir Ficha Técnica 360°
  const openTruckCockpit = (order) => {
    setActiveTruckDetail(order);
    setEditLaborCost(String(order.costo_mano_obra || 2000000));
    setEditNotes(order.descripcion || "");
    setAssignForm({
      productId: products[0]?.id || "",
      cantidad: 1,
    });
  };

  // Guardar Cambios en la Ficha (Mano de obra, notas)
  const handleSaveTruckDetail = async () => {
    if (!activeTruckDetail) return;

    try {
      const res = await fetch(`${API_BASE}/work-orders/${activeTruckDetail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costo_mano_obra: parseFloat(editLaborCost) || 0,
          descripcion: editNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Cambios guardados en la orden");
        setActiveTruckDetail(data.order);
        loadData();
      }
    } catch (err) {
      showNotification("Error al guardar cambios", "error");
    }
  };

  // Alternar archivado en histórico (sacar del patio sin perder registro)
  const handleToggleArchive = async (orderId, shouldArchive) => {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivado: shouldArchive }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || (shouldArchive ? "Mula archivada en el histórico" : "Mula reintegrada al patio"));
        if (activeTruckDetail && activeTruckDetail.id === orderId) {
          setActiveTruckDetail(data.order);
        }
        loadData();
      } else {
        showNotification(data.message || "Error al actualizar archivo", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Disparar impresión de Ficha de Parabrisas
  const triggerPrintWorkOrder = (order) => {
    if (!order) return;
    setPrintOrderData(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Crear orden de trabajo
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!createForm.cliente || !createForm.placa || !createForm.marca) {
      showNotification("Ingresa cliente, placa y marca", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/work-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || "Mula ingresada al taller");
        setShowCreateModal(false);
        setCreateForm({
          cliente: "",
          telefono: "",
          placa: "",
          marca: "Kenworth",
          linea: "T800 Aerocab",
          color: "",
          costo_mano_obra: "2000000",
          descripcion: "",
        });
        loadData();
      } else {
        showNotification(data.message || "Error al registrar", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Mover de fase (desde el Kanban o desde el Cockpit)
  const handleMoveStage = async (orderId, newStage) => {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStage }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        if (activeTruckDetail && activeTruckDetail.id === orderId) {
          setActiveTruckDetail(data.order);
        }
        loadData();
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Asignar pieza y descontar de inventario
  const handleAssignItem = async (e) => {
    e.preventDefault();
    if (!activeTruckDetail || !assignForm.productId) return;

    try {
      const res = await fetch(`${API_BASE}/work-orders/${activeTruckDetail.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(assignForm.productId, 10),
          cantidad: parseInt(assignForm.cantidad, 10) || 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        setActiveTruckDetail(data.order);
        loadData();
      } else {
        showNotification(data.message || "Error al asignar pieza", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Retirar pieza y reintegrar al inventario
  const handleRemoveItem = async (orderId, itemId) => {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}/items/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        setActiveTruckDetail(data.order);
        loadData();
      } else {
        showNotification(data.message || "Error al retirar pieza", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Solicitar confirmación para eliminar orden (Abre modal oscuro pro, sin alertas feas del navegador)
  const handleDeleteOrder = (orderId, plate, itemsCount = 0) => {
    setDeleteConfirmData({ id: orderId, plate, itemsCount });
  };

  // Ejecutar eliminación confirmada y devolver repuestos al stock
  const executeDeleteOrder = async (orderId, plate) => {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`Orden de la mula ${plate} cancelada y eliminada`);
        setDeleteConfirmData(null);
        if (activeTruckDetail && activeTruckDetail.id === orderId) {
          setActiveTruckDetail(null);
        }
        loadData();
      } else {
        const errData = await res.json();
        showNotification(errData.message || "Error al eliminar orden", "error");
      }
    } catch (err) {
      showNotification("Error al eliminar orden", "error");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      o.placa.toLowerCase().includes(term) ||
      o.cliente.toLowerCase().includes(term) ||
      o.marca.toLowerCase().includes(term) ||
      (o.linea && o.linea.toLowerCase().includes(term))
    );
  });

  const filteredArchivedOrders = archivedOrders.filter((o) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      o.placa.toLowerCase().includes(term) ||
      o.cliente.toLowerCase().includes(term) ||
      o.marca.toLowerCase().includes(term) ||
      (o.linea && o.linea.toLowerCase().includes(term))
    );
  });

  const getCleanTruckTitle = (order) => {
    if (!order.linea) return order.marca;
    if (order.linea.toLowerCase().includes(order.marca.toLowerCase())) {
      return order.linea;
    }
    return `${order.marca} ${order.linea}`;
  };

  const getTruckImage = (order) => {
    if (order.placa === "WTL-892") return "/images/showroom/kenworth_after.jpg";
    if (order.placa === "SZZ-514") return "/images/showroom/mack_truck_custom.jpg";
    if (order.placa === "UFT-621") return "/images/showroom/peterbilt_truck_custom.jpg";
    if (order.placa === "XVZ-409") return "/images/showroom/detail_visera_cornetas.jpg";
    if (order.placa === "SKR-901") return "/images/showroom/kenworth_before.jpg";
    if (order.placa === "SKM-302") return "/images/showroom/detail_bumper_chrome.jpg";
    return DEFAULT_TRUCK_IMAGES[order.marca] || "/images/showroom/kenworth_after.jpg";
  };

  const selectedProduct = products.find((p) => p.id === parseInt(assignForm.productId, 10));

  return (
    <div
      style={{
        color: "#f8fafc",
        padding: "1.2rem 1.6rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "radial-gradient(circle at 40% -10%, rgba(245, 158, 11, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 90%, rgba(56, 189, 248, 0.05) 0%, transparent 50%)",
      }}
    >
      {/* Toast Notification */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            background: feedback.type === "error" ? "#dc2626" : "#059669",
            color: "#ffffff",
            fontWeight: "700",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.9rem",
          }}
        >
          <span>{feedback.type === "error" ? "⚠️" : "✅"}</span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* HEADER ULTRA PREMIUM: Command Center */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.2rem",
          padding: "1rem 1.4rem",
          background: "linear-gradient(135deg, rgba(22, 24, 30, 0.85), rgba(12, 14, 18, 0.95))",
          backdropFilter: "blur(20px)",
          borderRadius: "14px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "900",
                margin: 0,
                letterSpacing: "0.04em",
                background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              Taller Central & Mulas
            </h1>
            <span
              style={{
                background: activeView === "kanban" ? "rgba(245, 158, 11, 0.15)" : "rgba(56, 189, 248, 0.15)",
                color: activeView === "kanban" ? "#f59e0b" : "#38bdf8",
                border: activeView === "kanban" ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid rgba(56, 189, 248, 0.35)",
                padding: "0.2rem 0.6rem",
                borderRadius: "20px",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.08em",
              }}
            >
              {activeView === "kanban" ? "TABLERO KANBAN" : "ARCHIVO HISTÓRICO"}
            </span>
          </div>

          {activeView === "kanban" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.35rem", fontSize: "0.82rem", color: "#94a3b8", flexWrap: "wrap" }}>
              <span style={{ color: "#f8fafc", fontWeight: "700" }}>🚛 {orders.length} Mulas en Patio</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ color: "#fb923c" }}>⚙️ {orders.filter((o) => o.estado === "Taller").length} Pailería</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ color: "#c084fc" }}>🎨 {orders.filter((o) => o.estado === "Pintura").length} Pintura</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ color: "#34d399" }}>💎 {orders.filter((o) => o.estado === "Terminado" || o.estado === "Entregado").length} Listas / Showroom</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.35rem", fontSize: "0.82rem", color: "#94a3b8", flexWrap: "wrap" }}>
              <span style={{ color: "#38bdf8", fontWeight: "800" }}>📁 {archivedOrders.length} Mulas Culminadas</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ color: "#34d399", fontWeight: "700" }}>💰 ${(archivedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)).toLocaleString("es-CO")} COP Facturado Total</span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
              <span style={{ color: "#94a3b8" }}>Historial contable y vitrina 4K permanente</span>
            </div>
          )}
        </div>

        {/* Selector de Vistas: Patio vs Histórico */}
        <div style={{ display: "flex", background: "rgba(10, 12, 16, 0.9)", padding: "0.3rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={() => setActiveView("kanban")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeView === "kanban" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
              color: activeView === "kanban" ? "#000" : "#94a3b8",
              fontWeight: "900",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: activeView === "kanban" ? "0 2px 10px rgba(245,158,11,0.3)" : "none",
            }}
          >
            <span>🚛 Tablero Patio ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("history")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeView === "history" ? "linear-gradient(135deg, #38bdf8, #0284c7)" : "transparent",
              color: activeView === "history" ? "#000" : "#94a3b8",
              fontWeight: "900",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: activeView === "history" ? "0 2px 10px rgba(56,189,248,0.3)" : "none",
            }}
          >
            <span>📁 Archivo Histórico ({archivedOrders.length})</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Buscar placa, cliente, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "230px",
                padding: "0.55rem 0.95rem",
                borderRadius: "10px",
                background: "rgba(10, 12, 16, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>

          <Link
            to="/admin/inventory"
            style={{
              padding: "0.55rem 0.95rem",
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            📦 Container
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.6rem 1.25rem",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              fontWeight: "900",
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.4)",
            }}
          >
            + Ingresar Mula
          </button>
        </div>
      </header>

      {activeView === "kanban" && (
        <>
          {/* SELECTOR RÁPIDO DE ETAPA EN MÓVIL (< 900px) */}
          <div className="workshop-mobile-filter">
        <button
          onClick={() => setMobileStageFilter("all")}
          style={{
            padding: "0.4rem 0.85rem",
            borderRadius: "20px",
            border: mobileStageFilter === "all" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
            background: mobileStageFilter === "all" ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.05)",
            color: mobileStageFilter === "all" ? "#f59e0b" : "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: "800",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          Todas ({orders.length})
        </button>
        {STAGES.map((stg) => {
          const count = orders.filter((o) => o.estado === stg.id).length;
          const isSelected = mobileStageFilter === stg.id;
          return (
            <button
              key={stg.id}
              onClick={() => setMobileStageFilter(isSelected ? "all" : stg.id)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: isSelected ? `1px solid ${stg.color}` : "1px solid rgba(255,255,255,0.1)",
                background: isSelected ? `${stg.color}25` : "rgba(255,255,255,0.05)",
                color: isSelected ? stg.color : "#94a3b8",
                fontSize: "0.75rem",
                fontWeight: "800",
                whiteSpace: "nowrap",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span>{stg.icon}</span>
              <span>{stg.title} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* KANBAN BOARD ESCALABLE CON TARJETAS COMPACTAS (Haz clic para abrir Ficha 360°) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando naves en taller...
        </div>
      ) : (
        <div className="workshop-kanban-grid">
          {STAGES.filter((stg) => mobileStageFilter === "all" || mobileStageFilter === stg.id).map((stage) => {
            const stageOrders = filteredOrders.filter((o) => o.estado === stage.id);

            return (
              <div
                key={stage.id}
                style={{
                  background: "linear-gradient(180deg, rgba(20, 22, 28, 0.85) 0%, rgba(12, 14, 18, 0.95) 100%)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "14px",
                  border: `1px solid ${stage.color}25`,
                  borderTop: `3px solid ${stage.color}`,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 195px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                }}
              >
                {/* Header de Fase */}
                <div
                  style={{
                    padding: "0.85rem 1.1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    background: `linear-gradient(90deg, ${stage.color}11, transparent)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1rem" }}>{stage.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "900", color: stage.color, letterSpacing: "0.06em" }}>
                        {stage.title}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                        {stage.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: `${stage.color}22`,
                      color: stage.color,
                      fontSize: "0.78rem",
                      fontWeight: "900",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "12px",
                      border: `1px solid ${stage.color}44`,
                    }}
                  >
                    {stageOrders.length}
                  </span>
                </div>

                {/* Lista de Tarjetas Compactas y Escalables */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {stageOrders.length === 0 ? (
                    <div
                      style={{
                        margin: "auto 0",
                        textAlign: "center",
                        padding: "2.5rem 1rem",
                        color: "#475569",
                        fontSize: "0.82rem",
                        border: "1px dashed rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ fontSize: "1.4rem", marginBottom: "0.3rem", opacity: 0.5 }}>🚛</div>
                      Sin naves en esta fase
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      const truckImg = getTruckImage(order);
                      const partsCount = (order.items || []).length;
                      const partsTotal = order.costo_repuestos || 0;

                      return (
                        <div
                          key={order.id}
                          onClick={() => openTruckCockpit(order)}
                          style={{
                            background: "linear-gradient(145deg, #181a22, #13141b)",
                            borderRadius: "11px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "0.85rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.55rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                            transition: "all 0.2s ease",
                            position: "relative",
                            borderLeft: `4px solid ${stage.color}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = stage.color;
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = `0 8px 22px rgba(0,0,0,0.6), 0 0 12px ${stage.color}33`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                            e.currentTarget.style.borderLeft = `4px solid ${stage.color}`;
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.4)";
                          }}
                        >
                          {/* Fila 1: Placa Troquelada + Marca + Miniatura */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                              {/* Placa Colombiana */}
                              <div
                                style={{
                                  background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                                  color: "#000",
                                  fontWeight: "900",
                                  fontSize: "0.82rem",
                                  letterSpacing: "0.12em",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "4px",
                                  border: "1.5px solid #000",
                                  boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  lineHeight: "1",
                                }}
                              >
                                <span>{order.placa}</span>
                              </div>

                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  color: "#94a3b8",
                                  fontWeight: "800",
                                  background: "rgba(255,255,255,0.06)",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "4px",
                                }}
                              >
                                {order.marca}
                              </span>
                            </div>

                            {/* Foto Miniatura Redonda */}
                            <img
                              src={truckImg}
                              alt={order.placa}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid rgba(255,255,255,0.15)",
                              }}
                            />
                          </div>

                          {/* Fila 2: Modelo & Cliente */}
                          <div>
                            <div style={{ fontWeight: "800", color: "#f8fafc", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {getCleanTruckTitle(order)}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "1px" }}>
                              👤 {order.cliente}
                            </div>
                          </div>

                          {/* Fila 3: Barra de Progreso y Piezas Container */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.73rem" }}>
                            <span style={{ color: partsCount > 0 ? "#38bdf8" : "#64748b", fontWeight: "700" }}>
                              📦 {partsCount > 0 ? `${partsCount} pieza(s)` : "Sin piezas"}
                            </span>

                            <span style={{ color: partsCount > 0 ? "#f59e0b" : "#64748b", fontWeight: "800" }}>
                              {partsCount > 0 ? `$${(partsTotal / 1000000).toFixed(1)}M COP` : ""}
                            </span>

                            {/* Indicador de Clic */}
                            <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                              Ver ➔
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* VISTA DE ARCHIVO HISTÓRICO: FLOTA DESPACHADA A RUTA */}
      {activeView === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", flex: 1, overflowY: "auto", paddingBottom: "1.5rem" }}>
          {/* KPI Summary Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <div style={{ background: "rgba(18, 20, 26, 0.75)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: "12px", padding: "1.1rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🚛 Mulas Despachadas
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f8fafc", marginTop: "0.3rem" }}>
                {archivedOrders.length}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                Flota culminada en taller
              </div>
            </div>

            <div style={{ background: "rgba(18, 20, 26, 0.75)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "12px", padding: "1.1rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🔨 Mano de Obra Liquidada
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fbbf24", marginTop: "0.3rem" }}>
                ${(archivedOrders.reduce((sum, o) => sum + (parseFloat(o.costo_mano_obra) || 0), 0)).toLocaleString("es-CO")} COP
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                Pailería, latonería y pintura
              </div>
            </div>

            <div style={{ background: "rgba(18, 20, 26, 0.75)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "12px", padding: "1.1rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📦 Salidas Repuestos Container
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#c084fc", marginTop: "0.3rem" }}>
                ${(archivedOrders.reduce((sum, o) => sum + (parseFloat(o.costo_repuestos) || 0), 0)).toLocaleString("es-CO")} COP
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                Piezas instaladas de inventario
              </div>
            </div>

            <div style={{ background: "rgba(18, 20, 26, 0.75)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "12px", padding: "1.1rem", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                💰 Facturación Bruta Histórica
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#34d399", marginTop: "0.3rem" }}>
                ${(archivedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)).toLocaleString("es-CO")} COP
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                Total consolidado de la flota archivada
              </div>
            </div>
          </div>

          {/* Estado de carga o Lista de Mulas */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
              Cargando flota archivada...
            </div>
          ) : filteredArchivedOrders.length === 0 ? (
            <div
              style={{
                background: "linear-gradient(180deg, rgba(20, 22, 28, 0.85) 0%, rgba(12, 14, 18, 0.95) 100%)",
                border: "1px dashed rgba(255,255,255,0.15)",
                borderRadius: "16px",
                padding: "3.5rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>📁</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 0.5rem 0" }}>
                {search ? "No se encontraron mulas archivadas con ese criterio" : "No hay mulas en el archivo histórico todavía"}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.88rem", maxWidth: "550px", margin: "0 auto 1.5rem auto", lineHeight: "1.6" }}>
                Cuando una mula culmine sus trabajos y se despache en fase <span style={{ color: "#38bdf8", fontWeight: "800" }}>ENTREGADO</span>, puedes pulsar <strong>"Archivar Mula"</strong> en su Ficha Técnica para mantener el patio ágil y preservar su contabilidad y galería 4K.
              </p>
              <button
                type="button"
                onClick={() => setActiveView("kanban")}
                style={{
                  padding: "0.6rem 1.4rem",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                Volver al Tablero de Patio
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1.2rem",
              }}
            >
              {filteredArchivedOrders.map((order) => {
                const truckImg = getTruckImage(order);
                const partsCount = order.items ? order.items.length : 0;
                const totalVal = parseFloat(order.total) || 0;

                return (
                  <div
                    key={order.id}
                    style={{
                      background: "linear-gradient(180deg, rgba(20, 22, 28, 0.85) 0%, rgba(12, 14, 18, 0.95) 100%)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Imagen de Cabecera y Placa */}
                    <div style={{ position: "relative", height: "135px", overflow: "hidden" }}>
                      <img
                        src={truckImg}
                        alt={order.placa}
                        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(12, 14, 18, 0.95) 100%)" }}></div>

                      {/* Placa Stamped */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "12px",
                          background: "#facc15",
                          color: "#000",
                          fontWeight: "900",
                          fontSize: "0.85rem",
                          letterSpacing: "0.08em",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "5px",
                          border: "1.5px solid #000",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        }}
                      >
                        {order.placa}
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "12px",
                          background: "rgba(56, 189, 248, 0.2)",
                          color: "#38bdf8",
                          border: "1px solid rgba(56, 189, 248, 0.4)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "20px",
                          fontSize: "0.72rem",
                          fontWeight: "800",
                        }}
                      >
                        🚚 Despachada
                      </div>

                      <div style={{ position: "absolute", bottom: "10px", left: "14px", right: "14px" }}>
                        <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#f8fafc" }}>
                          {getCleanTruckTitle(order)}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                          👤 {order.cliente} • 📞 {order.telefono || "Sin teléfono"}
                        </div>
                      </div>
                    </div>

                    {/* Resumen Contable y Detalles */}
                    <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1 }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                          background: "rgba(10, 12, 16, 0.6)",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Mano de Obra</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#fbbf24" }}>
                            ${(parseFloat(order.costo_mano_obra) || 0).toLocaleString("es-CO")}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Repuestos ({partsCount})</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#c084fc" }}>
                            ${(parseFloat(order.costo_repuestos) || 0).toLocaleString("es-CO")}
                          </div>
                        </div>
                        <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Total Facturado</div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "#34d399" }}>
                            ${totalVal.toLocaleString("es-CO")} COP
                          </div>
                        </div>
                      </div>

                      {order.descripcion && (
                        <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          "{order.descripcion}"
                        </div>
                      )}

                      {/* Botones de Acción */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "auto" }}>
                        <button
                          type="button"
                          onClick={() => openTruckCockpit(order)}
                          style={{
                            padding: "0.55rem 0.75rem",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#fff",
                            borderRadius: "8px",
                            fontWeight: "800",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          👁️ Ficha 360°
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerPrintWorkOrder(order)}
                          style={{
                            padding: "0.55rem 0.75rem",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            color: "#cbd5e1",
                            borderRadius: "8px",
                            fontWeight: "800",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          🖨️ Imprimir
                        </button>

                        {order.slug && (
                          <Link
                            to={`/galeria/${order.slug}`}
                            target="_blank"
                            style={{
                              padding: "0.55rem 0.75rem",
                              background: "rgba(16, 185, 129, 0.15)",
                              border: "1px solid rgba(16, 185, 129, 0.35)",
                              color: "#34d399",
                              borderRadius: "8px",
                              fontWeight: "800",
                              fontSize: "0.75rem",
                              textDecoration: "none",
                              textAlign: "center",
                            }}
                          >
                            💎 Showroom 4K
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleArchive(order.id, false)}
                          style={{
                            gridColumn: order.slug ? "auto" : "span 2",
                            padding: "0.55rem 0.75rem",
                            background: "rgba(56, 189, 248, 0.12)",
                            border: "1px solid rgba(56, 189, 248, 0.3)",
                            color: "#38bdf8",
                            borderRadius: "8px",
                            fontWeight: "800",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                          title="Reintegrar al Tablero Kanban de Patio"
                        >
                          ↩️ Reactivar al Patio
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONSOLA DE CONTROL TOTAL / FICHA TÉCNICA 360° (SE ABRE CON 1 CLIC EN CUALQUIER MULA) */}
      {activeTruckDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1.2rem",
          }}
        >
          <div className="cockpit-modal-container">
            {/* 1. Header Visual con Fotografía de la Mula */}
            <div
              style={{
                position: "relative",
                height: "155px",
                width: "100%",
                overflow: "hidden",
                borderTopLeftRadius: "18px",
                borderTopRightRadius: "18px",
              }}
            >
              <img
                src={getTruckImage(activeTruckDetail)}
                alt={activeTruckDetail.placa}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.75) contrast(1.15)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(21, 23, 32, 0.96) 100%)",
                }}
              ></div>

              {/* Botón de Cerrar */}
              <button
                onClick={() => setActiveTruckDetail(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(0,0,0,0.75)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                }}
              >
                ✕
              </button>

              {/* Placa y Título en el Header */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "18px",
                  right: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "0.8rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  {/* Placa 3D */}
                  <div
                    style={{
                      background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                      color: "#000",
                      fontWeight: "900",
                      fontSize: "1.05rem",
                      letterSpacing: "0.15em",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "6px",
                      border: "2px solid #000",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
                      textAlign: "center",
                    }}
                  >
                    <div>{activeTruckDetail.placa}</div>
                    <div style={{ fontSize: "0.45rem", letterSpacing: "0.25em", color: "#333", fontWeight: "800" }}>
                      COLOMBIA
                    </div>
                  </div>

                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#f8fafc" }}>
                      {getCleanTruckTitle(activeTruckDetail)}
                    </h2>
                    <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "2px" }}>
                      👤 {activeTruckDetail.cliente} {activeTruckDetail.telefono && `• 📞 ${activeTruckDetail.telefono}`}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {activeTruckDetail.estado === "Entregado" ? (
                    <div
                      style={{
                        background: "rgba(56, 189, 248, 0.18)",
                        border: "1px solid rgba(56, 189, 248, 0.5)",
                        color: "#38bdf8",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        boxShadow: "0 0 15px rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      <span>🚚</span>
                      <span>DESPACHADA A CARRETERA</span>
                    </div>
                  ) : activeTruckDetail.estado === "Terminado" ? (
                    <button
                      onClick={() => handleMoveStage(activeTruckDetail.id, "Entregado")}
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        border: "none",
                        color: "#000",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: "900",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <span>🚚</span>
                      <span>Despachar a Carretera</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* 2. Cuerpo de la Ficha 360° en 2 Columnas Responsivas */}
            <div className="cockpit-grid-layout">
              {/* COLUMNA IZQUIERDA: Fases del Taller, Showroom & Piso */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Stepper de Fases */}
                <div
                  style={{
                    background: "rgba(10, 12, 16, 0.7)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Fase en Taller: <span style={{ color: "#f59e0b" }}>{activeTruckDetail.estado}</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {STAGES.map((stg) => {
                      const isCurrent = activeTruckDetail.estado === stg.id;
                      return (
                        <button
                          key={stg.id}
                          onClick={() => handleMoveStage(activeTruckDetail.id, stg.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "8px",
                            border: isCurrent ? `2px solid ${stg.color}` : "1px solid rgba(255,255,255,0.06)",
                            background: isCurrent ? `${stg.color}22` : "rgba(255,255,255,0.02)",
                            color: isCurrent ? "#fff" : "#94a3b8",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            <span style={{ fontSize: "1.1rem" }}>{stg.icon}</span>
                            <div style={{ textAlign: "left" }}>
                              <div style={{ fontSize: "0.82rem", fontWeight: isCurrent ? "900" : "700", color: isCurrent ? stg.color : "#cbd5e1" }}>
                                {stg.title}
                              </div>
                              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{stg.subtitle}</div>
                            </div>
                          </div>
                          {isCurrent && <span style={{ color: stg.color, fontSize: "0.95rem", fontWeight: "900" }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Showroom 4K & WhatsApp si está Terminado o Entregado */}
                {(activeTruckDetail.estado === "Terminado" || activeTruckDetail.estado === "Entregado") && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.35)",
                      borderRadius: "12px",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "900", color: "#34d399" }}>
                        ⚡ Showroom Cinematográfico 4K Activo
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "2px" }}>
                        Vitrina interactiva y difusión listas para compartir.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {activeTruckDetail.slug && (
                        <Link
                          to={`/galeria/${activeTruckDetail.slug}`}
                          target="_blank"
                          style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "0.55rem 0.8rem",
                            background: "#10b981",
                            color: "#000",
                            borderRadius: "8px",
                            fontWeight: "900",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          👁️ Showroom 4K
                        </Link>
                      )}

                      {activeTruckDetail.whatsappShareUrl && (
                        <a
                          href={activeTruckDetail.whatsappShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "0.55rem 0.8rem",
                            background: "#22c55e",
                            color: "#000",
                            borderRadius: "8px",
                            fontWeight: "900",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          📱 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones Secundarias de Piso */}
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => triggerPrintWorkOrder(activeTruckDetail)}
                    style={{
                      flex: 1,
                      minWidth: "120px",
                      padding: "0.6rem 0.8rem",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#cbd5e1",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                  >
                    🖨️ Ficha Parabrisas
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleArchive(activeTruckDetail.id, !activeTruckDetail.archivado)}
                    style={{
                      flex: 1,
                      minWidth: "120px",
                      padding: "0.6rem 0.8rem",
                      background: activeTruckDetail.archivado ? "rgba(56, 189, 248, 0.12)" : "rgba(245, 158, 11, 0.12)",
                      border: activeTruckDetail.archivado ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid rgba(245, 158, 11, 0.35)",
                      color: activeTruckDetail.archivado ? "#38bdf8" : "#fbbf24",
                      borderRadius: "8px",
                      fontWeight: "800",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                    title={activeTruckDetail.archivado ? "Reactivar al patio activo" : "Archivar en el histórico para despejar el patio"}
                  >
                    {activeTruckDetail.archivado ? "↩️ Reactivar Mula" : "📁 Archivar Mula"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(activeTruckDetail.id, activeTruckDetail.placa, (activeTruckDetail.items || []).length)}
                    style={{
                      padding: "0.6rem 0.8rem",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      color: "#f87171",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                    title="Cancelar o anular orden"
                  >
                    🗑️ Anular
                  </button>
                </div>
              </div>

              {/* COLUMNA DERECHA: Repuestos del Container, Finanzas & Guardado */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Gestión de Repuestos del Container */}
                <div
                  style={{
                    background: "rgba(10, 12, 16, 0.7)",
                    padding: "1.1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase" }}>
                      📦 Repuestos Asignados ({activeTruckDetail.items ? activeTruckDetail.items.length : 0})
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "#38bdf8" }}>
                      ${(activeTruckDetail.costo_repuestos || 0).toLocaleString("es-CO")} COP
                    </div>
                  </div>

                  {/* Lista de Repuestos */}
                  {(!activeTruckDetail.items || activeTruckDetail.items.length === 0) ? (
                    <div style={{ padding: "0.9rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "8px", color: "#64748b", fontSize: "0.82rem" }}>
                      No se han asignado piezas del inventario a esta mula todavía.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", maxHeight: "150px", overflowY: "auto", marginBottom: "0.8rem" }}>
                      {activeTruckDetail.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0.8rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            fontSize: "0.82rem",
                          }}
                        >
                          <div>
                            <span style={{ color: "#f59e0b", fontWeight: "900" }}>{item.cantidad}x</span>{" "}
                            <span style={{ color: "#f8fafc", fontWeight: "600" }}>{item.nombre}</span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <span style={{ color: "#38bdf8", fontWeight: "800" }}>
                              ${(item.subtotal || 0).toLocaleString("es-CO")}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(activeTruckDetail.id, item.id)}
                              title="Devolver al Container"
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                color: "#f87171",
                                borderRadius: "4px",
                                cursor: "pointer",
                                padding: "0.15rem 0.4rem",
                                fontSize: "0.72rem",
                                fontWeight: "800",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario Rápido para Asignar Piezas */}
                  <form onSubmit={handleAssignItem} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <select
                      value={assignForm.productId}
                      onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })}
                      style={{
                        flex: 1,
                        minWidth: "170px",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        background: "#0a0c10",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: "0.82rem",
                      }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.nombre} (Stock: {p.stock}) — ${p.precio.toLocaleString("es-CO")}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      max={selectedProduct ? selectedProduct.stock : 99}
                      value={assignForm.cantidad}
                      onChange={(e) => setAssignForm({ ...assignForm, cantidad: e.target.value })}
                      style={{
                        width: "60px",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        background: "#0a0c10",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        textAlign: "center",
                      }}
                    />

                    <button
                      type="submit"
                      disabled={!selectedProduct || selectedProduct.stock < 1}
                      style={{
                        padding: "0.6rem 1rem",
                        background: "linear-gradient(135deg, #0284c7, #0369a1)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "900",
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Asignar
                    </button>
                  </form>
                </div>

                {/* Mano de Obra, Notas & Costo Total */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: "800", marginBottom: "0.35rem" }}>
                      Mano de Obra ($ COP)
                    </label>
                    <input
                      type="number"
                      value={editLaborCost}
                      onChange={(e) => setEditLaborCost(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        background: "#0a0c10",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#f8fafc",
                        fontSize: "0.95rem",
                        fontWeight: "900",
                      }}
                    />

                    <div style={{ marginTop: "0.75rem", padding: "0.65rem", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700" }}>TOTAL ORDEN ACUMULADO:</div>
                      <div style={{ color: "#f59e0b", fontSize: "1.15rem", fontWeight: "900" }}>
                        ${((parseFloat(editLaborCost) || 0) + (activeTruckDetail.costo_repuestos || 0)).toLocaleString("es-CO")} COP
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", fontWeight: "800", marginBottom: "0.35rem" }}>
                      Notas & Especificaciones
                    </label>
                    <textarea
                      rows="4"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Medidas, calibres, instrucciones de armado..."
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "8px",
                        background: "#0a0c10",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff",
                        fontSize: "0.82rem",
                        resize: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Botones de Acción de la Consola */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.8rem",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: "1rem",
                    marginTop: "auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTruckDetail(null)}
                    style={{
                      padding: "0.65rem 1.2rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Cerrar
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTruckDetail}
                    style={{
                      padding: "0.65rem 1.5rem",
                      background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                      color: "#000",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "900",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                    }}
                  >
                    💾 Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Ingresar Nueva Mula */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#161820",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#f59e0b" }}>
                Ingreso de Nueva Mula al Taller
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Placa (Ej: WTL-892) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="WTL-892"
                    value={createForm.placa}
                    onChange={(e) => setCreateForm({ ...createForm, placa: e.target.value.toUpperCase() })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fde047",
                      fontWeight: "900",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Marca *
                  </label>
                  <select
                    value={createForm.marca}
                    onChange={(e) => setCreateForm({ ...createForm, marca: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  >
                    <option value="Kenworth">Kenworth</option>
                    <option value="Mack">Mack</option>
                    <option value="International">International</option>
                    <option value="Peterbilt">Peterbilt</option>
                    <option value="Freightliner">Freightliner</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Línea / Modelo (Ej: T800, Vision)
                  </label>
                  <input
                    type="text"
                    placeholder="T800 Aerocab"
                    value={createForm.linea}
                    onChange={(e) => setCreateForm({ ...createForm, linea: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Azul Medianoche"
                    value={createForm.color}
                    onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Dueño / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Don Carlos Rodríguez"
                    value={createForm.cliente}
                    onChange={(e) => setCreateForm({ ...createForm, cliente: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Teléfono WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="573104567890"
                    value={createForm.telefono}
                    onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Trabajo a Realizar
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles de pailería, instalación de visera o bomper..."
                  value={createForm.descripcion}
                  onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    background: "#0c0e12",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    resize: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "0.65rem 1.2rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.65rem 1.4rem",
                    background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "900",
                    cursor: "pointer",
                  }}
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADO DARK: Confirmación de Anulación / Eliminación */}
      {deleteConfirmData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20000,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              background: "#161822",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(239, 68, 68, 0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>⚠️</div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#f87171", margin: "0 0 0.8rem 0" }}>
              ¿Anular Orden de la Mula {deleteConfirmData.plate}?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 1.2rem 0" }}>
              Si la mula <strong style={{ color: "#fff" }}>ya terminó su trabajo y salió del taller</strong>, no necesitas anularla: simplemente déjala en estado <span style={{ color: "#38bdf8", fontWeight: "800" }}>ENTREGADO</span> para conservar su historial contable y su Showroom 4K.
            </p>
            <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px dashed rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "0.8rem", fontSize: "0.82rem", color: "#fca5a5", marginBottom: "1.5rem" }}>
              Al anularla, sus <strong style={{ color: "#fff" }}>{deleteConfirmData.itemsCount || 0} piezas</strong> asignadas se reintegrarán automáticamente al stock disponible del Container.
            </div>

            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmData(null)}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.2rem",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#e2e8f0",
                  borderRadius: "10px",
                  fontWeight: "800",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Conservar Orden
              </button>
              <button
                type="button"
                onClick={() => executeDeleteOrder(deleteConfirmData.id, deleteConfirmData.plate)}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.2rem",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "10px",
                  fontWeight: "900",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                }}
              >
                Sí, Anular Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PLANTILLA DE IMPRESIÓN OFICIAL: FICHA TÉCNICA DE PARABRISAS (A4 / CARTA)
          Oculta en pantalla, visible únicamente al pulsar Imprimir (@media print)
          ========================================================================= */}
      {(printOrderData || activeTruckDetail || orders[0]) && (() => {
        const pOrder = printOrderData || activeTruckDetail || orders[0];
        const qrTargetUrl = pOrder.slug
          ? `http://localhost:5174/galeria/${pOrder.slug}`
          : `http://localhost:5174/admin/workshop`;

        return (
          <div className="windshield-print-sheet">
            {/* Cabecera Oficial del Taller */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #000", paddingBottom: "12px", marginBottom: "14px" }}>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 3px 0", letterSpacing: "1px", textTransform: "uppercase", color: "#000" }}>
                  MELLOS TRUCK S.A.S.
                </h1>
                <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#222", letterSpacing: "0.5px" }}>
                  Centro Especializado en Personalización, Pailería & Pintura Automotriz de Tractomulas
                </div>
                <div style={{ fontSize: "10px", color: "#555", marginTop: "3px" }}>
                  NIT: 901.482.391-4 • Cel / WhatsApp: 310 852 9467 • Bogotá D.C. - Colombia
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "15px", fontWeight: "900", color: "#000" }}>
                  ORDEN DE SERVICIO #{String(pOrder.id || 1).padStart(5, "0")}
                </div>
                <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
                  Fecha: {pOrder.created_at ? new Date(pOrder.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("es-CO")}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "900", marginTop: "2px", color: "#000" }}>
                  ESTADO: [{pOrder.estado?.toUpperCase() || "PATIO"}]
                </div>
              </div>
            </div>

            {/* Placa Stamped Oficial + Ficha Mula + QR Digital */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 120px", gap: "14px", alignItems: "center", border: "2px solid #000", padding: "12px 14px", borderRadius: "8px", marginBottom: "14px" }}>
              {/* Placa Colombiana Oficial */}
              <div style={{ textAlign: "center", border: "3px solid #000", background: "#fef08a", borderRadius: "6px", padding: "8px 6px" }}>
                <div style={{ fontSize: "9px", fontWeight: "900", letterSpacing: "2px", color: "#000" }}>COLOMBIA</div>
                <div style={{ fontSize: "32px", fontWeight: "900", letterSpacing: "3px", color: "#000", lineHeight: "1.05" }}>
                  {pOrder.placa}
                </div>
                <div style={{ fontSize: "8px", fontWeight: "800", letterSpacing: "1px", color: "#000", marginTop: "2px" }}>MELLOS TRUCK</div>
              </div>

              {/* Datos de la Nave y Propietario */}
              <div>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "#000", marginBottom: "4px" }}>
                  {pOrder.marca} {pOrder.linea || ""}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", fontSize: "11px", color: "#111" }}>
                  <div><strong>Propietario:</strong> {pOrder.cliente}</div>
                  <div><strong>Teléfono:</strong> {pOrder.telefono || "No registrado"}</div>
                  <div><strong>Color Cabina:</strong> {pOrder.color || "Especial"}</div>
                  <div><strong>Fase Actual:</strong> {pOrder.estado}</div>
                </div>
              </div>

              {/* QR Code Dinámico */}
              <div style={{ textAlign: "center" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrTargetUrl)}`}
                  alt="QR Ficha Digital"
                  style={{ width: "95px", height: "95px", border: "1px solid #000", display: "inline-block" }}
                />
                <div style={{ fontSize: "8px", fontWeight: "800", marginTop: "2px", color: "#000" }}>ESCANEAR FICHA 4K</div>
              </div>
            </div>

            {/* Especificaciones de Pailería & Trabajos de Patio */}
            <div style={{ border: "1.5px solid #000", borderRadius: "6px", padding: "10px 12px", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "5px" }}>
                🛠️ Especificaciones Técnicas & Trabajos Requeridos en Patio
              </div>
              <div style={{ fontSize: "11px", lineHeight: "1.45", color: "#222", minHeight: "40px" }}>
                {pOrder.descripcion || "Personalización general en lámina de acero inoxidable, pailería de accesorios y pintura poliuretano de alta resistencia."}
              </div>
            </div>

            {/* Checklist de Repuestos y Accesorios del Container */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                <span>📦 Repuestos y Accesorios Asignados del Container</span>
                <span style={{ fontSize: "10px", fontWeight: "normal", color: "#444" }}>Marcar con [✓] cada pieza instalada</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                <thead>
                  <tr style={{ background: "#f3f4f6", borderTop: "1.5px solid #000", borderBottom: "1.5px solid #000" }}>
                    <th style={{ padding: "5px 8px", textAlign: "center", width: "40px", borderRight: "1px solid #ddd" }}>INST.</th>
                    <th style={{ padding: "5px 8px", textAlign: "left", width: "95px", borderRight: "1px solid #ddd" }}>CÓDIGO</th>
                    <th style={{ padding: "5px 8px", textAlign: "left", borderRight: "1px solid #ddd" }}>DESCRIPCIÓN DE LA PIEZA</th>
                    <th style={{ padding: "5px 8px", textAlign: "center", width: "50px", borderRight: "1px solid #ddd" }}>CANT.</th>
                    <th style={{ padding: "5px 8px", textAlign: "center", width: "130px" }}>VERIFICACIÓN MECÁNICO</th>
                  </tr>
                </thead>
                <tbody>
                  {(pOrder.items && pOrder.items.length > 0) ? (
                    pOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "5px 8px", textAlign: "center", fontSize: "13px", fontWeight: "bold", borderRight: "1px solid #ddd" }}>[ &nbsp; ]</td>
                        <td style={{ padding: "5px 8px", fontWeight: "bold", borderRight: "1px solid #ddd" }}>{item.codigo || `REP-${item.id}`}</td>
                        <td style={{ padding: "5px 8px", borderRight: "1px solid #ddd" }}>{item.nombre || item.producto_nombre}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", fontWeight: "bold", borderRight: "1px solid #ddd" }}>{item.cantidad}</td>
                        <td style={{ padding: "5px 8px", textAlign: "center", color: "#777" }}>________________</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ padding: "8px", textAlign: "center", color: "#666", borderBottom: "1px solid #e5e7eb" }}>
                        Sin piezas de bodega pre-asignadas. Utilizar las filas de anotación manual si se retiran repuestos del Container.
                      </td>
                    </tr>
                  )}
                  {/* Filas en blanco para anotación manual de piso */}
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontSize: "13px", borderRight: "1px solid #ddd" }}>[ &nbsp; ]</td>
                    <td style={{ padding: "6px 8px", borderRight: "1px solid #ddd" }}></td>
                    <td style={{ padding: "6px 8px", borderRight: "1px solid #ddd", color: "#888" }}>Pieza adicional: _____________________________________</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #ddd" }}>____</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#777" }}>________________</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "6px 8px", textAlign: "center", fontSize: "13px", borderRight: "1px solid #ddd" }}>[ &nbsp; ]</td>
                    <td style={{ padding: "6px 8px", borderRight: "1px solid #ddd" }}></td>
                    <td style={{ padding: "6px 8px", borderRight: "1px solid #ddd", color: "#888" }}>Pieza adicional: _____________________________________</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", borderRight: "1px solid #ddd" }}>____</td>
                    <td style={{ padding: "6px 8px", textAlign: "center", color: "#777" }}>________________</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Checklist de Control de Calidad de 5 Fases */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", marginBottom: "16px", border: "1px solid #000", padding: "8px", borderRadius: "6px" }}>
              <div style={{ textAlign: "center", fontSize: "9px", borderRight: "1px solid #ccc" }}>
                <div style={{ fontWeight: "900" }}>[ &nbsp; ] 1. INGRESO</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Diagnóstico y desarme</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "9px", borderRight: "1px solid #ccc" }}>
                <div style={{ fontWeight: "900" }}>[ &nbsp; ] 2. TALLER</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Pailería y soldadura</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "9px", borderRight: "1px solid #ccc" }}>
                <div style={{ fontWeight: "900" }}>[ &nbsp; ] 3. PINTURA</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Poliuretano y secado</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "9px", borderRight: "1px solid #ccc" }}>
                <div style={{ fontWeight: "900" }}>[ &nbsp; ] 4. TERMINADO</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Brillo y showroom</div>
              </div>
              <div style={{ textAlign: "center", fontSize: "9px" }}>
                <div style={{ fontWeight: "900" }}>[ &nbsp; ] 5. ENTREGADO</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Despachada a ruta</div>
              </div>
            </div>

            {/* Firmas de Responsabilidad y Conformidad */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginTop: "24px", paddingTop: "8px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1.5px solid #000", height: "30px", marginBottom: "4px" }}></div>
                <div style={{ fontSize: "10px", fontWeight: "900" }}>Mecánico / Maestro Pailero</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Responsable Ejecución de Obra</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1.5px solid #000", height: "30px", marginBottom: "4px" }}></div>
                <div style={{ fontSize: "10px", fontWeight: "900" }}>Jefe de Patio / Calidad</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Mellos Truck S.A.S.</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderBottom: "1.5px solid #000", height: "30px", marginBottom: "4px" }}></div>
                <div style={{ fontSize: "10px", fontWeight: "900" }}>Cliente / Conductor</div>
                <div style={{ fontSize: "8px", color: "#555" }}>Recibido a Conformidad</div>
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: "8px", color: "#777", marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "5px" }}>
              Documento técnico de control interno y garantía • Mellos Truck S.A.S. • Bogotá D.C. • Tel. 310 852 9467
            </div>
          </div>
        );
      })()}
    </div>
  );
}
