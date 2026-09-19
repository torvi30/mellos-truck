import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import QuickQuoteModal from "../components/QuickQuoteModal";
import { showroomService } from "../services/firebaseService.js";
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Truck,
  ShieldCheck,
  Clock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function ShowroomPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchShowroomData = async () => {
      setLoading(true);
      try {
        const res = await showroomService.getBySlug(slug);
        setData(res);
      } catch (err) {
        console.warn("Error cargando showroom:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowroomData();
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Cargando Showroom Cinematográfico 4K...
        </p>
      </div>
    );
  }

  const { workOrder, showcase, sharing } = data || {};

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 selection:bg-amber-500 selection:text-carbon-950">
      {/* 1. Header Fijo / Barra Superior Glassmorphic */}
      <header className="sticky top-0 z-50 bg-carbon-950/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-carbon-950 text-xs">
              MT
            </div>
            <span className="font-extrabold text-sm text-white tracking-wider">
              MELLOS <span className="text-amber-400">TRUCK</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              copied
                ? "bg-emerald-500 text-carbon-950 border-emerald-400"
                : "bg-carbon-900 text-slate-200 border-white/10 hover:bg-carbon-850"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Copiar Enlace"}</span>
          </button>

          <a
            href={sharing?.whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-carbon-950 shadow-md shadow-emerald-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Compartir WhatsApp</span>
          </a>
        </div>
      </header>

      {/* 2. Cuerpo Central del Showroom */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Encabezado del Vehículo */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showroom Oficial Mellos Truck</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {workOrder?.brand} {workOrder?.line}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <span className="font-mono font-black text-sm sm:text-base px-3 py-1 rounded-lg bg-carbon-900 border border-white/15 text-amber-400 shadow-md">
              PLACA: {workOrder?.plate}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-carbon-900 text-slate-300 border border-white/10">
              Transportador: <strong className="text-white">{workOrder?.clientName}</strong>
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              Estado: {workOrder?.status || "Entregado"}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-400 pt-2 leading-relaxed">
            {workOrder?.description}
          </p>
        </div>

        {/* 3. Visor Interactivo de Antes vs Después */}
        <div className="glass-card rounded-3xl p-3 sm:p-5 border border-white/15 shadow-2xl">
          <div className="mb-4 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Transformación Frontal & Cabina
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Desliza la barra para comparar el cambio artesanal
              </h2>
            </div>
            <span className="text-xs text-slate-400">Acero 304 Grado Espejo</span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10">
            <BeforeAfterSlider
              beforeImage={showcase?.beforeAfter[0]?.before_url || "/images/showroom/kenworth_before.jpg"}
              afterImage={showcase?.beforeAfter[0]?.after_url || "/images/showroom/kenworth_after.jpg"}
              aspectRatio="16/9"
            />
          </div>
        </div>

        {/* 4. Especificaciones del Trabajo de Taller */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400 font-medium">Tiempo en Taller</div>
            <div className="text-base font-extrabold text-white">8 Días Hábiles</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400 font-medium">Garantía Soldadura</div>
            <div className="text-base font-extrabold text-white">De por Vida (TIG)</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <Sparkles className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400 font-medium">Acabado Principal</div>
            <div className="text-base font-extrabold text-white">Inox 304 Espejo</div>
          </div>
          <div className="glass-card p-5 rounded-2xl text-center space-y-1">
            <Truck className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <div className="text-xs text-slate-400 font-medium">Nivel Modificación</div>
            <div className="text-base font-extrabold text-white">Stage 3 (Full Custom)</div>
          </div>
        </div>

        {/* 5. Galería Detallada de Piezas Instaladas */}
        {showcase?.photos && showcase.photos.length > 0 && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Planos Detalle
              </span>
              <h3 className="text-2xl font-bold text-white">Piezas & Lujos Instalados</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {showcase.photos.map((photo, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 group"
                >
                  <div className="h-52 bg-carbon-950 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/images/showroom/detail_bumper_chrome.jpg";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-slate-200 line-clamp-2">
                      {photo.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CTA Final: Cotizar transformación */}
        <div className="glass-card p-8 sm:p-12 rounded-3xl text-center space-y-5 border-amber-500/25 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              ¿Quieres que tu mula luzca así en carretera?
            </h3>
            <p className="text-sm text-slate-300">
              Cotiza la fabricación de tu bomper en acero inoxidable calibre pesado, visera americana tipo espejo y accesorios de lujo directamente con nuestro taller.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setShowQuoteModal(true)}
                className="px-6 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span>Cotizar Mi Nave Ahora</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href={sharing?.whatsappShareUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-carbon-900 text-slate-200 border border-white/10 hover:bg-carbon-800 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Hablar con un Maestro</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Cotización Rápida */}
      <QuickQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        initialService={`Transformación como ${workOrder?.brand || "Kenworth"} ${workOrder?.line || "T800"}`}
      />
    </div>
  );
}
