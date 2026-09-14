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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  // Notificaciones Toast
  const [feedback, setFeedback] = useState(null);

  const showNotification = (msg, type = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
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

  // Eliminar orden
  const handleDeleteOrder = async (orderId, plate) => {
    if (!window.confirm(`¿Seguro de retirar la orden de la mula ${plate}? Las piezas volverán al inventario.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showNotification(`Mula ${plate} retirada del taller`);
        if (activeTruckDetail && activeTruckDetail.id === orderId) {
          setActiveTruckDetail(null);
        }
        loadData();
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
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
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                padding: "0.2rem 0.6rem",
                borderRadius: "20px",
                fontSize: "0.72rem",
                fontWeight: "800",
                letterSpacing: "0.08em",
              }}
            >
              TABLERO KANBAN
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.35rem", fontSize: "0.82rem", color: "#94a3b8" }}>
            <span style={{ color: "#f8fafc", fontWeight: "700" }}>🚛 {orders.length} Mulas en Patio</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#fb923c" }}>⚙️ {orders.filter((o) => o.estado === "Taller").length} Pailería</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#c084fc" }}>🎨 {orders.filter((o) => o.estado === "Pintura").length} Pintura</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#34d399" }}>💎 {orders.filter((o) => o.estado === "Terminado" || o.estado === "Entregado").length} Listas / Showroom</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Buscar placa, cliente, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "240px",
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

      {/* KANBAN BOARD ESCALABLE CON TARJETAS COMPACTAS (Haz clic para abrir Ficha 360°) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando naves en taller...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(280px, 1fr))",
            gap: "1.1rem",
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: "0.6rem",
          }}
        >
          {STAGES.map((stage) => {
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
          <div
            style={{
              background: "#151720",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 70px rgba(0,0,0,0.9)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 1. Header Visual con Fotografía de la Mula */}
            <div
              style={{
                position: "relative",
                height: "170px",
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
                  filter: "brightness(0.8) contrast(1.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(21, 23, 32, 0.98) 100%)",
                }}
              ></div>

              {/* Botón de Cerrar */}
              <button
                onClick={() => setActiveTruckDetail(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>

              {/* Placa y Título en el Header */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "20px",
                  right: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* Placa 3D */}
                  <div
                    style={{
                      background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                      color: "#000",
                      fontWeight: "900",
                      fontSize: "1.1rem",
                      letterSpacing: "0.15em",
                      padding: "0.25rem 0.8rem",
                      borderRadius: "6px",
                      border: "2px solid #000",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.8)",
                      textAlign: "center",
                    }}
                  >
                    <div>{activeTruckDetail.placa}</div>
                    <div style={{ fontSize: "0.45rem", letterSpacing: "0.25em", color: "#333", fontWeight: "800" }}>
                      COLOMBIA
                    </div>
                  </div>

                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#f8fafc" }}>
                      {getCleanTruckTitle(activeTruckDetail)}
                    </h2>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px" }}>
                      👤 {activeTruckDetail.cliente} {activeTruckDetail.telefono && `• 📞 ${activeTruckDetail.telefono}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteOrder(activeTruckDetail.id, activeTruckDetail.placa)}
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#f87171",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Retirar Mula del Taller
                </button>
              </div>
            </div>

            {/* 2. Cuerpo de la Ficha 360° */}
            <div style={{ padding: "1.8rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              {/* Stepper de Fases del Taller (Permite mover la mula con 1 clic) */}
              <div
                style={{
                  background: "rgba(10, 12, 16, 0.7)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                  Fase Actual en el Taller: <span style={{ color: "#f59e0b" }}>{activeTruckDetail.estado}</span> (Haz clic para cambiar fase)
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                  {STAGES.map((stg) => {
                    const isCurrent = activeTruckDetail.estado === stg.id;
                    return (
                      <button
                        key={stg.id}
                        onClick={() => handleMoveStage(activeTruckDetail.id, stg.id)}
                        style={{
                          padding: "0.6rem 0.4rem",
                          borderRadius: "8px",
                          border: isCurrent ? `2px solid ${stg.color}` : "1px solid rgba(255,255,255,0.08)",
                          background: isCurrent ? `${stg.color}25` : "rgba(255,255,255,0.03)",
                          color: isCurrent ? stg.color : "#94a3b8",
                          fontWeight: isCurrent ? "900" : "600",
                          fontSize: "0.78rem",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.25rem",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ fontSize: "1rem" }}>{stg.icon}</span>
                        <span>{stg.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Enlace Magic Link & WhatsApp si está Terminado o Entregado */}
              {(activeTruckDetail.estado === "Terminado" || activeTruckDetail.estado === "Entregado") && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "#34d399" }}>
                      ⚡ Showroom Cinematográfico 4K Activo
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                      Esta nave ya tiene su propia vitrina con slider interactivo y video de dron.
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    {activeTruckDetail.slug && (
                      <Link
                        to={`/galeria/${activeTruckDetail.slug}`}
                        target="_blank"
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#10b981",
                          color: "#000",
                          borderRadius: "8px",
                          fontWeight: "900",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                        }}
                      >
                        👁️ Ver Showroom 4K
                      </Link>
                    )}

                    {activeTruckDetail.whatsappShareUrl && (
                      <a
                        href={activeTruckDetail.whatsappShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#22c55e",
                          color: "#000",
                          borderRadius: "8px",
                          fontWeight: "900",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                        }}
                      >
                        📱 Compartir WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Gestión de Repuestos del Container */}
              <div
                style={{
                  background: "rgba(10, 12, 16, 0.7)",
                  padding: "1.2rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#38bdf8", textTransform: "uppercase" }}>
                    📦 Repuestos & Lujos del Container Asignados ({activeTruckDetail.items ? activeTruckDetail.items.length : 0})
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "#38bdf8" }}>
                    Total Piezas: ${(activeTruckDetail.costo_repuestos || 0).toLocaleString("es-CO")} COP
                  </div>
                </div>

                {/* Lista de Repuestos */}
                {(!activeTruckDetail.items || activeTruckDetail.items.length === 0) ? (
                  <div style={{ padding: "1.2rem", textAlign: "center", background: "rgba(0,0,0,0.3)", borderRadius: "8px", color: "#64748b", fontSize: "0.85rem" }}>
                    No se han asignado piezas del inventario a esta mula todavía.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                    {activeTruckDetail.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.6rem 0.9rem",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.05)",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div>
                          <span style={{ color: "#f59e0b", fontWeight: "900" }}>{item.cantidad}x</span>{" "}
                          <span style={{ color: "#f8fafc", fontWeight: "600" }}>{item.nombre}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
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
                              padding: "0.2rem 0.5rem",
                              fontSize: "0.75rem",
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
                <form onSubmit={handleAssignItem} style={{ display: "flex", gap: "0.8rem", marginTop: "0.8rem" }}>
                  <select
                    value={assignForm.productId}
                    onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })}
                    style={{
                      flex: 1,
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
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
                      width: "70px",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.95rem",
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!selectedProduct || selectedProduct.stock < 1}
                    style={{
                      padding: "0.65rem 1.2rem",
                      background: "linear-gradient(135deg, #0284c7, #0369a1)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "900",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Asignar y Descontar
                  </button>
                </form>
              </div>

              {/* Mano de Obra, Notas & Costo Total */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: "800", marginBottom: "0.4rem" }}>
                    Mano de Obra ($ COP)
                  </label>
                  <input
                    type="number"
                    value={editLaborCost}
                    onChange={(e) => setEditLaborCost(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#f8fafc",
                      fontSize: "1rem",
                      fontWeight: "900",
                    }}
                  />

                  <div style={{ marginTop: "0.8rem", fontSize: "0.85rem", color: "#94a3b8" }}>
                    Total Orden Acumulado:{" "}
                    <strong style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
                      ${((parseFloat(editLaborCost) || 0) + (activeTruckDetail.costo_repuestos || 0)).toLocaleString("es-CO")} COP
                    </strong>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", fontWeight: "800", marginBottom: "0.4rem" }}>
                    Especificaciones / Notas de Pailería
                  </label>
                  <textarea
                    rows="3"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Detalles de pailería, medidas del bomper, cortes láser..."
                    style={{
                      width: "100%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      background: "#0a0c10",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              {/* Botones Finales de la Consola */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: "1.2rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: "0.65rem 1.2rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#cbd5e1",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  🖨️ Imprimir Ficha de Parabrisas
                </button>

                <div style={{ display: "flex", gap: "0.8rem" }}>
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
    </div>
  );
}
