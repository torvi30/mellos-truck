import pool from "../config/db.js";

export const createVehicle = async (req, res) => {
  try {
    const {
      client_id,
      plate,
      brand,
      line,
      model,
      vehicle_type,
      color,
      notes
    } = req.body;

    if (!client_id || !plate || !brand || !vehicle_type) {
      return res.status(400).json({
        message: "client_id, plate, brand y vehicle_type son obligatorios"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO vehicles
      (client_id, plate, brand, line, model, vehicle_type, color, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [client_id, plate, brand, line || null, model || null, vehicle_type, color || null, notes || null]
    );

    res.status(201).json({
      message: "Vehículo creado correctamente",
      vehicleId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear vehículo",
      error: error.message
    });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";

    let query = `
      SELECT
        v.*,
        c.name AS client_name,
        c.phone AS client_phone
      FROM vehicles v
      INNER JOIN clients c ON v.client_id = c.id
    `;
    let params = [];

    if (search) {
      query += `
        WHERE
          v.plate LIKE ?
          OR v.brand LIKE ?
          OR v.line LIKE ?
          OR c.name LIKE ?
      `;
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }

    query += " ORDER BY v.created_at DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener vehículos",
      error: error.message
    });
  }
};