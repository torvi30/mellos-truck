import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TransformationShowcase from "../components/TransformationShowcase";
import QuickQuoteModal from "../components/QuickQuoteModal";
import { settingsService, productsService, quotesService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Sparkles,
  Truck,
  Wrench,
  Package,
  CheckCircle2,
  Shield,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  X,
  Menu,
  Send,
  Flame,
} from "lucide-react";

export default function PublicHome() {
  const [config, setConfig] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteInitialService, setQuoteInitialService] = useState("");

  // Formulario de cotización directa en la portada
  const [quoteForm, setQuoteForm] = useState({
    client_name: "",
    phone: "",
    city: "Medellín",
    vehicle_type: "Kenworth T800",
    plate: "",
    service: 'Bomper de Acero Inoxidable 20"',
    details: "",
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, prodRes] = await Promise.all([
          settingsService.getLanding(),
          productsService.getAll(),
        ]);
        if (settingsRes.success && settingsRes.config) {
          setConfig(settingsRes.config);
        }
        if (prodRes.products) {
          setLiveProducts(prodRes.products.slice(0, 6));
        }
      } catch (err) {
        console.warn("Error cargando portada:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenQuote = (service = "", truck = "") => {
    setQuoteInitialService(service ? `${service} (${truck || "Pesado"})` : "");
    setIsQuoteModalOpen(true);
  };

  const handleDirectQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.client_name || !quoteForm.phone) {
      showErrorToast("Por favor ingresa tu nombre y teléfono WhatsApp");
      return;
    }

    setSubmittingQuote(true);
    try {
      await quotesService.create({
        ...quoteForm,
        details: quoteForm.details || "Cotización desde formulario de pie de página",
      });

      showSuccessToast("¡Cotización recibida! Abriendo asesoría por WhatsApp...");

      const cleanPhone = (config?.whatsappNumber || "573104567890").replace(/\D/g, "");
      const waText = encodeURIComponent(
        `¡Hola Mellos Truck! 🚛🔥\nQuiero cotizar:\n- Nombre: ${quoteForm.client_name}\n- Mula: ${quoteForm.vehicle_type} (Placa: ${quoteForm.plate || "S/P"})\n- Ciudad: ${quoteForm.city}\n- Trabajo: ${quoteForm.service}\n- Detalles: ${quoteForm.details || "Quiero más información de tiempos y costos."}`
      );

      window.open(`https://wa.me/${cleanPhone}?text=${waText}`, "_blank");

      setQuoteForm({
        client_name: "",
        phone: "",
        city: "Medellín",
        vehicle_type: "Kenworth T800",
        plate: "",
        service: 'Bomper de Acero Inoxidable 20"',
        details: "",
      });
    } catch (err) {
      showErrorToast("Error enviando cotización");
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Iniciando Mellos Truck 4K...
        </p>
      </div>
    );
  }

  const cleanWaNumber = (config?.whatsappNumber || "573104567890").replace(/\D/g, "");

  const services = [
    {
      title: 'Fabricación de Bompers en Acero',
      text: 'Diseño y fabricación a medida de bompers de 18" a 22" en lámina de acero inoxidable calidad 304, corte láser computarizado, soldadura TIG pulida e iluminación LED integrada.',
      badge: "Especialidad de la Casa",
      icon: "🛡️",
    },
    {
      title: "Viseras Americanas & Cornetas",
      text: "Montaje de viseras estilo americano en acero espejo (Drop Visors), cornetas de tren Hadley con pulmones de aire y luces de gálibo tipo sandía (watermelon LEDs).",
      badge: "Lujo & Estilo",
      icon: "📢",
    },
    {
      title: "Latonería, Pintura & Acabados",
      text: "Intervenciones estéticas de cabina, restauración de chasis, pulido cerámico para camiones de exhibición y personalización de estribos y tanques de combustible.",
      badge: "Acabado Showroom",
      icon: "🎨",
    },
    {
      title: "Tienda Container de Lujos & Repuestos",
      text: "Punto de venta físico y distribución de rines cromados Alcoa, tapas de espárragos tipo spike, tuberías de escape cromadas y accesorios eléctricos.",
      badge: "Punto Físico",
      icon: "📦",
    },
  ];

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 selection:bg-amber-500 selection:text-carbon-950">
      {/* 0. Barra Superior de Anuncios */}
      {config.announcementBar?.enabled && !announcementDismissed && (
        <aside className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-carbon-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
            <span className="px-2 py-0.5 rounded bg-carbon-950 text-amber-400 text-[10px] font-black uppercase tracking-wider">
              {config.announcementBar.badgeText || "AVISO"}
            </span>
            <span>{config.announcementBar.message}</span>
            {config.announcementBar.buttonText && (
              <button
                onClick={() => handleOpenQuote()}
                className="underline hover:opacity-80 transition-opacity ml-1"
              >
                {config.announcementBar.buttonText}
              </button>
            )}
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="p-1 hover:bg-black/10 rounded"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* 1. Header Principal Glassmorphic */}
      <header className="sticky top-0 z-40 bg-carbon-950/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-carbon-950 text-base shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              MT
            </div>
            <div>
              <div className="font-extrabold text-base tracking-wider text-white">
                MELLOS <span className="text-amber-400">TRUCK</span>
              </div>
              <div className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">
                TALLER PESADOS & CONTAINER 4K
              </div>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-carbon-900/80 px-3 py-1.5 rounded-2xl border border-white/10">
            <a href="#transformacion" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-carbon-800 transition-colors">
              🎬 Transformaciones
            </a>
            <a href="#catalogo" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-carbon-800 transition-colors">
              📦 Tienda Container
            </a>
            <a href="#servicios" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-carbon-800 transition-colors">
              🛠️ Trabajos de Taller
            </a>
            <a href="#contacto" className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-carbon-800 transition-colors">
              📍 Ubicación & Contacto
            </a>
          </nav>

          {/* Botón Cotizar & Menú Móvil */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenQuote()}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <span>⚡ Cotizar Cupo</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-carbon-900 text-slate-300 hover:text-white border border-white/10"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2 border-t border-white/10 mt-3 animate-fade-in">
            <a
              href="#transformacion"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-carbon-900"
            >
              🎬 Transformaciones Antes vs Después
            </a>
            <a
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-carbon-900"
            >
              📦 Catálogo Tienda Container
            </a>
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-carbon-900"
            >
              🛠️ Servicios de Modificación
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-carbon-900"
            >
              📍 Contacto & WhatsApp
            </a>
            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20"
            >
              🔐 Acceso Administrativo
            </Link>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glows de fondo */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Izquierda: Textos y CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{config.hero.badgeText || "LÍDERES EN MODIFICACIÓN DE PESADOS"}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
                {config.hero.headline || "POTENCIA, ACERO & PRESENCIA PARA TU MULA"}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {config.hero.subtitle ||
                  "En Mellos Truck convertimos tu vehículo de carga pesada en una verdadera obra de arte en carretera. Fabricación artesanal de bompers en acero inoxidable 304, viseras americanas, iluminación LED y lujos de alto nivel."}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => handleOpenQuote()}
                  className="px-6 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span>⚡ Cotizar Mi Nave Ahora</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <Link
                  to="/galeria/Kenworth-T800-Placa-WTL892"
                  className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-carbon-900 text-slate-200 border border-white/10 hover:bg-carbon-850 hover:text-white transition-all flex items-center gap-2"
                >
                  <span>🎬 Explorar Showroom 4K</span>
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                </Link>
              </div>

              {/* Tira de Métricas de Confianza */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
                {(config.metrics || []).map((m, idx) => (
                  <div key={idx} className="text-center lg:text-left">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">{m.value}</div>
                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Insignia de la Mula */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-4 border border-white/15 shadow-2xl space-y-3 group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-carbon-950">
                  <img
                    src={config.hero.featuredTruck?.imageUrl || "/images/showroom/kenworth_after.jpg"}
                    alt={config.hero.featuredTruck?.title || "Kenworth T800"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-carbon-950/90 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {config.hero.featuredTruck?.tag || "PROYECTO DESTACADO"}
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <h3 className="font-extrabold text-lg text-white">
                    {config.hero.featuredTruck?.title || "Kenworth T800 Aerocab"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {config.hero.featuredTruck?.specs || 'Bomper 20" • Visera Espejo • Doble Corneta'}
                  </p>

                  <div className="pt-3 flex items-center justify-between">
                    <Link
                      to="/galeria/Kenworth-T800-Placa-WTL892"
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>Ver Ficha 360° en Showroom</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-carbon-900 text-slate-400">
                      WTL-892
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Estudio de Transformación (Antes vs Después) */}
      <section id="transformacion" className="py-16 sm:py-24 border-t border-white/5 bg-carbon-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {config.beforeAfter?.subheading || "EL CAMBIO HABLA POR SÍ SOLO"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {config.beforeAfter?.title || "Estudio Cinemático de Transformaciones"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {config.beforeAfter?.description ||
                "Explora la transformación artesanal en alta definición: compara el estado de llegada al taller contra la entrega final con acabados en acero inoxidable 304 calidad espejo."}
            </p>
          </div>

          <TransformationShowcase
            config={config}
            whatsappNumber={config.whatsappNumber}
            onOpenQuote={handleOpenQuote}
          />
        </div>
      </section>

      {/* 4. Sección Tienda Container & Catálogo Físico */}
      <section id="catalogo" className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Punto de Venta Físico & Distribución
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Tienda Container de Lujos & Repuestos
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Piezas exclusivas en acero inoxidable, iluminación LED sumergible IP68 y rines forjados disponibles para entrega inmediata o instalación en nuestro patio.
              </p>
            </div>

            <button
              onClick={() => handleOpenQuote("Consulta de Catálogo Container")}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-carbon-900 text-amber-400 border border-amber-500/30 hover:bg-carbon-850 self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Consultar Stock Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveProducts.map((prod) => (
              <div
                key={prod.id}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
              >
                <div className="relative h-48 bg-carbon-950 overflow-hidden">
                  <img
                    src={prod.imagen_url || "/images/showroom/detail_bumper_chrome.jpg"}
                    alt={prod.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-carbon-950/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-amber-400 border border-white/10">
                    {prod.categoria}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">SKU: {prod.sku}</span>
                    <h3 className="font-extrabold text-sm text-white line-clamp-2 leading-snug">
                      {prod.nombre}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Precio Taller</div>
                      <div className="text-base font-extrabold text-amber-400">
                        ${Number(prod.precio || 0).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenQuote(prod.nombre)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950 transition-all flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pedir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Servicios de Modificación en Taller */}
      <section id="servicios" className="py-16 sm:py-24 border-t border-white/5 bg-carbon-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Maestría en Acero Inoxidable
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Especialidades de Taller Mellos Truck
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Intervenciones estructurales y estéticas para Kenworth, Mack, Peterbilt e International.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((srv, idx) => (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="text-3xl">{srv.icon}</div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    {srv.badge}
                  </span>
                  <h3 className="font-extrabold text-base text-white">{srv.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.text}</p>
                </div>

                <button
                  onClick={() => handleOpenQuote(srv.title)}
                  className="pt-2 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 self-start"
                >
                  <span>Cotizar este trabajo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Formulario de Cotización Directa & Ubicación */}
      <section id="contacto" className="py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Info de Taller y WhatsApp */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  Canal Directo con Maestros
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Pide tu Presupuesto sin Compromiso
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  ¿Tienes una mula que necesita bomper, visera o cambio de imagen? Escríbenos directamente o llena el formulario para responderte al instante por WhatsApp.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Ubicación de Talleres</div>
                    <div className="text-xs font-bold text-white">{config.locationText}</div>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Línea Oficial WhatsApp</div>
                    <div className="text-xs font-bold text-white font-mono">+{cleanWaNumber}</div>
                  </div>
                </div>

                <div className="glass-card p-4 rounded-xl flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-bold">Instagram Oficial</div>
                    <a
                      href={config.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      {config.instagramUser}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario en Tarjeta Glass */}
            <div className="lg:col-span-7">
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white">Solicitar Cotización de Taller</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tus datos quedan guardados y abrimos WhatsApp con la ficha lista.
                  </p>
                </div>

                <form onSubmit={handleDirectQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre *</label>
                      <input
                        type="text"
                        required
                        value={quoteForm.client_name}
                        onChange={(e) => setQuoteForm({ ...quoteForm, client_name: e.target.value })}
                        placeholder="Don Carlos Rodríguez"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                        placeholder="3104567890"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Mula / Marca</label>
                      <input
                        type="text"
                        value={quoteForm.vehicle_type}
                        onChange={(e) => setQuoteForm({ ...quoteForm, vehicle_type: e.target.value })}
                        placeholder="Kenworth T800"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Placa</label>
                      <input
                        type="text"
                        value={quoteForm.plate}
                        onChange={(e) => setQuoteForm({ ...quoteForm, plate: e.target.value.toUpperCase() })}
                        placeholder="WTL-892"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={quoteForm.city}
                        onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                        placeholder="Medellín"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Trabajo Deseado</label>
                    <input
                      type="text"
                      value={quoteForm.service}
                      onChange={(e) => setQuoteForm({ ...quoteForm, service: e.target.value })}
                      placeholder='Bomper de 20", Visera Drop Visor, Doble Corneta...'
                      className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Detalles Adicionales</label>
                    <textarea
                      rows="2"
                      value={quoteForm.details}
                      onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
                      placeholder="Especificaciones o consultas de personalización..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-xl shadow-amber-500/25 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingQuote ? "Guardando..." : "Enviar Cotización & Conectar por WhatsApp"}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/10 bg-carbon-950 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-carbon-950 text-xs">
              MT
            </div>
            <span className="font-extrabold text-sm text-white">
              MELLOS TRUCK S.A.S. • © {new Date().getFullYear()}
            </span>
          </div>

          <p className="text-center sm:text-right">
            Líderes en fabricación de bompers y lujos en acero inoxidable para carga pesada.
          </p>

          <div>
            <Link
              to="/admin/login"
              className="px-3 py-1.5 rounded-lg bg-carbon-900 text-slate-400 hover:text-amber-400 border border-white/5 transition-colors font-bold"
            >
              🔐 Acceso Gerencia
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal de Cotización Rápida Flotante */}
      <QuickQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialService={quoteInitialService}
      />
    </div>
  );
}
