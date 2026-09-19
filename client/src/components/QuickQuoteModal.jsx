import React, { useState, useEffect } from "react";
import { quotesService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import { X, MessageCircle, Truck, Sparkles, Check, Send } from "lucide-react";

const TRUCK_PRESETS = [
  { id: "kw", name: "Kenworth T800" },
  { id: "mack", name: "Mack Vision" },
  { id: "pet", name: "Peterbilt 389" },
  { id: "int", name: "International" },
  { id: "other", name: "Otra Mula / Camión" },
];

const SERVICE_PRESETS = [
  { id: "bomper", name: 'Bomper 20" Inox Calibre 10' },
  { id: "visera", name: "Visera Americana Espejo" },
  { id: "cornetas", name: "Doble Corneta Hadley 24V" },
  { id: "estacionarias", name: "Luces Estacionarias LED" },
  { id: "rines", name: "Rines Pulidos & Copas Spikes" },
  { id: "full", name: "Transformación Full Taller" },
];

export default function QuickQuoteModal({
  isOpen,
  onClose,
  whatsappNumber = "573104567890",
  initialVehicle = "Kenworth T800",
  initialService = 'Bomper 20" Inox Calibre 10',
}) {
  const cleanWaNumber = String(whatsappNumber).replace(/\D/g, "") || "573104567890";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Medellín",
    vehicle_type: initialVehicle || "Kenworth T800",
    plate: "",
    selectedServices: [initialService || 'Bomper 20" Inox Calibre 10'],
    details: "",
  });

  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape" || e.key === "Esc") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleService = (serviceName) => {
    setForm((prev) => {
      const exists = prev.selectedServices.includes(serviceName);
      let updated;
      if (exists) {
        updated = prev.selectedServices.filter((s) => s !== serviceName);
        if (updated.length === 0) updated = [serviceName]; // mantener al menos 1
      } else {
        updated = [...prev.selectedServices, serviceName];
      }
      return { ...prev, selectedServices: updated };
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
      // Registrar directamente en Cloud Firestore
      await quotesService.create({
        client_name: form.name,
        phone: form.phone,
        city: form.city,
        vehicle_type: form.vehicle_type,
        plate: form.plate || null,
        service: form.selectedServices.join(", "),
        details: form.details || "Cotización express desde modal",
      });
    } catch (err) {
      console.warn("Error registrando cotización:", err);
    } finally {
      setSending(false);
      showSuccessToast("¡Conectando con tu asesor técnico por WhatsApp!");

      const servicesText = form.selectedServices.map((s) => `  • ${s}`).join("\n");
      const waText = encodeURIComponent(
        `¡Hola Mellos Truck! 🚛🔥\nQuiero cotizar para mi vehículo:\n- Nombre: ${form.name}\n- Mula: ${form.vehicle_type} (Placa: ${form.plate || "Sin especificar"})\n- Ciudad: ${form.city}\n- Mejoras de interés:\n${servicesText}\n- Detalles: ${form.details || "Quiero más información de tiempos y precios."}`
      );

      window.open(`https://wa.me/${cleanWaNumber}?text=${waText}`, "_blank");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div
        className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-5 border border-white/20 my-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-carbon-900 text-slate-400 hover:text-white hover:bg-carbon-800 border border-white/10 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Respuesta Inmediata por Taller</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Cotiza la Transformación de tu Nave
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recibe asesoría directa con fotos y cotización formal por WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Don Carlos Rodríguez"
                className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu WhatsApp *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="3104567890"
                className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mula / Marca</label>
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {TRUCK_PRESETS.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Placa (Opcional)</label>
              <input
                type="text"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
                placeholder="WTL-892"
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Medellín / Bogotá"
                className="w-full px-3 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Selector de Accesorios */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Selecciona los accesorios o modificaciones que te interesan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_PRESETS.map((service) => {
                const isSelected = form.selectedServices.includes(service.name);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.name)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm"
                        : "bg-carbon-900 border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <span className="truncate">{service.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detalles Adicionales</label>
            <textarea
              rows="2"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="¿Quieres algún corte láser específico, número de calibre o fecha de ingreso?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-xl shadow-amber-500/25 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? "Guardando..." : "Enviar Cotización & Abrir WhatsApp"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
