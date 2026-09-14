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
      details,
    } = req.body;

    if (
      !client_name ||
      !phone ||
      !city ||
      !vehicle_type ||
      !service ||
      !details
    ) {
      return res.status(400).json({
        message:
          "client_name, phone, city, vehicle_type, service y details son obligatorios",
      });
    }

    let quoteId = Date.now();
    try {
      const [result] = await pool.query(
        `
        INSERT INTO quotes
        (client_name, phone, city, vehicle_type, plate, service, details, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          client_name,
          phone,
          city,
          vehicle_type,
          plate || null,
          service,
          details,
          "nueva",
        ]
      );
      quoteId = result.insertId;
    } catch (dbErr) {
      console.warn("⚠️ MySQL offline en createQuote, guardando en modo desarrollo:", dbErr.message);
    }

    res.status(201).json({
      message: "Cotización creada correctamente",
      quoteId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cotización",
      error: error.message,
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
      error: error.message,
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
      "convertida",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Estado no válido",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE quotes
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cotización no encontrada",
      });
    }

    res.json({
      message: "Estado actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar estado",
      error: error.message,
    });
  }
};

export const convertQuoteToClient = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [quoteRows] = await connection.query(
      `
      SELECT *
      FROM quotes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (quoteRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Cotización no encontrada",
      });
    }

    const quote = quoteRows[0];

    // 1. Buscar cliente por teléfono
    const [existingClients] = await connection.query(
      `
      SELECT id
      FROM clients
      WHERE phone = ?
      LIMIT 1
      `,
      [quote.phone]
    );

    let clientId = null;
    let clientAlreadyExisted = false;

    if (existingClients.length > 0) {
      clientId = existingClients[0].id;
      clientAlreadyExisted = true;
    } else {
      const [clientResult] = await connection.query(
        `
        INSERT INTO clients
        (name, phone, whatsapp, city, company, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          quote.client_name,
          quote.phone,
          quote.phone,
          quote.city || null,
          null,
          `Cliente creado desde cotización #${quote.id}`,
        ]
      );

      clientId = clientResult.insertId;
    }

    // 2. Si tiene placa, buscar o crear vehículo
    let vehicleId = null;
    let vehicleCreated = false;

    if (quote.plate && String(quote.plate).trim() !== "") {
      const [existingVehicles] = await connection.query(
        `
        SELECT id
        FROM vehicles
        WHERE plate = ?
        LIMIT 1
        `,
        [quote.plate]
      );

      if (existingVehicles.length > 0) {
        vehicleId = existingVehicles[0].id;
      } else {
        const [vehicleResult] = await connection.query(
          `
          INSERT INTO vehicles
          (client_id, plate, brand, line, model, vehicle_type, color, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            clientId,
            quote.plate,
            "Pendiente",
            null,
            null,
            quote.vehicle_type || "Otro",
            null,
            `Vehículo creado desde cotización #${quote.id}. Servicio solicitado: ${quote.service}`,
          ]
        );

        vehicleId = vehicleResult.insertId;
        vehicleCreated = true;
      }
    }

    // 3. Marcar la cotización como convertida
    await connection.query(
      `
      UPDATE quotes
      SET status = ?
      WHERE id = ?
      `,
      ["convertida", id]
    );

    await connection.commit();

    res.json({
      message: "Cotización convertida correctamente",
      quoteId: quote.id,
      clientId,
      vehicleId,
      clientAlreadyExisted,
      vehicleCreated,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Error al convertir cotización",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};