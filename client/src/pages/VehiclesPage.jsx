import React, { useEffect, useMemo, useState } from "react";
import {
  getVehiclesRequest,
  createVehicleRequest,
  getClientsRequest,
} from "../api/api";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Truck,
  Plus,
  Search,
  User,
  Hash,
  Palette,
  Calendar,
  X,
  FileText,
} from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    plate: "",
    brand: "Kenworth",
    line: "T800 Aerocab",
    model: "2024",
    vehicle_type: "Tractomula",
    color: "",
    notes: "",
  });

  const vehicleTypes = [
    "Tractomula",
    "Camión Pesado",
    "Volqueta",
    "Turbo",
    "Furgón",
    "Remolque / Tráiler",
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [vData, cData] = await Promise.all([
        getVehiclesRequest(),
        getClientsRequest(),
      ]);
      setVehicles(Array.isArray(vData) ? vData : []);
      setClients(Array.isArray(cData) ? cData : []);
    } catch (error) {
      console.error("Error cargando flota:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((v) => {
      return (
        (v.plate || "").toLowerCase().includes(term) ||
        (v.brand || "").toLowerCase().includes(term) ||
        (v.line || "").toLowerCase().includes(term) ||
        (v.client_name || "").toLowerCase().includes(term)
      );
    });
  }, [vehicles, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.plate) {
      showErrorToast("La placa es obligatoria");
      return;
    }

    const matchedClient = clients.find((c) => String(c.id) === String(form.client_id));

    try {
      const res = await createVehicleRequest({
        ...form,
        client_name: matchedClient ? matchedClient.name : "Cliente Particular",
        client_phone: matchedClient ? matchedClient.phone : "",
      });

      if (res.vehicleId) {
        showSuccessToast(`Mula con placa ${form.plate.toUpperCase()} registrada con éxito`);
        setShowModal(false);
        setForm({
          client_id: "",
          plate: "",
          brand: "Kenworth",
          line: "T800 Aerocab",
          model: "2024",
          vehicle_type: "Tractomula",
          color: "",
          notes: "",
        });
        await loadData();
      }
    } catch (err) {
      showErrorToast("Error registrando vehículo");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Flota */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Truck className="w-4 h-4" />
            <span>Padrón de Vehículos & Pesados</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Flota de Tractomulas Registradas
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro de camiones vinculados a transportadores y órdenes de taller.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Mula</span>
        </button>
      </div>

      {/* 2. Barra de Búsqueda */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por placa, marca, línea o transportador..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* 3. Grid de Vehículos */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Cargando flota desde Firebase...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No se encontraron vehículos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Registra una nueva mula para asignarla a órdenes de trabajo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded-md bg-carbon-950 border border-white/15 text-amber-400">
                    {v.plate}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-carbon-800 text-slate-300">
                    {v.vehicle_type || "Tractomula"}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-white">
                  {v.brand} {v.line}
                </h3>

                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Transportador: <strong className="text-slate-200">{v.client_name || "Particular"}</strong></span>
                  </div>
                  {v.color && (
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-slate-500" />
                      <span>Color: {v.color}</span>
                    </div>
                  )}
                  {v.model && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Modelo: {v.model}</span>
                    </div>
                  )}
                </div>

                {v.notes && (
                  <p className="text-xs text-slate-400 italic bg-carbon-950/60 p-2.5 rounded-xl border border-white/5">
                    "{v.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Registrar Vehículo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Registrar Mula en la Flota</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value })}
                    placeholder="WTL-892"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Transportador Asignado</label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">-- Seleccionar cliente --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city || "Colombia"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
                    value={form.line}
                    onChange={(e) => setForm({ ...form, line: e.target.value })}
                    placeholder="T800 Aerocab"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo (Año)</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Vehículo</label>
                  <select
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {vehicleTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color de Cabina</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Azul Medianoche Metalizado"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas de Accesorios / Modificaciones</label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder='Bomper de 20" instalado, visera espejo, cornetas...'
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:bg-carbon-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110"
                >
                  Registrar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}