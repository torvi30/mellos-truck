import pool from "../config/db.js";

// Inventario inicial en memoria para modo resiliente (V3 Rules)
let memoryProducts = [
  {
    id: 1,
    nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
    sku: "BOMP-INOX-20-KW",
    precio: 3850000,
    stock: 4,
    min_stock_alert: 2,
    categoria: "Acero Inoxidable",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Visera Americana Drop Visor Acero Espejo T800",
    sku: "VIS-AMER-KW-T800",
    precio: 1450000,
    stock: 6,
    min_stock_alert: 3,
    categoria: "Acero Inoxidable",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
    sku: "CORN-HADLEY-24V",
    precio: 980000,
    stock: 2,
    min_stock_alert: 3, // ALERTA: stock <= min_stock_alert
    categoria: "Escapes y Cornetas",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    nombre: "Kit Iluminación LED Watermelon Ámbar IP68 (Pack x10)",
    sku: "LED-WML-AMB-10PK",
    precio: 320000,
    stock: 48,
    min_stock_alert: 15,
    categoria: "Iluminación",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    nombre: 'Rines Forjados Alcoa 22.5" Pulidos Espejo',
    sku: "RIN-ALCOA-225-ESP",
    precio: 2400000,
    stock: 8,
    min_stock_alert: 4,
    categoria: "Lujos",
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    nombre: "Juego Copas Spikes Cromadas en Punta (33mm)",
    sku: "ACC-SPIKE-33MM-SET",
    precio: 185000,
    stock: 15,
    min_stock_alert: 20, // ALERTA: stock <= min_stock_alert
    categoria: "Lujos",
    created_at: new Date().toISOString(),
  },
];

/**
 * Listar productos del inventario y alertas de stock
 * GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let items = [...memoryProducts];

    // Intentar leer de MySQL si la tabla existe
    try {
      const [rows] = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
      if (rows && rows.length > 0) {
        items = rows;
      }
    } catch (dbErr) {
      // Usar memoria
    }

    if (category && category !== "Todos") {
      items = items.filter((p) => p.categoria === category);
    }

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term)
      );
    }

    // Calcular productos con alerta de stock crítico
    const lowStockAlerts = items.filter((p) => p.stock <= p.min_stock_alert);

    res.json({
      success: true,
      count: items.length,
      lowStockCount: lowStockAlerts.length,
      products: items,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener inventario", error: error.message });
  }
};

/**
 * Crear producto en el inventario Container
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { nombre, sku, precio, stock, min_stock_alert, categoria } = req.body;

    if (!nombre || !sku) {
      return res.status(400).json({ message: "Nombre y SKU son requeridos" });
    }

    const newProduct = {
      id: Date.now(),
      nombre,
      sku: sku.toUpperCase().trim(),
      precio: parseFloat(precio) || 0,
      stock: parseInt(stock, 10) || 0,
      min_stock_alert: parseInt(min_stock_alert, 10) || 5,
      categoria: categoria || "Lujos",
      created_at: new Date().toISOString(),
    };

    memoryProducts.unshift(newProduct);

    // Guardar en MySQL si está disponible
    try {
      await pool.query(
        `INSERT INTO products (nombre, sku, precio, stock, min_stock_alert, categoria)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newProduct.nombre,
          newProduct.sku,
          newProduct.precio,
          newProduct.stock,
          newProduct.min_stock_alert,
          newProduct.categoria,
        ]
      );
    } catch (dbErr) {
      console.warn("DB MySQL en modo fallback en createProduct:", dbErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Producto agregado correctamente",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
};

/**
 * Ajustar stock (Entrada o Descuento de taller)
 * PATCH /api/products/:id/stock
 */
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // ej: +5 o -1

    const product = memoryProducts.find((p) => p.id === parseInt(id, 10));
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    product.stock = Math.max(0, product.stock + (parseInt(delta, 10) || 0));

    // Si llega al mínimo de stock, marcar aviso
    const isCritical = product.stock <= product.min_stock_alert;

    res.json({
      success: true,
      product,
      isCritical,
      message: isCritical ? `⚠️ Stock bajo: ${product.stock} unidades restantes` : "Stock actualizado",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar stock", error: error.message });
  }
};

// Exportar almacén en memoria para sincronización entre módulos
export { memoryProducts };

export const getProductById = (id) => {
  return memoryProducts.find((p) => p.id === parseInt(id, 10));
};

export const deductProductStock = async (id, qty = 1) => {
  const prod = memoryProducts.find((p) => p.id === parseInt(id, 10));
  if (prod) {
    prod.stock = Math.max(0, prod.stock - qty);
  }
  try {
    await pool.query("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?", [qty, id]);
  } catch (err) {
    // Modo offline resiliente
  }
  return prod;
};

export const restoreProductStock = async (id, qty = 1) => {
  const prod = memoryProducts.find((p) => p.id === parseInt(id, 10));
  if (prod) {
    prod.stock = prod.stock + qty;
  }
  try {
    await pool.query("UPDATE products SET stock = stock + ? WHERE id = ?", [qty, id]);
  } catch (err) {
    // Modo offline resiliente
  }
  return prod;
};
