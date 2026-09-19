import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { clientsService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Phone,
  Building,
  MapPin,
  X,
  FileText,
  Truck,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    city: "Medellín",
    company: "",
    notes: "",
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const list = await clientsService.getAll(search);
      setClients(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      showErrorToast("Nombre y teléfono son obligatorios");
      return;
    }

    try {
      if (editingClient) {
        await clientsService.update(editingClient.id, form);
        showSuccessToast("Cliente actualizado con éxito");
      } else {
        await clientsService.create({
          ...form,
          whatsapp: form.whatsapp || form.phone,
        });
        showSuccessToast("Cliente registrado en Firebase");
      }
      setShowModal(false);
      setEditingClient(null);
      setForm({
        name: "",
        phone: "",
        whatsapp: "",
        city: "Medellín",
        company: "",
        notes: "",
      });
      await loadClients();
    } catch (err) {
      showErrorToast("Error guardando cliente");
    }
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      whatsapp: client.whatsapp || client.phone || "",
      city: client.city || "Medellín",
      company: client.company || "",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Clientes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>Directorio de Transportadores & Flotas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Base de datos de transportadores y empresas sincronizada en Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClient(null);
            setForm({
              name: "",
              phone: "",
              whatsapp: "",
              city: "Medellín",
              company: "",
              notes: "",
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* 2. Barra de Búsqueda */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar transportador por nombre, teléfono o empresa..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* 3. Grid de Clientes */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Cargando clientes desde Firebase...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay clientes registrados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Registra a los transportadores para asociarlos a sus mulas y cotizaciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => {
            const cleanPhone = (c.whatsapp || c.phone || "").replace(/\D/g, "");
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
              `¡Hola ${c.name}! Te saludamos de Mellos Truck.`
            )}`;

            return (
              <div
                key={c.id}
                className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-carbon-950 border border-white/10 text-amber-400">
                      {c.city || "Colombia"}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="text-xs text-slate-400 hover:text-amber-400 font-bold"
                    >
                      Editar
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base text-white">{c.name}</h3>

                  {c.company && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.company}</span>
                    </div>
                  )}

                  {c.notes && (
                    <p className="text-xs text-slate-400 italic bg-carbon-950/60 p-2.5 rounded-xl border border-white/5">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {c.phone}
                  </span>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-carbon-950 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear / Editar Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 space-y-4 border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingClient ? "Editar Transportador" : "Registrar Nuevo Cliente"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Don Carlos Rodríguez"
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Principal *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="573104567890"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa de Transportes (Opcional)</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Transportes El Cóndor S.A.S."
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas / Flota de Mulas</label>
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Dueño de 3 tractomulas Kenworth T800, cliente recurrente..."
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}