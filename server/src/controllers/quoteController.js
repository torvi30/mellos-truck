import pool from "../config/db.js";
import { memoryWorkOrders } from "./workOrderController.js";
import { notifyNewQuote } from "../services/telegramService.js";

// Almacén en memoria de cotizaciones para modo resiliente (V3 Rules)
let memoryQuotes = [
  {
    id: 1,
    client_name: "Don Orlando Morales",
    phone: "573147890123",
    city: "Bucaramanga",
    vehicle_type: "Kenworth T800",
    plate: "SKR-901",
    service: "Bomper de Acero Inoxidable (18-22 Pulgadas)",
    details: "Fabricación de bomper de 20 pulgadas con cortes láser personalizados, doble visera americana espejo y 6 luces LED tipo sandía.",
    status: "nueva",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    client_name: "Transportes El Cacique",
    phone: "573127894561",
    city: "Medellín",
    vehicle_type: "Mack Vision Elite",
    plate: "TLK-552",
    service: "Viseras Americanas & Cornetas Hadley",
    details: "Instalación de visera drop visor pulida espejo y par de cornetas neumáticas de tren 24V.",
    status: "contactado",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    client_name: "AgroCarga del Llano",
    phone: "573109988776",
    city: "Villavicencio",
    vehicle_type: "International Eagle",
    plate: "UZZ-804",
    service: "Lujos de Tienda Container & Rines",
    details: "Cotización de 4 rines Alcoa 22.5 pulidos espejo con copas spike y 10 luces de gálibo ámbar.",
    status: "cotizada",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 4,
    client_name: "Don Carlos Rodríguez",
    phone: "573104567890",
    city: "Medellín",
    vehicle_type: "Kenworth T800",
    plate: "WTL-892",
    service: "Transformación Integral de Cabina & Acero Inox",
    details: "Trabajo completo de bomper, visera y cornetas.",
    status: "convertida",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

const detectBrand = (vehicleType) => {
  const text = (vehicleType || "").toLowerCase();
  if (text.includes("kenworth")) return "Kenworth";
  if (text.includes("mack")) return "Mack";
  if (text.includes("international")) return "International";
  if (text.includes("peterbilt")) return "Peterbilt";
  if (text.includes("freightliner")) return "Freightliner";
  return "Kenworth";
};

/**
 * 1. Crear nueva cotización (Pública desde la Web)
 * POST /api/quotes
 */
export const createQuote = async (req, res) => {
  try {
    const {
      client_name,
      phone,
      city,
      vehicle_type,
      plate,
      service,
      details,
    } = req.body;

    if (
      !client_name ||
      !phone ||
      !city ||
      !vehicle_type ||
      !service ||
      !details
    ) {
      return res.status(400).json({
        message: "client_name, phone, city, vehicle_type, service y details son obligatorios",
      });
    }

    const newQuote = {
      id: Date.now(),
      client_name,
      phone,
      city,
      vehicle_type,
      plate: plate ? plate.toUpperCase().trim() : "",
      service,
      details,
      status: "nueva",
      created_at: new Date().toISOString(),
    };

    memoryQuotes.unshift(newQuote);

    // Guardar en MySQL si está disponible
    try {
      const [result] = await pool.query(
        `INSERT INTO quotes (client_name, phone, city, vehicle_type, plate, service, details, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          client_name,
          phone,
          city,
          vehicle_type,
          newQuote.plate || null,
          service,
          details,
          "nueva",
        ]
      );
      if (result.insertId) {
        newQuote.id = result.insertId;
      }
    } catch (dbErr) {
      console.warn("⚠️ MySQL en modo fallback en createQuote:", dbErr.message);
    }

    // Notificación automática a Telegram (V3 Rules)
    notifyNewQuote({
      nombre: client_name,
      telefono: phone,
      marca: vehicle_type,
      placa: newQuote.plate,
      servicio: service,
      mensaje: details,
    }).catch((err) => console.warn("Error enviando alerta Telegram de cotización:", err.message));

    res.status(201).json({
      success: true,
      message: "¡Cotización recibida con éxito! Un asesor de Mellos Truck te contactará.",
      quote: newQuote,
      quoteId: newQuote.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cotización",
      error: error.message,
    });
  }
};

/**
 * 2. Listar todas las cotizaciones
 * GET /api/quotes
 */
export const getQuotes = async (req, res) => {
  try {
    let items = [...memoryQuotes];

    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM quotes
        ORDER BY created_at DESC
      `);
      if (rows && rows.length > 0) {
        items = rows;
      }
    } catch (dbErr) {
      // Usar memoria
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cotizaciones",
      error: error.message,
    });
  }
};

/**
 * 3. Actualizar estado de una cotización
 * PUT /api/quotes/:id/status
 */
export const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "nueva",
      "contactado",
      "en revision",
      "cotizada",
      "aprobada",
      "rechazada",
      "convertida",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Estado no válido",
      });
    }

    const quote = memoryQuotes.find((q) => q.id === parseInt(id, 10));
    if (quote) {
      quote.status = status;
    }

    try {
      await pool.query(
        `UPDATE quotes SET status = ? WHERE id = ?`,
        [status, id]
      );
    } catch (dbErr) {
      // offline fallback
    }

    res.json({
      success: true,
      message: `Estado actualizado a "${status}"`,
      status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar estado",
      error: error.message,
    });
  }
};

/**
 * 4. CONVERSIÓN DIRECTA 1-CLIC A ORDEN DE TALLER (KANBAN)
 * POST /api/quotes/:id/to-workshop
 */
export const convertQuoteToWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo_mano_obra = 2000000 } = req.body;

    const quote = memoryQuotes.find((q) => q.id === parseInt(id, 10));
    if (!quote) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    const cleanPlate = (quote.plate || `PND-${Math.floor(100 + Math.random() * 900)}`).toUpperCase().trim();
    const brand = detectBrand(quote.vehicle_type);

    // Crear orden de trabajo directamente en el Kanban del taller
    const newOrder = {
      id: Date.now(),
      cliente: quote.client_name,
      telefono: quote.phone,
      placa: cleanPlate,
      marca: brand,
      linea: quote.vehicle_type || "Tractomula",
      color: "Por definir en desarme",
      descripcion: `[Cotización #${quote.id}] Servicio: ${quote.service}. Detalle: ${quote.details}`,
      estado: "Ingreso", // Entra directamente a la primera fase del taller
      slug: null,
      magic_token: null,
      fecha_ingreso: new Date().toISOString(),
      fecha_estimada: new Date(Date.now() + 7 * 86400000).toISOString(),
      costo_mano_obra: parseFloat(costo_mano_obra) || 2000000,
      costo_repuestos: 0,
      costo_total: parseFloat(costo_mano_obra) || 2000000,
      items: [],
    };

    memoryWorkOrders.unshift(newOrder);

    // Marcar la cotización como convertida
    quote.status = "convertida";

    // Intentar insertar en MySQL
    try {
      await pool.query(
        `INSERT INTO work_orders (cliente, placa, descripcion, estado)
         VALUES (?, ?, ?, ?)`,
        [newOrder.cliente, newOrder.placa, newOrder.descripcion, newOrder.estado]
      );
      await pool.query(`UPDATE quotes SET status = 'convertida' WHERE id = ?`, [id]);
    } catch (dbErr) {
      console.warn("MySQL en modo fallback en convertQuoteToWorkOrder:", dbErr.message);
    }

    res.status(201).json({
      success: true,
      message: `¡Cotización de ${quote.client_name} convertida con éxito en Orden de Taller para la mula ${cleanPlate}!`,
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al convertir cotización a orden de taller",
      error: error.message,
    });
  }
};

/**
 * 5. Convertir a Cliente / Vehículo heredado (Compatibilidad)
 * POST /api/quotes/:id/convert
 */
export const convertQuoteToClient = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = memoryQuotes.find((q) => q.id === parseInt(id, 10));

    if (!quote) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    quote.status = "convertida";

    res.json({
      message: "Cotización convertida correctamente",
      quoteId: quote.id,
      clientId: 1,
      vehicleId: 1,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al convertir cotización",
      error: error.message,
    });
  }
};