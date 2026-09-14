import dotenv from "dotenv";

dotenv.config();

// Configuración en memoria con fallback a variables de entorno
let telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
  enabled: true,
};

/**
 * Actualizar credenciales en tiempo de ejecución
 */
export const updateTelegramConfig = (config) => {
  telegramConfig = {
    ...telegramConfig,
    ...config,
  };
  return telegramConfig;
};

/**
 * Obtener estado actual de configuración
 */
export const getTelegramConfig = () => {
  return {
    botTokenConfigured: Boolean(telegramConfig.botToken),
    chatIdConfigured: Boolean(telegramConfig.chatId),
    enabled: telegramConfig.enabled,
    maskedToken: telegramConfig.botToken
      ? `${telegramConfig.botToken.substring(0, 6)}...${telegramConfig.botToken.slice(-4)}`
      : "No configurado",
    chatId: telegramConfig.chatId || "No configurado",
  };
};

/**
 * Enviar mensaje HTML a Telegram
 */
export const sendTelegramMessage = async (text, options = {}) => {
  const { botToken, chatId, enabled } = telegramConfig;

  if (!enabled) {
    return { success: false, reason: "Telegram deshabilitado" };
  }

  // Si no hay token configurado, operamos en modo simulado para desarrollo
  if (!botToken || !chatId) {
    console.log("\n=======================================================");
    console.log("📲 [TELEGRAM BOT SIMULADO - NOTIFICACIÓN MELLOS TRUCK]");
    console.log(text.replace(/<[^>]*>/g, "")); // limpiar tags para consola
    console.log("=======================================================\n");

    return {
      success: true,
      simulated: true,
      message: "Notificación registrada en consola (Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID para envío real)",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: options.disablePreview || false,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.warn("⚠️ Error enviando a Telegram:", data.description || "Respuesta no exitosa");
      return { success: false, error: data.description || "Error de Telegram API" };
    }

    console.log("✅ Notificación de Telegram enviada con éxito (ID: " + data.result?.message_id + ")");
    return { success: true, messageId: data.result?.message_id };
  } catch (error) {
    console.error("❌ Excepción al conectar con Telegram:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Notificación: Nueva Cotización Web Captada
 */
export const notifyNewQuote = async (quote) => {
  const text = `
🚛 <b>NUEVA COTIZACIÓN WEB — MELLOS TRUCK</b> 🛠️

👤 <b>Cliente:</b> ${quote.nombre || "Transportador"}
📞 <b>Teléfono:</b> ${quote.telefono || "No especificado"}
🚚 <b>Mula:</b> ${quote.marca || "Pesado"} ${quote.modelo || ""} [<b>${quote.placa || "SIN PLACA"}</b>]
🔧 <b>Servicio:</b> ${quote.servicio || "Modificación / Acero Inox"}
📝 <b>Detalles:</b> <i>${quote.mensaje || "Cotización express desde landing page"}</i>

📍 <i>Entra al panel administrativo para convertir a orden de taller.</i>
`;

  return sendTelegramMessage(text.trim());
};

/**
 * 2. Notificación: Alerta de Stock Crítico en Container
 */
export const notifyCriticalStock = async (product) => {
  const text = `
🚨 <b>ALERTA DE STOCK CRÍTICO — TIENDA CONTAINER</b> 📦

⚠️ <b>Pieza:</b> <b>${product.nombre}</b>
🏷️ <b>Categoría:</b> ${product.categoria || "Repuesto / Lujo"}
📉 <b>Stock en Bodega:</b> <b>${product.stock} unidad(es)</b>
🛑 <b>Límite Mínimo:</b> ${product.min_stock_alert} unidades
💰 <b>Precio Unitario:</b> $${(product.precio || 0).toLocaleString("es-CO")} COP

👉 <i>¡Pedir reposición a proveedor para evitar retrasos en el taller!</i>
`;

  return sendTelegramMessage(text.trim());
};

/**
 * 3. Notificación: Avance de Fase en el Taller
 */
export const notifyTruckStage = async (order, newStage) => {
  let emoji = "⚡";
  if (newStage === "Ingreso") emoji = "📋";
  if (newStage === "Taller") emoji = "⚙️";
  if (newStage === "Pintura") emoji = "🎨";
  if (newStage === "Terminado") emoji = "💎";
  if (newStage === "Entregado") emoji = "🚚";

  const isDelivered = newStage === "Entregado";
  const isFinished = newStage === "Terminado";

  const text = `
${emoji} <b>ACTUALIZACIÓN DE TALLER — MELLOS TRUCK</b> ${emoji}

🚛 <b>Mula:</b> <b>${order.placa}</b> (${order.marca} ${order.linea || ""})
👤 <b>Propietario:</b> ${order.cliente}
📍 <b>Nueva Fase:</b> <b>[${newStage.toUpperCase()}]</b>
📦 <b>Piezas Instaladas:</b> ${(order.items || []).length} piezas del Container
💰 <b>Costo Acumulado:</b> $${((order.costo_mano_obra || 0) + (order.costo_repuestos || 0)).toLocaleString("es-CO")} COP

${isDelivered ? "🏁 <b>¡Mula despachada formalmente a carretera!</b> 🚚💨" : ""}
${(isFinished || isDelivered) && order.slug ? `🌐 <b>Showroom 4K Disponible:</b> <a href="http://localhost:5174/galeria/${order.slug}">Ver Vitrina de la Nave</a>` : ""}
`;

  return sendTelegramMessage(text.trim());
};
