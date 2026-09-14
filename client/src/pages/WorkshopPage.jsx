import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:4000/api";

const STAGES = [
  { id: "Ingreso", title: "INGRESO", subtitle: "Diagnóstico & Desarme", color: "#f59e0b", dotColor: "#fbbf24" },
  { id: "Taller", title: "TALLER", subtitle: "Pailería & Acero Inox", color: "#f97316", dotColor: "#fb923c" },
  { id: "Pintura", title: "PINTURA", subtitle: "Poliuretano & Brillo", color: "#a855f7", dotColor: "#c084fc" },
  { id: "Terminado", title: "TERMINADO", subtitle: "Control Calidad", color: "#10b981", dotColor: "#34d399" },
  { id: "Entregado", title: "ENTREGADO", subtitle: "Despachada a Ruta", color: "#38bdf8", dotColor: "#60a5fa" },
];

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

  // Modal Detalle & Repuestos de la Mula
  const [selectedOrderForParts, setSelectedOrderForParts] = useState(null);
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

  // Mover de fase
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

  // Abrir modal de repuestos
  const openPartsModal = (order) => {
    setSelectedOrderForParts(order);
    setAssignForm({
      productId: products[0]?.id || "",
      cantidad: 1,
    });
  };

  // Asignar pieza y descontar de inventario
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

  // Retirar pieza y reintegrar al inventario
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
        loadData();
      }
    } catch (err) {
      showNotification("Error al eliminar orden", "error");
    }
  };

  // Filtrado simple por búsqueda
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

  // Métricas inline limpias (sin cajas pesadas)
  const totalMulas = orders.length;
  const inWorkshop = orders.filter((o) => o.estado === "Taller").length;
  const inPaint = orders.filter((o) => o.estado === "Pintura").length;
  const finished = orders.filter((o) => o.estado === "Terminado" || o.estado === "Entregado").length;

  const selectedProduct = products.find((p) => p.id === parseInt(assignForm.productId, 10));

  // Función para formatear el título limpio sin duplicar la marca
  const getCleanTruckTitle = (order) => {
    if (!order.linea) return order.marca;
    if (order.linea.toLowerCase().includes(order.marca.toLowerCase())) {
      return order.linea;
    }
    return `${order.marca} ${order.linea}`;
  };

  return (
    <div style={{ color: "#f8fafc", padding: "1.2rem 1.5rem", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Toast Feedback */}
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

      {/* HEADER COMPACTO & ELEGANTE (Ahorra más de 200px verticales) */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.2rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "900", margin: 0, letterSpacing: "0.02em", color: "#f8fafc" }}>
              Taller Central & Mulas
            </h1>
            <span
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                padding: "0.15rem 0.5rem",
                borderRadius: "6px",
                fontSize: "0.72rem",
                fontWeight: "800",
              }}
            >
              TRAZABILIDAD
            </span>
          </div>

          {/* Cinta de resumen minimalista (en vez de 5 cajas gigantescas) */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginTop: "0.4rem", fontSize: "0.82rem", color: "#94a3b8" }}>
            <span><strong>{totalMulas}</strong> mulas en patio</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#fb923c" }}><strong>{inWorkshop}</strong> en armado</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#c084fc" }}><strong>{inPaint}</strong> en pintura</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
            <span style={{ color: "#34d399" }}><strong>{finished}</strong> listas</span>
          </div>
        </div>

        {/* Acciones del Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {/* Buscador minimalista */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Buscar placa, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "220px",
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: "rgba(18, 19, 24, 0.8)",
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
              padding: "0.55rem 0.9rem",
              background: "rgba(56, 189, 248, 0.08)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            📦 Container
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.55rem 1.1rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 3px 12px rgba(245, 158, 11, 0.3)",
            }}
          >
            + Ingresar Mula
          </button>
        </div>
      </header>

      {/* KANBAN BOARD 100% HORIZONTAL (Estilo Linear / Jira de alta gama) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando tablero operativo...
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(270px, 1fr))",
            gap: "1rem",
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            paddingBottom: "0.5rem",
          }}
        >
          {STAGES.map((stage) => {
            const stageOrders = filteredOrders.filter((o) => o.estado === stage.id);

            return (
              <div
                key={stage.id}
                style={{
                  background: "rgba(18, 20, 26, 0.65)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "calc(100vh - 210px)",
                  minHeight: "450px",
                }}
              >
                {/* Cabecera de Columna */}
                <div
                  style={{
                    padding: "0.8rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: stage.dotColor,
                        boxShadow: `0 0 8px ${stage.dotColor}`,
                      }}
                    ></span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "0.03em" }}>
                      {stage.title}
                    </span>
                  </div>

                  <span
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "10px",
                    }}
                  >
                    {stageOrders.length}
                  </span>
                </div>

                {/* Lista de Tarjetas con Scroll Interno Independiente */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0.8rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {stageOrders.length === 0 ? (
                    <div
                      style={{
                        margin: "auto 0",
                        textAlign: "center",
                        padding: "2rem 1rem",
                        color: "#475569",
                        fontSize: "0.8rem",
                      }}
                    >
                      Sin mulas en esta fase
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      const partsCount = (order.items || []).length;
                      const partsTotal = order.costo_repuestos || 0;

                      return (
                        <div
                          key={order.id}
                          style={{
                            background: "#16171d",
                            borderRadius: "10px",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "0.9rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.65rem",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                            transition: "transform 0.15s ease, border-color 0.15s ease",
                          }}
                        >
                          {/* Fila 1: Placa Metálica Colombiana 3D & Botón eliminar */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {/* Auténtica Placa Colombiana Troquelada */}
                            <div
                              style={{
                                background: "linear-gradient(180deg, #facc15 0%, #eab308 100%)",
                                color: "#000",
                                fontWeight: "900",
                                fontSize: "0.88rem",
                                letterSpacing: "0.14em",
                                padding: "0.15rem 0.55rem",
                                borderRadius: "4px",
                                border: "1.5px solid #000",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "82px",
                              }}
                            >
                              {/* Remaches metálicos superiores */}
                              <span
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "4px",
                                  width: "3px",
                                  height: "3px",
                                  borderRadius: "50%",
                                  background: "#333",
                                }}
                              ></span>
                              <span
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  right: "4px",
                                  width: "3px",
                                  height: "3px",
                                  borderRadius: "50%",
                                  background: "#333",
                                }}
                              ></span>
                              {order.placa}
                            </div>

                            <button
                              onClick={() => handleDeleteOrder(order.id, order.placa)}
                              title="Retirar orden"
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#475569",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                              }}
                            >
                              ✕
                            </button>
                          </div>

                          {/* Fila 2: Camión & Cliente (Limpio, sin duplicados) */}
                          <div>
                            <div style={{ fontWeight: "800", color: "#f1f5f9", fontSize: "0.9rem" }}>
                              {getCleanTruckTitle(order)}
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: "2px" }}>
                              👤 {order.cliente}
                            </div>
                          </div>

                          {/* Fila 3: Chip de Piezas del Container (Click para gestionar) */}
                          <div
                            onClick={() => openPartsModal(order)}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: "rgba(56, 189, 248, 0.06)",
                              border: "1px solid rgba(56, 189, 248, 0.2)",
                              borderRadius: "6px",
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                          >
                            <span style={{ color: "#38bdf8", fontWeight: "700" }}>
                              📦 {partsCount > 0 ? `${partsCount} pieza(s)` : "Sin piezas"}
                            </span>
                            <span style={{ color: "#94a3b8", fontWeight: "600" }}>
                              {partsCount > 0 ? `$${(partsTotal / 1000000).toFixed(1)}M` : "+ Asignar"}
                            </span>
                          </div>

                          {/* Fila 4: Acciones si está Terminado o Entregado */}
                          {(order.estado === "Terminado" || order.estado === "Entregado") && order.slug && (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <Link
                                to={`/galeria/${order.slug}`}
                                target="_blank"
                                style={{
                                  flex: 1,
                                  padding: "0.35rem",
                                  background: "rgba(16, 185, 129, 0.15)",
                                  border: "1px solid rgba(16, 185, 129, 0.3)",
                                  color: "#34d399",
                                  borderRadius: "6px",
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  textAlign: "center",
                                  textDecoration: "none",
                                }}
                              >
                                ⚡ Showroom
                              </Link>
                              {order.whatsappShareUrl && (
                                <a
                                  href={order.whatsappShareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    flex: 1,
                                    padding: "0.35rem",
                                    background: "#25d366",
                                    color: "#000",
                                    borderRadius: "6px",
                                    fontSize: "0.72rem",
                                    fontWeight: "800",
                                    textAlign: "center",
                                    textDecoration: "none",
                                  }}
                                >
                                  💬 WhatsApp
                                </a>
                              )}
                            </div>
                          )}

                          {/* Fila 5: Botones de Avance de Estado */}
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
                                  fontSize: "0.72rem",
                                  cursor: "pointer",
                                  fontWeight: "600",
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
                                  padding: "0.35rem 0.75rem",
                                  borderRadius: "6px",
                                  background: "rgba(255, 255, 255, 0.08)",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  color: "#f8fafc",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                }}
                              >
                                Pasar a {STAGES[STAGES.findIndex((s) => s.id === stage.id) + 1]?.title} ➔
                              </button>
                            ) : (
                              <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#38bdf8", fontWeight: "700" }}>
                                ✓ Despachada
                              </span>
                            )}
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

      {/* MODAL MODERNO: Detalle de la Mula & Gestión de Piezas del Container */}
      {selectedOrderForParts && (
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
              background: "#181920",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header del Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div
                    style={{
                      background: "#facc15",
                      color: "#000",
                      fontWeight: "900",
                      fontSize: "0.9rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #000",
                    }}
                  >
                    {selectedOrderForParts.placa}
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>
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

            {/* Lista de Repuestos Asignados Actualmente */}
            <div style={{ marginBottom: "1.4rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.6rem" }}>
                Piezas Asignadas del Container ({selectedOrderForParts.items ? selectedOrderForParts.items.length : 0})
              </div>

              {(!selectedOrderForParts.items || selectedOrderForParts.items.length === 0) ? (
                <div style={{ padding: "1rem", textAlign: "center", background: "rgba(0,0,0,0.25)", borderRadius: "8px", color: "#64748b", fontSize: "0.85rem" }}>
                  No hay repuestos cargados a esta mula todavía.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "160px", overflowY: "auto" }}>
                  {selectedOrderForParts.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0.8rem",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div>
                        <span style={{ color: "#f59e0b", fontWeight: "800" }}>{item.cantidad}x</span>{" "}
                        <span style={{ color: "#f8fafc" }}>{item.nombre}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ color: "#38bdf8", fontWeight: "700" }}>
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
                            padding: "0.2rem 0.4rem",
                            fontSize: "0.75rem",
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
                  paddingTop: "0.6rem",
                  marginTop: "0.6rem",
                  borderTop: "1px dashed rgba(255,255,255,0.1)",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                }}
              >
                <span style={{ color: "#94a3b8" }}>Total Repuestos:</span>
                <span style={{ color: "#38bdf8" }}>
                  ${(selectedOrderForParts.costo_repuestos || 0).toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            {/* Asignar Nueva Pieza (Formulario Rápido) */}
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
                    background: "#0d0e12",
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
                    background: "#0d0e12",
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
                    padding: "0.6rem 1.1rem",
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
                    padding: "0.6rem 1.3rem",
                    background: "linear-gradient(135deg, #0284c7, #0369a1)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
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
              background: "#181920",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#f59e0b" }}>
                Ingreso de Nueva Mula
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fde047",
                      fontWeight: "800",
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
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
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0d0e12",
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
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "#0d0e12",
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
                    padding: "0.6rem 1.1rem",
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
                    padding: "0.6rem 1.3rem",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
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
