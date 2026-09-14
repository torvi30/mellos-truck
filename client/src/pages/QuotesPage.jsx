import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getQuotesRequest,
  updateQuoteStatusRequest,
  createQuoteRequest,
  convertToWorkshopRequest,
} from "../api/api";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal para confirmar envío a taller
  const [selectedQuoteForWorkshop, setSelectedQuoteForWorkshop] = useState(null);
  const [workshopLaborCost, setWorkshopLaborCost] = useState("2500000");

  const [form, setForm] = useState({
    client_name: "",
    phone: "",
    city: "Medellín",
    vehicle_type: "Kenworth T800",
    plate: "",
    service: "Fabricación de Bomper en Acero Inoxidable",
    details: "",
  });

  const statuses = [
    "nueva",
    "contactado",
    "en revision",
    "cotizada",
    "aprobada",
    "rechazada",
    "convertida",
  ];

  const statusInfoMap = {
    nueva: { label: "Nueva", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: "🟡" },
    contactado: { label: "Contactado", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", icon: "💬" },
    "en revision": { label: "En Revisión", color: "#818cf8", bg: "rgba(129, 140, 248, 0.15)", icon: "🔍" },
    cotizada: { label: "Cotizada", color: "#c084fc", bg: "rgba(192, 132, 252, 0.15)", icon: "📋" },
    aprobada: { label: "Aprobada", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)", icon: "✅" },
    rechazada: { label: "Rechazada", color: "#f87171", bg: "rgba(248, 113, 113, 0.15)", icon: "❌" },
    convertida: { label: "En Taller", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.25)", icon: "🛠️" },
  };

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const data = await getQuotesRequest();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando cotizaciones:", error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    if (statusFilter !== "todos") {
      result = result.filter((quote) => quote.status === statusFilter);
    }

    const term = search.trim().toLowerCase();
    if (!term) return result;

    return result.filter((quote) => {
      return (
        (quote.client_name || "").toLowerCase().includes(term) ||
        (quote.phone || "").toLowerCase().includes(term) ||
        (quote.city || "").toLowerCase().includes(term) ||
        (quote.vehicle_type || "").toLowerCase().includes(term) ||
        (quote.plate || "").toLowerCase().includes(term) ||
        (quote.service || "").toLowerCase().includes(term) ||
        (quote.details || "").toLowerCase().includes(term)
      );
    });
  }, [quotes, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: quotes.length,
      nuevas: quotes.filter((q) => q.status === "nueva").length,
      negociacion: quotes.filter((q) => q.status === "contactado" || q.status === "cotizada" || q.status === "en revision").length,
      aprobadas: quotes.filter((q) => q.status === "aprobada").length,
      convertidas: quotes.filter((q) => q.status === "convertida").length,
    };
  }, [quotes]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = await createQuoteRequest(form);
      if (data.quoteId) {
        setMessage("✅ Cotización registrada con éxito");
        setShowCreateModal(false);
        setForm({
          client_name: "",
          phone: "",
          city: "Medellín",
          vehicle_type: "Kenworth T800",
          plate: "",
          service: "Fabricación de Bomper en Acero Inoxidable",
          details: "",
        });
        await loadQuotes();
      } else {
        setMessage(data.message || "No se pudo crear la cotización");
      }
    } catch (error) {
      console.error("Error creando cotización:", error);
      setMessage("Error al registrar cotización");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateQuoteStatusRequest(id, newStatus);
      await loadQuotes();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  // Abrir WhatsApp con mensaje comercial pre-cargado
  const handleContactWhatsApp = async (quote) => {
    const text = encodeURIComponent(
      `¡Hola ${quote.client_name}! 🚛🔥 Te saludamos desde Mellos Truck.\nRecibimos tu solicitud para tu camión ${quote.vehicle_type} (${quote.plate || "Sin placa"}).\nRespecto a: "${quote.service}".\n¿Cuándo te gustaría traer el carro al taller o programar la fabricación?`
    );

    const cleanPhone = (quote.phone || "").replace(/[^0-9]/g, "");
    const waUrl = cleanPhone.startsWith("57")
      ? `https://wa.me/${cleanPhone}?text=${text}`
      : `https://wa.me/57${cleanPhone}?text=${text}`;

    window.open(waUrl, "_blank");

    if (quote.status === "nueva") {
      await handleStatusChange(quote.id, "contactado");
    }
  };

  // Confirmar y Enviar a Taller Kanban
  const handleConfirmSendToWorkshop = async () => {
    if (!selectedQuoteForWorkshop) return;

    try {
      const res = await convertToWorkshopRequest(
        selectedQuoteForWorkshop.id,
        parseFloat(workshopLaborCost) || 2000000
      );

      setMessage(`¡Mula ${selectedQuoteForWorkshop.plate || "ingresada"} enviada al Taller Kanban!`);
      setSelectedQuoteForWorkshop(null);
      await loadQuotes();
    } catch (err) {
      console.error("Error enviando a taller:", err);
      setMessage("Error al enviar al taller");
    }
  };

  return (
    <div style={{ color: "#f8fafc", padding: "1.5rem" }}>
      {/* Toast Notification */}
      {message && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            padding: "1rem 1.5rem",
            borderRadius: "10px",
            background: "#059669",
            color: "#ffffff",
            fontWeight: "700",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
          }}
        >
          <span>✅</span>
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", marginLeft: "0.5rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Industrial */}
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
            <span style={{ fontSize: "1.8rem" }}>💬</span>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
                background: "linear-gradient(90deg, #4ade80, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cotizaciones Web & Ventas
            </h1>
            <span
              style={{
                background: "rgba(74, 222, 128, 0.15)",
                color: "#4ade80",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "800",
              }}
            >
              ENTRADA COMERCIAL
            </span>
          </div>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            Atiende a los camioneros interesados de la landing, contáctalos por WhatsApp y conviértelos en órdenes de trabajo para el taller con 1 clic.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <Link
            to="/admin/workshop"
            style={{
              padding: "0.75rem 1.2rem",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#f59e0b",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🛠️ Ver Tablero Kanban
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.75rem 1.4rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>+</span> Nueva Cotización
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
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase" }}>Total Solicitudes</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f8fafc", marginTop: "0.3rem" }}>
            {counts.total} <span style={{ fontSize: "0.9rem", color: "#64748b" }}>cotizaciones</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(245, 158, 11, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#f59e0b", textTransform: "uppercase" }}>🟡 Nuevas por Atender</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f59e0b", marginTop: "0.3rem" }}>
            {counts.nuevas} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>pendientes</span>
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
          <div style={{ fontSize: "0.8rem", color: "#38bdf8", textTransform: "uppercase" }}>💬 En Negociación</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#38bdf8", marginTop: "0.3rem" }}>
            {counts.negociacion} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>en contacto</span>
          </div>
        </div>

        <div
          style={{
            background: "rgba(24, 24, 27, 0.8)",
            padding: "1.2rem",
            borderRadius: "12px",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#f59e0b", textTransform: "uppercase" }}>🛠️ Convertidas a Taller</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f59e0b", marginTop: "0.3rem" }}>
            {counts.convertidas} <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>en patio</span>
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
          {["todos", ...statuses].map((stg) => {
            const isSelected = statusFilter === stg;
            const label = stg === "todos" ? "Todas" : statusInfoMap[stg]?.label || stg;
            return (
              <button
                key={stg}
                onClick={() => setStatusFilter(stg)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: isSelected ? "1px solid #4ade80" : "1px solid rgba(255,255,255,0.08)",
                  background: isSelected ? "rgba(74, 222, 128, 0.15)" : "rgba(24, 24, 27, 0.6)",
                  color: isSelected ? "#4ade80" : "#94a3b8",
                  fontWeight: isSelected ? "800" : "500",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ minWidth: "260px" }}>
          <input
            type="text"
            placeholder="🔍 Buscar por cliente, placa, vehículo..."
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

      {/* Lista de Cotizaciones en Cards Industriales */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
          Cargando cotizaciones...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(24, 24, 27, 0.6)",
            borderRadius: "12px",
            border: "1px dashed rgba(255, 255, 255, 0.1)",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
          <p>No se encontraron cotizaciones con los filtros actuales.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredQuotes.map((quote) => {
            const statusInfo = statusInfoMap[quote.status] || {
              label: quote.status,
              color: "#94a3b8",
              bg: "rgba(255,255,255,0.05)",
              icon: "•",
            };

            const isConverted = quote.status === "convertida";

            return (
              <div
                key={quote.id}
                style={{
                  background: "linear-gradient(135deg, #18181b, #121215)",
                  borderRadius: "14px",
                  border: isConverted
                    ? "1px solid rgba(245, 158, 11, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "1.4rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {/* Header de la Tarjeta */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    {/* Badge de Placa Colombiana */}
                    <div
                      style={{
                        background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                        color: "#000",
                        fontWeight: "900",
                        fontSize: "0.95rem",
                        letterSpacing: "0.15em",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        border: "2px solid #000",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                        minWidth: "90px",
                        textAlign: "center",
                      }}
                    >
                      {quote.plate || "SIN PLACA"}
                    </div>

                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc" }}>
                        {quote.client_name}
                      </h3>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "2px" }}>
                        📞 {quote.phone} • 📍 {quote.city || "Colombia"} • 🚛 {quote.vehicle_type}
                      </div>
                    </div>
                  </div>

                  {/* Estado Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span
                      style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        padding: "0.3rem 0.8rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "800",
                        border: `1px solid ${statusInfo.color}44`,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>

                    <select
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      style={{
                        padding: "0.35rem 0.6rem",
                        borderRadius: "6px",
                        background: "#09090b",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#cbd5e1",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      {statuses.map((stg) => (
                        <option key={stg} value={stg}>
                          {statusInfoMap[stg]?.label || stg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detalle del Servicio Solicitado */}
                <div
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "0.9rem 1.1rem",
                    borderRadius: "8px",
                    borderLeft: "4px solid #38bdf8",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#38bdf8", marginBottom: "0.3rem" }}>
                    {quote.service}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                    {quote.details}
                  </div>
                </div>

                {/* Barra de Acciones Rápidas */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.8rem",
                    paddingTop: "0.6rem",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Recibida el: {new Date(quote.created_at || Date.now()).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                    {/* Botón WhatsApp Directo */}
                    <button
                      onClick={() => handleContactWhatsApp(quote)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#25d366",
                        color: "#000",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <span>💬</span> WhatsApp Directo
                    </button>

                    {/* Botón Convertir a Taller (Kanban) */}
                    {isConverted ? (
                      <Link
                        to="/admin/workshop"
                        style={{
                          padding: "0.5rem 1rem",
                          background: "rgba(245, 158, 11, 0.2)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245, 158, 11, 0.4)",
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "0.85rem",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span>🚚</span> Ver en Taller Kanban
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedQuoteForWorkshop(quote);
                          setWorkshopLaborCost("2500000");
                        }}
                        style={{
                          padding: "0.5rem 1.1rem",
                          background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          color: "#000",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "800",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          boxShadow: "0 2px 10px rgba(245, 158, 11, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span>⚡</span> Enviar a Taller (Kanban)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Enviar Cotización al Taller */}
      {selectedQuoteForWorkshop && (
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
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#f59e0b" }}>
                ⚡ Enviar Mula a Taller Kanban
              </h3>
              <button
                onClick={() => setSelectedQuoteForWorkshop(null)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.3)",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "1.2rem",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ marginBottom: "0.4rem" }}>
                <span style={{ color: "#94a3b8" }}>Cliente: </span>
                <strong style={{ color: "#f8fafc" }}>{selectedQuoteForWorkshop.client_name}</strong>
              </div>
              <div style={{ marginBottom: "0.4rem" }}>
                <span style={{ color: "#94a3b8" }}>Vehículo / Mula: </span>
                <strong style={{ color: "#f8fafc" }}>{selectedQuoteForWorkshop.vehicle_type}</strong>
              </div>
              <div style={{ marginBottom: "0.4rem" }}>
                <span style={{ color: "#94a3b8" }}>Placa: </span>
                <strong style={{ color: "#fde047" }}>{selectedQuoteForWorkshop.plate || "PENDIENTE"}</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8" }}>Trabajo a realizar: </span>
                <span style={{ color: "#cbd5e1" }}>{selectedQuoteForWorkshop.service}</span>
              </div>
            </div>

            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
                Mano de Obra Estimada ($ COP)
              </label>
              <input
                type="number"
                value={workshopLaborCost}
                onChange={(e) => setWorkshopLaborCost(e.target.value)}
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
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.3rem 0 0 0" }}>
                La mula ingresará inmediatamente a la fase 1 (INGRESO) del tablero Kanban.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
              <button
                type="button"
                onClick={() => setSelectedQuoteForWorkshop(null)}
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
                type="button"
                onClick={handleConfirmSendToWorkshop}
                style={{
                  padding: "0.65rem 1.4rem",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "800",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                }}
              >
                Confirmar e Ingresar a Taller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nueva Cotización Manual */}
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
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800", color: "#4ade80" }}>
                📝 Registrar Cotización Manual
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    name="client_name"
                    value={form.client_name}
                    onChange={handleChange}
                    placeholder="Don Orlando Morales"
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
                    Teléfono WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="573147890123"
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
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
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
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    name="plate"
                    placeholder="SKR-901"
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      background: "#09090b",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fde047",
                      fontWeight: "800",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Mula / Tipo de Vehículo *
                </label>
                <input
                  type="text"
                  required
                  name="vehicle_type"
                  placeholder="Kenworth T800 / Mack Vision / International"
                  value={form.vehicle_type}
                  onChange={handleChange}
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
                  Servicio Solicitado *
                </label>
                <input
                  type="text"
                  required
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  placeholder="Fabricación de Bomper, Viseras, Latonería o Repuestos"
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
                  Detalles / Especificaciones *
                </label>
                <textarea
                  required
                  name="details"
                  rows="3"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Especificaciones de cortes láser, medidas en pulgadas, luces..."
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
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}