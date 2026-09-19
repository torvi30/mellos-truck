import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getQuotesRequest,
  updateQuoteStatusRequest,
  createQuoteRequest,
  convertToWorkshopRequest,
} from "../api/api";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  FileText,
  Plus,
  Search,
  MessageCircle,
  Wrench,
  X,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  Filter,
} from "lucide-react";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    nueva: { label: "Nueva", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    contactado: { label: "Contactado", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30" },
    "en revision": { label: "En Revisión", color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30" },
    cotizada: { label: "Cotizada", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
    aprobada: { label: "Aprobada", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
    rechazada: { label: "Rechazada", color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
    convertida: { label: "En Taller", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" },
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
      negociacion: quotes.filter((q) => ["contactado", "cotizada", "en revision"].includes(q.status)).length,
      aprobadas: quotes.filter((q) => q.status === "aprobada").length,
      convertidas: quotes.filter((q) => q.status === "convertida").length,
    };
  }, [quotes]);

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    try {
      const data = await createQuoteRequest(form);
      if (data.quoteId) {
        showSuccessToast("¡Cotización registrada con éxito!");
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
      }
    } catch (error) {
      showErrorToast("Error al registrar cotización");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateQuoteStatusRequest(id, newStatus);
      showSuccessToast(`Estado cambiado a ${newStatus}`);
      await loadQuotes();
    } catch (err) {
      showErrorToast("Error actualizando estado");
    }
  };

  const handleConfirmWorkshop = async () => {
    if (!selectedQuoteForWorkshop) return;
    try {
      const laborCostNum = parseFloat(workshopLaborCost) || 2000000;
      await convertToWorkshopRequest(selectedQuoteForWorkshop.id, laborCostNum);
      showSuccessToast("¡Mula enviada al Tablero de Taller Kanban!");
      setSelectedQuoteForWorkshop(null);
      await loadQuotes();
    } catch (err) {
      showErrorToast("No se pudo transferir al taller");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Cotizaciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <FileText className="w-4 h-4" />
            <span>Gestión de Prospectos & Leads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cotizaciones & Presupuestos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Solicitudes comerciales de transportadores con conversión directa al taller Kanban.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Cotización</span>
        </button>
      </div>

      {/* 2. Barra de Métricas de Cotización */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs font-medium text-slate-400">Total Solicitudes</div>
          <div className="text-2xl font-black text-white mt-1">{counts.total}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-2 border-l-amber-500">
          <div className="text-xs font-medium text-slate-400">Nuevas sin Gestionar</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{counts.nuevas}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-2 border-l-cyan-500">
          <div className="text-xs font-medium text-slate-400">En Negociación</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{counts.negociacion}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-2 border-l-emerald-500">
          <div className="text-xs font-medium text-slate-400">Aprobadas</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{counts.aprobadas}</div>
        </div>
        <div className="glass-card p-4 rounded-xl border-l-2 border-l-orange-500">
          <div className="text-xs font-medium text-slate-400">En Taller Patio</div>
          <div className="text-2xl font-black text-orange-400 mt-1">{counts.convertidas}</div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, placa, vehículo o ciudad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setStatusFilter("todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === "todos"
                ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Todos ({counts.total})
          </button>
          {statuses.map((s) => {
            const info = statusInfoMap[s] || { label: s };
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === s
                    ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                    : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Lista de Cotizaciones */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Cargando cotizaciones desde Firebase...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No se encontraron cotizaciones</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay registros para este filtro o búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map((q) => {
            const statusConfig = statusInfoMap[q.status] || {
              label: q.status,
              color: "text-slate-300",
              bg: "bg-carbon-800 border-white/10",
            };

            const cleanPhone = (q.phone || "").replace(/\D/g, "");
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
              `¡Hola ${q.client_name}! Te saludamos de Mellos Truck respecto a tu cotización para la mula ${q.vehicle_type} (${q.plate || "en proceso"}).`
            )}`;

            return (
              <div
                key={q.id}
                className="glass-card p-5 rounded-2xl space-y-3 hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-md bg-carbon-950 border border-white/10 text-amber-400">
                      {q.plate || "SIN PLACA"}
                    </span>
                    <h3 className="font-extrabold text-base text-white">{q.client_name}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {q.city || "Colombia"}
                    </span>
                  </div>

                  {/* Selector de Estado */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <select
                      value={q.status}
                      onChange={(e) => handleStatusChange(q.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg bg-carbon-950 border border-white/10 text-slate-300 focus:outline-none focus:border-amber-500/50"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {statusInfoMap[st]?.label || st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detalles de la Mula y Servicio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Vehículo:</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{q.vehicle_type}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Servicio Solicitado:</span>
                    <div className="font-semibold text-amber-400 mt-0.5">{q.service}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Teléfono / WhatsApp:</span>
                    <div className="font-semibold text-slate-200 mt-0.5">{q.phone}</div>
                  </div>
                </div>

                {q.details && (
                  <div className="p-3 rounded-xl bg-carbon-950/60 border border-white/5 text-xs text-slate-300 italic">
                    "{q.details}"
                  </div>
                )}

                {/* Barra de Acciones */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-white/5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-carbon-950 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {q.status !== "convertida" && (
                    <button
                      onClick={() => setSelectedQuoteForWorkshop(q)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950 transition-all flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Enviar a Taller Kanban</span>
                    </button>
                  )}

                  {q.status === "convertida" && (
                    <Link
                      to="/admin/workshop"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Ver Mula en Patio</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Confirmar Envío a Taller con Mano de Obra */}
      {selectedQuoteForWorkshop && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Transferir a Tablero Kanban</h3>
              </div>
              <button
                onClick={() => setSelectedQuoteForWorkshop(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              La mula <strong>{selectedQuoteForWorkshop.vehicle_type}</strong> (Placa: <strong>{selectedQuoteForWorkshop.plate || "S/P"}</strong>) de <strong>{selectedQuoteForWorkshop.client_name}</strong> ingresará a la fase de <strong>[Ingreso]</strong> en el patio.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Costo Estimado de Mano de Obra ($COP)
              </label>
              <input
                type="number"
                value={workshopLaborCost}
                onChange={(e) => setWorkshopLaborCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedQuoteForWorkshop(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:bg-carbon-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWorkshop}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
              >
                Confirmar Ingreso a Patio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nueva Cotización Manual */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 space-y-4 border border-white/15 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Registrar Nueva Cotización</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Transportador *</label>
                  <input
                    type="text"
                    required
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Don Carlos Rodríguez"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="573104567890"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placa Mula</label>
                  <input
                    type="text"
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value })}
                    placeholder="WTL-892"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
                  <input
                    type="text"
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                    placeholder="Kenworth T800"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Medellín"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Trabajo o Accesorio Requerido</label>
                <input
                  type="text"
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  placeholder='Bomper en Acero 20", Visera Drop Visor, Luces LED'
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detalles Adicionales</label>
                <textarea
                  rows="2"
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  placeholder="Especificaciones de corte láser, calibre, tiempos requeridos..."
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:bg-carbon-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
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