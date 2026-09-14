import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/landingConfig.json");

export const DEFAULT_LANDING_CONFIG = {
  whatsappNumber: "573104567890",
  whatsappDefaultMsg: "Hola Mellos Truck, quiero cotizar accesorios y trabajos de taller para mi camión",
  instagramUser: "@mellos_trucks",
  instagramUrl: "https://www.instagram.com/mellos_trucks/",
  locationText: "Fontibón Zona Industrial, Bogotá D.C. & Medellín, Colombia",

  announcementBar: {
    enabled: true,
    badgeText: "🔥 CUPOS LIMITADOS",
    message: "Fabricación artesanal de Bompers en Acero 304 con entrega prioritaria este mes.",
    buttonText: "Cotizar por WhatsApp ➔",
    link: "#cotizar",
  },

  hero: {
    badgeText: "LÍDERES EN MODIFICACIÓN DE PESADOS",
    headline: "POTENCIA, ACERO & PRESENCIA PARA TU TRACTOMULA",
    subtitle:
      "En Mellos Truck convertimos tu vehículo de carga pesada en una verdadera obra de arte en carretera. Fabricación artesanal de bompers en acero inoxidable, viseras americanas, iluminación LED y lujos que imponen respeto en cualquier ruta.",
    ctaPrimaryText: "⚡ Cotizar Mi Nave Ahora",
    ctaPrimaryLink: "#cotizar",
    ctaSecondaryText: "🎬 Explorar Showroom 4K",
    ctaSecondaryLink: "/galeria/Kenworth-T800-Placa-WTL892",
    featuredTruck: {
      tag: "PROYECTO DESTACADO",
      title: "Kenworth T800 Aerocab",
      specs: 'Bomper 20" • Visera Espejo • Doble Corneta',
      imageUrl: "/images/showroom/kenworth_after.jpg",
      magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
    },
  },

  metrics: [
    { value: "100% Acero", label: "Inoxidable Calidad 304" },
    { value: "+1,200", label: "Mulas Transformadas" },
    { value: "Garantía", label: "De Taller & Soldadura TIG" },
  ],

  beforeAfter: {
    subheading: "EL CAMBIO HABLA POR SÍ SOLO",
    title: "Intervención Real de Taller: Antes vs. Después",
    description:
      "Desliza la manija amarilla para ver la transformación de esta nave: desde su llegada con bomper de fábrica hasta la entrega con acero cromado tipo espejo y accesorios de lujo.",
    truckTitle: "Kenworth T800 • Placa WTL-892",
    truckDescription: "Transformación completa de estética, iluminación perimetral y bomper de acero inoxidable.",
    beforeImage: "/images/showroom/kenworth_before.jpg",
    afterImage: "/images/showroom/kenworth_after.jpg",
    beforeLabel: "ANTES (Llegada al taller)",
    afterLabel: "DESPUÉS (Mellos Truck)",
    projectLink: "/galeria/Kenworth-T800-Placa-WTL892",
  },
};

let memoryConfig = null;

// Cargar configuración al iniciar
const loadConfig = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    memoryConfig = JSON.parse(data);
  } catch {
    memoryConfig = { ...DEFAULT_LANDING_CONFIG };
  }
};
loadConfig();

// GET /api/settings/landing
export const getLandingConfig = async (req, res) => {
  try {
    if (!memoryConfig) {
      await loadConfig();
    }
    return res.json({
      success: true,
      config: memoryConfig,
    });
  } catch (error) {
    console.error("Error obteniendo configuración de landing:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la configuración",
      config: DEFAULT_LANDING_CONFIG,
    });
  }
};

// PUT /api/settings/landing
export const updateLandingConfig = async (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== "object") {
      return res.status(400).json({ success: false, message: "Datos de configuración inválidos" });
    }

    // Merge profundo para preservar llaves no especificadas
    memoryConfig = {
      ...DEFAULT_LANDING_CONFIG,
      ...memoryConfig,
      ...newConfig,
      announcementBar: {
        ...DEFAULT_LANDING_CONFIG.announcementBar,
        ...(memoryConfig?.announcementBar || {}),
        ...(newConfig.announcementBar || {}),
      },
      hero: {
        ...DEFAULT_LANDING_CONFIG.hero,
        ...(memoryConfig?.hero || {}),
        ...(newConfig.hero || {}),
        featuredTruck: {
          ...DEFAULT_LANDING_CONFIG.hero.featuredTruck,
          ...(memoryConfig?.hero?.featuredTruck || {}),
          ...(newConfig.hero?.featuredTruck || {}),
        },
      },
      beforeAfter: {
        ...DEFAULT_LANDING_CONFIG.beforeAfter,
        ...(memoryConfig?.beforeAfter || {}),
        ...(newConfig.beforeAfter || {}),
      },
      metrics: Array.isArray(newConfig.metrics) && newConfig.metrics.length > 0
        ? newConfig.metrics
        : memoryConfig?.metrics || DEFAULT_LANDING_CONFIG.metrics,
    };

    // Guardar en disco
    await fs.writeFile(DATA_FILE, JSON.stringify(memoryConfig, null, 2), "utf-8");

    return res.json({
      success: true,
      message: "¡Página principal actualizada con éxito!",
      config: memoryConfig,
    });
  } catch (error) {
    console.error("Error guardando configuración de landing:", error);
    return res.status(500).json({
      success: false,
      message: "Error al guardar la configuración: " + error.message,
    });
  }
};

// POST /api/settings/landing/reset
export const resetLandingConfig = async (req, res) => {
  try {
    memoryConfig = { ...DEFAULT_LANDING_CONFIG };
    await fs.writeFile(DATA_FILE, JSON.stringify(memoryConfig, null, 2), "utf-8");

    return res.json({
      success: true,
      message: "Configuración restablecida a los valores predeterminados",
      config: memoryConfig,
    });
  } catch (error) {
    console.error("Error restableciendo configuración de landing:", error);
    return res.status(500).json({
      success: false,
      message: "Error al restablecer la configuración",
    });
  }
};
