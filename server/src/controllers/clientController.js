import pool from "../config/db.js";
import { memoryWorkOrders } from "./workOrderController.js";

// Almacén en memoria de Clientes & Flotas Transportadoras (CRM Mellos Truck)
let memoryClients = [
  {
    id: 1,
    name: "Don Carlos Rodríguez",
    phone: "3104567890",
    whatsapp: "573104567890",
    city: "Bogotá D.C.",
    company: "Transportes Rodríguez & Hijos S.A.S.",
    documento: "80.124.590",
    notes: "Cliente VIP. Exige bompers en acero espejo calibre pesado e iluminación LED ámbar.",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 2,
    name: "Transportes El Sol S.A.S.",
    phone: "3129876543",
    whatsapp: "573129876543",
    city: "Medellín",
    company: "Flota El Sol Carga Pesada",
    documento: "900.842.110-3",
    notes: "Flota de 12 mulas Mack y Kenworth en ruta Medellín - Buenaventura.",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 3,
    name: "Don Jairo Beltrán",
    phone: "3157778899",
    whatsapp: "573157778899",
    city: "Bucaramanga",
    company: "Beltrán Logística & Carga",
    documento: "91.240.812",
    notes: "Especialista en tractocamiones Peterbilt. Aficionado a cornetas Hadley y viseras Drop Visor.",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 4,
    name: "Logística del Valle Ltda.",
    phone: "3183332211",
    whatsapp: "573183332211",
    city: "Cali",
    company: "Logística del Valle",
    documento: "890.312.445-1",
    notes: "Ruta Cali - Ipiales. Mantenimientos preventivos de chasis y accesorios en acero.",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 5,
    name: "Don Hernando Gómez",
    phone: "3145554433",
    whatsapp: "573145554433",
    city: "Pereira",
    company: "Café & Carga Eje Cafetero",
    documento: "79.882.301",
    notes: "Propietario independiente de Freightliner Cascadia y Kenworth.",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 6,
    name: "Transporte Pesado del Caribe",
    phone: "3176669988",
    whatsapp: "573176669988",
    city: "Barranquilla",
    company: "Carga Caribe S.A.",
    documento: "901.120.334-8",
    notes: "Flota de volquetas cuatro manos y mulas carboneras de la costa.",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// Función para cruzar cliente con las órdenes de trabajo del taller
const enrichClientWithWorkOrders = (client) => {
  const clientNameNormalized = (client.name || "").toLowerCase().trim();
  const clientPhoneClean = (client.phone || "").replace(/\D/g, "");

  // Buscar órdenes que coincidan por nombre o teléfono
  const matchedOrders = (memoryWorkOrders || []).filter((order) => {
    const orderClient = (order.cliente || "").toLowerCase().trim();
    const orderPhone = (order.telefono || "").replace(/\D/g, "");
    
    return (
      orderClient.includes(clientNameNormalized) ||
      clientNameNormalized.includes(orderClient) ||
      (orderPhone && clientPhoneClean && (orderPhone.includes(clientPhoneClean) || clientPhoneClean.includes(orderPhone)))
    );
  });

  const plates = [...new Set(matchedOrders.map((o) => o.placa).filter(Boolean))];
  const totalSpent = matchedOrders.reduce((sum, o) => sum + (parseFloat(o.costo_total) || 0), 0);
  
  const sortedDates = matchedOrders
    .map((o) => o.fecha_ingreso || o.created_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  
  const lastVisit = sortedDates[0] || client.created_at;

  return {
    ...client,
    total_orders: matchedOrders.length,
    total_spent: totalSpent,
    plates,
    last_visit: lastVisit,
    recent_orders: matchedOrders.map((o) => ({
      id: o.id,
      placa: o.placa,
      marca: o.marca,
      linea: o.linea,
      estado: o.estado,
      slug: o.slug,
      costo_total: o.costo_total,
    })),
  };
};

export const getClients = async (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();

    // Intentar leer de MySQL si estuviera disponible
    let dbClients = null;
    try {
      const [rows] = await pool.query("SELECT * FROM clients ORDER BY created_at DESC");
      if (Array.isArray(rows) && rows.length > 0) {
        dbClients = rows;
      }
    } catch (_) {}

    const source = dbClients || memoryClients;

    let enriched = source.map(enrichClientWithWorkOrders);

    if (search) {
      enriched = enriched.filter((c) => {
        const inName = (c.name || "").toLowerCase().includes(search);
        const inPhone = (c.phone || "").toLowerCase().includes(search);
        const inCompany = (c.company || "").toLowerCase().includes(search);
        const inCity = (c.city || "").toLowerCase().includes(search);
        const inPlates = (c.plates || []).some((p) => p.toLowerCase().includes(search));
        return inName || inPhone || inCompany || inCity || inPlates;
      });
    }

    res.json({
      success: true,
      clients: enriched,
      metrics: {
        total_clients: source.length,
        total_spent_accumulated: enriched.reduce((sum, c) => sum + c.total_spent, 0),
        total_trucks_registered: [...new Set(enriched.flatMap((c) => c.plates))].length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener clientes",
      error: error.message,
    });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, phone, whatsapp, city, company, documento, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Nombre y teléfono son obligatorios" });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const wa = whatsapp || (cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`);

    const newClient = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: wa,
      city: (city || "Bogotá D.C.").trim(),
      company: (company || "Transportador Independiente").trim(),
      documento: (documento || "No especificado").trim(),
      notes: (notes || "").trim(),
      created_at: new Date().toISOString(),
    };

    memoryClients.unshift(newClient);

    // Guardar en MySQL de respaldo si estuviera activo
    try {
      await pool.query(
        "INSERT INTO clients (name, phone, whatsapp, city, company, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [newClient.name, newClient.phone, newClient.whatsapp, newClient.city, newClient.company, newClient.notes]
      );
    } catch (_) {}

    const enriched = enrichClientWithWorkOrders(newClient);

    res.status(201).json({
      success: true,
      message: `Cliente ${newClient.name} registrado con éxito en el CRM`,
      client: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear cliente",
      error: error.message,
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, whatsapp, city, company, documento, notes } = req.body;

    const index = memoryClients.findIndex((c) => c.id === parseInt(id, 10));
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }

    const current = memoryClients[index];
    const updated = {
      ...current,
      name: name ? name.trim() : current.name,
      phone: phone ? phone.trim() : current.phone,
      whatsapp: whatsapp ? whatsapp.trim() : current.whatsapp,
      city: city ? city.trim() : current.city,
      company: company ? company.trim() : current.company,
      documento: documento ? documento.trim() : current.documento,
      notes: notes !== undefined ? notes.trim() : current.notes,
    };

    memoryClients[index] = updated;

    const enriched = enrichClientWithWorkOrders(updated);

    res.json({
      success: true,
      message: "Datos de cliente actualizados correctamente",
      client: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando cliente",
      error: error.message,
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryClients.findIndex((c) => c.id === parseInt(id, 10));

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Cliente no encontrado" });
    }

    const removed = memoryClients.splice(index, 1)[0];

    res.json({
      success: true,
      message: `Cliente ${removed.name} retirado del CRM`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando cliente",
      error: error.message,
    });
  }
};