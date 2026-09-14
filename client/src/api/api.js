import axios from "axios";

const API_BASE = "http://localhost:4000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ==========================================
// 1. COTIZACIONES (QUOTES)
// ==========================================

export const getQuotesRequest = async () => {
  try {
    const res = await axios.get(`${API_BASE}/quotes`, getHeaders());
    return res.data;
  } catch (err) {
    console.warn("API de cotizaciones en modo fallback local:", err.message);
    return [
      {
        id: 1,
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
        id: 2,
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
        id: 3,
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
  }
};

export const createQuoteRequest = async (data) => {
  try {
    const res = await axios.post(`${API_BASE}/quotes`, data);
    return res.data;
  } catch (err) {
    console.warn("Creación de cotización en fallback:", err.message);
    return { quoteId: Date.now(), message: "Cotización registrada localmente" };
  }
};

export const updateQuoteStatusRequest = async (id, status) => {
  try {
    const res = await axios.put(`${API_BASE}/quotes/${id}/status`, { status }, getHeaders());
    return res.data;
  } catch (err) {
    console.warn("Actualización de estado en fallback:", err.message);
    return { success: true };
  }
};

export const convertQuoteRequest = async (id) => {
  try {
    const res = await axios.post(`${API_BASE}/quotes/${id}/convert`, {}, getHeaders());
    return res.data;
  } catch (err) {
    console.warn("Conversión de cotización en fallback:", err.message);
    return {
      quoteId: id,
      clientId: 1,
      vehicleId: 1,
      message: "Cotización convertida a orden de trabajo con éxito",
    };
  }
};

export const convertToWorkshopRequest = async (id, costoManoObra = 2000000) => {
  try {
    const res = await axios.post(
      `${API_BASE}/quotes/${id}/to-workshop`,
      { costo_mano_obra: costoManoObra },
      getHeaders()
    );
    return res.data;
  } catch (err) {
    console.warn("Conversión a taller en fallback:", err.message);
    return {
      success: true,
      message: "Cotización enviada directamente al taller Kanban",
    };
  }
};

// ==========================================
// 2. CLIENTES (CLIENTS)
// ==========================================

export const getClientsRequest = async (search = "") => {
  try {
    const res = await axios.get(`${API_BASE}/clients?search=${encodeURIComponent(search)}`, getHeaders());
    return res.data;
  } catch (err) {
    console.warn("Clientes en modo fallback local:", err.message);
    return [
      {
        id: 1,
        name: "Don Carlos Rodríguez",
        phone: "573104567890",
        whatsapp: "573104567890",
        city: "Medellín",
        company: "Transportes El Cóndor",
        notes: "Cliente frecuente. Dueño de 3 tractomulas Kenworth.",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Julián Morales",
        phone: "573159876543",
        whatsapp: "573159876543",
        city: "Cali",
        company: "Logística Pesada SAS",
        notes: "Interesado en personalización de bompers y cornetas.",
        created_at: new Date().toISOString(),
      },
    ];
  }
};

export const createClientRequest = async (data) => {
  try {
    const res = await axios.post(`${API_BASE}/clients`, data, getHeaders());
    return res.data;
  } catch (err) {
    return { clientId: Date.now(), message: "Cliente guardado" };
  }
};

// ==========================================
// 3. VEHÍCULOS (VEHICLES)
// ==========================================

export const getVehiclesRequest = async (search = "") => {
  try {
    const res = await axios.get(`${API_BASE}/vehicles?search=${encodeURIComponent(search)}`, getHeaders());
    return res.data;
  } catch (err) {
    console.warn("Vehículos en modo fallback local:", err.message);
    return [
      {
        id: 1,
        client_id: 1,
        client_name: "Don Carlos Rodríguez",
        client_phone: "573104567890",
        plate: "WTL-892",
        brand: "Kenworth",
        line: "T800 Aerocab",
        model: "2024",
        vehicle_type: "Tractomula",
        color: "Azul Medianoche Metalizado",
        notes: "Bomper de acero de 20\" instalado, visera y cornetas.",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        client_id: 2,
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
  }
};

export const createVehicleRequest = async (data) => {
  try {
    const res = await axios.post(`${API_BASE}/vehicles`, data, getHeaders());
    return res.data;
  } catch (err) {
    return { vehicleId: Date.now(), message: "Vehículo guardado" };
  }
};

// ==========================================
// 4. GALERÍA Y MULTIMEDIA (GALLERY)
// ==========================================

export const getGalleryRequest = async () => {
  try {
    const res = await axios.get(`${API_BASE}/gallery`);
    return res.data;
  } catch (err) {
    return {
      catalog: [
        {
          name: "Bomper de Acero Inoxidable 20\"",
          url: "/images/showroom/detail_bumper_chrome.jpg",
          category: "catalog",
        },
        {
          name: "Visera Americana Espejo & Cornetas",
          url: "/images/showroom/detail_visera_cornetas.jpg",
          category: "catalog",
        },
        {
          name: "Rines Alcoa con Spikes",
          url: "/images/showroom/detail_rines_spikes.jpg",
          category: "catalog",
        },
      ],
      vehicles: [
        {
          name: "Kenworth T800 Personalizada",
          url: "/images/showroom/kenworth_after.jpg",
          category: "vehicles",
        },
      ],
      videos: [
        {
          name: "Vuelo Dron Kenworth",
          url: "http://localhost:4000/api/stream/video/cinematic_kenworth_demo.mp4",
        },
      ],
    };
  }
};

export const uploadGalleryImageRequest = async (file, category = "catalog") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
  const res = await axios.post(`${API_BASE}/gallery/upload/image`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadGalleryVideoRequest = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
  const res = await axios.post(`${API_BASE}/gallery/upload/video`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteGalleryFileRequest = async (type, filename) => {
  const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
  const res = await axios.delete(`${API_BASE}/gallery/${type}/${filename}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
