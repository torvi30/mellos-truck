import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import InvoiceModal from "../components/InvoiceModal";
import { useAuth } from "../contexts/AuthContext.jsx";
import { workOrdersService, productsService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast, showConfirmAlert } from "../utils/alerts";
import {
  Wrench,
  Plus,
  Search,
  Truck,
  Layers,
  Archive,
  RotateCcw,
  Sparkles,
  DollarSign,
  Package,
  Calendar,
  Phone,
  Trash2,
  ExternalLink,
  Receipt,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  Eye,
} from "lucide-react";

const STAGES = [
  { id: "Ingreso", title: "INGRESO", subtitle: "Diagnóstico & Desarme", color: "amber", bgBadge: "bg-amber-500/15 border-amber-500/30 text-amber-400", progress: 20 },
  { id: "Taller", title: "TALLER", subtitle: "Pailería & Acero Inox", color: "orange", bgBadge: "bg-orange-500/15 border-orange-500/30 text-orange-400", progress: 45 },
  { id: "Pintura", title: "PINTURA", subtitle: "Poliuretano & Brillo", color: "purple", bgBadge: "bg-purple-500/15 border-purple-500/30 text-purple-400", progress: 70 },
  { id: "Terminado", title: "TERMINADO", subtitle: "Control Calidad & Showroom", color: "emerald", bgBadge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400", progress: 90 },
  { id: "Entregado", title: "ENTREGADO", subtitle: "Despachada a Ruta", color: "cyan", bgBadge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400", progress: 100 },
];

const DEFAULT_TRUCK_IMAGES = {
  Kenworth: "/images/showroom/kenworth_after.jpg",
  Mack: "/images/showroom/mack_truck_custom.jpg",
  Peterbilt: "/images/showroom/peterbilt_truck_custom.jpg",
  International: "/images/showroom/detail_bumper_chrome.jpg",
  Freightliner: "/images/showroom/kenworth_before.jpg",
};

export default function WorkshopPage() {
  const { isWorkshop } = useAuth();
  const [orders, setOrders] = useState([]);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [activeView, setActiveView] = useState("kanban"); // "kanban" | "history"
  const [invoiceOrderData, setInvoiceOrderData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

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
    before_url: "",
  });

  // Ficha Técnica / Modal Detalle 360
  const [activeTruckDetail, setActiveTruckDetail] = useState(null);
  const [editLaborCost, setEditLaborCost] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editBeforeUrl, setEditBeforeUrl] = useState("");
  const [editAfterUrl, setEditAfterUrl] = useState("");

  // Asignar repuesto
  const [assignForm, setAssignForm] = useState({
    productId: "",
    cantidad: 1,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resArchived, resProducts] = await Promise.all([
        workOrdersService.getAll({ include_archived: false }),
        workOrdersService.getAll({ only_archived: true }),
        productsService.getAll(),
      ]);

      setOrders(resOrders.orders || []);
      setArchivedOrders(resArchived.orders || []);
      setProducts(resProducts.products || []);
    } catch (err) {
      console.warn("Error cargando taller:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!createForm.cliente || !createForm.placa) {
      showErrorToast("Ingresa el nombre del cliente y la placa");
      return;
    }

    try {
      const res = await workOrdersService.create(createForm);
      if (res.success) {
        showSuccessToast(`Mula ${createForm.placa.toUpperCase()} ingresada al patio`);
        setShowCreateModal(false);
        setCreateForm({
          cliente: "",
          telefono: "",
          placa: "",
          marca: "Kenworth",
          linea: "T800 Aerocab",
          color: "",
          costo_mano_obra: "2500000",
          descripcion: "",
          before_url: "",
        });
        await loadData();
      }
    } catch (err) {
      showErrorToast("Error al ingresar la mula");
    }
  };

  const handleStageChange = async (orderId, newStage) => {
    try {
      await workOrdersService.updateStatus(orderId, newStage);
      showSuccessToast(`Mula movida a fase: [${newStage}]`);
      await loadData();
      if (activeTruckDetail && activeTruckDetail.id === orderId) {
        setActiveTruckDetail((prev) => ({ ...prev, estado: newStage }));
      }
    } catch (err) {
      showErrorToast("No se pudo cambiar el estado");
    }
  };

  const handleOpenDetail = (order) => {
    setActiveTruckDetail(order);
    setEditLaborCost(String(order.costo_mano_obra || ""));
    setEditNotes(order.descripcion || "");
    setEditBeforeUrl(order.before_url || "");
    setEditAfterUrl(order.after_url || "");
  };

  const handleSaveDetailUpdates = async () => {
    if (!activeTruckDetail) return;
    try {
      await workOrdersService.update(activeTruckDetail.id, {
        costo_mano_obra: parseFloat(editLaborCost) || 0,
        descripcion: editNotes,
        before_url: editBeforeUrl,
        after_url: editAfterUrl,
      });
      showSuccessToast("Ficha técnica actualizada");
      await loadData();
      setActiveTruckDetail(null);
    } catch (err) {
      showErrorToast("Error guardando cambios");
    }
  };

  const handleAssignItem = async (e) => {
    e.preventDefault();
    if (!assignForm.productId) {
      showErrorToast("Selecciona una pieza del Container");
      return;
    }
    try {
      const res = await workOrdersService.assignItem(
        activeTruckDetail.id,
        assignForm.productId,
        assignForm.cantidad
      );
      if (res.success) {
        showSuccessToast("Pieza asignada y descontada del stock del Container");
        setAssignForm({ productId: "", cantidad: 1 });
        await loadData();
        // refrescar detalle
        const updatedOrders = await workOrdersService.getAll({ include_archived: false });
        const updated = updatedOrders.orders.find((o) => o.id === activeTruckDetail.id);
        if (updated) setActiveTruckDetail(updated);
      }
    } catch (err) {
      showErrorToast(err.message || "Error al asignar pieza");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await workOrdersService.removeItem(activeTruckDetail.id, itemId);
      showSuccessToast("Pieza retirada y stock devuelto al Container");
      await loadData();
      const updatedOrders = await workOrdersService.getAll({ include_archived: false });
      const updated = updatedOrders.orders.find((o) => o.id === activeTruckDetail.id);
      if (updated) setActiveTruckDetail(updated);
    } catch (err) {
      showErrorToast("Error al retirar la pieza");
    }
  };

  const handleToggleArchive = async (orderId, currentArchived) => {
    try {
      await workOrdersService.toggleArchive(orderId, !currentArchived);
      showSuccessToast(!currentArchived ? "Mula trasladada al Archivo Histórico" : "Mula devuelta al Tablero Activo");
      setActiveTruckDetail(null);
      await loadData();
    } catch (err) {
      showErrorToast("Error al archivar");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const ok = await showConfirmAlert("¿Estás seguro de eliminar esta orden?", "Esta acción reintegrará repuestos y borrará el historial.");
    if (!ok) return;
    try {
      await workOrdersService.delete(orderId);
      showSuccessToast("Orden eliminada del sistema");
      setActiveTruckDetail(null);
      await loadData();
    } catch (err) {
      showErrorToast("Error al eliminar orden");
    }
  };

  // Filtrado
  const currentList = activeView === "kanban" ? orders : archivedOrders;
  const filteredOrders = currentList.filter((o) => {
    if (stageFilter !== "all" && o.estado !== stageFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (o.placa && o.placa.toLowerCase().includes(term)) ||
      (o.cliente && o.cliente.toLowerCase().includes(term)) ||
      (o.marca && o.marca.toLowerCase().includes(term)) ||
      (o.linea && o.linea.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Taller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Truck className="w-4 h-4" />
            <span>Trazabilidad & Línea de Producción</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tablero de Taller & Patio de Mulas
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Flujo Kanban industrial con sincronización directa en Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Switch de Vista: Kanban vs Historial */}
          <div className="bg-carbon-900 p-1 rounded-xl border border-white/10 flex gap-1">
            <button
              onClick={() => setActiveView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === "kanban"
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Patio Activo ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === "history"
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivo Histórico ({archivedOrders.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ingresar Mula</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros de Etapa */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, transportador, marca..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              stageFilter === "all"
                ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Todas ({currentList.length})
          </button>
          {STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setStageFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                stageFilter === st.id
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {st.title} ({currentList.filter((o) => o.estado === st.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tablero Kanban (5 Columnas por Etapas) */}
      {loading ? (
        <div className="py-24 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Sincronizando mulas en taller con Firebase...</p>
        </div>
      ) : activeView === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {STAGES.map((st) => {
            const stageOrders = filteredOrders.filter((o) => o.estado === st.id);

            return (
              <div
                key={st.id}
                className="glass-card rounded-2xl p-3 flex flex-col space-y-3 min-h-[450px]"
              >
                {/* Header de Columna */}
                <div className="p-2 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <h3 className="font-extrabold text-xs tracking-wider text-white">
                        {st.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {st.subtitle}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-carbon-950 border border-white/10 text-amber-400">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Lista de Mulas en esta etapa */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1">
                  {stageOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-600 text-xs border border-dashed border-white/5 rounded-xl">
                      Sin mulas en esta fase
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      const truckImg =
                        order.after_url ||
                        order.before_url ||
                        DEFAULT_TRUCK_IMAGES[order.marca] ||
                        DEFAULT_TRUCK_IMAGES.Kenworth;

                      const nextStageIdx = STAGES.findIndex((s) => s.id === order.estado) + 1;
                      const nextStage = STAGES[nextStageIdx]?.id;
                      const prevStageIdx = STAGES.findIndex((s) => s.id === order.estado) - 1;
                      const prevStage = STAGES[prevStageIdx]?.id;

                      return (
                        <div
                          key={order.id}
                          className="p-3.5 rounded-xl bg-carbon-900 border border-white/10 hover:border-amber-500/40 transition-all space-y-3 shadow-md"
                        >
                          {/* Miniatura y Placa */}
                          <div className="relative h-28 rounded-lg overflow-hidden bg-carbon-950">
                            <img
                              src={truckImg}
                              alt={order.placa}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = DEFAULT_TRUCK_IMAGES.Kenworth;
                              }}
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-carbon-950/90 backdrop-blur-sm border border-white/10 font-mono font-black text-xs text-amber-400">
                              {order.placa}
                            </div>
                            {order.slug && (
                              <Link
                                to={`/galeria/${order.slug}`}
                                target="_blank"
                                className="absolute top-2 right-2 p-1 rounded bg-carbon-950/90 text-cyan-400 hover:text-white"
                                title="Ver Showroom Público"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>

                          {/* Info de la Mula */}
                          <div>
                            <div className="font-extrabold text-sm text-white truncate">
                              {order.marca} {order.linea}
                            </div>
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {order.cliente}
                            </div>
                          </div>

                          {/* Resumen Financiero Rápido */}
                          <div className="p-2 rounded-lg bg-carbon-950/80 border border-white/5 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Repuestos: {order.items?.length || 0}</span>
                            <span className="font-extrabold text-amber-400">
                              ${Number(order.costo_total || 0).toLocaleString()}
                            </span>
                          </div>

                          {/* Botonera de Acciones y Fases */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              {prevStage && (
                                <button
                                  onClick={() => handleStageChange(order.id, prevStage)}
                                  className="p-1 rounded bg-carbon-800 text-slate-400 hover:text-white hover:bg-carbon-700"
                                  title={`Retroceder a ${prevStage}`}
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {nextStage && (
                                <button
                                  onClick={() => handleStageChange(order.id, nextStage)}
                                  className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950 text-[10px] font-bold flex items-center gap-1"
                                  title={`Avanzar a ${nextStage}`}
                                >
                                  <span>{nextStage}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setInvoiceOrderData(order)}
                                className="p-1 rounded bg-carbon-800 text-slate-400 hover:text-amber-400"
                                title="Generar Liquidación / Factura"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDetail(order)}
                                className="px-2 py-1 rounded bg-carbon-800 text-slate-200 hover:bg-carbon-700 text-[10px] font-bold flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-amber-400" />
                                <span>Ficha 360°</span>
                              </button>
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
      ) : (
        /* Vista Lista de Archivo Histórico */
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center text-slate-500 space-y-2">
              <Archive className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">No hay mulas archivadas en el historial.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded bg-carbon-950 border border-white/10 text-amber-400">
                    {order.placa}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {order.marca} {order.linea}
                    </h4>
                    <p className="text-xs text-slate-400">{order.cliente} • Entregada</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-400 mr-2">
                    ${Number(order.costo_total || 0).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleToggleArchive(order.id, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-carbon-800 text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reactivar en Patio</span>
                  </button>
                  <button
                    onClick={() => handleOpenDetail(order)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950"
                  >
                    Ver Ficha
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: Ingreso de Mula al Taller */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 space-y-4 border border-white/15 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ingreso de Mula al Patio de Modificación</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Transportador *</label>
                  <input
                    type="text"
                    required
                    value={createForm.cliente}
                    onChange={(e) => setCreateForm({ ...createForm, cliente: e.target.value })}
                    placeholder="Don Carlos Rodríguez"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={createForm.telefono}
                    onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })}
                    placeholder="573104567890"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    value={createForm.placa}
                    onChange={(e) => setCreateForm({ ...createForm, placa: e.target.value })}
                    placeholder="WTL-892"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca</label>
                  <select
                    value={createForm.marca}
                    onChange={(e) => setCreateForm({ ...createForm, marca: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Kenworth">Kenworth</option>
                    <option value="Mack">Mack</option>
                    <option value="Peterbilt">Peterbilt</option>
                    <option value="Freightliner">Freightliner</option>
                    <option value="International">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Línea</label>
                  <input
                    type="text"
                    value={createForm.linea}
                    onChange={(e) => setCreateForm({ ...createForm, linea: e.target.value })}
                    placeholder="T800 Aerocab"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color de Cabina</label>
                  <input
                    type="text"
                    value={createForm.color}
                    onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                    placeholder="Azul Medianoche & Cromo"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Mano de Obra ($COP)</label>
                  <input
                    type="number"
                    value={createForm.costo_mano_obra}
                    onChange={(e) => setCreateForm({ ...createForm, costo_mano_obra: e.target.value })}
                    placeholder="2500000"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción del Trabajo</label>
                <textarea
                  rows="2"
                  value={createForm.descripcion}
                  onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
                  placeholder='Fabricación de bomper de 20", visera gangsta espejo, cornetas Hadley...'
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Foto de Ingreso (Antes)</label>
                <ImageUploader
                  value={createForm.before_url}
                  onChange={(url) => setCreateForm({ ...createForm, before_url: url })}
                  category="workshop"
                />
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
                  Confirmar Ingreso al Patio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ficha Técnica 360° / Consola de Control de la Mula */}
      {activeTruckDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-4xl w-full rounded-2xl p-6 space-y-6 border border-white/20 my-6 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-base px-3 py-1 rounded-lg bg-carbon-950 border border-white/15 text-amber-400">
                  {activeTruckDetail.placa}
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    {activeTruckDetail.marca} {activeTruckDetail.linea}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Transportador: <strong>{activeTruckDetail.cliente}</strong> • Tel: {activeTruckDetail.telefono || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrderData(activeTruckDetail)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-carbon-800 text-slate-200 border border-white/10 hover:text-amber-400 flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Liquidación</span>
                </button>

                <button
                  onClick={() => setActiveTruckDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slider de Antes y Después en la Ficha Técnica */}
            {(activeTruckDetail.before_url || activeTruckDetail.after_url) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Inspección Visual: Antes vs. Después
                </h4>
                <div className="max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10">
                  <BeforeAfterSlider
                    beforeImage={activeTruckDetail.before_url || "/images/showroom/kenworth_before.jpg"}
                    afterImage={activeTruckDetail.after_url || "/images/showroom/kenworth_after.jpg"}
                    aspectRatio="16/9"
                  />
                </div>
              </div>
            )}

            {/* Selector de Etapas Rápido */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Fase Actual en Patio
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStageChange(activeTruckDetail.id, st.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all ${
                      activeTruckDetail.estado === st.id
                        ? "bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20"
                        : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {st.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Desglose de Piezas Asignadas y Formulario de Agregar Repuesto */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Repuestos y Lujos Asignados desde el Container</span>
                </h4>
                <span className="text-xs text-slate-400">
                  Subtotal Repuestos: <strong className="text-amber-400">${Number(activeTruckDetail.costo_repuestos || 0).toLocaleString()}</strong>
                </span>
              </div>

              {/* Formulario para Asignar Pieza */}
              <form onSubmit={handleAssignItem} className="p-3.5 rounded-xl bg-carbon-900 border border-white/10 flex flex-col sm:flex-row gap-2 items-center">
                <select
                  value={assignForm.productId}
                  onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })}
                  className="flex-1 w-full px-3 py-2 rounded-lg bg-carbon-950 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">-- Seleccionar pieza del Container --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.nombre} ({p.sku}) - Stock: {p.stock} - ${Number(p.precio).toLocaleString()}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min="1"
                    value={assignForm.cantidad}
                    onChange={(e) => setAssignForm({ ...assignForm, cantidad: parseInt(e.target.value, 10) || 1 })}
                    className="w-20 px-2.5 py-2 rounded-lg bg-carbon-950 border border-white/10 text-xs text-white text-center focus:outline-none"
                    placeholder="Cant."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-carbon-950 hover:brightness-110 whitespace-nowrap"
                  >
                    + Asignar
                  </button>
                </div>
              </form>

              {/* Lista de Piezas Asignadas */}
              {(!activeTruckDetail.items || activeTruckDetail.items.length === 0) ? (
                <div className="p-4 rounded-xl bg-carbon-950/60 border border-white/5 text-center text-xs text-slate-500">
                  No hay repuestos asignados a esta orden todavía.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTruckDetail.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-carbon-950 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{item.nombre}</span>
                        <span className="text-slate-500 ml-2">SKU: {item.sku}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{item.cantidad} x ${Number(item.precio_unitario).toLocaleString()}</span>
                        <span className="font-extrabold text-amber-400">${Number(item.subtotal).toLocaleString()}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20"
                          title="Retirar pieza y devolver stock al Container"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edición de Costos y Enlaces Fotográficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mano de Obra Taller ($COP)</label>
                <input
                  type="number"
                  value={editLaborCost}
                  onChange={(e) => setEditLaborCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas de Pailería / Trabajo</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Foto de Ingreso (Antes)</label>
                <ImageUploader
                  value={editBeforeUrl}
                  onChange={(url) => setEditBeforeUrl(url)}
                  category="workshop"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Foto de Entrega (Después)</label>
                <ImageUploader
                  value={editAfterUrl}
                  onChange={(url) => setEditAfterUrl(url)}
                  category="workshop"
                />
              </div>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleArchive(activeTruckDetail.id, activeTruckDetail.archivado)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{activeTruckDetail.archivado ? "Reactivar en Tablero" : "Archivar Mula"}</span>
                </button>

                <button
                  onClick={() => handleDeleteOrder(activeTruckDetail.id)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTruckDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:bg-carbon-700"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleSaveDetailUpdates}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Factura / Liquidación */}
      {invoiceOrderData && (
        <InvoiceModal
          order={invoiceOrderData}
          onClose={() => setInvoiceOrderData(null)}
        />
      )}
    </div>
  );
}
