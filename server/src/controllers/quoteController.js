import pool from "../config/db.js";

export const createQuote = async (req, res) => {
  try {
    const {
      client_name,
      phone,
      city,
      vehicle_type,
      plate,
      service,
      details
    } = req.body;

    if (!client_name || !phone || !city || !vehicle_type || !service || !details) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO quotes
      (client_name, phone, city, vehicle_type, plate, service, details, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'nueva')
      `,
      [client_name, phone, city, vehicle_type, plate || null, service, details]
    );

    res.status(201).json({
      message: "Cotización guardada correctamente",
      quoteId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al guardar cotización",
      error: error.message
    });
  }
};

export const getQuotes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM quotes
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cotizaciones",
      error: error.message
    });
  }
};

export const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "nueva",
      "contactado",
      "en revision",
      "cotizada",
      "aprobada",
      "rechazada",
      "convertida"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const [result] = await pool.query(
      "UPDATE quotes SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar estado",
      error: error.message
    });
  }
};

export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM quotes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cotización no encontrada" });
    }

    res.json({ message: "Cotización eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar cotización",
      error: error.message
    });
  }
};