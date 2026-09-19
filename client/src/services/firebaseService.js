import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, isConfigured } from "../firebase.js";

// ============================================================================
// 1. DATOS INICIALES (SEED DATA - MELLOS TRUCK S.A.S.)
// ============================================================================

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
    sku: "BOMP-INOX-20-KW",
    precio: 3850000,
    stock: 4,
    min_stock_alert: 2,
    categoria: "Acero Inoxidable",
    imagen_url: "/images/showroom/detail_bumper_chrome.jpg",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-2",
    nombre: "Visera Americana Drop Visor Acero Espejo T800",
    sku: "VIS-AMER-KW-T800",
    precio: 1450000,
    stock: 6,
    min_stock_alert: 3,
    categoria: "Acero Inoxidable",
    imagen_url: "/images/showroom/detail_visera_cornetas.jpg",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-3",
    nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
    sku: "CORN-HADLEY-24V",
    precio: 980000,
    stock: 2,
    min_stock_alert: 3,
    categoria: "Escapes y Cornetas",
    imagen_url: "/images/showroom/detail_visera_cornetas.jpg",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-4",
    nombre: "Kit Iluminación LED Watermelon Ámbar IP68 (Pack x10)",
    sku: "LED-WML-AMB-10PK",
    precio: 320000,
    stock: 48,
    min_stock_alert: 15,
    categoria: "Iluminación",
    imagen_url: "/images/showroom/mack_truck_custom.jpg",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-5",
    nombre: 'Rines Forjados Alcoa 22.5" Pulidos Espejo',
    sku: "RIN-ALCOA-225-ESP",
    precio: 2400000,
    stock: 8,
    min_stock_alert: 4,
    categoria: "Lujos",
    imagen_url: "/images/showroom/detail_rines_spikes.jpg",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-6",
    nombre: "Juego Copas Spikes Cromadas en Punta (33mm)",
    sku: "ACC-SPIKE-33MM-SET",
    precio: 185000,
    stock: 15,
    min_stock_alert: 20,
    categoria: "Lujos",
    imagen_url: "/images/showroom/detail_rines_spikes.jpg",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_LANDING_CONFIG = {
  whatsappNumber: "573104567890",
  whatsappDefaultMsg: "Hola Mellos Truck, quiero cotizar accesorios y trabajos de taller para mi camión",
  instagramUser: "@mellos_trucks",
  instagramUrl: "https://www.instagram.com/mellos_trucks/",
  locationText: "Fontibón Zona Industrial, Bogotá D.C. & Medellín, Colombia",
  announcementBar: {
    enabled: true,
    badgeText: "🔥 CUPOS LIMITADOS",
    message: "Fabricación de Bompers en Acero 304 con entrega prioritaria este mes.",
    buttonText: "⚡ Cotizar Cupo de Taller ➔",
    link: "#cotizar",
  },
  hero: {
    badgeText: "★ TALLER DE MODIFICACIONES ARTESANALES",
    headline: "TRANSFORMAMOS TU MULA EN UNA LEYENDA DEL ASFALTO",
    subtitle:
      "Especialistas en acero inoxidable calidad 304, corte láser computarizado, viseras tipo espejo, bompers de lujo y tienda física en container.",
    ctaPrimaryText: "⚡ Cotizar Mi Nave Ahora",
    ctaPrimaryLink: "#cotizar",
    ctaSecondaryText: "🎬 Explorar Showroom 4K",
    ctaSecondaryLink: "/galeria/Kenworth-T800-Placa-WTL892",
    featuredTruck: {
      tag: "PROYECTO INSIGNIA • 2026",
      title: "Kenworth T800 Aerocab",
      specs: 'Bomper 20" corte láser • Visera espejo • Rines diamantados',
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
    title: "Estudio Cinemático de Transformaciones: Antes vs. Después",
    description:
      "Explora la transformación artesanal en alta definición: compara el estado de llegada al taller contra la entrega final con acabados en acero inoxidable 304 calidad espejo.",
    truckTitle: "Kenworth T800 • Placa WTL-892",
    truckDescription: "Transformación completa de estética, iluminación perimetral y bomper de acero inoxidable.",
    beforeImage: "/images/showroom/kenworth_before.jpg",
    afterImage: "/images/showroom/kenworth_after.jpg",
    beforeLabel: "ANTES (Llegada al taller)",
    afterLabel: "DESPUÉS (Mellos Truck)",
    projectLink: "/galeria/Kenworth-T800-Placa-WTL892",
    specs: [
      { icon: "⏱️", label: "Tiempo en Taller", value: "8 Días Hábiles" },
      { icon: "🛡️", label: "Garantía de Obra", value: "De por vida en soldadura TIG" },
      { icon: "💎", label: "Material Principal", value: "Inox 304 Grado Espejo" },
      { icon: "⚡", label: "Nivel de Modificación", value: "Stage 3 (Full Custom)" },
    ],
    hotspots: [
      {
        id: "bumper",
        tag: "BOMPER ARTESANAL",
        title: 'Bomper de 20" en Acero Inoxidable Calibre 10',
        subtitle: "Corte láser de precisión con acabado tipo espejo y acoples de aire ocultos.",
        image: "/images/showroom/detail_bumper_chrome.jpg",
        x: 28,
        y: 78,
      },
      {
        id: "visera",
        tag: "VISERA & CORNETAS",
        title: "Visera Americana Gangsta Calibre 10 & Cornetas",
        subtitle: "Acero inoxidable calidad 304 acompañada de cornetas Hadley neumáticas de 24V.",
        image: "/images/showroom/detail_visera_cornetas.jpg",
        x: 68,
        y: 20,
      },
      {
        id: "rines",
        tag: "RINES & COPAS SPIKES",
        title: "Rines Pulidos Diamantados con Copas Spikes",
        subtitle: "Tratamiento de pulido artesanal a espejo con tuercas cónicas de seguridad.",
        image: "/images/showroom/detail_rines_spikes.jpg",
        x: 48,
        y: 74,
      },
    ],
    projects: [
      {
        id: "kw-wtl892",
        name: "Kenworth T800",
        plate: "WTL-892",
        badge: "ACERO ESPEJO 304",
        beforeImage: "/images/showroom/kenworth_before.jpg",
        afterImage: "/images/showroom/kenworth_after.jpg",
        magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
        summary: 'Bomper artesanal de 20", visera tipo espejo y doble corneta Hadley neumática.',
      },
      {
        id: "mack-vision",
        name: "Mack Vision Elite",
        plate: "MKV-404",
        badge: "CUSTOM BLACK & GOLD",
        beforeImage: "/images/showroom/kenworth_before.jpg",
        afterImage: "/images/showroom/mack_truck_custom.jpg",
        magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
        summary: "Pintura tricapa negro profundo, visera aerodinámica e iluminación LED perimetral.",
      },
      {
        id: "peterbilt-389",
        name: "Peterbilt 389 Classic",
        plate: "PET-389",
        badge: "SHOW TRUCK AMERICANO",
        beforeImage: "/images/showroom/kenworth_before.jpg",
        afterImage: "/images/showroom/peterbilt_truck_custom.jpg",
        magicLink: "/galeria/Kenworth-T800-Placa-WTL892",
        summary: 'Trompa extendida clásica, chimeneas monstruo de 8" y visera estilo americano.',
      },
    ],
  },
};

export const INITIAL_WORK_ORDERS = [
  {
    id: "wo-1",
    cliente: "Don Carlos Rodríguez",
    telefono: "573104567890",
    placa: "WTL-892",
    marca: "Kenworth",
    linea: "T800 Aerocab",
    color: "Azul Medianoche & Cromo",
    descripcion: 'Fabricación de bomper de 20" con corte láser, visera americana espejo y cornetas.',
    estado: "Entregado",
    slug: "Kenworth-T800-Placa-WTL892",
    magic_token: "tok_kw_wtl892_live",
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/kenworth_after.jpg",
    fecha_ingreso: new Date(Date.now() - 7 * 86400000).toISOString(),
    fecha_estimada: new Date().toISOString(),
    costo_mano_obra: 2500000,
    costo_repuestos: 5940000,
    costo_total: 8440000,
    archivado: false,
    items: [
      {
        id: 101,
        productId: "prod-1",
        nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
        sku: "BOMP-INOX-20-KW",
        cantidad: 1,
        precio_unitario: 3850000,
        subtotal: 3850000,
      },
      {
        id: 102,
        productId: "prod-2",
        nombre: "Visera Americana Drop Visor Acero Espejo T800",
        sku: "VIS-AMER-KW-T800",
        cantidad: 1,
        precio_unitario: 1450000,
        subtotal: 1450000,
      },
      {
        id: 103,
        productId: "prod-4",
        nombre: "Kit Iluminación LED Watermelon Ámbar IP68 (Pack x10)",
        sku: "LED-WML-AMB-10PK",
        cantidad: 2,
        precio_unitario: 320000,
        subtotal: 640000,
      },
    ],
  },
  {
    id: "wo-2",
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
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/mack_truck_custom.jpg",
    fecha_ingreso: new Date(Date.now() - 3 * 86400000).toISOString(),
    fecha_estimada: new Date(Date.now() + 4 * 86400000).toISOString(),
    costo_mano_obra: 1800000,
    costo_repuestos: 1350000,
    costo_total: 3150000,
    archivado: false,
    items: [
      {
        id: 104,
        productId: "prod-3",
        nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
        sku: "CORN-HADLEY-24V",
        cantidad: 1,
        precio_unitario: 980000,
        subtotal: 980000,
      },
      {
        id: 105,
        productId: "prod-6",
        nombre: "Juego Copas Spikes Cromadas en Punta (33mm)",
        sku: "ACC-SPIKE-33MM-SET",
        cantidad: 2,
        precio_unitario: 185000,
        subtotal: 370000,
      },
    ],
  },
  {
    id: "wo-3",
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
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/detail_bumper_chrome.jpg",
    fecha_ingreso: new Date().toISOString(),
    fecha_estimada: new Date(Date.now() + 8 * 86400000).toISOString(),
    costo_mano_obra: 1200000,
    costo_repuestos: 0,
    costo_total: 1200000,
    archivado: false,
    items: [],
  },
  {
    id: "wo-4",
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
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/peterbilt_truck_custom.jpg",
    fecha_ingreso: new Date(Date.now() - 4 * 86400000).toISOString(),
    fecha_estimada: new Date(Date.now() + 2 * 86400000).toISOString(),
    costo_mano_obra: 3200000,
    costo_repuestos: 9600000,
    costo_total: 12800000,
    archivado: false,
    items: [
      {
        id: 106,
        productId: "prod-5",
        nombre: 'Rines Forjados Alcoa 22.5" Pulidos Espejo',
        sku: "RIN-ALCOA-225-ESP",
        cantidad: 4,
        precio_unitario: 2400000,
        subtotal: 9600000,
      },
    ],
  },
  {
    id: "wo-5",
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
    before_url: "/images/showroom/kenworth_before.jpg",
    after_url: "/images/showroom/detail_visera_cornetas.jpg",
    fecha_ingreso: new Date(Date.now() - 6 * 86400000).toISOString(),
    fecha_estimada: new Date().toISOString(),
    costo_mano_obra: 2900000,
    costo_repuestos: 4830000,
    costo_total: 7730000,
    archivado: false,
    items: [
      {
        id: 107,
        productId: "prod-1",
        nombre: 'Bomper de Acero Inoxidable 20" Corte Láser & LED',
        sku: "BOMP-INOX-20-KW",
        cantidad: 1,
        precio_unitario: 3850000,
        subtotal: 3850000,
      },
      {
        id: 108,
        productId: "prod-3",
        nombre: "Doble Corneta de Tren Neumática Hadley Cromo 24V",
        sku: "CORN-HADLEY-24V",
        cantidad: 1,
        precio_unitario: 980000,
        subtotal: 980000,
      },
    ],
  },
];

export const INITIAL_QUOTES = [
  {
    id: "q-1",
    client_name: "Don Carlos Rodríguez",
    phone: "573104567890",
    city: "Medellín",
    vehicle_type: "Kenworth T800",
    plate: "WTL-892",
    service: "Bomper de Acero Inoxidable (18-22 Pulgadas)",
    details: "Bomper con luces LED integradas y corte láser personalizado.",
    status: "convertida",
    created_at: new Date().toISOString(),
  },
  {
    id: "q-2",
    client_name: "Transportes El Cacique",
    phone: "573127894561",
    city: "Bucaramanga",
    vehicle_type: "Mack Vision",
    plate: "SZZ-514",
    service: "Visera Americana & Doble Corneta",
    details: "Instalación de visera drop visor pulida espejo.",
    status: "nueva",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "q-3",
    client_name: "Julián Morales",
    phone: "573159876543",
    city: "Cali",
    vehicle_type: "Freightliner Cascadia",
    plate: "UFX-119",
    service: "Rines Cromados & Spikes",
    details: "Cotización para juego completo de 10 rines Alcoa pulidos.",
    status: "contactado",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const INITIAL_CLIENTS = [
  {
    id: "c-1",
    name: "Don Carlos Rodríguez",
    phone: "573104567890",
    whatsapp: "573104567890",
    city: "Medellín",
    company: "Transportes El Cóndor",
    notes: "Cliente frecuente. Dueño de 3 tractomulas Kenworth.",
    created_at: new Date().toISOString(),
  },
  {
    id: "c-2",
    name: "Julián Morales",
    phone: "573159876543",
    whatsapp: "573159876543",
    city: "Cali",
    company: "Logística Pesada SAS",
    notes: "Interesado en personalización de bompers y cornetas.",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_VEHICLES = [
  {
    id: "v-1",
    client_id: "c-1",
    client_name: "Don Carlos Rodríguez",
    client_phone: "573104567890",
    plate: "WTL-892",
    brand: "Kenworth",
    line: "T800 Aerocab",
    model: "2024",
    vehicle_type: "Tractomula",
    color: "Azul Medianoche Metalizado",
    notes: 'Bomper de acero de 20" instalado, visera y cornetas.',
    created_at: new Date().toISOString(),
  },
  {
    id: "v-2",
    client_id: "c-2",
    client_name: "Julián Morales",
    client_phone: "573159876543",
    plate: "UFX-119",
    brand: "Freightliner",
    line: "Cascadia",
    model: "2023",
    vehicle_type: "Tractomula",
    color: "Blanco Diamante",
    notes: "Rines Alcoa pulidos con spikes en punta.",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SHOWROOM = [
  {
    id: "sr-1",
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
    video_url: "",
    created_at: new Date().toISOString(),
    views: 142,
  },
  {
    id: "sr-2",
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
    after_url: "/images/showroom/mack_truck_custom.jpg",
    video_url: "",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    views: 89,
  },
];

// ============================================================================
// 2. UTILIDADES DE PERSISTENCIA LOCAL / FALLBACK RESILIENTE
// ============================================================================

const getLocalCollection = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`mt_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return fallback;
};

const setLocalCollection = (key, data) => {
  try {
    localStorage.setItem(`mt_${key}`, JSON.stringify(data));
  } catch (e) {}
};

const sanitizeSlug = (text) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// ============================================================================
// 3. AUTO-SEEDER: INICIALIZACIÓN INTELIGENTE DE FIRESTORE
// ============================================================================

let seedingPromise = null;

export const seedInitialDataIfEmpty = async () => {
  if (!isConfigured || !db) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const prodSnap = await getDocs(collection(db, "products"));
      if (prodSnap.empty) {
        console.info("📦 Inicializando datos base en Cloud Firestore...");
        const batch = writeBatch(db);

        // 1. Productos
        INITIAL_PRODUCTS.forEach((p) => {
          const ref = doc(db, "products", p.id);
          batch.set(ref, p);
        });

        // 2. Órdenes de trabajo
        INITIAL_WORK_ORDERS.forEach((wo) => {
          const ref = doc(db, "work_orders", wo.id);
          batch.set(ref, wo);
        });

        // 3. Cotizaciones
        INITIAL_QUOTES.forEach((q) => {
          const ref = doc(db, "quotes", q.id);
          batch.set(ref, q);
        });

        // 4. Clientes
        INITIAL_CLIENTS.forEach((c) => {
          const ref = doc(db, "clients", c.id);
          batch.set(ref, c);
        });

        // 5. Vehículos
        INITIAL_VEHICLES.forEach((v) => {
          const ref = doc(db, "vehicles", v.id);
          batch.set(ref, v);
        });

        // 6. Showroom
        INITIAL_SHOWROOM.forEach((sr) => {
          const ref = doc(db, "showroom", sr.id);
          batch.set(ref, sr);
        });

        // 7. Configuración Landing
        const settingsRef = doc(db, "settings", "landing");
        batch.set(settingsRef, INITIAL_LANDING_CONFIG);

        await batch.commit();
        console.info("✅ Firestore inicializado con éxito con datos de Mellos Truck!");
      }
    } catch (err) {
      console.warn("Error en auto-seed Firestore:", err.message);
    }
  })();

  return seedingPromise;
};

// Ejecutar seeder en segundo plano al cargar
seedInitialDataIfEmpty().catch(() => {});

// ============================================================================
// 4. SERVICIOS DE PRODUCTOS & INVENTARIO CONTAINER
// ============================================================================

export const productsService = {
  async getAll({ category, search } = {}) {
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "products"));
        let products = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        if (category && category !== "Todos") {
          products = products.filter((p) => p.categoria === category);
        }
        if (search) {
          const q = search.toLowerCase();
          products = products.filter(
            (p) =>
              (p.nombre && p.nombre.toLowerCase().includes(q)) ||
              (p.sku && p.sku.toLowerCase().includes(q)) ||
              (p.categoria && p.categoria.toLowerCase().includes(q))
          );
        }
        const lowStockCount = products.filter((p) => p.stock <= p.min_stock_alert).length;
        return { success: true, count: products.length, lowStockCount, products };
      } catch (err) {
        console.warn("Fallo lectura Firestore products, usando local:", err.message);
      }
    }

    let products = getLocalCollection("products", INITIAL_PRODUCTS);
    if (category && category !== "Todos") {
      products = products.filter((p) => p.categoria === category);
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          (p.nombre && p.nombre.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.categoria && p.categoria.toLowerCase().includes(q))
      );
    }
    const lowStockCount = products.filter((p) => p.stock <= p.min_stock_alert).length;
    return { success: true, count: products.length, lowStockCount, products };
  },

  async create(data) {
    const newProduct = {
      ...data,
      precio: parseFloat(data.precio) || 0,
      stock: parseInt(data.stock, 10) || 0,
      min_stock_alert: parseInt(data.min_stock_alert, 10) || 5,
      sku: (data.sku || "").toUpperCase().trim(),
      created_at: new Date().toISOString(),
    };

    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "products"), newProduct);
        return { success: true, product: { ...newProduct, id: docRef.id } };
      } catch (err) {
        console.warn("Fallo create Firestore, usando local:", err.message);
      }
    }

    const products = getLocalCollection("products", INITIAL_PRODUCTS);
    const item = { ...newProduct, id: `prod-${Date.now()}` };
    products.unshift(item);
    setLocalCollection("products", products);
    return { success: true, product: item };
  },

  async update(id, data) {
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "products", String(id));
        await updateDoc(refDoc, data);
        return { success: true };
      } catch (err) {
        console.warn("Fallo update Firestore:", err.message);
      }
    }

    const products = getLocalCollection("products", INITIAL_PRODUCTS);
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data };
      setLocalCollection("products", products);
    }
    return { success: true };
  },

  async updateStock(id, delta) {
    const diff = parseInt(delta, 10) || 0;
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "products", String(id));
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const current = snap.data().stock || 0;
          const nextStock = Math.max(0, current + diff);
          await updateDoc(refDoc, { stock: nextStock });
          return { success: true, stock: nextStock };
        }
      } catch (err) {
        console.warn("Fallo updateStock Firestore:", err.message);
      }
    }

    const products = getLocalCollection("products", INITIAL_PRODUCTS);
    const prod = products.find((p) => String(p.id) === String(id));
    if (prod) {
      prod.stock = Math.max(0, (prod.stock || 0) + diff);
      setLocalCollection("products", products);
      return { success: true, stock: prod.stock, isCritical: prod.stock <= prod.min_stock_alert };
    }
    return { success: false, message: "Producto no encontrado" };
  },

  async delete(id) {
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, "products", String(id)));
        return { success: true };
      } catch (err) {}
    }
    const products = getLocalCollection("products", INITIAL_PRODUCTS).filter(
      (p) => String(p.id) !== String(id)
    );
    setLocalCollection("products", products);
    return { success: true };
  },
};

// ============================================================================
// 5. SERVICIOS DE ÓRDENES DE TRABAJO (TALLER KANBAN)
// ============================================================================

export const workOrdersService = {
  async getAll({ estado, search, include_archived, only_archived } = {}) {
    let orders = [];
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "work_orders"));
        orders = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      } catch (err) {
        console.warn("Fallo lectura Firestore work_orders:", err.message);
        orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
      }
    } else {
      orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    }

    if (only_archived === true || only_archived === "true") {
      orders = orders.filter((o) => o.archivado === true);
    } else if (include_archived !== true && include_archived !== "true") {
      orders = orders.filter((o) => o.archivado !== true);
    }

    if (estado && estado !== "Todos") {
      orders = orders.filter((o) => o.estado === estado);
    }

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          (o.placa && o.placa.toLowerCase().includes(q)) ||
          (o.cliente && o.cliente.toLowerCase().includes(q)) ||
          (o.marca && o.marca.toLowerCase().includes(q)) ||
          (o.linea && o.linea.toLowerCase().includes(q))
      );
    }

    const mapped = orders.map((o) => {
      const repuestos = (o.items || []).reduce(
        (acc, item) => acc + (parseFloat(item.subtotal) || 0),
        0
      );
      return {
        ...o,
        costo_repuestos: repuestos,
        costo_total: (parseFloat(o.costo_mano_obra) || 0) + repuestos,
        magicUrl: o.slug ? `/galeria/${o.slug}` : null,
      };
    });

    return { success: true, count: mapped.length, orders: mapped };
  },

  async create(data) {
    const cleanPlate = (data.placa || "").toUpperCase().trim();
    const newOrder = {
      cliente: data.cliente || "Cliente Particular",
      telefono: data.telefono || "",
      placa: cleanPlate,
      marca: data.marca || "Kenworth",
      linea: data.linea || "",
      color: data.color || "No especificado",
      descripcion: data.descripcion || "Ingreso a taller para adecuación y personalización artesanal.",
      estado: "Ingreso",
      slug: null,
      magic_token: null,
      before_url: data.before_url || "/images/showroom/kenworth_before.jpg",
      after_url: data.after_url || null,
      fecha_ingreso: new Date().toISOString(),
      fecha_estimada: data.fecha_estimada || new Date(Date.now() + 7 * 86400000).toISOString(),
      costo_mano_obra: parseFloat(data.costo_mano_obra) || 0,
      costo_repuestos: 0,
      costo_total: parseFloat(data.costo_mano_obra) || 0,
      archivado: false,
      items: [],
    };

    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "work_orders"), newOrder);
        return { success: true, order: { ...newOrder, id: docRef.id } };
      } catch (err) {
        console.warn("Fallo create work_order Firestore:", err.message);
      }
    }

    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    const item = { ...newOrder, id: `wo-${Date.now()}` };
    orders.unshift(item);
    setLocalCollection("work_orders", orders);
    return { success: true, order: item };
  },

  async updateStatus(id, estado) {
    const updateData = { estado };

    if (estado === "Terminado" || estado === "Entregado") {
      updateData.fecha_entrega = new Date().toISOString();
    }

    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "work_orders", String(id));
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const current = snap.data();
          if ((estado === "Terminado" || estado === "Entregado") && !current.slug) {
            const slugBase = `${current.marca || "Truck"}-${current.linea || "Custom"}-Placa-${current.placa || id}`;
            updateData.slug = `${sanitizeSlug(slugBase)}-${Date.now().toString(36).slice(-4)}`;
            updateData.magic_token = `tok_${Date.now().toString(36)}`;
          }
          await updateDoc(refDoc, updateData);
          return { success: true, order: { ...current, ...updateData } };
        }
      } catch (err) {
        console.warn("Fallo updateStatus Firestore:", err.message);
      }
    }

    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    const idx = orders.findIndex((o) => String(o.id) === String(id));
    if (idx !== -1) {
      if ((estado === "Terminado" || estado === "Entregado") && !orders[idx].slug) {
        const slugBase = `${orders[idx].marca || "Truck"}-${orders[idx].linea || "Custom"}-Placa-${orders[idx].placa || id}`;
        updateData.slug = `${sanitizeSlug(slugBase)}-${Date.now().toString(36).slice(-4)}`;
        updateData.magic_token = `tok_${Date.now().toString(36)}`;
      }
      orders[idx] = { ...orders[idx], ...updateData };
      setLocalCollection("work_orders", orders);
      return { success: true, order: orders[idx] };
    }
    return { success: false, message: "Orden no encontrada" };
  },

  async assignItem(orderId, productId, cantidad = 1) {
    const qty = parseInt(cantidad, 10) || 1;
    // 1. Obtener producto para verificar y descontar stock
    const { products } = await productsService.getAll();
    const product = products.find((p) => String(p.id) === String(productId));

    if (!product) {
      throw new Error("Producto no encontrado en inventario");
    }
    if (product.stock < qty) {
      throw new Error(`Stock insuficiente: solo quedan ${product.stock} unidades de ${product.nombre}`);
    }

    // 2. Descontar stock
    await productsService.updateStock(productId, -qty);

    // 3. Asignar pieza a la orden
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "work_orders", String(orderId));
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const order = snap.data();
          const items = order.items || [];
          const existingIdx = items.findIndex((it) => String(it.productId) === String(productId));

          if (existingIdx !== -1) {
            items[existingIdx].cantidad += qty;
            items[existingIdx].subtotal = items[existingIdx].cantidad * items[existingIdx].precio_unitario;
          } else {
            items.push({
              id: Date.now(),
              productId: product.id,
              nombre: product.nombre,
              sku: product.sku,
              cantidad: qty,
              precio_unitario: product.precio,
              subtotal: product.precio * qty,
            });
          }

          const repuestos = items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0);
          const total = (parseFloat(order.costo_mano_obra) || 0) + repuestos;

          await updateDoc(refDoc, {
            items,
            costo_repuestos: repuestos,
            costo_total: total,
          });

          return { success: true, order: { ...order, items, costo_repuestos: repuestos, costo_total: total } };
        }
      } catch (err) {
        console.warn("Fallo assignItem Firestore:", err.message);
      }
    }

    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    const idx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (idx !== -1) {
      const order = orders[idx];
      order.items = order.items || [];
      const existing = order.items.find((it) => String(it.productId) === String(productId));
      if (existing) {
        existing.cantidad += qty;
        existing.subtotal = existing.cantidad * existing.precio_unitario;
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
      setLocalCollection("work_orders", orders);
      return { success: true, order };
    }
    return { success: false, message: "Orden no encontrada" };
  },

  async removeItem(orderId, itemId) {
    // 1. Obtener la orden para saber qué producto e itemId reintegrar
    let orderToUpdate = null;
    let removedItem = null;

    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "work_orders", String(orderId));
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const order = snap.data();
          const items = order.items || [];
          const idx = items.findIndex((it) => String(it.id) === String(itemId) || String(it.productId) === String(itemId));
          if (idx !== -1) {
            removedItem = items[idx];
            items.splice(idx, 1);
            const repuestos = items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0);
            const total = (parseFloat(order.costo_mano_obra) || 0) + repuestos;
            await updateDoc(refDoc, { items, costo_repuestos: repuestos, costo_total: total });
            if (removedItem) {
              await productsService.updateStock(removedItem.productId, removedItem.cantidad);
            }
            return { success: true };
          }
        }
      } catch (err) {
        console.warn("Fallo removeItem Firestore:", err.message);
      }
    }

    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    const oIdx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (oIdx !== -1) {
      const items = orders[oIdx].items || [];
      const iIdx = items.findIndex((it) => String(it.id) === String(itemId) || String(it.productId) === String(itemId));
      if (iIdx !== -1) {
        removedItem = items[iIdx];
        items.splice(iIdx, 1);
        setLocalCollection("work_orders", orders);
        if (removedItem) {
          await productsService.updateStock(removedItem.productId, removedItem.cantidad);
        }
        return { success: true };
      }
    }
    return { success: false, message: "Pieza no encontrada en la orden" };
  },

  async update(id, data) {
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, "work_orders", String(id)), data);
        return { success: true };
      } catch (err) {}
    }
    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS);
    const idx = orders.findIndex((o) => String(o.id) === String(id));
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...data };
      setLocalCollection("work_orders", orders);
    }
    return { success: true };
  },

  async toggleArchive(id, archivado) {
    const isArchived = archivado !== undefined ? Boolean(archivado) : true;
    return this.update(id, {
      archivado: isArchived,
      fecha_archivado: isArchived ? new Date().toISOString() : null,
    });
  },

  async delete(id) {
    if (isConfigured && db) {
      try {
        await deleteDoc(doc(db, "work_orders", String(id)));
        return { success: true };
      } catch (err) {}
    }
    const orders = getLocalCollection("work_orders", INITIAL_WORK_ORDERS).filter(
      (o) => String(o.id) !== String(id)
    );
    setLocalCollection("work_orders", orders);
    return { success: true };
  },
};

// ============================================================================
// 6. SERVICIOS DE COTIZACIONES (QUOTES)
// ============================================================================

export const quotesService = {
  async getAll() {
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "quotes"));
        const quotes = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        return quotes;
      } catch (err) {
        console.warn("Fallo quotes Firestore:", err.message);
      }
    }
    return getLocalCollection("quotes", INITIAL_QUOTES);
  },

  async create(data) {
    const newQuote = {
      ...data,
      status: "nueva",
      created_at: new Date().toISOString(),
    };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "quotes"), newQuote);
        return { quoteId: docRef.id, message: "Cotización registrada con éxito en Firebase" };
      } catch (err) {
        console.warn("Fallo create quote Firestore:", err.message);
      }
    }
    const quotes = getLocalCollection("quotes", INITIAL_QUOTES);
    const item = { ...newQuote, id: `q-${Date.now()}` };
    quotes.unshift(item);
    setLocalCollection("quotes", quotes);
    return { quoteId: item.id, message: "Cotización registrada localmente" };
  },

  async updateStatus(id, status) {
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, "quotes", String(id)), { status });
        return { success: true };
      } catch (err) {}
    }
    const quotes = getLocalCollection("quotes", INITIAL_QUOTES);
    const idx = quotes.findIndex((q) => String(q.id) === String(id));
    if (idx !== -1) {
      quotes[idx].status = status;
      setLocalCollection("quotes", quotes);
    }
    return { success: true };
  },

  async convertToWorkshop(id, costoManoObra = 2000000) {
    const quotes = await this.getAll();
    const quote = quotes.find((q) => String(q.id) === String(id));
    if (!quote) throw new Error("Cotización no encontrada");

    // Crear orden de trabajo directamente en el taller Kanban
    const orderRes = await workOrdersService.create({
      cliente: quote.client_name,
      telefono: quote.phone,
      placa: quote.plate || "POR-ASIGNAR",
      marca: quote.vehicle_type?.split(" ")[0] || "Kenworth",
      linea: quote.vehicle_type || "T800",
      descripcion: `Cotización convertida: ${quote.service || ""} - ${quote.details || ""}`,
      costo_mano_obra: costoManoObra,
    });

    await this.updateStatus(id, "convertida");

    // También guardar como cliente si no existe
    await clientsService.create({
      name: quote.client_name,
      phone: quote.phone,
      whatsapp: quote.phone,
      city: quote.city || "Colombia",
      company: "Transportes",
      notes: `Generado desde cotización de mula ${quote.vehicle_type || ""}`,
    }).catch(() => {});

    return {
      success: true,
      order: orderRes.order,
      message: "¡Cotización convertida a orden de trabajo en patio con éxito!",
    };
  },
};

// ============================================================================
// 7. SERVICIOS DE CLIENTES & VEHÍCULOS
// ============================================================================

export const clientsService = {
  async getAll(search = "") {
    let list = [];
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "clients"));
        list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      } catch (err) {
        list = getLocalCollection("clients", INITIAL_CLIENTS);
      }
    } else {
      list = getLocalCollection("clients", INITIAL_CLIENTS);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async create(data) {
    const item = { ...data, created_at: new Date().toISOString() };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "clients"), item);
        return { clientId: docRef.id, message: "Cliente guardado en Firebase" };
      } catch (e) {}
    }
    const list = getLocalCollection("clients", INITIAL_CLIENTS);
    const newC = { ...item, id: `c-${Date.now()}` };
    list.unshift(newC);
    setLocalCollection("clients", list);
    return { clientId: newC.id, message: "Cliente guardado" };
  },

  async update(id, data) {
    if (isConfigured && db) {
      try {
        await updateDoc(doc(db, "clients", String(id)), data);
        return { success: true };
      } catch (e) {}
    }
    const list = getLocalCollection("clients", INITIAL_CLIENTS);
    const idx = list.findIndex((c) => String(c.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocalCollection("clients", list);
    }
    return { success: true };
  },
};

export const vehiclesService = {
  async getAll(search = "") {
    let list = [];
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "vehicles"));
        list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      } catch (err) {
        list = getLocalCollection("vehicles", INITIAL_VEHICLES);
      }
    } else {
      list = getLocalCollection("vehicles", INITIAL_VEHICLES);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          (v.plate && v.plate.toLowerCase().includes(q)) ||
          (v.brand && v.brand.toLowerCase().includes(q)) ||
          (v.client_name && v.client_name.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async create(data) {
    const item = {
      ...data,
      plate: (data.plate || "").toUpperCase().trim(),
      created_at: new Date().toISOString(),
    };
    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "vehicles"), item);
        return { vehicleId: docRef.id, message: "Vehículo registrado en Firebase" };
      } catch (e) {}
    }
    const list = getLocalCollection("vehicles", INITIAL_VEHICLES);
    const newV = { ...item, id: `v-${Date.now()}` };
    list.unshift(newV);
    setLocalCollection("vehicles", list);
    return { vehicleId: newV.id, message: "Vehículo registrado" };
  },
};

// ============================================================================
// 8. SERVICIOS DE SHOWROOM & MAGIC LINKS
// ============================================================================

export const showroomService = {
  async getAll() {
    let list = [];
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "showroom"));
        list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      } catch (e) {
        list = getLocalCollection("showroom", INITIAL_SHOWROOM);
      }
    } else {
      list = getLocalCollection("showroom", INITIAL_SHOWROOM);
    }

    const mapped = list.map((p) => ({
      ...p,
      magicUrl: `/galeria/${p.slug}`,
      whatsappShareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `¡Pillate cómo quedó mi nave en Mellos Truck! 🔥🚛\n${p.brand || "Camión"} - Placa: ${p.plate}\n👉 ${window.location.origin}/galeria/${p.slug}`
      )}`,
    }));
    return { success: true, count: mapped.length, projects: mapped };
  },

  async getBySlug(slug) {
    const { projects } = await this.getAll();
    let project = projects.find((p) => p.slug === slug);
    if (!project) {
      project = projects.find((p) => slug.toLowerCase().includes((p.plate || "").toLowerCase().replace(/[^a-z0-9]/g, "")));
    }
    if (!project) {
      project = projects[0] || INITIAL_SHOWROOM[0];
    }

    const shareText = encodeURIComponent(
      `¡Mira la transformación de mi nave en Mellos Truck! 🔥🚛\n${project.brand} ${project.line || ""} - Placa: ${project.plate}\n👉 ${window.location.origin}/galeria/${project.slug}`
    );

    return {
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
        views: (project.views || 0) + 1,
      },
      showcase: {
        beforeAfter: [
          {
            id: 1,
            title: `Transformación Frontal & Cabina: ${project.brand} ${project.line || ""}`,
            before_url: project.before_url,
            after_url: project.after_url,
          },
        ],
        cinematicVideo: {
          title: `Toma Aérea Dron DJI - ${project.brand} ${project.line || ""}`,
          url: project.video_url || "",
          thumbnail_url: project.after_url,
        },
        photos: [
          {
            id: 1,
            title: 'Bomper de Acero Inoxidable de 20" con Luces LED & Soldadura TIG',
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
        directUrl: `${window.location.origin}/galeria/${project.slug}`,
      },
    };
  },

  async create(data) {
    const cleanPlate = (data.plate || "").toUpperCase().trim();
    const slugBase = `${data.brand}-${data.line || "Truck"}-Placa-${cleanPlate}`;
    const slug = `${sanitizeSlug(slugBase)}-${Date.now().toString(36).slice(-4)}`;
    const magicToken = `tok_${Date.now().toString(36)}`;

    const newProject = {
      ...data,
      plate: cleanPlate,
      slug,
      magicToken,
      created_at: new Date().toISOString(),
      views: 0,
    };

    if (isConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, "showroom"), newProject);
        return { success: true, project: { ...newProject, id: docRef.id } };
      } catch (e) {}
    }

    const list = getLocalCollection("showroom", INITIAL_SHOWROOM);
    const item = { ...newProject, id: `sr-${Date.now()}` };
    list.unshift(item);
    setLocalCollection("showroom", list);
    return { success: true, project: item };
  },
};

// ============================================================================
// 9. SERVICIOS DE CONFIGURACIÓN DE PORTADA (LANDING CMS)
// ============================================================================

export const settingsService = {
  async getLanding() {
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "settings", "landing");
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          return { success: true, config: snap.data() };
        }
      } catch (err) {
        console.warn("Fallo settings Firestore:", err.message);
      }
    }
    const local = getLocalCollection("settings_landing", INITIAL_LANDING_CONFIG);
    return { success: true, config: local };
  },

  async updateLanding(data) {
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "settings", "landing");
        await setDoc(refDoc, data, { merge: true });
        return { success: true, config: data };
      } catch (err) {}
    }
    setLocalCollection("settings_landing", data);
    return { success: true, config: data };
  },

  async resetLanding() {
    if (isConfigured && db) {
      try {
        const refDoc = doc(db, "settings", "landing");
        await setDoc(refDoc, INITIAL_LANDING_CONFIG);
        return { success: true, config: INITIAL_LANDING_CONFIG };
      } catch (err) {}
    }
    setLocalCollection("settings_landing", INITIAL_LANDING_CONFIG);
    return { success: true, config: INITIAL_LANDING_CONFIG };
  },
};

// ============================================================================
// 10. SERVICIOS DE STORAGE & GALERÍA MULTIMEDIA
// ============================================================================

export const storageService = {
  async uploadFile(file, category = "catalog", onProgress) {
    if (isConfigured && storage) {
      try {
        const ext = file.name.split(".").pop();
        const path = `gallery/${category}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              // Guardar registro en Firestore colección gallery
              if (db) {
                await addDoc(collection(db, "gallery"), {
                  name: file.name,
                  category,
                  url: downloadURL,
                  created_at: new Date().toISOString(),
                });
              }
              resolve({ success: true, url: downloadURL, name: file.name });
            }
          );
        });
      } catch (err) {
        console.warn("Fallo subida Firebase Storage, usando modo local preview:", err.message);
      }
    }

    // Modo local / Fallback con DataURL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        resolve({
          success: true,
          url: dataUrl,
          name: file.name,
          message: "Subida simulada en modo local",
        });
      };
      reader.readAsDataURL(file);
    });
  },

  async getGallery() {
    let items = [];
    if (isConfigured && db) {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        items = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      } catch (e) {}
    }

    return {
      catalog: [
        { name: 'Bomper de Acero Inoxidable 20"', url: "/images/showroom/detail_bumper_chrome.jpg", category: "catalog" },
        { name: "Visera Americana Espejo & Cornetas", url: "/images/showroom/detail_visera_cornetas.jpg", category: "catalog" },
        { name: "Rines Alcoa con Spikes", url: "/images/showroom/detail_rines_spikes.jpg", category: "catalog" },
        ...items.filter((i) => i.category === "catalog"),
      ],
      vehicles: [
        { name: "Kenworth T800 Personalizada", url: "/images/showroom/kenworth_after.jpg", category: "vehicles" },
        { name: "Mack Vision Elite Custom", url: "/images/showroom/mack_truck_custom.jpg", category: "vehicles" },
        { name: "Peterbilt 389 Show Truck", url: "/images/showroom/peterbilt_truck_custom.jpg", category: "vehicles" },
        ...items.filter((i) => i.category === "vehicles"),
      ],
      videos: [
        { name: "Vuelo Dron Kenworth T800", url: "" },
        ...items.filter((i) => i.category === "videos"),
      ],
    };
  },
};
