import React from "react";
import { showSuccessToast } from "../utils/alerts";
import { Printer, MessageCircle, X, Receipt, CheckCircle2 } from "lucide-react";

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

  let totalLetras = "";
  if (millones.letras) totalLetras += millones.letras + " ";
  if (miles.letras) totalLetras += miles.letras + " ";
  if (finales) totalLetras += finales + " ";

  return (totalLetras.trim() + " PESOS M/CTE").toUpperCase();
}

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const invoiceNumber = `FAC-${String(order.id).slice(-4)}-${(order.placa || "MT").replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`;
  const fechaLiquidacion = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const laborCost = Number(order.costo_mano_obra) || 0;
  const partsCost = Number(order.costo_repuestos) || 0;
  const totalCost = Number(order.costo_total) || (laborCost + partsCost);
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

    const showroomLink = order.slug ? `${window.location.origin}/galeria/${order.slug}` : "";

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      {/* Contenedor Flotante */}
      <div className="max-w-4xl w-full space-y-4 my-6">
        {/* Barra de Acciones Superior */}
        <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-extrabold text-sm text-white">Factura Proforma & Liquidación</div>
              <div className="text-xs text-slate-400">Consecutivo: <strong className="text-amber-400 font-mono">{invoiceNumber}</strong></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-carbon-800 text-slate-200 border border-white/10 hover:bg-carbon-700 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-carbon-950 hover:brightness-110 flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp al Cliente</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-carbon-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hoja de Factura (Imprimible en Papel Blanco) */}
        <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 space-y-8 shadow-2xl print:shadow-none print:rounded-none print:p-8">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <div className="text-2xl font-black tracking-wider text-slate-950">
                MELLOS TRUCK S.A.S.
              </div>
              <div className="text-xs text-slate-600 font-semibold">NIT: 901.458.789-2 • Régimen Simplificado</div>
              <div className="text-xs text-slate-600">Taller Central Pesados & Tienda Container</div>
              <div className="text-xs text-slate-600">Fontibón Zona Industrial, Bogotá D.C. & Medellín, Colombia</div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs font-mono">
                {invoiceNumber}
              </div>
              <div className="text-xs text-slate-600 mt-1">Fecha: <strong>{fechaLiquidacion}</strong></div>
              <div className="text-xs text-slate-600">Estado de Obra: <strong>{order.estado}</strong></div>
            </div>
          </div>

          {/* Datos del Cliente y Mula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block font-semibold">DATOS DEL TRANSPORTADOR:</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{order.cliente}</div>
              <div className="text-slate-600">Teléfono: {order.telefono || "No registrado"}</div>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">DATOS DEL VEHÍCULO:</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{order.marca} {order.linea} (Placa: <span className="font-mono text-amber-700">{order.placa}</span>)</div>
              <div className="text-slate-600">Color: {order.color || "Personalizado"}</div>
            </div>
          </div>

          {/* Tabla de Conceptos */}
          <div className="space-y-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-2.5">Ítem / Concepto</th>
                  <th className="py-2.5 text-center">Cant.</th>
                  <th className="py-2.5 text-right">V. Unitario</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-semibold text-slate-900">
                      {item.nombre}
                      <span className="block text-[10px] text-slate-500 font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold">{item.cantidad}</td>
                    <td className="py-2.5 text-right font-mono">${Number(item.precio_unitario).toLocaleString("es-CO")}</td>
                    <td className="py-2.5 text-right font-black font-mono">${Number(item.subtotal).toLocaleString("es-CO")}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2.5 font-semibold text-slate-900">
                    Mano de Obra Especializada & Pailería en Acero Inoxidable 304
                    <span className="block text-[10px] text-slate-500 italic">{order.descripcion || "Fabricación y montaje artesanal"}</span>
                  </td>
                  <td className="py-2.5 text-center font-bold">1</td>
                  <td className="py-2.5 text-right font-mono">${laborCost.toLocaleString("es-CO")}</td>
                  <td className="py-2.5 text-right font-black font-mono">${laborCost.toLocaleString("es-CO")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totales y Letras */}
          <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <span className="text-[10px] font-black uppercase text-slate-500">Valor en Letras:</span>
              <div className="text-xs font-bold text-slate-800">{numeroALetrasCOP(totalCost)}</div>
              <div className="text-[10px] text-slate-500 pt-2">
                * Garantía de Taller: 12 meses en soldadura TIG y estructura en acero inox 304.
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Repuestos Container:</span>
                <span className="font-mono">${partsCost.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mano de Obra:</span>
                <span className="font-mono">${laborCost.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-900">
                <span>TOTAL A PAGAR:</span>
                <span className="font-mono text-amber-700">${totalCost.toLocaleString("es-CO")} COP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
