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

  // Modal Detalle & Repuestos
  const [selectedOrderForParts, setSelectedOrderForParts] = useState(null);
  const [assignForm, setAssignForm] = useState({
    productId: "",
    cantidad: 1,
  });

  // Toast
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
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  const openPartsModal = (order) => {
    setSelectedOrderForParts(order);
    setAssignForm({
      productId: products[0]?.id || "",
      cantidad: 1,
    });
  };

  const handleAssignItem = async (e) => {
    e.preventDefault();
    if (!selectedOrderForParts || !assignForm.productId) return;

    try {
      const res = await fetch(`${API_BASE}/work-orders/${selectedOrderForParts.id}/items`, {
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
        setSelectedOrderForParts(data.order);
        loadData();
      } else {
        showNotification(data.message || "Error al asignar pieza", "error");
      }
    } catch (err) {
      showNotification("Error de conexión al servidor", "error");
    }
  };

  const handleRemoveItem = async (orderId, itemId) => {
    try {
      const res = await fetch(`${API_BASE}/work-orders/${orderId}/items/${itemId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        showNotification(data.message);
        setSelectedOrderForParts(data.order);
        loadData();
      }
    } catch (err) {
      showNotification("Error al retirar pieza", "error");
    }
  };

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
          padding: "1.1rem 1.4rem",
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
                fontSize: "1.6rem",
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
              KANBAN V3 PRO
            </span>
          </div>

          {/* Ribbon con métricas en tiempo real */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginTop: "0.4rem", fontSize: "0.82rem", color: "#94a3b8" }}>
            <span style={{ color: "#f8fafc", fontWeight: "700" }}>🚛 {orders.length} Naves en Patio</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#fb923c" }}>⚙️ {orders.filter((o) => o.estado === "Taller").length} Pailería</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#c084fc" }}>🎨 {orders.filter((o) => o.estado === "Pintura").length} Pintura</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#34d399" }}>💎 {orders.filter((o) => o.estado === "Terminado" || o.estado === "Entregado").length} Listas / Showroom</span>
          </div>
        </div>

        {/* Acciones del Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Buscar placa, cliente, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "250px",
                padding: "0.6rem 1rem",
                borderRadius: "10px",
                background: "rgba(10, 12, 16, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fff",
                fontSize: "0.85rem",
                outline: "none",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
              }}
            />
          </div>

          <Link
            to="/admin/inventory"
            style={{
              padding: "0.6rem 1rem",
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "10px",
              fontWeight: "800",
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.2s",
            }}
          >
            📦 Tienda Container
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.65rem 1.3rem",
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              fontWeight: "900",
              fontSize: "0.88rem",
              cursor: "pointer",
              boxShadow: "0 4px 18px rgba(245, 158, 11, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>+</span> Ingresar Mula
          </button>
        </div>
      </header>

      {/* KANBAN BOARD ULTRA-PRO (5 Columnas con identidad visual y tarjetas cinemáticas) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando naves en taller...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(285px, 1fr))",
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
                  background: "linear-gradient(180deg, rgba(20, 22, 28, 0.8) 0%, rgba(12, 14, 18, 0.9) 100%)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "14px",
                  border: `1px solid ${stage.color}22`,
                  borderTop: `3px solid ${stage.color}`,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 200px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                }}
              >
                {/* Header de Fase */}
                <div
                  style={{
                    padding: "0.9rem 1.1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    background: `linear-gradient(90deg, ${stage.color}11, transparent)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1rem" }}>{stage.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: "900", color: stage.color, letterSpacing: "0.06em" }}>
                        {stage.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
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
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      border: `1px solid ${stage.color}44`,
                    }}
                  >
                    {stageOrders.length}
                  </span>
                </div>

                {/* Contenedor de Tarjetas */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0.9rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
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
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.3rem", opacity: 0.5 }}>🚛</div>
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
                          style={{
                            background: "#14161c",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            overflow: "hidden",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.25s ease",
                            position: "relative",
                          }}
                        >
                          {/* BANNER FOTOGRÁFICO DE LA MULA (Nivel Ultra PRO) */}
                          <div
                            style={{
                              position: "relative",
                              height: "100px",
                              width: "100%",
                              overflow: "hidden",
                              background: "#000",
                            }}
                          >
                            <img
                              src={truckImg}
                              alt={order.placa}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center",
                                filter: "brightness(0.85) contrast(1.1)",
                              }}
                            />

                            {/* Gradiente de Oscuridad para Contraste */}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(20,22,28,0.95) 100%)",
                              }}
                            ></div>

                            {/* Placa Colombiana Troquelada Metálica */}
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                left: "10px",
                                background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                                color: "#000",
                                fontWeight: "900",
                                fontSize: "0.85rem",
                                letterSpacing: "0.14em",
                                padding: "0.18rem 0.6rem",
                                borderRadius: "4px",
                                border: "1.5px solid #000",
                                boxShadow: "0 3px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.6)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                lineHeight: "1",
                              }}
                            >
                              <span>{order.placa}</span>
                              <span style={{ fontSize: "0.42rem", letterSpacing: "0.2em", fontWeight: "800", color: "#333", marginTop: "1px" }}>
                                COLOMBIA
                              </span>
                            </div>

                            {/* Tag de Marca del Camión */}
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "10px",
                                background: "rgba(0,0,0,0.7)",
                                backdropFilter: "blur(6px)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "#f8fafc",
                                fontSize: "0.68rem",
                                fontWeight: "800",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "4px",
                                textTransform: "uppercase",
                              }}
                            >
                              {order.marca}
                            </div>

                            {/* Botón rápido para retirar del taller */}
                            <button
                              onClick={() => handleDeleteOrder(order.id, order.placa)}
                              title="Retirar orden"
                              style={{
                                position: "absolute",
                                bottom: "6px",
                                right: "10px",
                                background: "rgba(0,0,0,0.6)",
                                border: "none",
                                color: "#94a3b8",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          {/* CONTENIDO DE LA TARJETA */}
                          <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {/* Línea & Cliente */}
                            <div>
                              <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "900", color: "#f8fafc" }}>
                                {getCleanTruckTitle(order)}
                              </h4>
                              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span>👤 {order.cliente}</span>
                                {order.telefono && (
                                  <a
                                    href={`https://wa.me/${order.telefono.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: "#22c55e", textDecoration: "none", fontWeight: "700" }}
                                  >
                                    💬
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Barra de Progreso Neón */}
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#64748b", marginBottom: "3px" }}>
                                <span>Avance en Taller</span>
                                <span style={{ color: stage.color, fontWeight: "800" }}>{stage.progress}%</span>
                              </div>
                              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${stage.progress}%`,
                                    background: `linear-gradient(90deg, ${stage.color}, ${stage.dotColor})`,
                                    boxShadow: `0 0 8px ${stage.color}`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Detalle o Repuestos Asignados */}
                            <div
                              onClick={() => openPartsModal(order)}
                              style={{
                                background: "rgba(56, 189, 248, 0.06)",
                                border: "1px solid rgba(56, 189, 248, 0.2)",
                                borderRadius: "8px",
                                padding: "0.5rem 0.7rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.76rem" }}>
                                <span>📦</span>
                                <span style={{ color: "#38bdf8", fontWeight: "800" }}>
                                  {partsCount > 0 ? `${partsCount} Pieza(s) Container` : "Sin piezas del Container"}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.74rem", fontWeight: "800", color: partsCount > 0 ? "#f59e0b" : "#64748b" }}>
                                {partsCount > 0 ? `$${(partsTotal / 1000000).toFixed(1)}M` : "+ Asignar"}
                              </span>
                            </div>

                            {/* Acciones Showroom & WhatsApp si está terminado */}
                            {(order.estado === "Terminado" || order.estado === "Entregado") && order.slug && (
                              <div style={{ display: "flex", gap: "0.4rem" }}>
                                <Link
                                  to={`/galeria/${order.slug}`}
                                  target="_blank"
                                  style={{
                                    flex: 1,
                                    padding: "0.4rem 0.6rem",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    border: "1px solid rgba(16, 185, 129, 0.35)",
                                    color: "#34d399",
                                    borderRadius: "8px",
                                    fontSize: "0.74rem",
                                    fontWeight: "800",
                                    textAlign: "center",
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.3rem",
                                  }}
                                >
                                  ⚡ Showroom 4K
                                </Link>

                                {order.whatsappShareUrl && (
                                  <a
                                    href={order.whatsappShareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      flex: 1,
                                      padding: "0.4rem 0.6rem",
                                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                      color: "#000",
                                      borderRadius: "8px",
                                      fontSize: "0.74rem",
                                      fontWeight: "900",
                                      textAlign: "center",
                                      textDecoration: "none",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.3rem",
                                      boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
                                    }}
                                  >
                                    💬 WhatsApp
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Botones de Transición de Fase */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.3rem" }}>
                              {stage.id !== "Ingreso" && (
                                <button
                                  onClick={() => {
                                    const idx = STAGES.findIndex((s) => s.id === stage.id);
                                    if (idx > 0) handleMoveStage(order.id, STAGES[idx - 1].id);
                                  }}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#64748b",
                                    fontSize: "0.74rem",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                    padding: "0.2rem 0.4rem",
                                  }}
                                >
                                  ◀ Volver
                                </button>
                              )}

                              {stage.id !== "Entregado" ? (
                                <button
                                  onClick={() => {
                                    const idx = STAGES.findIndex((s) => s.id === stage.id);
                                    if (idx < STAGES.length - 1) handleMoveStage(order.id, STAGES[idx + 1].id);
                                  }}
                                  style={{
                                    marginLeft: "auto",
                                    padding: "0.45rem 0.9rem",
                                    borderRadius: "8px",
                                    background: `linear-gradient(135deg, ${stage.color}, ${stage.dotColor})`,
                                    border: "none",
                                    color: "#000",
                                    fontSize: "0.76rem",
                                    fontWeight: "900",
                                    cursor: "pointer",
                                    boxShadow: `0 2px 10px ${stage.color}55`,
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  ➔ Pasar a {STAGES[STAGES.findIndex((s) => s.id === stage.id) + 1]?.title}
                                </button>
                              ) : (
                                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#38bdf8", fontWeight: "800" }}>
                                  ✓ Despachada a Carretera
                                </span>
                              )}
                            </div>
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

      {/* MODAL DETALLADO DE REPUESTOS DEL CONTAINER */}
      {selectedOrderForParts && (
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
              border: "1px solid rgba(56, 189, 248, 0.35)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      background: "#facc15",
                      color: "#000",
                      fontWeight: "900",
                      fontSize: "0.9rem",
                      padding: "0.18rem 0.55rem",
                      borderRadius: "4px",
                      border: "1.5px solid #000",
                    }}
                  >
                    {selectedOrderForParts.placa}
                  </span>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#f8fafc" }}>
                    {getCleanTruckTitle(selectedOrderForParts)}
                  </h3>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "4px" }}>
                  👤 {selectedOrderForParts.cliente} • 📞 {selectedOrderForParts.telefono || "Sin teléfono"}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForParts(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Lista de Piezas Asignadas */}
            <div style={{ marginBottom: "1.4rem" }}>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                Piezas Asignadas ({selectedOrderForParts.items ? selectedOrderForParts.items.length : 0})
              </div>

              {(!selectedOrderForParts.items || selectedOrderForParts.items.length === 0) ? (
                <div style={{ padding: "1rem", textAlign: "center", background: "rgba(0,0,0,0.25)", borderRadius: "8px", color: "#64748b", fontSize: "0.85rem" }}>
                  No hay repuestos asignados todavía.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "170px", overflowY: "auto" }}>
                  {selectedOrderForParts.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.55rem 0.8rem",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "0.85rem",
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
                          onClick={() => handleRemoveItem(selectedOrderForParts.id, item.id)}
                          title="Devolver al Container"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#ef4444",
                            borderRadius: "4px",
                            cursor: "pointer",
                            padding: "0.2rem 0.45rem",
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

              {/* Total Repuestos */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.7rem",
                  marginTop: "0.7rem",
                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                  fontSize: "0.9rem",
                  fontWeight: "900",
                }}
              >
                <span style={{ color: "#94a3b8" }}>Total Repuestos Container:</span>
                <span style={{ color: "#38bdf8" }}>
                  ${(selectedOrderForParts.costo_repuestos || 0).toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            {/* Asignar Nueva Pieza */}
            <form onSubmit={handleAssignItem} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.2rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                + Descontar y Asignar Pieza del Inventario
              </div>

              <div style={{ display: "flex", gap: "0.8rem", marginBottom: "0.8rem" }}>
                <select
                  value={assignForm.productId}
                  onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "0.65rem",
                    borderRadius: "8px",
                    background: "#0c0e12",
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
                    background: "#0c0e12",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    textAlign: "center",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForParts(null)}
                  style={{
                    padding: "0.6rem 1.2rem",
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
                  type="submit"
                  disabled={!selectedProduct || selectedProduct.stock < 1}
                  style={{
                    padding: "0.65rem 1.4rem",
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "900",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Confirmar Asignación
                </button>
              </div>
            </form>
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
