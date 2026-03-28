import bcrypt from "bcryptjs";
import pool from "../config/db.js";

export const initAdmin = async () => {
  try {
    const [rows] = await pool.query("SELECT id FROM admins WHERE email = ? LIMIT 1", [
      "admin@mellostrucks.com"
    ]);

    if (rows.length > 0) {
      console.log("🔐 Admin por defecto ya existe");
      return;
    }

    const hashedPassword = await bcrypt.hash("123456789", 10);

    await pool.query(
      `
      INSERT INTO admins (name, email, password, role)
      VALUES (?, ?, ?, ?)
      `,
      ["Administrador Mellos", "admin@mellostrucks.com", hashedPassword, "admin"]
    );

    console.log("✅ Admin por defecto creado");
    console.log("📧 Email: admin@mellostrucks.com");
    console.log("🔑 Password: 123456789");
  } catch (error) {
    console.error("❌ Error creando admin inicial:", error.message);
  }
};