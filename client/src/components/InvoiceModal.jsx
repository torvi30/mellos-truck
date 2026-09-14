import React from "react";
import { showSuccessToast } from "../utils/alerts";

// Convertidor de números a letras en español para valores en Pesos Colombianos (COP)
function numeroALetrasCOP(cantidad) {
  const numero = Math.floor(Math.abs(Number(cantidad) || 0));
  if (numero === 0) return "CERO PESOS M/CTE";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const diezY = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const veinteY = ["VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  function seccion(num, divisor, strSingular, strPlural) {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let letras = "";
    if (cientos > 0) {
      if (cientos > 1) {
        letras = resolverTresDigitos(cientos) + " " + strPlural;
      } else {
        letras = strSingular;
      }
    }
    return { letras, resto };
  }

  function resolverTresDigitos(n) {
    if (n === 100) return "CIEN";
    let c = Math.floor(n / 100);
    let d = Math.floor((n % 100) / 10);
    let u = n % 10;
    let resultado = "";

    if (c > 0) resultado += centenas[c] + " ";

    let du = n % 100;
    if (du >= 10 && du <= 19) {
      resultado += diezY[du - 10];
      return resultado.trim();
    } else if (du >= 20 && du <= 29) {
      resultado += veinteY[du - 20];
      return resultado.trim();
    }

    if (d > 0) {
      resultado += decenas[d];
      if (u > 0) resultado += " Y ";
    }
    if (u > 0) {
      resultado += unidades[u];
    }
    return resultado.trim();
  }

  let millones = seccion(numero, 1000000, "UN MILLÓN", "MILLONES");
  let miles = seccion(millones.resto, 1000, "MIL", "MIL");
  let finales = resolverTresDigitos(miles.resto);

  let resultado = "";
  if (millones.letras) resultado += millones.letras + " ";
  if (miles.letras) resultado += miles.letras + " ";
  if (finales) resultado += finales + " ";

  return (resultado.trim() + " PESOS M/CTE").toUpperCase();
}

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const orderId = order.id || 1;
  const invoiceNumber = `LIQ-${new Date().getFullYear()}-${String(orderId).padStart(4, "0")}`;
  const fechaIngreso = order.fecha_ingreso ? new Date(order.fecha_ingreso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" }) : "Fecha no registrada";
  const fechaLiquidacion = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  
  const laborCost = parseFloat(order.costo_mano_obra) || 0;
  const partsCost = parseFloat(order.costo_repuestos) || 0;
  const totalCost = parseFloat(order.costo_total) || (laborCost + partsCost);
  const items = order.items || [];

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const phone = (order.telefono || "").replace(/\D/g, "");
    const targetPhone = phone.length >= 10 ? (phone.startsWith("57") ? phone : `57${phone}`) : "573000000000";

    const itemsSummary = items.length > 0 
      ? items.map((it, idx) => `  ${idx + 1}. ${it.nombre} (x${it.cantidad}) -> $${(it.subtotal || 0).toLocaleString("es-CO")} COP`).join("\n")
      : "  • No se registraron repuestos externos del Container.";

    const showroomLink = order.slug ? `http://localhost:5174/galeria/${order.slug}` : "";

    const text = 
`*MELLOS TRUCK S.A.S. - LIQUIDACIÓN DE ENTREGA* 🚛✨
*Factura Proforma:* ${invoiceNumber}
*Fecha:* ${fechaLiquidacion}

👤 *Cliente:* ${order.cliente}
🚛 *Mula:* ${order.marca} ${order.linea || ""} (Placa: *${order.placa}*)
🎨 *Color:* ${order.color || "Personalizado"}
📋 *Fase:* ${order.estado}

*DESGLOSE DE LIQUIDACIÓN:*
${itemsSummary}
• *Mano de Obra & Pailería:* $${laborCost.toLocaleString("es-CO")} COP

💰 *TOTAL LIQUIDADO:* $${totalCost.toLocaleString("es-CO")} COP
(${numeroALetrasCOP(totalCost)})

🛡️ *Garantía de Taller:* 12 Meses en Pailería & Acero Inox 304.
${showroomLink ? `\n💎 *Ver Showroom 4K & Certificado:* ${showroomLink}` : ""}

_¡Gracias por confiar la personalización de tu máquina en Mellos Truck!_`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, "_blank");
    showSuccessToast("Abriendo WhatsApp con la liquidación formal...");
  };

  return (
    <div className="invoice-modal-backdrop">
      {/* Barra de Acciones Flotante (Se oculta al imprimir) */}
      <div className="invoice-action-bar no-print">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>📄</span>
          <div>
            <div style={{ fontWeight: "900", color: "#f8fafc", fontSize: "0.95rem" }}>
              Factura Proforma & Liquidación de Entrega
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Consecutivo oficial: <strong style={{ color: "#f59e0b" }}>{invoiceNumber}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="btn-invoice-whatsapp"
            title="Enviar liquidación y resumen al WhatsApp del cliente"
          >
            <span>📱</span>
            <span>Enviar por WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-invoice-print"
            title="Imprimir o guardar como PDF"
          >
            <span>🖨️</span>
            <span>Imprimir / Guardar PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-invoice-close"
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Contenedor del Documento Imprimible (Formato Carta / A4) */}
      <div className="invoice-sheet-container">
        {/* Cabecera Oficial Membretada */}
        <div className="invoice-header">
          <div className="invoice-brand-col">
            <div className="invoice-brand-badge">
              <div className="invoice-brand-logo">MT</div>
              <div>
                <h1 className="invoice-brand-title">MELLOS TRUCK S.A.S.</h1>
                <p className="invoice-brand-sub">TRANSFORMACIÓN ARTESANAL & TIENDA CONTAINER DE PESADOS</p>
              </div>
            </div>
            <div className="invoice-company-details">
              <div>NIT: 901.482.930-4 • Régimen Simple</div>
              <div>Carrera 68D # 18-42 Zona Industrial • Bogotá D.C., Colombia</div>
              <div>Tel: +57 (310) 456-7890 • Email: gerencia@mellostruck.com</div>
              <div>Showroom Oficial: www.mellostruck.com</div>
            </div>
          </div>

          <div className="invoice-meta-col">
            <div className="invoice-number-box">
              <div className="invoice-meta-tag">ORDEN DE LIQUIDACIÓN</div>
              <div className="invoice-meta-number">{invoiceNumber}</div>
            </div>
            <div className="invoice-meta-grid">
              <div><strong>Fecha Emisión:</strong> {fechaLiquidacion}</div>
              <div><strong>Fecha Ingreso:</strong> {fechaIngreso}</div>
              <div><strong>Estado de Entrega:</strong> <span className="invoice-badge-status">{order.estado}</span></div>
            </div>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Ficha del Transportador & Mula */}
        <div className="invoice-customer-vehicle-grid">
          <div className="invoice-info-panel">
            <div className="invoice-panel-title">👤 DATOS DEL PROPIETARIO / CLIENTE</div>
            <div className="invoice-info-row">
              <span className="info-label">Nombre:</span>
              <span className="info-val strong">{order.cliente}</span>
            </div>
            <div className="invoice-info-row">
              <span className="info-label">Teléfono:</span>
              <span className="info-val">{order.telefono || "No especificado"}</span>
            </div>
            <div className="invoice-info-row">
              <span className="info-label">Documento / NIT:</span>
              <span className="info-val">C.C. {order.documento || "Cliente Frecuente"}</span>
            </div>
            <div className="invoice-info-row">
              <span className="info-label">Ciudad Operación:</span>
              <span className="info-val">{order.ciudad || "Nacional (Colombia)"}</span>
            </div>
          </div>

          <div className="invoice-info-panel">
            <div className="invoice-panel-title">🚛 VEHÍCULO INTERVENIDO</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <div className="invoice-info-row">
                  <span className="info-label">Vehículo:</span>
                  <span className="info-val strong">{order.marca} {order.linea || ""}</span>
                </div>
                <div className="invoice-info-row">
                  <span className="info-label">Color / Acabado:</span>
                  <span className="info-val">{order.color || "Personalizado"}</span>
                </div>
              </div>

              {/* Placa Troquelada en la Factura */}
              <div className="invoice-plate-tag">
                <div className="plate-letters">{order.placa}</div>
                <div className="plate-footer">COLOMBIA</div>
              </div>
            </div>

            <div className="invoice-info-row">
              <span className="info-label">Trabajo Solicitado:</span>
              <span className="info-val italic">{order.descripcion || "Personalización integral de carrocería, bomper y accesorios."}</span>
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Repuestos y Accesorios del Container */}
        <div className="invoice-table-section">
          <div className="invoice-section-heading">
            📦 REPUESTOS & ACCESORIOS INSTALADOS (TIENDA CONTAINER)
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>#</th>
                <th style={{ width: "120px" }}>SKU</th>
                <th>DESCRIPCIÓN DE LA PIEZA</th>
                <th style={{ width: "60px", textAlign: "center" }}>CANT.</th>
                <th style={{ width: "140px", textAlign: "right" }}>VALOR UNITARIO</th>
                <th style={{ width: "140px", textAlign: "right" }}>SUBTOTAL (COP)</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "12px", color: "#666", fontStyle: "italic" }}>
                    No se instalaron repuestos físicos del Container en esta orden (Solo mano de obra especializada).
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>{idx + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#444" }}>
                      {item.sku || "PROD-GEN"}
                    </td>
                    <td style={{ fontWeight: "600" }}>
                      {item.nombre}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700" }}>{item.cantidad || 1}</td>
                    <td style={{ textAlign: "right" }}>
                      ${(item.precio_unitario || 0).toLocaleString("es-CO")}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "700" }}>
                      ${(item.subtotal || 0).toLocaleString("es-CO")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tabla de Servicios y Mano de Obra */}
        <div className="invoice-table-section">
          <div className="invoice-section-heading">
            ⚡ MANO DE OBRA, PAILERÍA & CONTROL DE CALIDAD
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th style={{ width: "40px", textAlign: "center" }}>#</th>
                <th>CONCEPTO OPERATIVO</th>
                <th style={{ width: "120px", textAlign: "center" }}>GARANTÍA</th>
                <th style={{ width: "140px", textAlign: "right" }}>VALOR (COP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: "center", fontWeight: "700" }}>1</td>
                <td>
                  <strong>Pailería Pesada, Soldadura TIG, Ajuste de Cabina & Acabado Poliuretano</strong>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                    Montaje de bomper a chasis con pernos de grado, alineación de visera americana, calibración de cornetas y pulido espejo de acero inoxidable 304.
                  </div>
                </td>
                <td style={{ textAlign: "center", fontWeight: "700", color: "#166534" }}>12 Meses</td>
                <td style={{ textAlign: "right", fontWeight: "800" }}>
                  ${laborCost.toLocaleString("es-CO")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen Contable y Monto en Letras */}
        <div className="invoice-totals-wrapper">
          <div className="invoice-words-box">
            <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#555", textTransform: "uppercase" }}>
              VALOR TOTAL EN LETRAS:
            </div>
            <div className="invoice-words-text">
              {numeroALetrasCOP(totalCost)}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "4px" }}>
              Forma de Pago: Contado / Transferencia Bancaria antes de entrega de la unidad.
            </div>
          </div>

          <div className="invoice-totals-table">
            <div className="totals-row">
              <span>Subtotal Repuestos:</span>
              <strong>${partsCost.toLocaleString("es-CO")} COP</strong>
            </div>
            <div className="totals-row">
              <span>Subtotal Mano de Obra:</span>
              <strong>${laborCost.toLocaleString("es-CO")} COP</strong>
            </div>
            <div className="totals-row">
              <span>Impuestos / Retenciones:</span>
              <strong>$0 COP (Régimen Simple)</strong>
            </div>
            <div className="totals-row grand-total">
              <span>TOTAL A PAGAR:</span>
              <span>${totalCost.toLocaleString("es-CO")} COP</span>
            </div>
          </div>
        </div>

        {/* Cláusula de Garantía de Pailería y Acero Inoxidable */}
        <div className="invoice-warranty-clause">
          <div className="warranty-title">🛡️ CERTIFICADO DE GARANTÍA Y CONFORMIDAD TÉCNICA (MELLOS TRUCK S.A.S.)</div>
          <p className="warranty-text">
            Mellos Truck certifica que todos los trabajos de soldadura TIG, fijación de soportes en chasis y piezas fabricadas en lámina de acero inoxidable calidad 304 cuentan con una garantía comercial de <strong>doce (12) meses</strong> contra desprendimiento, fisuras de cordón o defectos de fábrica en herrajes. No cubre daños por colisión en carretera, sobrecarga extrema o manipulación indebida en otros talleres no autorizados.
          </p>
        </div>

        {/* Firmas de Conformidad */}
        <div className="invoice-signatures-grid">
          <div className="invoice-signature-box">
            <div className="sig-line"></div>
            <div className="sig-name">Mellos Truck S.A.S.</div>
            <div className="sig-role">Jefe de Patio / Maestro Pailero Autorizado</div>
          </div>

          <div className="invoice-signature-box">
            <div className="sig-line"></div>
            <div className="sig-name">{order.cliente}</div>
            <div className="sig-role">Recibido a Conformidad (Propietario / Conductor)</div>
            <div className="sig-doc">C.C. _______________________</div>
          </div>
        </div>

        {/* Footer Legal */}
        <div className="invoice-footer-legal">
          Documento expedido por el sistema informático de taller Mellos Truck. Válido como orden de liquidación de taller y constancia de entrega de vehículo automotor de servicio público / particular de carga pesada.
        </div>
      </div>
    </div>
  );
}
