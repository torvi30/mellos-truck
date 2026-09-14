import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

const STAGES = [
  { id: "Ingreso", title: "1. INGRESO", subtitle: "Diagnóstico & Desarme", color: "#f59e0b", icon: "📋" },
  { id: "Taller", title: "2. TALLER", subtitle: "Pailería & Acero Inox", color: "#f97316", icon: "⚡" },
  { id: "Pintura", title: "3. PINTURA", subtitle: "Poliuretano & Brillo", color: "#a855f7", icon: "🎨" },
  { id: "Terminado", title: "4. TERMINADO", subtitle: "Control Calidad & Showroom", color: "#10b981", icon: "💎" },
  { id: "Entregado", title: "5. ENTREGADO", subtitle: "Despacho a Carretera", color: "#38bdf8", icon: "🚚" },
];

export default function WorkshopPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeStageFilter, setActiveStageFilter] = useState("Todos");

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

  // Modal Asignar Pieza del Container
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [assignForm, setAssignForm] = useState({
    productId: "",
    cantidad: 1,
  });

  // Notificaciones Toast / Status Banner
  const [feedback, setFeedback] = useState(null);

  const showNotification = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resProducts] = await Promise.all([
        fetch(`${API_BASE}/work-orders`),
        fetch(`${API_BASE}/products`),
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.orders || []);
      }

      if (resProducts.ok) {
        const dataProd = await resProducts.json();
        setProducts(dataProd.products || []);
      }
    } catch (err) {
      console.warn("Error cargando datos del taller:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Crear orden de trabajo
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!createForm.cliente || !createForm.placa || !createForm.marca) {
      showNotification("Por favor ingresa cliente, placa y marca", "error");
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
        showNotification(data.message || "Mula ingresada exitosamente");
        setShowCreateModal(false);
        setCreateForm({
          cliente: "",
          telefono: "",
          placa: "",
          marca: "Kenworth",
          linea: "",
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

  // Cambiar estado en el flujo
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
        loadData();
      } else {
        showNotification(data.message || "Error al mover estado", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Abrir modal para asignar repuesto
  const openAssignModal = (order) => {
    setSelectedOrderForAssign(order);
    setAssignForm({
      productId: products[0]?.id || "",
      cantidad: 1,
    });
    setShowAssignModal(true);
  };

  // Confirmar asignación de repuesto y descuento del inventario
  const handleAssignItem = async (e) => {
    e.preventDefault();
    if (!selectedOrderForAssign || !assignForm.productId) return;

    try {
      const res = await fetch(`${API_BASE}/work-orders/${selectedOrderForAssign.id}/items`, {
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
        setShowAssignModal(false);
        loadData();
      } else {
        showNotification(data.message || "Error al asignar pieza", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Retirar pieza y devolver al inventario Container
  const handleRemoveItem = async (orderId, itemId, itemName) => {
    if (!window.confirm(`¿Seguro que deseas retirar "${itemName}" y reintegrar las piezas al Container?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}/items/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        loadData();
      } else {
        showNotification(data.message || "Error al retirar pieza", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  // Eliminar orden
  const handleDeleteOrder = async (orderId, plate) => {
    if (!window.confirm(`¿Seguro de eliminar la orden para la placa ${plate}? Todas las piezas asignadas volverán al Container.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`Orden de la mula ${plate} eliminada`);
        loadData();
      }
    } catch (err) {
      showNotification("Error al eliminar orden", "error");
    }
  };

  // Filtrado
  const filteredOrders = orders.filter((o) => {
    const matchesStage = activeStageFilter === "Todos" || o.estado === activeStageFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.placa.toLowerCase().includes(term) ||
      o.cliente.toLowerCase().includes(term) ||
      o.marca.toLowerCase().includes(term) ||
      (o.linea && o.linea.toLowerCase().includes(term));
    return matchesStage && matchesSearch;
  });

  // Métricas rápidas
  const totalMulas = orders.length;
  const inWorkshop = orders.filter((o) => o.estado === "Taller").length;
  const inPaint = orders.filter((o) => o.estado === "Pintura").length;
  const finished = orders.filter((o) => o.estado === "Terminado" || o.estado === "Entregado").length;
  const totalPartsValue = orders.reduce((acc, o) => acc + (o.costo_repuestos || 0), 0);

  const selectedProduct = products.find((p) => p.id === parseInt(assignForm.productId, 10));

  return (
    <div className="workshop-view" style={{ color: "#f8fafc", padding: "1.5rem" }}>
      {/* Toast Feedback */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            padding: "1rem 1.5rem",
            borderRadius: "10px",
            background: feedback.type === "error" ? "#dc2626" : "#059669",
            color: "#ffffff",
            fontWeight: "700",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <span>{feedback.type === "error" ? "⚠️" : "✅"}</span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.8rem",
          flexWrap: "wrap",
          gap: "1.2rem",
          background: "linear-gradient(135deg, rgba(24, 24, 27, 0.9), rgba(9, 9, 11, 0.95))",
          padding: "1.8rem 2rem",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "1.8rem" }}>🛠️</span>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
                background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Taller & Trazabilidad de Mulas
            </h1>
            <span
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800",
              }}
            >
              V3 INDUSTRIAL
            </span>
          </div>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            Seguimiento de fase por fase (Ingreso ➔ Taller ➔ Pintura ➔ Terminado) y asignación automática de lujos del Container.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <Link
            to="/admin/inventory"
            style={{
              padding: "0.7rem 1.1rem",
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📦 Ver Inventario Container
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.75rem 1.4rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>+</span> Ingresar Nueva Mula
          </button>
        </div>
      </header>

      {/* KPI Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.8rem",
        }}
      >
        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>Total Mulas en Patio</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f8fafc", marginTop: "0.3rem" }}>
            {totalMulas} <span style={{ fontSize: "0.9rem", color: "#64748b" }}>vehículos</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(249, 115, 22, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#f97316", textTransform: "uppercase" }}>En Pailería / Taller</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f97316", marginTop: "0.3rem" }}>
            {inWorkshop} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>en armado</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(168, 85, 247, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#c084fc", textTransform: "uppercase" }}>En Pintura y Cromo</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#c084fc", marginTop: "0.3rem" }}>
            {inPaint} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>acabado</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(16, 185, 129, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#34d399", textTransform: "uppercase" }}>Terminadas / Entregadas</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#34d399", marginTop: "0.3rem" }}>
            {finished} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>listas</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(56, 189, 248, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#38bdf8", textTransform: "uppercase" }}>Piezas Asignadas Taller</div>
          <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#38bdf8", marginTop: "0.3rem" }}>
            ${totalPartsValue.toLocaleString("es-CO")}{" "}
            <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>COP</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["Todos", ...STAGES.map((s) => s.id)].map((stg) => (
            <button
              key={stg}
              onClick={() => setActiveStageFilter(stg)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: activeStageFilter === stg ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
                background: activeStageFilter === stg ? "rgba(245, 158, 11, 0.15)" : "rgba(24, 24, 27, 0.6)",
                color: activeStageFilter === stg ? "#f59e0b" : "#94a3b8",
                fontWeight: activeStageFilter === stg ? "800" : "500",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              {stg}
            </button>
          ))}
        </div>

        <div style={{ minWidth: "260px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por placa, cliente o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* KANBAN BOARD */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando tablero operativo del taller...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "1.2rem",
            alignItems: "start",
          }}
        >
          {STAGES.filter(
            (stage) => activeStageFilter === "Todos" || activeStageFilter === stage.id
          ).map((stage) => {
            const stageOrders = filteredOrders.filter((o) => o.estado === stage.id);

            return (
              <div
                key={stage.id}
                style={{
                  background: "rgba(18, 18, 22, 0.75)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "14px",
                  border: `1px solid ${stage.color}33`,
                  borderTop: `4px solid ${stage.color}`,
                  padding: "1.2rem 1rem",
                  minHeight: "500px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    paddingBottom: "0.6rem",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span>{stage.icon}</span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "0.95rem",
                          fontWeight: "800",
                          color: stage.color,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {stage.title}
                      </h3>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                      {stage.subtitle}
                    </div>
                  </div>

                  <span
                    style={{
                      background: `${stage.color}22`,
                      color: stage.color,
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      border: `1px solid ${stage.color}44`,
                    }}
                  >
                    {stageOrders.length}
                  </span>
                </div>

                {/* Column Content (Orders List) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                  {stageOrders.length === 0 ? (
                    <div
                      style={{
                        padding: "2rem 1rem",
                        textAlign: "center",
                        color: "#475569",
                        fontSize: "0.85rem",
                        border: "1px dashed rgba(255,255,255,0.06)",
                        borderRadius: "10px",
                        margin: "auto 0",
                      }}
                    >
                      Sin mulas en esta fase
                    </div>
                  ) : (
                    stageOrders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          background: "linear-gradient(145deg, #18181b, #121215)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "1.1rem",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.8rem",
                          position: "relative",
                        }}
                      >
                        {/* Header card: Placa y Marca */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          {/* Colombian Heavy Truck Plate Badge */}
                          <div
                            style={{
                              background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                              color: "#000",
                              fontWeight: "900",
                              fontSize: "1rem",
                              letterSpacing: "0.15em",
                              padding: "0.2rem 0.6rem",
                              borderRadius: "4px",
                              border: "2px solid #000",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "95px",
                            }}
                          >
                            {order.placa}
                          </div>

                          <button
                            onClick={() => handleDeleteOrder(order.id, order.placa)}
                            title="Eliminar orden y devolver repuestos"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#64748b",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Truck & Client info */}
                        <div>
                          <div style={{ fontWeight: "800", color: "#f1f5f9", fontSize: "0.95rem" }}>
                            {order.marca} {order.linea}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                            👤 {order.cliente} {order.telefono && `• 📞 ${order.telefono}`}
                          </div>
                          {order.color && (
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                              🎨 Color: {order.color}
                            </div>
                          )}
                        </div>

                        {/* Work description */}
                        {order.descripcion && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#cbd5e1",
                              background: "rgba(0,0,0,0.25)",
                              padding: "0.5rem 0.7rem",
                              borderRadius: "6px",
                              borderLeft: `3px solid ${stage.color}`,
                              lineHeight: "1.35",
                            }}
                          >
                            {order.descripcion}
                          </div>
                        )}

                        {/* Repuestos asignados desde el Container */}
                        <div
                          style={{
                            background: "rgba(10, 10, 12, 0.6)",
                            borderRadius: "8px",
                            padding: "0.7rem",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase" }}>
                              📦 Piezas Container ({order.items ? order.items.length : 0})
                            </span>
                            <button
                              onClick={() => openAssignModal(order)}
                              style={{
                                background: "rgba(56, 189, 248, 0.15)",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                                color: "#38bdf8",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: "700",
                                padding: "0.2rem 0.5rem",
                                cursor: "pointer",
                              }}
                            >
                              + Asignar Pieza
                            </button>
                          </div>

                          {(!order.items || order.items.length === 0) ? (
                            <div style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                              No se han asignado piezas del inventario.
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "0.75rem",
                                    background: "rgba(255,255,255,0.03)",
                                    padding: "0.35rem 0.5rem",
                                    borderRadius: "5px",
                                    border: "1px solid rgba(255,255,255,0.04)",
                                  }}
                                >
                                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                                    <span style={{ color: "#f59e0b", fontWeight: "700" }}>{item.cantidad}x</span>{" "}
                                    <span style={{ color: "#e2e8f0" }}>{item.nombre}</span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <span style={{ color: "#94a3b8", fontWeight: "600" }}>
                                      ${(item.subtotal || 0).toLocaleString("es-CO")}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveItem(order.id, item.id, item.nombre)}
                                      title="Devolver al Container"
                                      style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        padding: "0 2px",
                                        fontWeight: "800",
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  color: "#38bdf8",
                                  paddingTop: "0.3rem",
                                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                                }}
                              >
                                <span>Total Repuestos:</span>
                                <span>${(order.costo_repuestos || 0).toLocaleString("es-CO")} COP</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Magic Link / WhatsApp Section si está Terminado o Entregado */}
                        {(order.estado === "Terminado" || order.estado === "Entregado") && (
                          <div
                            style={{
                              background: "rgba(16, 185, 129, 0.1)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              borderRadius: "8px",
                              padding: "0.6rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                            }}
                          >
                            <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "800" }}>
                              ⚡ Magic Link Showroom Habilitado
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              {order.slug && (
                                <Link
                                  to={`/galeria/${order.slug}`}
                                  target="_blank"
                                  style={{
                                    flex: 1,
                                    padding: "0.4rem 0.6rem",
                                    background: "#10b981",
                                    color: "#000",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "800",
                                    textAlign: "center",
                                    textDecoration: "none",
                                  }}
                                >
                                  Ver Showroom 4K
                                </Link>
                              )}
                              {order.whatsappShareUrl && (
                                <a
                                  href={order.whatsappShareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    flex: 1,
                                    padding: "0.4rem 0.6rem",
                                    background: "#25d366",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: "800",
                                    textAlign: "center",
                                    textDecoration: "none",
                                  }}
                                >
                                  📱 WhatsApp
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Navigation Buttons across Stages */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginTop: "0.2rem",
                            paddingTop: "0.6rem",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {/* Botón anterior */}
                          {stage.id !== "Ingreso" && (
                            <button
                              onClick={() => {
                                const currentIndex = STAGES.findIndex((s) => s.id === stage.id);
                                if (currentIndex > 0) {
                                  handleMoveStage(order.id, STAGES[currentIndex - 1].id);
                                }
                              }}
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#94a3b8",
                                borderRadius: "6px",
                                padding: "0.35rem 0.6rem",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              ◀ Anterior
                            </button>
                          )}

                          {/* Botón siguiente */}
                          {stage.id !== "Entregado" ? (
                            <button
                              onClick={() => {
                                const currentIndex = STAGES.findIndex((s) => s.id === stage.id);
                                if (currentIndex < STAGES.length - 1) {
                                  handleMoveStage(order.id, STAGES[currentIndex + 1].id);
                                }
                              }}
                              style={{
                                marginLeft: "auto",
                                background: stage.color,
                                border: "none",
                                color: "#000",
                                borderRadius: "6px",
                                padding: "0.35rem 0.75rem",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                fontWeight: "800",
                                boxShadow: `0 2px 8px ${stage.color}66`,
                              }}
                            >
                              Pasar a {STAGES[STAGES.findIndex((s) => s.id === stage.id) + 1]?.title.split(".")[1]?.trim()} ▶
                            </button>
                          ) : (
                            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>
                              ✅ Despachada
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Ingresar Nueva Mula */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#f59e0b" }}>
                📋 Ingreso de Nueva Mula al Taller
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
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
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
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fde047",
                      fontWeight: "800",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Marca *
                  </label>
                  <select
                    value={createForm.marca}
                    onChange={(e) => setCreateForm({ ...createForm, marca: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  >
                    <option value="Kenworth">Kenworth</option>
                    <option value="Mack">Mack</option>
                    <option value="International">International</option>
                    <option value="Peterbilt">Peterbilt</option>
                    <option value="Freightliner">Freightliner</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
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
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
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
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Nombre del Dueño / Cliente *
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
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Teléfono WhatsApp (Notificaciones)
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
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Mano de Obra Estimada ($ COP)
                </label>
                <input
                  type="number"
                  value={createForm.costo_mano_obra}
                  onChange={(e) => setCreateForm({ ...createForm, costo_mano_obra: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Descripción de Trabajos a Realizar
                </label>
                <textarea
                  rows="3"
                  placeholder="Detalles de pailería, instalación de visera, bomper personalizado o preparación de pintura..."
                  value={createForm.descripcion}
                  onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: "8px",
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    resize: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
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
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Confirmar Ingreso al Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Asignar Pieza del Container */}
      {showAssignModal && selectedOrderForAssign && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#38bdf8" }}>
                  📦 Asignar Pieza del Container
                </h3>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px" }}>
                  Para: <strong style={{ color: "#fde047" }}>{selectedOrderForAssign.placa}</strong> ({selectedOrderForAssign.marca})
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignItem} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Seleccionar Producto del Inventario Container
                </label>
                <select
                  value={assignForm.productId}
                  onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.9rem",
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.nombre} — Stock: {p.stock} unids — ${p.precio.toLocaleString("es-CO")} COP {p.stock <= 0 ? "(AGOTADO)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div
                  style={{
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    padding: "0.8rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#94a3b8" }}>SKU:</span>
                    <span style={{ color: "#f8fafc", fontWeight: "700" }}>{selectedProduct.sku}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#94a3b8" }}>Stock Disponible en Container:</span>
                    <span
                      style={{
                        color: selectedProduct.stock <= selectedProduct.min_stock_alert ? "#f59e0b" : "#34d399",
                        fontWeight: "800",
                      }}
                    >
                      {selectedProduct.stock} unidades
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8" }}>Precio Unitario:</span>
                    <span style={{ color: "#38bdf8", fontWeight: "800" }}>
                      ${selectedProduct.precio.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Cantidad a Asignar
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.stock : 99}
                  value={assignForm.cantidad}
                  onChange={(e) => setAssignForm({ ...assignForm, cantidad: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: "800",
                  }}
                />
              </div>

              {selectedProduct && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.7rem",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "8px",
                    fontWeight: "800",
                    color: "#f59e0b",
                  }}
                >
                  <span>Subtotal a Cargar a la Mula:</span>
                  <span>
                    ${((parseInt(assignForm.cantidad, 10) || 0) * selectedProduct.precio).toLocaleString("es-CO")} COP
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
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
                  disabled={!selectedProduct || selectedProduct.stock < 1}
                  style={{
                    padding: "0.65rem 1.4rem",
                    background:
                      !selectedProduct || selectedProduct.stock < 1
                        ? "#475569"
                        : "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
                    cursor: !selectedProduct || selectedProduct.stock < 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Descontar del Container & Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
