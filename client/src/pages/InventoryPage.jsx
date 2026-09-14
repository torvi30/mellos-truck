import React, { useEffect, useState } from "react";

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
      const url = `http://localhost:4000/api/products?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setLowStockCount(data.lowStockCount || 0);
      }
    } catch (err) {
      console.warn("Cargando inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [category, search]);

  const handleStockDelta = async (id, delta) => {
    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) {
        await loadInventory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await loadInventory();
        setShowModal(false);
        setForm({
          nombre: "",
          sku: "",
          precio: "",
          stock: "5",
          min_stock_alert: "3",
          categoria: "Acero Inoxidable",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="studio-container">
      {/* Header */}
      <div className="studio-header">
        <div>
          <h1>Control de Inventario & Tienda Container</h1>
          <p>
            Gestión de stock en tiempo real, alertas de reposición automática y salida de repuestos hacia el taller.
          </p>
        </div>
        <button className="primary-btn pulse-btn" onClick={() => setShowModal(true)}>
          📦 + Registrar Producto / Lujo
        </button>
      </div>

      {/* Banner de Alerta de Stock Bajo */}
      {lowStockCount > 0 && (
        <div className="inventory-alert-banner">
          <div className="alert-icon">⚠️</div>
          <div>
            <strong>¡Atención: Stock Crítico Detectado!</strong>
            <p>
              Hay <strong>{lowStockCount} producto(s)</strong> con unidades iguales o por debajo del mínimo de seguridad. Se requiere reposición para no frenar trabajos de taller.
            </p>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="inventory-toolbar">
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="🔍 Buscar por nombre, SKU o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla de Productos */}
      <div className="studio-card-wrapper">
        <table className="pro-table">
          <thead>
            <tr>
              <th>SKU / Código</th>
              <th>Producto & Descripción</th>
              <th>Categoría</th>
              <th>Precio Unitario</th>
              <th>Stock Actual</th>
              <th>Alerta Mín.</th>
              <th>Ajuste Rápido</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                  Cargando productos de la Tienda Container...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                  No se encontraron productos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              products.map((item) => {
                const isCritical = item.stock <= item.min_stock_alert;
                return (
                  <tr key={item.id} className={isCritical ? "row-critical-stock" : ""}>
                    <td>
                      <span className="sku-badge">{item.sku}</span>
                    </td>
                    <td>
                      <strong>{item.nombre}</strong>
                    </td>
                    <td>
                      <span className="category-pill">{item.categoria}</span>
                    </td>
                    <td className="price-cell">
                      ${new Intl.NumberFormat("es-CO").format(item.precio)} COP
                    </td>
                    <td>
                      <span className={`stock-badge ${isCritical ? "stock-critical" : "stock-ok"}`}>
                        {item.stock} unidades
                        {isCritical && " (Crítico)"}
                      </span>
                    </td>
                    <td style={{ color: "#94a3b8", textAlign: "center" }}>
                      {item.min_stock_alert}
                    </td>
                    <td>
                      <div className="stock-actions-group">
                        <button
                          className="btn-delta minus"
                          onClick={() => handleStockDelta(item.id, -1)}
                          title="Descontar 1 unidad (Salida a taller)"
                        >
                          -1
                        </button>
                        <button
                          className="btn-delta plus"
                          onClick={() => handleStockDelta(item.id, 1)}
                          title="Agregar 1 unidad (Entrada Container)"
                        >
                          +1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Producto */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>📦 Registrar Producto en Tienda Container</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label>Nombre del Producto / Accesorio *</label>
                <input
                  type="text"
                  placeholder='Ej: Bomper Acero 22" Corte Láser'
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>Código SKU *</label>
                  <input
                    type="text"
                    placeholder="Ej: BOMP-22-LASER"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  >
                    <option value="Acero Inoxidable">Acero Inoxidable</option>
                    <option value="Iluminación">Iluminación</option>
                    <option value="Lujos">Lujos</option>
                    <option value="Escapes y Cornetas">Escapes y Cornetas</option>
                    <option value="Estructura">Estructura</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>Precio Unitario (COP)</label>
                  <input
                    type="number"
                    placeholder="Ej: 3500000"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Stock Inicial</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Alerta de Stock Mínimo (Disparador de aviso)</label>
                <input
                  type="number"
                  value={form.min_stock_alert}
                  onChange={(e) => setForm({ ...form, min_stock_alert: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
