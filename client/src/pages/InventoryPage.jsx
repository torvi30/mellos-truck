import React, { useEffect, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import { productsService } from "../services/firebaseService.js";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Minus,
  CheckCircle2,
  Filter,
  X,
  Sparkles,
} from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    precio: "",
    stock: "5",
    min_stock_alert: "3",
    categoria: "Acero Inoxidable",
    imagen_url: "",
  });

  const categories = [
    "Todos",
    "Acero Inoxidable",
    "Iluminación",
    "Lujos",
    "Escapes y Cornetas",
    "Estructura",
  ];

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await productsService.getAll({ category, search });
      setProducts(res.products || []);
      setLowStockCount(res.lowStockCount || 0);
    } catch (err) {
      console.warn("Error cargando inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [category, search]);

  const handleStockDelta = async (id, delta) => {
    try {
      const res = await productsService.updateStock(id, delta);
      if (res.success) {
        showSuccessToast(delta > 0 ? "+1 unidad ingresada al Container" : "-1 unidad despachada");
        await loadInventory();
      }
    } catch (err) {
      showErrorToast("No se pudo actualizar el stock");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.sku) {
      showErrorToast("Ingresa el nombre y SKU del repuesto/lujo");
      return;
    }

    try {
      const res = await productsService.create(form);
      if (res.success) {
        showSuccessToast("¡Producto registrado en el Container con éxito!");
        await loadInventory();
        setShowModal(false);
        setForm({
          nombre: "",
          sku: "",
          precio: "",
          stock: "5",
          min_stock_alert: "3",
          categoria: "Acero Inoxidable",
          imagen_url: "",
        });
      }
    } catch (err) {
      showErrorToast("Error al guardar el producto");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Package className="w-4 h-4" />
            <span>Tienda Física & Repuestos de Taller</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Inventario Container
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Control de stock en tiempo real sincronizado con Cloud Firestore.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Repuesto / Lujo</span>
        </button>
      </div>

      {/* 2. Banner de Alerta si hay stock crítico */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm font-semibold">
              Atención: <strong>{lowStockCount} producto(s)</strong> han llegado o están por debajo de su stock mínimo de seguridad en el Container.
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-black bg-red-500/20 border border-red-500/40">
            {lowStockCount} Crítico(s)
          </span>
        </div>
      )}

      {/* 3. Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o categoría..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Selector de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
                  : "bg-carbon-900 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Grid de Productos */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Sincronizando inventario con Firebase...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No se encontraron productos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay existencias para este filtro o búsqueda. Agrega un nuevo producto para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => {
            const isCritical = prod.stock <= prod.min_stock_alert;
            return (
              <div
                key={prod.id}
                className={`glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                  isCritical ? "border-red-500/40" : "border-white/10 hover:border-amber-500/30"
                }`}
              >
                {/* Imagen del Producto */}
                <div className="relative h-44 bg-carbon-950 overflow-hidden group">
                  <img
                    src={prod.imagen_url || "/images/showroom/detail_bumper_chrome.jpg"}
                    alt={prod.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/images/showroom/detail_bumper_chrome.jpg";
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-carbon-950/90 backdrop-blur-md text-amber-400 border border-white/10">
                      {prod.categoria}
                    </span>
                  </div>
                  {isCritical && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/90 text-white shadow-lg shadow-red-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Stock Crítico</span>
                    </div>
                  )}
                </div>

                {/* Detalles del Producto */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                      <span>SKU: {prod.sku}</span>
                      <span>Mínimo: {prod.min_stock_alert}</span>
                    </div>
                    <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                      {prod.nombre}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Precio Unidad</div>
                      <div className="text-base font-extrabold text-amber-400">
                        ${Number(prod.precio || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Controlador de Stock Rápido */}
                    <div className="flex items-center gap-2 bg-carbon-950 p-1.5 rounded-xl border border-white/10">
                      <button
                        onClick={() => handleStockDelta(prod.id, -1)}
                        className="w-7 h-7 rounded-lg bg-carbon-800 text-slate-300 hover:text-white hover:bg-carbon-700 flex items-center justify-center transition-colors"
                        title="Despachar 1 unidad a taller"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span
                        className={`text-sm font-black min-w-[24px] text-center ${
                          isCritical ? "text-red-400" : "text-white"
                        }`}
                      >
                        {prod.stock}
                      </span>
                      <button
                        onClick={() => handleStockDelta(prod.id, 1)}
                        className="w-7 h-7 rounded-lg bg-carbon-800 text-slate-300 hover:text-white hover:bg-carbon-700 flex items-center justify-center transition-colors"
                        title="Ingresar 1 unidad al Container"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal para Crear Nuevo Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-card max-w-lg w-full rounded-2xl p-6 space-y-5 border border-white/15 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Nuevo Repuesto / Lujo en Container</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Pieza *</label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder='ej: Bomper de Acero Inoxidable 20" Corte Láser'
                  className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="ej: BOMP-INOX-20-KW"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {categories.filter((c) => c !== "Todos").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio ($COP)</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="3850000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={form.min_stock_alert}
                    onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-carbon-900 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fotografía de la Pieza</label>
                <ImageUploader
                  value={form.imagen_url}
                  onChange={(url) => setForm({ ...form, imagen_url: url })}
                  category="catalog"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-carbon-800 text-slate-300 hover:bg-carbon-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  Guardar en Container
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
