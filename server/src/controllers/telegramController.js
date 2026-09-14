import {
  getTelegramConfig,
  updateTelegramConfig,
  sendTelegramMessage,
} from "../services/telegramService.js";

export const getTelegramStatus = async (req, res) => {
  try {
    const config = getTelegramConfig();
    res.json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al consultar estado de Telegram", error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { botToken, chatId, enabled } = req.body;
    const updated = updateTelegramConfig({
      ...(botToken !== undefined && { botToken }),
      ...(chatId !== undefined && { chatId }),
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
    });

    res.json({
      success: true,
      message: "Configuración de Telegram actualizada con éxito",
      config: getTelegramConfig(),
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar configuración", error: error.message });
  }
};

export const sendTestAlert = async (req, res) => {
  try {
    const testMessage = `
🚛 <b>PRUEBA DE CONEXIÓN TELEGRAM — MELLOS TRUCK</b> 🛠️

✅ El bot de notificaciones está vinculado correctamente al taller.
📅 <b>Fecha:</b> ${new Date().toLocaleString("es-CO")}
🔔 <i>A partir de ahora recibirás alertas automáticas de nuevas cotizaciones, avances de mulas y stock crítico del Container.</i>
`;

    const result = await sendTelegramMessage(testMessage.trim());

    res.json({
      success: result.success,
      result,
      message: result.simulated
        ? "Prueba simulada en la consola del servidor (Configura tu TOKEN y Chat ID para entrega en celular)"
        : "¡Mensaje de prueba enviado exitosamente a tu Telegram!",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al enviar mensaje de prueba", error: error.message });
  }
};
