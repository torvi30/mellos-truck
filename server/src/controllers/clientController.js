import pool from "../config/db.js";

export const createClient = async (req, res) => {
  try {
    const { name, phone, whatsapp, city, company, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Nombre y teléfono son obligatorios" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO clients (name, phone, whatsapp, city, company, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, phone, whatsapp || null, city || null, company || null, notes || null]
    );

    res.status(201).json({
      message: "Cliente creado correctamente",
      clientId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cliente",
      error: error.message
    });
  }
};

export const getClients = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    let query = `
      SELECT *
      FROM clients
    `;
    let params = [];

    if (search) {
      query += `
        WHERE
          name LIKE ?
          OR phone LIKE ?
          OR company LIKE ?
          OR city LIKE ?
      `;
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener clientes",
      error: error.message
    });
  }
};