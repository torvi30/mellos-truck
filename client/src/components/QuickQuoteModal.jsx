import React, { useState, useEffect } from "react";
import { showSuccessToast, showErrorToast } from "../utils/alerts";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, "")}/api`
  : "http://localhost:4000/api";

const TRUCK_PRESETS = [
  { id: "kw", name: "Kenworth T800", icon: "🚛" },
  { id: "mack", name: "Mack Vision", icon: "🚚" },
  { id: "pet", name: "Peterbilt 389", icon: "🚛" },
  { id: "int", name: "International", icon: "🚚" },
  { id: "other", name: "Otra Mula / Camión", icon: "⚙️" },
];

const SERVICE_PRESETS = [
  { id: "bomper", name: "Bomper 20\" Inox Calibre 10", icon: "🛡️" },
  { id: "visera", name: "Visera Americana Espejo", icon: "🪞" },
  { id: "cornetas", name: "Doble Corneta Hadley 24V", icon: "📢" },
  { id: "estacionarias", name: "Luces Estacionarias LED", icon: "💡" },
  { id: "rines", name: "Rines Pulidos & Copas Spikes", icon: "💎" },
  { id: "full", name: "Transformación Full Taller", icon: "⚡" },
];

export default function QuickQuoteModal({
  isOpen,
  onClose,
  whatsappNumber = "573104567890",
  initialVehicle = "Kenworth T800",
  initialService = "Bomper 20\" Inox Calibre 10",
}) {
  const cleanWaNumber = String(whatsappNumber).replace(/\D/g, "") || "573104567890";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Medellín",
    vehicle_type: initialVehicle || "Kenworth T800",
    plate: "",
    selectedServices: [initialService || "Bomper 20\" Inox Calibre 10"],
    details: "",
  });

  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialVehicle) {
      setForm((prev) => ({ ...prev, vehicle_type: initialVehicle }));
    }
  }, [initialVehicle]);

  useEffect(() => {
    if (initialService) {
      setForm((prev) => ({
        ...prev,
        selectedServices: prev.selectedServices.includes(initialService)
          ? prev.selectedServices
          : [...prev.selectedServices, initialService],
      }));
    }
  }, [initialService]);

  if (!isOpen) return null;

  const toggleService = (serviceName) => {
    setForm((prev) => {
      const exists = prev.selectedServices.includes(serviceName);
      if (exists) {
        if (prev.selectedServices.length === 1) return prev; // Mantener al menos uno
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter((s) => s !== serviceName),
        };
      } else {
        return {
          ...prev,
          selectedServices: [...prev.selectedServices, serviceName],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      showErrorToast("Por favor ingresa tu nombre y número de WhatsApp");
      return;
    }

    setSending(true);

    try {
      // Registrar en backend para trazabilidad / bot Telegram
      await fetch(`${API_BASE}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: form.name,
          phone: form.phone,
          city: form.city,
          vehicle_type: form.vehicle_type,
          plate: form.plate || null,
          service: form.selectedServices.join(", "),
          details: form.details || "Cotización express desde modal",
        }),
      });
    } catch (err) {
      console.warn("Registrando localmente:", err);
    } finally {
      setSending(false);
      showSuccessToast("¡Conectando con tu asesor técnico por WhatsApp!");

      // Mensaje estructurado de WhatsApp
      const servicesText = form.selectedServices.map((s) => `  • ${s}`).join("\n");
      const waText = encodeURIComponent(
        `¡Hola Mellos Truck! 🚛🔥\nQuiero cotizar para mi vehículo:\n- Nombre: ${form.name}\n- Mula: ${form.vehicle_type} (Placa: ${form.plate || "Sin especificar"})\n- Ciudad: ${form.city}\n- Mejoras de interés:\n${servicesText}\n- Detalles: ${form.details || "Quiero más información de tiempos y precios."}`
      );

      window.open(`https://wa.me/${cleanWaNumber}?text=${waText}`, "_blank");
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(6, 8, 12, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "modal-fade-in 0.22s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "linear-gradient(180deg, #141722 0%, #0d0f16 100%)",
          border: "1.5px solid rgba(245, 158, 11, 0.4)",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(245, 158, 11, 0.15)",
          color: "#f8fafc",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: "6px", padding: "3px 10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 900, letterSpacing: "0.06em" }}>
                ⚡ COTIZACIÓN EXPRESS SIN ESPERAS
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 900, color: "#fff" }}>
              Personaliza Tu Mula en Mellos Truck
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#94a3b8" }}>
              Elige tus accesorios y te conectamos de inmediato por WhatsApp con precio de taller.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Paso 1: Selector de Vehículo */}
          <div>
            <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              1. Selecciona tu Máquina:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: "8px" }}>
              {TRUCK_PRESETS.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm({ ...form, vehicle_type: t.name })}
                  style={{
                    background: form.vehicle_type === t.name ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#161b26",
                    color: form.vehicle_type === t.name ? "#000" : "#cbd5e1",
                    border: form.vehicle_type === t.name ? "1px solid #f59e0b" : "1px solid #283244",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "3px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Mejoras de Interés (Chips multiselección) */}
          <div>
            <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              2. ¿Qué accesorios o trabajos necesitas? (Toca para seleccionar):
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SERVICE_PRESETS.map((s) => {
                const isSelected = form.selectedServices.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleService(s.name)}
                    style={{
                      background: isSelected ? "rgba(245, 158, 11, 0.2)" : "#161b26",
                      color: isSelected ? "#fbbf24" : "#94a3b8",
                      border: isSelected ? "1.5px solid #f59e0b" : "1px solid #283244",
                      padding: "7px 13px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                    {isSelected && <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paso 3: Datos de Contacto */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#cbd5e1", marginBottom: "4px" }}>
                Tu Nombre: *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Carlos Rodríguez"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#0a0c12",
                  border: "1px solid #283244",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#cbd5e1", marginBottom: "4px" }}>
                Tu WhatsApp: *
              </label>
              <input
                type="tel"
                required
                placeholder="Ej: 310 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#0a0c12",
                  border: "1px solid #283244",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", marginBottom: "4px" }}>
                Ciudad / Ruta habitual:
              </label>
              <input
                type="text"
                placeholder="Ej: Bogotá, Medellín, Duitama..."
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#0a0c12",
                  border: "1px solid #283244",
                  color: "#cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", marginBottom: "4px" }}>
                Placa (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej: WTL-892"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#0a0c12",
                  border: "1px solid #283244",
                  color: "#fbbf24",
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#94a3b8", marginBottom: "4px" }}>
              Detalles adicionales (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: ¿Cuánto tiempo toma instalar el bomper y la visera?"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                background: "#0a0c12",
                border: "1px solid #283244",
                color: "#cbd5e1",
                fontSize: "0.82rem",
              }}
            />
          </div>

          {/* Botón Principal de Enviar */}
          <button
            type="submit"
            disabled={sending}
            style={{
              marginTop: "6px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#000",
              border: "none",
              padding: "13px 20px",
              borderRadius: "12px",
              fontWeight: 900,
              fontSize: "0.92rem",
              letterSpacing: "0.04em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 6px 22px rgba(245, 158, 11, 0.4)",
              transition: "all 0.22s ease",
            }}
          >
            <span>{sending ? "⏳ Conectando..." : "🚀 Chatear por WhatsApp con Asesor de Taller"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
