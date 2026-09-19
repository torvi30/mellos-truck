import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  LayoutDashboard,
  Wrench,
  FileText,
  Package,
  Users,
  Truck,
  Image,
  Sparkles,
  Sliders,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  Hammer,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user, role, switchRole, isWorkshop } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/workshop", label: "Taller & Patio", icon: Wrench },
    { to: "/admin/quotes", label: "Cotizaciones", icon: FileText },
    { to: "/admin/inventory", label: "Inventario Container", icon: Package },
    { to: "/admin/clients", label: "Clientes", icon: Users },
    { to: "/admin/vehicles", label: "Flota de Mulas", icon: Truck },
    { to: "/admin/gallery", label: "Galería Multimedia", icon: Image },
    { to: "/admin/studio", label: "Magic Links Studio", icon: Sparkles },
    { to: "/admin/landing", label: "Editor Portada CMS", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Header Móvil (< 768px) */}
      <header className="md:hidden sticky top-0 z-50 bg-carbon-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-carbon-950 text-sm shadow-md ${
              isWorkshop
                ? "bg-gradient-to-br from-orange-500 to-amber-500"
                : "bg-gradient-to-br from-amber-400 to-amber-600"
            }`}
          >
            MT
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider text-white">
              MELLOS <span className="text-amber-400">TRUCK</span>
            </div>
            <div className="text-[10px] font-bold text-amber-500 tracking-wide uppercase">
              {isWorkshop ? "🛠️ Modo Patio" : "👔 Gerencia Pro"}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchRole(isWorkshop ? "admin" : "workshop")}
            className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1"
          >
            {isWorkshop ? <Hammer className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            <span>{isWorkshop ? "Patio" : "Gerencia"}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-carbon-800 text-slate-300 hover:text-white border border-white/5"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-40 bg-carbon-950/95 backdrop-blur-lg p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-carbon-900"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/10 space-y-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-carbon-800 text-slate-300 border border-white/10 hover:bg-carbon-700"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Vitrina Pública</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Sidebar Fijo de Escritorio (>= 768px) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-carbon-900 border-r border-white/10 shrink-0 h-screen sticky top-0 overflow-y-auto">
        {/* Identidad de Marca */}
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-carbon-950 text-base shadow-lg transition-transform group-hover:scale-105 ${
                isWorkshop
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20"
                  : "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20"
              }`}
            >
              MT
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-wider text-white">
                MELLOS <span className="text-amber-400">TRUCK</span>
              </h2>
              <p className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">
                TALLER & CONTAINER
              </p>
            </div>
          </Link>
        </div>

        {/* Selector de Rol Operativo */}
        <div className="px-4 pt-4 pb-2">
          <div className="bg-carbon-950 p-1 rounded-xl border border-white/10 flex gap-1">
            <button
              onClick={() => switchRole("admin")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isWorkshop
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Gerencia</span>
            </button>
            <button
              onClick={() => switchRole("workshop")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isWorkshop
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Taller</span>
            </button>
          </div>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-carbon-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer del Sidebar con Usuario y Acciones */}
        <div className="p-4 border-t border-white/10 space-y-2.5">
          <div className="px-2 py-1.5 rounded-lg bg-carbon-950 border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <div className="text-[11px] font-medium text-slate-400 truncate">Sesión activa</div>
              <div className="text-xs font-bold text-slate-200 truncate">
                {user?.email || "admin@mellostrucks.com"}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-carbon-800 text-slate-300 border border-white/5 hover:bg-carbon-700 hover:text-white transition-colors"
              title="Abrir vitrina pública en nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Web</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 4. Contenido Principal */}
      <main className="flex-1 min-w-0 bg-carbon-950 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}