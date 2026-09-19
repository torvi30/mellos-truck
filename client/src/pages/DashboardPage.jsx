import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  workOrdersService,
  showroomService,
  quotesService,
  productsService,
} from "../services/firebaseService.js";
import {
  Wrench,
  Sparkles,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  Package,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const adminName = user?.displayName || user?.email?.split("@")[0] || "Administrador";

  const [stats, setStats] = useState({
    ordersCount: 5,
    showroomsCount: 2,
    quotesCount: 3,
    lowStockCount: 2,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [ordersRes, showroomRes, quotesList, productsRes] = await Promise.all([
          workOrdersService.getAll(),
          showroomService.getAll(),
          quotesService.getAll(),
          productsService.getAll(),
        ]);

        setStats({
          ordersCount: ordersRes?.count || ordersRes?.orders?.length || 0,
          showroomsCount: showroomRes?.count || showroomRes?.projects?.length || 0,
          quotesCount: Array.isArray(quotesList) ? quotesList.length : 0,
          lowStockCount: productsRes?.lowStockCount || 0,
        });

        if (ordersRes?.orders) {
          setRecentOrders(ordersRes.orders.slice(0, 4));
        }
      } catch (err) {
        console.warn("Error cargando métricas en dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header de Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Centro de Mando & Operaciones
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Panel General Mellos Truck
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Bienvenido, <strong className="text-slate-200">{adminName}</strong>. Estado operativo de patio y taller sincronizado en Firebase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/workshop"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>Tablero Taller</span>
          </Link>
          <Link
            to="/admin/studio"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-carbon-850 text-amber-400 border border-amber-500/30 hover:bg-carbon-800 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>+ Magic Link</span>
          </Link>
        </div>
      </div>

      {/* 2. Grid de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mulas en Taller */}
        <Link
          to="/admin/workshop"
          className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.ordersCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Mulas en Taller (Kanban)
            </div>
          </div>
        </Link>

        {/* Showrooms Emitidos */}
        <Link
          to="/admin/studio"
          className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.showroomsCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Showrooms Emitidos (Magic Links)
            </div>
          </div>
        </Link>

        {/* Cotizaciones Pendientes */}
        <Link
          to="/admin/quotes"
          className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.quotesCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              Cotizaciones Registradas
            </div>
          </div>
        </Link>

        {/* Alertas Stock Container */}
        <Link
          to="/admin/inventory"
          className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                stats.lowStockCount > 0
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <div
              className={`text-3xl font-black tracking-tight ${
                stats.lowStockCount > 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {stats.lowStockCount}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              {stats.lowStockCount > 0
                ? "Piezas en Stock Crítico"
                : "Inventario en Nivel Óptimo"}
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Accesos Directos a Módulos Core */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <span>Módulos de Gestión Rápida</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Taller */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-amber-500 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Operaciones & Trazabilidad
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Taller Central & Mulas</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tablero Kanban industrial: seguimiento de mulas en Ingreso, Pailería, Pintura y Terminado con descuento automático de piezas desde el Container.
              </p>
            </div>
            <Link
              to="/admin/workshop"
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-carbon-950 transition-all flex items-center justify-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Abrir Tablero de Taller</span>
            </Link>
          </div>

          {/* Studio Magic Links */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-cyan-500 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                Modalidad Comercial & WhatsApp
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Studio de Magic Links</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Genera los enlaces únicos para enviar al transportador por WhatsApp apenas la mula sale del taller, con slider interactivo y tomas aéreas.
              </p>
            </div>
            <Link
              to="/admin/studio"
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-carbon-950 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Abrir Studio de Showrooms</span>
            </Link>
          </div>

          {/* Inventario Container */}
          <div className="glass-card p-6 rounded-2xl border-t-2 border-t-emerald-500 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Tienda Física & Repuestos
              </span>
              <h3 className="text-lg font-bold text-white mt-1">Inventario Container</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Monitorea existencias de bompers en acero, cornetas de tren Hadley, viseras americanas y rines forjados Alcoa.
              </p>
            </div>
            <Link
              to="/admin/inventory"
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-carbon-950 transition-all flex items-center justify-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Abrir Inventario Container</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Mulas Recientes en Patio */}
      {recentOrders.length > 0 && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Mulas Activas en Patio</span>
            </h3>
            <Link
              to="/admin/workshop"
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-xl bg-carbon-950/60 border border-white/5 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-black text-amber-400">{o.placa}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-carbon-800 text-slate-300">
                      {o.estado}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white mt-1 truncate">{o.marca} {o.linea}</div>
                  <div className="text-xs text-slate-400 truncate">{o.cliente}</div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-white/5">
                  Total: <strong className="text-slate-300">${(o.costo_total || 0).toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Banner de Enlace a la Vitrina Pública */}
      <div className="glass-card p-8 rounded-2xl text-center space-y-4 border-dashed border-amber-500/20">
        <h3 className="text-xl font-bold text-white">
          ¿Quieres ver cómo ven los clientes la plataforma pública?
        </h3>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Accede a la página de inicio o visualiza el Showroom oficial con el antes y después de la Kenworth T800.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            target="_blank"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <span>Ver Portada Pública</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/galeria/Kenworth-T800-Placa-WTL892"
            target="_blank"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-carbon-850 text-slate-300 border border-white/10 hover:bg-carbon-800 transition-all flex items-center gap-2"
          >
            <span>Ver Magic Link Kenworth</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}