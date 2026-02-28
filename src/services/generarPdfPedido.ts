// generarPdfPedido.ts — LANDSCAPE A4 — mismo diseño que cotización

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  cargarLogoBase64,
  val, boolLabel, parsePantones, getMedida, formatCantidadCelda,
  dibujarEncabezado, dibujarCajasPie, dibujarPiePagina,
  GRAY_DARK, GRAY_MED, GRAY_LIGHT, GRAY_ROW, BLACK, WHITE,
} from "./Pdfutils";
import type { ProductoPdf, TotalesPdf } from "./Pdfutils";

interface PedidoPdf {
  no_pedido:      number;
  no_cotizacion?: number | null;
  fecha:          string;
  cliente:        string;
  empresa:        string;
  telefono:       string;
  correo:         string;
  impresion?:     string | null;
  logoBase64?:    string;
  productos:      ProductoPdf[];
  subtotal:       number;   // sin IVA — del backend (ventas.subtotal)
  iva:            number;   // 16%     — del backend (ventas.iva)
  total:          number;   // con IVA — del backend (ventas.total)
  anticipo:       number;   // monto anticipo — del backend (ventas.anticipo)
  saldo:          number;   // pendiente por pagar — del backend (ventas.saldo)
}

export async function generarPdfPedido(pedido: PedidoPdf): Promise<void> {
  const logoBase64 = pedido.logoBase64
    ?? await cargarLogoBase64("/src/assets/logogrupeb.png");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW  = 297;
  const M   = 8;

  // ── Encabezado (idéntico al de cotización) ────────────────────────────────
  const y = dibujarEncabezado({
    doc,
    logoBase64,
    labelDocumento: "PEDIDO",
    labelFolio:     "No P",
    folio:          pedido.no_pedido,
    refTexto:       pedido.no_cotizacion
      ? `Ref. Cot. #${pedido.no_cotizacion}`
      : undefined,
    fecha:          pedido.fecha,
    empresa:        pedido.empresa,
    impresion:      pedido.impresion,
    cliente:        pedido.cliente,
    telefono:       pedido.telefono,
    correo:         pedido.correo,
  });

  // ── Tabla de productos — 1 sola columna de cantidad (la del pedido) ───────
  const headAll = [
    "Descripción", "Medida", "B/K", "Tintas", "Caras",
    "Material", "Calibre", "Foil", "Asa/Suaje", "Alto Rel",
    "Laminado", "UV/BR", "Pantones", "Pigmento",
    "Cantidad",
  ];

  const bodyRows: any[][] = [];

  pedido.productos.forEach(prod => {
    // Tomar el primer detalle con cantidad > 0
    const det = prod.detalles.find(d => d.cantidad > 0);

    bodyRows.push([
      val(prod.nombre),
      getMedida(prod),
      boolLabel(prod.bk),
      val(prod.tintas),
      val(prod.caras),
      val(prod.material),
      val(prod.calibre),
      boolLabel(prod.foil),
      boolLabel(prod.asa_suaje),
      boolLabel(prod.alto_rel),
      boolLabel(prod.laminado),
      boolLabel(prod.uvBr),
      parsePantones(prod.pantones),
      prod.pigmentos ? String(prod.pigmentos).trim() || "—" : "—",
      det ? formatCantidadCelda(det, prod.por_kilo) : "—",
    ]);

    // Fila observación (igual que cotización)
    const tieneKilo = prod.detalles.some(d => d.modo_cantidad === "kilo");
    const modoLabel = tieneKilo ? "Por kilo" : "Por unidad";
    const obsTexto  = prod.observacion?.trim()
      ? `Obs: ${modoLabel}  —  ${prod.observacion.trim()}`
      : `Obs: ${modoLabel}`;
    const obsRow = new Array(headAll.length).fill("");
    obsRow[0] = obsTexto;
    bodyRows.push(obsRow);
  });

  // Anchos de columnas — mismos que cotización para las fijas, cantidad ocupa el resto
  const availW = PW - M * 2;
  const colW: Record<number, number> = {
    0: 32, 1: 16, 2: 7, 3: 9, 4: 9,
    5: 16, 6: 11, 7: 9, 8: 14, 9: 11,
    10: 13, 11: 11, 12: 28, 13: 18,
  };
  const fixedTotal = Object.values(colW).reduce((a, b) => a + b, 0);
  colW[14] = Math.max(availW - fixedTotal, 18);  // columna única cantidad

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head:   [headAll],
    body:   bodyRows,
    theme:  "grid",
    headStyles:         { fillColor: GRAY_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 6, cellPadding: 1.2, halign: "center", valign: "middle" },
    bodyStyles:         { fontSize: 6, textColor: BLACK, cellPadding: 1.2, valign: "middle", minCellHeight: 7 },
    alternateRowStyles: { fillColor: GRAY_ROW },
    columnStyles: Object.fromEntries(
      Object.entries(colW).map(([k, v]) => [
        Number(k),
        { cellWidth: v, halign: Number(k) === 0 || Number(k) === 12 ? "left" : "center" },
      ])
    ),
    didParseCell(data) {
      // Columna "Cantidad" con encabezado en gris medio para diferenciarla
      if (data.section === "head" && data.column.index === 14) {
        data.cell.styles.fillColor = GRAY_MED;
      }
      if (data.section === "body") {
        const raw0 = String((data.row.raw as any[])?.[0] ?? "");
        if (raw0.startsWith("Obs:")) {
          if (data.column.index === 0) {
            data.cell.colSpan          = headAll.length;
            data.cell.styles.fillColor = GRAY_LIGHT;
            data.cell.styles.fontStyle = "italic";
            data.cell.styles.fontSize  = 6;
            data.cell.styles.textColor = [80, 80, 80];
            data.cell.styles.halign    = "left";
          } else {
            data.cell.styles.fillColor = GRAY_LIGHT;
            data.cell.text = [];
          }
        }
      }
    },
  });

  // ── Cajas de pie — condiciones + resumen con Sub-Total/IVA/Total/Anticipo/Saldo
  // El pie del pedido no usa condLines — el bloque bancario y firmas
  // están embebidos directamente en dibujarCajasPie cuando se pasan totales
  dibujarCajasPie(doc, pedido.productos, [], {
    subtotal: pedido.subtotal,
    iva:      pedido.iva,
    total:    pedido.total,
    anticipo: pedido.anticipo,
    saldo:    pedido.saldo,
  });

  dibujarPiePagina(doc, "PEDIDO", pedido.no_pedido, pedido.fecha);

  doc.save(`Pedido_${pedido.no_pedido}.pdf`);
}