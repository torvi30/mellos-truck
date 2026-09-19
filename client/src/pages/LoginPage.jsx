import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Lock, Mail, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    email: "admin@mellostrucks.com",
    password: "123456789",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/admin");
    } catch (err) {
      console.error("Error login:", err);
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-carbon-950">
      {/* Luces de fondo ambientadas estilo taller nocturno */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo / Encabezado */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-carbon-950 text-xl shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              MT
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MELLOS <span className="text-amber-400">TRUCK</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Acceso Autorizado al Panel de Gerencia & Taller
          </p>
        </div>

        {/* Tarjeta de Autenticación */}
        <div className="glass-card p-7 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@mellostrucks.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/25 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Verificando..." : "Ingresar al Panel"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credenciales Demo */}
          <div className="p-3 rounded-xl bg-carbon-950/80 border border-white/5 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">
              Acceso Rápido Demo
            </span>
            <p className="text-xs text-slate-400 font-mono">
              admin@mellostrucks.com / 123456789
            </p>
          </div>
        </div>

        {/* Link de retorno */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-amber-400 transition-colors font-medium"
          >
            ← Volver a la vitrina pública
          </Link>
        </div>
      </div>
    </div>
  );
}