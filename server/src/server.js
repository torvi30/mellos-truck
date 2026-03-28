import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import { initAdmin } from "./utils/initAdmin.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL conectado");
    connection.release();

    await initAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error.message);
  }
};

startServer();