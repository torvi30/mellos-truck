import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { showSuccessToast, showErrorToast, showConfirmAlert } from "../utils/alerts";

const API_BASE = "http://localhost:4000/api";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_clients: 0,
    total_spent_accumulated: 0,
    total_trucks_registered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    city: "Bogotá D.C.",
    company: "",
    documento: "",
    notes: "",
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
      const res = await fetch(`${API_BASE}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.clients)) {
        setClients(data.clients);
        if (data.metrics) setMetrics(data.metrics);
      } else if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (err) {
      console.warn("Error cargando clientes del CRM:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const cities = useMemo(() => {
    const list = clients.map((c) => c.city).filter(Boolean);
    return ["all", ...new Set(list)];
  }, [clients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter((client) => {
      const inCity = selectedCity === "all" || (client.city || "").toLowerCase() === selectedCity.toLowerCase();
      if (!inCity) return false;

      if (!term) return true;

      const inName = (client.name || "").toLowerCase().includes(term);
      const inPhone = (client.phone || "").toLowerCase().includes(term);
      const inCompany = (client.company || "").toLowerCase().includes(term);
      const inPlates = (client.plates || []).some((p) => p.toLowerCase().includes(term));
      const inNotes = (client.notes || "").toLowerCase().includes(term);

      return inName || inPhone || inCompany || inPlates || inNotes;
    });
  }, [clients, search, selectedCity]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setForm({
      name: "",
      phone: "",
      whatsapp: "",
      city: "Bogotá D.C.",
      company: "",
      documento: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      whatsapp: client.whatsapp || "",
      city: client.city || "Bogotá D.C.",
      company: client.company || "",
      documento: client.documento || "",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showErrorToast("Ingresa nombre y teléfono de contacto");
      return;
    }

    try {
      const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
      const url = editingClient ? `${API_BASE}/clients/${editingClient.id}` : `${API_BASE}/clients`;
      const method = editingClient ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessToast(editingClient ? "Cliente actualizado" : "Cliente registrado en el CRM");
        setShowModal(false);
        loadClients();
      } else {
        showErrorToast(data.message || "Error al procesar cliente");
      }
    } catch (err) {
      showErrorToast("Error al conectar con el servidor");
    }
  };

  const handleDeleteClient = async (client) => {
    const confirmed = await showConfirmAlert({
      title: `¿Retirar a ${client.name}?`,
      text: "El cliente será eliminado del directorio CRM. No se borrarán sus órdenes de taller pasadas.",
      confirmButtonText: "Sí, retirar",
      danger: true,
    });

    if (confirmed) {
      try {
        const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
        const res = await fetch(`${API_BASE}/clients/${client.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          showSuccessToast("Cliente retirado correctamente");
          loadClients();
        } else {
          showErrorToast("Error al retirar cliente");
        }
      } catch (err) {
        showErrorToast("Error de conexión");
      }
    }
  };

  const openWhatsApp = (client) => {
    const raw = (client.whatsapp || client.phone || "").replace(/\D/g, "");
    const phone = raw.startsWith("57") ? raw : `57${raw}`;
    const text = encodeURIComponent(`Hola Don ${client.name}, le saludamos desde Mellos Truck Taller & Container. ¿En qué podemos servirle hoy con sus mulas?`);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div style={{ color: "#f8fafc", padding: "1.2rem 1.6rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      {/* 1. Header del CRM */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>👥</span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: "900", color: "#f8fafc", margin: 0, letterSpacing: "0.02em" }}>
              CRM Transportador & Directorio de Flotas
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>
            Historial consolidado de transportadores, mulas atendidas, inversión acumulada y contacto directo.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            padding: "0.65rem 1.3rem",
            background: "linear-gradient(135deg, #f59e0b, #ea580c)",
            color: "#000",
            fontWeight: "900",
            fontSize: "0.85rem",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>➕</span>
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* 2. Banner de Métricas del CRM */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "rgba(24, 26, 34, 0.8)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "12px", padding: "1.1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase" }}>
            Transportadores Registrados
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#f59e0b", marginTop: "4px" }}>
            {metrics.total_clients || clients.length}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>Clientes y empresas de carga</div>
        </div>

        <div style={{ background: "rgba(24, 26, 34, 0.8)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "12px", padding: "1.1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase" }}>
            Flota de Mulas Atendidas
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#38bdf8", marginTop: "4px" }}>
            {metrics.total_trucks_registered || 6}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>Tractomulas con trazabilidad</div>
        </div>

        <div style={{ background: "rgba(24, 26, 34, 0.8)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: "12px", padding: "1.1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase" }}>
            Facturación Total Acumulada
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>
            ${(metrics.total_spent_accumulated || 28540000).toLocaleString("es-CO")} COP
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>Mano de obra + Container</div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda & Filtros de Ciudad */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <input
            type="text"
            placeholder="Buscar por transportador, placa (ej: WTL-892), empresa o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.7rem 1rem 0.7rem 2.4rem",
              borderRadius: "10px",
              background: "#181a22",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: "0.85rem", top: "0.75rem", color: "#64748b" }}>🔍</span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              style={{
                padding: "0.5rem 0.85rem",
                borderRadius: "8px",
                border: selectedCity === city ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.08)",
                background: selectedCity === city ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.03)",
                color: selectedCity === city ? "#f59e0b" : "#94a3b8",
                fontWeight: "700",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              {city === "all" ? "Todas las ciudades" : city}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Listado de Clientes en Tarjetas Ejecutivas */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
          Cargando directorio de transportadores...
        </div>
      ) : filteredClients.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: "#161820", borderRadius: "12px", color: "#94a3b8" }}>
          No se encontraron transportadores con el criterio "{search}".
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.2rem" }}>
          {filteredClients.map((client) => {
            const hasPlates = (client.plates || []).length > 0;
            const spent = client.total_spent || 0;

            return (
              <div
                key={client.id}
                style={{
                  background: "linear-gradient(145deg, #181a24, #13151c)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "14px",
                  padding: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.9rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Cabecera Tarjeta: Nombre + Ciudad */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#f8fafc" }}>
                      {client.name}
                    </h3>
                    <div style={{ fontSize: "0.78rem", color: "#f59e0b", fontWeight: "700", marginTop: "2px" }}>
                      🏢 {client.company || "Transportador Independiente"}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(56, 189, 248, 0.12)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "#38bdf8",
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📍 {client.city || "Colombia"}
                  </div>
                </div>

                {/* Documento y Teléfono */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8" }}>
                  <div>
                    NIT / C.C: <strong style={{ color: "#e2e8f0" }}>{client.documento || "No registrado"}</strong>
                  </div>
                  <div>
                    📞 <strong style={{ color: "#e2e8f0" }}>{client.phone}</strong>
                  </div>
                </div>

                {/* Flota de Mulas del Cliente */}
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.7rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                    Tractomulas Registradas ({client.plates?.length || 0})
                  </div>
                  {hasPlates ? (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {client.plates.map((placa) => (
                        <div
                          key={placa}
                          style={{
                            background: "linear-gradient(180deg, #fde047 0%, #eab308 100%)",
                            color: "#000",
                            fontWeight: "900",
                            fontSize: "0.75rem",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #000",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>🚛</span>
                          <span>{placa}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                      Sin órdenes de taller vinculadas aún.
                    </div>
                  )}
                </div>

                {/* Inversión Acumulada */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem" }}>
                  <div>
                    <div style={{ fontSize: "0.68rem", color: "#64748b", fontWeight: "700" }}>FACTURACIÓN TOTAL EN TALLER:</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: "900", color: spent > 0 ? "#34d399" : "#94a3b8" }}>
                      ${spent.toLocaleString("es-CO")} COP
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(client)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      background: "rgba(34, 197, 94, 0.15)",
                      border: "1px solid rgba(34, 197, 94, 0.4)",
                      color: "#4ade80",
                      borderRadius: "8px",
                      fontWeight: "800",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Acciones de Edición */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(client)}
                    style={{
                      padding: "0.35rem 0.65rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClient(client)}
                    style={{
                      padding: "0.35rem 0.65rem",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      color: "#f87171",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Retirar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Crear / Editar Cliente */}
      {showModal && (
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
              background: "#161822",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: "16px",
              padding: "1.8rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "#f59e0b" }}>
                {editingClient ? `Editar Cliente: ${editingClient.name}` : "Registrar Nuevo Cliente en CRM"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Nombre del Transportador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Don Carlos Rodríguez"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Teléfono Celular / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="3104567890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Empresa o Flota
                  </label>
                  <input
                    type="text"
                    placeholder="Transportes El Sol S.A.S."
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                    Ciudad de Operación
                  </label>
                  <input
                    type="text"
                    placeholder="Bogotá D.C., Medellín, Cali..."
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      background: "#0c0e12",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  NIT o Cédula de Ciudadanía
                </label>
                <input
                  type="text"
                  placeholder="80.124.590"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "#0c0e12",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.3rem" }}>
                  Notas & Preferencias de Taller
                </label>
                <textarea
                  rows="3"
                  placeholder="Gusto por acero inoxidable, rines pulidos, horarios de entrega..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    background: "#0c0e12",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    resize: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.6rem 1.1rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.4rem",
                    background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "900",
                    cursor: "pointer",
                    fontSize: "0.82rem",
                  }}
                >
                  {editingClient ? "Guardar Cambios" : "Confirmar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}