import pool from "../config/db.js";
import crypto from "crypto";
import {
  memoryProducts,
  getProductById,
  deductProductStock,
  restoreProductStock,
} from "./productController.js";
import { memoryShowroomProjects } from "./showroom.controller.js";

const sanitizeSlug = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Almacén en memoria de órdenes de trabajo (Módulo B - V3)
let memoryWorkOrders = [
  {
    id: 1,
    cliente: "Don Carlos Rodríguez",
    telefono: "573104567890",
    placa: "WTL-892",
    marca: "Kenworth",
    linea: "T800 Aerocab",
    color: "Azul Medianoche & Cromo",
    descripcion: "Fabricación de bomper de 20\" con corte láser, visera americana espejo y cornetas.",
    estado: "Entregado",
    slug: "Kenworth-T800-Placa-WTL892",
    magic_token: "tok_kw_wtl892_live",
    fecha_ingreso: new Date(Date.now() - 7 * 86400000).toISOString(),
    fecha_estimada: new Date().toISOString(),
    costo_mano_obra: 2500000,
    costo_repuestos: 5940000,
    costo_total: 8440000,
    items: [
      {
        id: 101,
        productId: 1,
        nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
        sku: "BOMP-INOX-20-KW",
        cantidad: 1,
        precio_unitario: 3850000,
        subtotal: 3850000,
      },
      {
        id: 102,
        productId: 2,
        nombre: "Visera Americana Drop Visor Acero Espejo T800",
        sku: "VIS-AMER-KW-T800",
        cantidad: 1,
        precio_unitario: 1450000,
        subtotal: 1450000,
      },
      {
        id: 103,
        productId: 4,
        nombre: "Kit Iluminación LED Watermelon Ámbar IP68 (Pack x10)",
        sku: "LED-WML-AMB-10PK",
        cantidad: 2,
        precio_unitario: 320000,
        subtotal: 640000,
      },
    ],
  },
  {
    id: 2,
    cliente: "Transportes La Montaña",
    telefono: "573129876543",
    placa: "SZZ-514",
    marca: "Mack",
    linea: "Vision Elite",
    color: "Rojo Rubí Metalizado",
    descripcion: "Instalación de bomper tipo americano, visera drop visor y doble corneta Hadley.",
    estado: "Taller",
    slug: "Mack-Vision-Placa-SZZ514",
    magic_token: "tok_mack_szz514_live",
    fecha_ingreso: new Date(Date.now() - 3 * 86400000).toISOString(),
    fecha_estimada: new Date(Date.now() + 4 * 86400000).toISOString(),
    costo_mano_obra: 1800000,
    costo_repuestos: 1350000,
    costo_total: 3150000,
    items: [
      {
        id: 104,
        productId: 3,
        nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
        sku: "CORN-HADLEY-24V",
        cantidad: 1,
        precio_unitario: 980000,
        subtotal: 980000,
      },
      {
        id: 105,
        productId: 6,
        nombre: "Juego Copas Spikes Cromadas en Punta (33mm)",
        sku: "ACC-SPIKE-33MM-SET",
        cantidad: 2,
        precio_unitario: 185000,
        subtotal: 370000,
      },
    ],
  },
  {
    id: 3,
    cliente: "Logística del Caribe S.A.S",
    telefono: "573157778899",
    placa: "SKM-302",
    marca: "International",
    linea: "Eagle 9400i",
    color: "Negro Brillante",
    descripcion: "Ingreso para diagnóstico de pailería, refuerzo estructural y diseño de visera.",
    estado: "Ingreso",
    slug: null,
    magic_token: null,
    fecha_ingreso: new Date().toISOString(),
    fecha_estimada: new Date(Date.now() + 8 * 86400000).toISOString(),
    costo_mano_obra: 1200000,
    costo_repuestos: 0,
    costo_total: 1200000,
    items: [],
  },
  {
    id: 4,
    cliente: "Agregados & Volquetas del Huila",
    telefono: "573183344556",
    placa: "UFT-621",
    marca: "Peterbilt",
    linea: "389 Pride & Class",
    color: "Verde Esmeralda Metalizado",
    descripcion: "Aplicación de base y acabado poliuretano de alta resistencia con brillo cerámico.",
    estado: "Pintura",
    slug: null,
    magic_token: null,
    fecha_ingreso: new Date(Date.now() - 4 * 86400000).toISOString(),
    fecha_estimada: new Date(Date.now() + 2 * 86400000).toISOString(),
    costo_mano_obra: 3200000,
    costo_repuestos: 9600000,
    costo_total: 12800000,
    items: [
      {
        id: 106,
        productId: 5,
        nombre: 'Rines Forjados Alcoa 22.5" Pulidos Espejo',
        sku: "RIN-ALCOA-225-ESP",
        cantidad: 4,
        precio_unitario: 2400000,
        subtotal: 9600000,
      },
    ],
  },
  {
    id: 5,
    cliente: "Transportes Valle del Sol",
    telefono: "573112233445",
    placa: "XVZ-409",
    marca: "Kenworth",
    linea: "W900 Icon",
    color: "Plata Espejo & Naranja",
    descripcion: "Control de calidad final, prueba de sistema neumático de cornetas y alistamiento estético.",
    estado: "Terminado",
    slug: "Kenworth-W900-Placa-XVZ409",
    magic_token: "tok_kw_xvz409_live",
    fecha_ingreso: new Date(Date.now() - 6 * 86400000).toISOString(),
    fecha_estimada: new Date().toISOString(),
    costo_mano_obra: 2900000,
    costo_repuestos: 4830000,
    costo_total: 7730000,
    items: [
      {
        id: 107,
        productId: 1,
        nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
        sku: "BOMP-INOX-20-KW",
        cantidad: 1,
        precio_unitario: 3850000,
        subtotal: 3850000,
      },
      {
        id: 108,
        productId: 3,
        nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
        sku: "CORN-HADLEY-24V",
        cantidad: 1,
        precio_unitario: 980000,
        subtotal: 980000,
      },
    ],
  },
];

const recalculateTotals = (order) => {
  const repuestos = (order.items || []).reduce(
    (acc, item) => acc + (parseFloat(item.subtotal) || 0),
    0
  );
  order.costo_repuestos = repuestos;
  order.costo_total = (parseFloat(order.costo_mano_obra) || 0) + repuestos;
};

/**
 * 1. Listar todas las órdenes de trabajo con estado y piezas asignadas
 * GET /api/work-orders
 */
export const getWorkOrders = async (req, res) => {
  try {
    const { estado, search } = req.query;

    let orders = [...memoryWorkOrders];

    // Intentar leer de MySQL si existe
    try {
      const [rows] = await pool.query(
        `SELECT * FROM work_orders ORDER BY created_at DESC`
      );
      if (rows && rows.length > 0) {
        // Enlazar con memoria o registros de items
      }
    } catch (dbErr) {
      // Usar memoria
    }

    if (estado && estado !== "Todos") {
      orders = orders.filter((o) => o.estado === estado);
    }

    if (search) {
      const term = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.placa.toLowerCase().includes(term) ||
          o.cliente.toLowerCase().includes(term) ||
          o.marca.toLowerCase().includes(term) ||
          (o.linea && o.linea.toLowerCase().includes(term))
      );
    }

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5174";
    const mapped = orders.map((o) => {
      recalculateTotals(o);
      return {
        ...o,
        magicUrl: o.slug ? `${frontendBase}/galeria/${o.slug}` : null,
        whatsappShareUrl: o.slug
          ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
              `¡Hola ${o.cliente}! 🔥 Tu mula ${o.marca} (${o.placa}) está en estado ${o.estado} en Mellos Truck.\nPuedes seguirla aquí: ${frontendBase}/galeria/${o.slug}`
            )}`
          : null,
      };
    });

    res.json({
      success: true,
      count: mapped.length,
      orders: mapped,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener órdenes de trabajo", error: error.message });
  }
};

/**
 * 2. Crear nueva orden de trabajo (Ingreso de mula al taller)
 * POST /api/work-orders
 */
export const createWorkOrder = async (req, res) => {
  try {
    const {
      cliente,
      telefono,
      placa,
      marca,
      linea,
      color,
      descripcion,
      costo_mano_obra,
      fecha_estimada,
    } = req.body;

    if (!cliente || !placa || !marca) {
      return res.status(400).json({ message: "Cliente, placa y marca son obligatorios" });
    }

    const cleanPlate = placa.toUpperCase().trim();

    const newOrder = {
      id: Date.now(),
      cliente,
      telefono: telefono || "",
      placa: cleanPlate,
      marca,
      linea: linea || "",
      color: color || "No especificado",
      descripcion: descripcion || "Ingreso a taller para adecuación y personalización artesanal.",
      estado: "Ingreso",
      slug: null,
      magic_token: null,
      fecha_ingreso: new Date().toISOString(),
      fecha_estimada: fecha_estimada || new Date(Date.now() + 7 * 86400000).toISOString(),
      costo_mano_obra: parseFloat(costo_mano_obra) || 0,
      costo_repuestos: 0,
      costo_total: parseFloat(costo_mano_obra) || 0,
      items: [],
    };

    memoryWorkOrders.unshift(newOrder);

    // Intentar insertar en MySQL
    try {
      await pool.query(
        `INSERT INTO work_orders (cliente, placa, descripcion, estado)
         VALUES (?, ?, ?, ?)`,
        [newOrder.cliente, newOrder.placa, newOrder.descripcion, newOrder.estado]
      );
    } catch (dbErr) {
      console.warn("MySQL en modo fallback en createWorkOrder:", dbErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Mula con placa ${cleanPlate} ingresada exitosamente al taller`,
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar orden de trabajo", error: error.message });
  }
};

/**
 * 3. Actualizar estado de la orden (Ingreso -> Taller -> Pintura -> Terminado -> Entregado)
 * PATCH /api/work-orders/:id/status
 */
export const updateWorkOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const validStates = ["Ingreso", "Taller", "Pintura", "Terminado", "Entregado"];
    if (!validStates.includes(estado)) {
      return res.status(400).json({ message: `Estado inválido. Debe ser uno de: ${validStates.join(", ")}` });
    }

    const order = memoryWorkOrders.find((o) => o.id === parseInt(id, 10));
    if (!order) {
      return res.status(404).json({ message: "Orden de trabajo no encontrada" });
    }

    const previousState = order.estado;
    order.estado = estado;

    // Si avanza a Terminado o Entregado y aún no tiene Magic Link slug, generarlo automáticamente
    if ((estado === "Terminado" || estado === "Entregado") && !order.slug) {
      const slugBase = `${order.marca}-${order.linea || "Truck"}-Placa-${order.placa.replace(/[^a-zA-Z0-9]/g, "")}`;
      const shortHex = crypto.randomBytes(2).toString("hex");
      order.slug = `${sanitizeSlug(slugBase)}-${shortHex}`;
      order.magic_token = crypto.randomBytes(12).toString("hex");

      // Sincronizar con el catálogo Showroom para que el cliente lo pueda abrir
      const existingShowroom = memoryShowroomProjects.find((p) => p.plate === order.placa);
      if (!existingShowroom) {
        memoryShowroomProjects.unshift({
          id: order.id,
          clientName: order.cliente,
          phone: order.telefono,
          plate: order.placa,
          brand: order.marca,
          line: order.linea,
          model: "2024",
          color: order.color,
          description: order.descripcion,
          status: order.estado,
          slug: order.slug,
          magicToken: order.magic_token,
          before_url: "/images/showroom/kenworth_before.jpg",
          after_url: "/images/showroom/kenworth_after.jpg",
          video_url: "/api/stream/video/cinematic_kenworth_demo.mp4",
          created_at: new Date().toISOString(),
          views: 0,
        });
      }
    }

    // Intentar actualizar en MySQL
    try {
      await pool.query(
        `UPDATE work_orders SET estado = ?, slug = ?, magic_token = ? WHERE id = ?`,
        [order.estado, order.slug, order.magic_token, order.id]
      );
    } catch (dbErr) {
      // offline fallback
    }

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5174";
    const magicUrl = order.slug ? `${frontendBase}/galeria/${order.slug}` : null;
    const whatsappShareUrl = order.slug
      ? `https://api.whatsapp.com/send?phone=${order.telefono}&text=${encodeURIComponent(
          `¡Hola ${order.cliente}! 🔥 Tu camión ${order.marca} ${order.linea} (${order.placa}) ha pasado al estado: ${order.estado} en Mellos Truck.\n👉 Ver estado y fotos aquí: ${magicUrl}`
        )}`
      : null;

    res.json({
      success: true,
      message: `Estado de la mula ${order.placa} actualizado de [${previousState}] a [${estado}]`,
      order: {
        ...order,
        magicUrl,
        whatsappShareUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado", error: error.message });
  }
};

/**
 * 4. Asignar repuesto/lujo del Container a la Orden de Trabajo (Descuento automático de stock)
 * POST /api/work-orders/:id/items
 */
export const assignWorkOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, cantidad = 1 } = req.body;

    const order = memoryWorkOrders.find((o) => o.id === parseInt(id, 10));
    if (!order) {
      return res.status(404).json({ message: "Orden de trabajo no encontrada" });
    }

    const qty = parseInt(cantidad, 10) || 1;
    if (qty <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
    }

    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto del inventario no encontrado" });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        message: `Stock insuficiente en el Container. Solo hay ${product.stock} unidades disponibles de ${product.nombre}`,
      });
    }

    // Descontar automáticamente del stock del inventario
    await deductProductStock(productId, qty);

    if (!order.items) {
      order.items = [];
    }

    const existingItem = order.items.find((item) => item.productId === parseInt(productId, 10));

    if (existingItem) {
      existingItem.cantidad += qty;
      existingItem.subtotal = existingItem.cantidad * existingItem.precio_unitario;
    } else {
      order.items.push({
        id: Date.now(),
        productId: product.id,
        nombre: product.nombre,
        sku: product.sku,
        cantidad: qty,
        precio_unitario: product.precio,
        subtotal: product.precio * qty,
      });
    }

    recalculateTotals(order);

    res.json({
      success: true,
      message: `Se asignaron ${qty} unidad(es) de "${product.nombre}" a la mula ${order.placa}. Stock restante: ${product.stock}`,
      order,
      product: {
        id: product.id,
        nombre: product.nombre,
        stock: product.stock,
        isCritical: product.stock <= product.min_stock_alert,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al asignar repuesto a la orden", error: error.message });
  }
};

/**
 * 5. Quitar repuesto de la orden y reintegrar stock al Container
 * DELETE /api/work-orders/:id/items/:itemId
 */
export const removeWorkOrderItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const order = memoryWorkOrders.find((o) => o.id === parseInt(id, 10));
    if (!order) {
      return res.status(404).json({ message: "Orden de trabajo no encontrada" });
    }

    const itemIndex = (order.items || []).findIndex(
      (item) => item.id === parseInt(itemId, 10) || item.productId === parseInt(itemId, 10)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Pieza no encontrada en esta orden" });
    }

    const removedItem = order.items[itemIndex];

    // Devolver el stock al inventario del Container
    await restoreProductStock(removedItem.productId, removedItem.cantidad);

    order.items.splice(itemIndex, 1);
    recalculateTotals(order);

    const product = getProductById(removedItem.productId);

    res.json({
      success: true,
      message: `Pieza "${removedItem.nombre}" retirada de la orden. Se reintegraron ${removedItem.cantidad} unidades al Container.`,
      order,
      productStock: product ? product.stock : null,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al retirar pieza de la orden", error: error.message });
  }
};

/**
 * 6. Eliminar orden de trabajo
 * DELETE /api/work-orders/:id
 */
export const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryWorkOrders.findIndex((o) => o.id === parseInt(id, 10));
    if (index === -1) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const order = memoryWorkOrders[index];

    // Devolver todas las piezas al stock si se elimina la orden
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        await restoreProductStock(item.productId, item.cantidad);
      }
    }

    memoryWorkOrders.splice(index, 1);

    res.json({
      success: true,
      message: `Orden de la mula ${order.placa} eliminada y stock reintegrado`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar orden", error: error.message });
  }
};

/**
 * 7. Actualizar datos de la orden (Mano de obra, notas, color)
 * PUT /api/work-orders/:id
 */
export const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo_mano_obra, descripcion, color, fecha_estimada } = req.body;

    const order = memoryWorkOrders.find((o) => o.id === parseInt(id, 10));
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (costo_mano_obra !== undefined) order.costo_mano_obra = parseFloat(costo_mano_obra) || 0;
    if (descripcion !== undefined) order.descripcion = descripcion;
    if (color !== undefined) order.color = color;
    if (fecha_estimada !== undefined) order.fecha_estimada = fecha_estimada;

    recalculateTotals(order);

    res.json({
      success: true,
      message: `Mula ${order.placa} actualizada correctamente`,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar orden", error: error.message });
  }
};

export { memoryWorkOrders };
