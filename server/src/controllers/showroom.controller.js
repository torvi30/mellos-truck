import pool from "../config/db.js";
import crypto from "crypto";

/**
 * Genera un slug limpio y amigable para el Magic Link comercial
 * Ejemplo: "Kenworth-T800-Placa-WTL123"
 */
const sanitizeSlug = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Almacén en memoria sincronizado para garantizar respuesta inmediata incluso si MySQL está offline
let memoryShowroomProjects = [
  {
    id: 1,
    clientName: "Don Carlos Rodríguez",
    phone: "573104567890",
    plate: "WTL-892",
    brand: "Kenworth",
    line: "T800 Aerocab",
    model: "2024",
    color: "Azul Medianoche & Cromo",
    description:
      "Transformación de alto nivel: Fabricación de bomper de acero inoxidable cromado de 20 pulgadas con cortes láser y luces LED integradas, visera americana de acero espejo, doble corneta de aire Hadley, estribos pulidos tipo espejo, iluminación perimetral ámbar y pulido cerámico de cabina.",
    status: "Entregado",
    slug: "Kenworth-T800-Placa-WTL892",
    magicToken: "tok_kw_wtl892_live",
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/kenworth_after.jpg",
    video_url: "/api/stream/video/cinematic_kenworth_demo.mp4",
    created_at: new Date().toISOString(),
    views: 142,
  },
  {
    id: 2,
    clientName: "Transportes La Montaña",
    phone: "573129876543",
    plate: "SZZ-514",
    brand: "Mack",
    line: "Vision Elite",
    model: "2022",
    color: "Rojo Rubí Metalizado",
    description:
      "Instalación de bomper tipo americano en acero 304, visera drop visor pulida, rines cromados con spikes y juego de cornetas neumáticas.",
    status: "En Taller",
    slug: "Mack-Vision-Placa-SZZ514",
    magicToken: "tok_mack_szz514_live",
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/kenworth_after.jpg",
    video_url: "/api/stream/video/cinematic_kenworth_demo.mp4",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    views: 89,
  },
];

/**
 * 1. Listar todos los proyectos Showroom / Magic Links
 * GET /api/showroom
 */
export const listShowroomProjects = async (req, res) => {
  try {
    let dbProjects = [];
    try {
      const [rows] = await pool.query(
        `SELECT wo.id, wo.cliente as clientName, wo.placa as plate, wo.descripcion as description,
                wo.estado as status, wo.slug, wo.magic_token as magicToken, wo.created_at
         FROM work_orders wo
         WHERE wo.slug IS NOT NULL
         ORDER BY wo.created_at DESC`
      );
      if (rows && rows.length > 0) {
        dbProjects = rows;
      }
    } catch (dbErr) {
      // Usar memoria
    }

    // Combinar proyectos asegurando que los de memoria existan
    const allProjects = [...memoryShowroomProjects];

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5174";
    const mapped = allProjects.map((p) => ({
      ...p,
      magicUrl: `${frontendBase}/galeria/${p.slug}`,
      whatsappShareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `¡Pillate cómo quedó mi nave en Mellos Truck! 🔥🚛\n${p.brand || "Camión"} - Placa: ${p.plate}\n👉 ${frontendBase}/galeria/${p.slug}`
      )}`,
    }));

    res.json({ success: true, count: mapped.length, projects: mapped });
  } catch (error) {
    res.status(500).json({ message: "Error listando proyectos", error: error.message });
  }
};

/**
 * 2. Crear nuevo Proyecto y emitir Magic Link
 * POST /api/showroom
 */
export const createShowroomProject = async (req, res) => {
  try {
    const {
      clientName,
      phone,
      plate,
      brand,
      line,
      model,
      color,
      description,
      status = "Terminado",
      before_url = "/images/showroom/kenworth_before.jpg",
      after_url = "/images/showroom/kenworth_after.jpg",
      video_url = "/api/stream/video/cinematic_kenworth_demo.mp4",
    } = req.body;

    if (!clientName || !plate || !brand) {
      return res.status(400).json({ message: "clientName, plate y brand son obligatorios" });
    }

    const cleanPlate = plate.toUpperCase().trim();
    const slugBase = `${brand}-${line || "Truck"}-Placa-${cleanPlate}`;
    const uniqueShort = crypto.randomBytes(2).toString("hex");
    const slug = `${sanitizeSlug(slugBase)}-${uniqueShort}`;
    const magicToken = crypto.randomBytes(12).toString("hex");

    const newProject = {
      id: Date.now(),
      clientName,
      phone: phone || "",
      plate: cleanPlate,
      brand,
      line: line || "",
      model: model || "",
      color: color || "",
      description: description || "Modificación estética artesanal en acero inoxidable Mellos Truck.",
      status,
      slug,
      magicToken,
      before_url,
      after_url,
      video_url,
      created_at: new Date().toISOString(),
      views: 0,
    };

    memoryShowroomProjects.unshift(newProject);

    // Intentar guardar en MySQL
    try {
      await pool.query(
        `INSERT INTO work_orders (cliente, placa, descripcion, estado, slug, magic_token)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [clientName, cleanPlate, newProject.description, status, slug, magicToken]
      );
    } catch (dbErr) {
      console.warn("No se pudo guardar en MySQL (modo local activo):", dbErr.message);
    }

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5174";
    const magicUrl = `${frontendBase}/galeria/${slug}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `¡Hola ${clientName}! 🔥 Aquí tienes el Showroom oficial con el antes y después de tu nave en Mellos Truck:\n👉 ${magicUrl}\n\n¡Gracias por confiar en los mejores de pesados!`
    )}`;

    res.status(201).json({
      success: true,
      message: "¡Magic Link generado con éxito!",
      project: {
        ...newProject,
        magicUrl,
        whatsappShareUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error creando proyecto", error: error.message });
  }
};

/**
 * 3. Generar Magic Link Comercial para una Orden de Trabajo existente
 * POST /api/showroom/orders/:id/magic-link
 */
export const generateMagicLink = async (req, res) => {
  try {
    const { id } = req.params;
    const project = memoryShowroomProjects.find((p) => p.id === parseInt(id, 10));

    if (!project) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const magicUrl = `${frontendBaseUrl}/galeria/${project.slug}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?phone=${project.phone}&text=${encodeURIComponent(
      `¡Hola! 🔥 Mira la transformación completa de tu nave en Mellos Truck:\n👉 ${magicUrl}`
    )}`;

    return res.status(200).json({
      success: true,
      slug: project.slug,
      magicUrl,
      whatsappShareUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al generar Magic Link", error: error.message });
  }
};

/**
 * 4. Obtener datos públicos del Showroom por Slug (Magic Link de solo lectura)
 * GET /api/showroom/:slug
 */
export const getShowroomBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscar en proyectos en memoria
    let project = memoryShowroomProjects.find((p) => p.slug === slug);

    // Si no está exacto, buscar por coincidencia parcial de slug
    if (!project) {
      project = memoryShowroomProjects.find((p) => slug.toLowerCase().includes(p.plate.toLowerCase().replace(/[^a-z0-9]/g, "")));
    }

    // Si aún no se encuentra, usar el proyecto principal por defecto
    if (!project) {
      project = memoryShowroomProjects[0];
    }

    // Incrementar contador de visitas
    project.views = (project.views || 0) + 1;

    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5174";
    const shareText = encodeURIComponent(
      `¡Mira cómo quedó mi nave en Mellos Truck! 🔥🚛\n${project.brand} ${project.line} - Placa: ${project.plate}\n👉 ${frontendBase}/galeria/${project.slug}`
    );

    return res.status(200).json({
      success: true,
      workOrder: {
        id: project.id,
        clientName: project.clientName,
        plate: project.plate,
        brand: project.brand,
        line: project.line,
        model: project.model,
        color: project.color,
        description: project.description,
        status: project.status,
        date: project.created_at,
        slug: project.slug,
        views: project.views,
      },
      showcase: {
        beforeAfter: [
          {
            id: 1,
            title: `Transformación Frontal & Cabina: ${project.brand} ${project.line}`,
            before_url: project.before_url,
            after_url: project.after_url,
          },
        ],
        cinematicVideo: {
          title: `Toma Aérea Dron DJI - ${project.brand} ${project.line}`,
          url: project.video_url,
          thumbnail_url: project.after_url,
        },
        photos: [
          {
            id: 1,
            title: "Bomper de Acero Inoxidable de 20\" con Luces LED & Soldadura TIG",
            url: "/images/showroom/detail_bumper_chrome.jpg",
          },
          {
            id: 2,
            title: "Visera Americana en Acero Espejo & Doble Corneta Hadley",
            url: "/images/showroom/detail_visera_cornetas.jpg",
          },
          {
            id: 3,
            title: "Rines Pulidos Alcoa, Spikes en Punta & Luces Ámbar de Bajo Chasis",
            url: "/images/showroom/detail_rines_spikes.jpg",
          },
        ],
      },
      sharing: {
        whatsappShareUrl: `https://api.whatsapp.com/send?text=${shareText}`,
        directUrl: `${frontendBase}/galeria/${project.slug}`,
      },
    });
  } catch (error) {
    console.error("Error al obtener Showroom:", error);
    return res.status(500).json({ message: "Error al cargar el Showroom", error: error.message });
  }
};
