import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import { initAdmin } from "./utils/initAdmin.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL conectado exitosamente");
    connection.release();
    await initAdmin();
  } catch (error) {
    console.warn("⚠️ Advertencia: MySQL no está disponible aún (" + error.message + "). El servidor Express se iniciará en modo resiliente para Streaming y Showroom.");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Mellos Truck corriendo en http://localhost:${PORT}`);
  });
};

startServer();