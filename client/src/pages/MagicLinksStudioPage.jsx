import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import { showroomService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Sparkles,
  Plus,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  Eye,
  Check,
  X,
  Truck,
} from "lucide-react";

export default function MagicLinksStudioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(null);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    plate: "",
    brand: "Kenworth",
    line: "T800 Aerocab",
    model: "2024",
    color: "Azul Metalizado",
    description: 'Fabricación de bomper en acero inoxidable de 20", visera americana y cornetas.',
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/kenworth_after.jpg",
    video_url: "",
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await showroomService.getAll();
      setProjects(res.projects || []);
    } catch (err) {
      console.warn("Error cargando showroom:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.clientName || !form.plate) {
      showErrorToast("Ingresa nombre del cliente y placa");
      return;
    }

    try {
      const res = await showroomService.create(form);
      if (res.success) {
        showSuccessToast("¡Magic Link generado y publicado en Firebase!");
        await loadProjects();
        setShowModal(false);
        setForm({
          clientName: "",
          phone: "",
          plate: "",
          brand: "Kenworth",
          line: "T800 Aerocab",
          model: "2024",
          color: "Azul Metalizado",
          description: 'Fabricación de bomper en acero inoxidable de 20", visera americana y cornetas.',
          before_url: "/images/showroom/kenworth_before.jpg",
          after_url: "/images/showroom/kenworth_after.jpg",
          video_url: "",
        });
      }
    } catch (err) {
      showErrorToast("Error al generar el Magic Link");
    }
  };

  const copyToClipboard = (slug) => {
    const fullUrl = `${window.location.origin}/galeria/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showSuccessToast("¡Enlace copiado al portapapeles!");
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Magic Links Studio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Showroom Cinematográfico & Viralización</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Studio de Magic Links
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Genera enlaces de solo lectura con tomas de antes/después para compartir por WhatsApp con transportadores.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Emitir Nuevo Magic Link</span>
        </button>
      </div>

      {/* 2. Grid de Showrooms */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Cargando showrooms desde Firebase...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay Magic Links emitidos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Crea tu primer enlace para que los transportadores presuman su mula transformada en redes sociales.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const isCopied = copiedSlug === proj.slug;
            const publicUrl = `${window.location.origin}/galeria/${proj.slug}`;
            const cleanPhone = (proj.phone || "").replace(/\D/g, "");
            const whatsappUrl = `https://api.whatsapp.com/send?${
              cleanPhone ? `phone=${cleanPhone}&` : ""
            }text=${encodeURIComponent(
              `¡Pillate cómo quedó mi nave en Mellos Truck! 🔥🚛\n${proj.brand} ${proj.line || ""} - Placa: ${proj.plate}\n👉 ${publicUrl}`
            )}`;

            return (
              <div
                key={proj.id}
                className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border-white/10 hover:border-amber-500/30 transition-all shadow-md"
              >
                {/* Imagen de Portada */}
                <div className="relative h-48 bg-carbon-950 overflow-hidden group">
                  <img
                    src={proj.after_url || proj.before_url || "/images/showroom/kenworth_after.jpg"}
                    alt={proj.plate}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/images/showroom/kenworth_after.jpg";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-carbon-950/90 backdrop-blur-md border border-white/10 font-mono font-black text-xs text-amber-400">
                    {proj.plate}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-carbon-950/90 text-cyan-400 border border-white/10 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{proj.views || 0} visitas</span>
                  </div>
                </div>

                {/* Detalles del Proyecto */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-white">
                      {proj.brand} {proj.line}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Dueño: <strong className="text-slate-200">{proj.clientName}</strong>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed italic">
                      "{proj.description}"
                    </p>
                  </div>

                  {/* Botonera de Enlaces */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(proj.slug)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isCopied
                            ? "bg-emerald-500 text-carbon-950"
                            : "bg-carbon-900 text-slate-200 border border-white/10 hover:bg-carbon-800"
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? "¡Copiado!" : "Copiar Link"}</span>
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-carbon-950 transition-all flex items-center gap-1.5"
                        title="Compartir por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <Link
                        to={`/galeria/${proj.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-carbon-900 text-slate-400 hover:text-amber-400 border border-white/10"
                        title="Abrir vista pública del cliente"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Showroom */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full rounded-2xl p-6 space-y-4 border border-white/15 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Emitir Nuevo Magic Link</h3>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Transportador *</label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="Don Carlos Rodríguez"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                    value={form.plate}
                    onChange={(e) => setForm({ ...form, plate: e.target.value })}
                    placeholder="WTL-892"
                    className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción de la Transformación</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder='Bomper de 20", visera americana y cornetas Hadley de tren...'
                  className="w-full px-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Foto de Llegada (Antes)</label>
                  <ImageUploader
                    value={form.before_url}
                    onChange={(url) => setForm({ ...form, before_url: url })}
                    category="showroom"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Foto de Entrega (Después)</label>
                  <ImageUploader
                    value={form.after_url}
                    onChange={(url) => setForm({ ...form, after_url: url })}
                    category="showroom"
                  />
                </div>
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
                  Generar Magic Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
