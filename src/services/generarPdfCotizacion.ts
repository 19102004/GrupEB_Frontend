// generarPdfCotizacion.ts
// Orientación: LANDSCAPE A4 — Diseño combinado GRUPE

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface DetallePdf {
  cantidad:     number;
  precio_total: number;
}

interface ProductoPdf {
  nombre:              string;
  tintas:              number | string;
  caras:               number | string;
  calibre?:            string;
  material?:           string;
  medidasFormateadas?: string;
  medidas?: {
    altura?:           string;
    ancho?:            string;
    fuelleFondo?:      string;
    fuelleLateral1?:   string;
    fuelleLateral2?:   string;
    refuerzo?:         string;
    solapa?:           string;
  };
  bk?:         boolean | string | null;
  foil?:       boolean | string | null;
  laminado?:   boolean | string | null;
  uvBr?:       boolean | string | null;
  pigmentos?:  boolean | string | null;
  pantones?:   boolean | string | null;
  asa_suaje?:  boolean | string | null;
  alto_rel?:   boolean | string | null;
  observacion?: string | null;
  detalles:    DetallePdf[];
}

interface CotizacionPdf {
  no_cotizacion: number;
  fecha:         string;
  cliente:       string;
  empresa:       string;
  telefono:      string;
  correo:        string;
  estado:        string;
  productos:     ProductoPdf[];
  total:         number;
  impresion?:    string | null;
  logoBase64?:   string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function cargarLogoBase64(ruta: string): Promise<string | null> {
  try {
    const response = await fetch(ruta);
    const blob     = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader   = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ── Valor vacío → "—" ────────────────────────────────────────────────────────
function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

// ── Booleanos/extras de impresión → "SI" o vacío ────────────────────────────
function boolLabel(v: boolean | string | null | undefined): string {
  if (v === true  || v === "true"  || v === "1") return "SI";
  if (v === false || v === "false" || v === "0") return "—";
  const s = v ? String(v).trim() : "";
  return s !== "" ? s : "—";
}

function getMedida(prod: ProductoPdf): string {
  if (prod.medidasFormateadas && prod.medidasFormateadas.trim() !== "") {
    return prod.medidasFormateadas;
  }
  if (!prod.medidas) return "—";
  const m = prod.medidas;
  const p: string[] = [];
  if (m.altura      && m.altura.trim()      !== "") p.push(m.altura);
  if (m.ancho       && m.ancho.trim()       !== "") p.push(m.ancho);
  if (m.fuelleFondo && m.fuelleFondo.trim() !== "") p.push(m.fuelleFondo);
  return p.length > 0 ? p.join("X") : "—";
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

// ── Colores B&N ───────────────────────────────────────────────────────────────
const GRAY_DARK  = [80,  80,  80]  as [number,number,number];
const GRAY_MED   = [160, 160, 160] as [number,number,number];
const GRAY_LIGHT = [220, 220, 220] as [number,number,number];
const GRAY_ROW   = [240, 240, 240] as [number,number,number];
const BLACK      = [0,   0,   0]   as [number,number,number];
const WHITE      = [255, 255, 255] as [number,number,number];

// ── Función principal ─────────────────────────────────────────────────────────
export async function generarPdfCotizacion(cotizacion: CotizacionPdf): Promise<void> {

  const logoBase64 = cotizacion.logoBase64
    ?? await cargarLogoBase64("/src/assets/logogrupeb.png");

  // LANDSCAPE A4: 297 x 210 mm
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW  = 297;
  const PH  = 210;
  const M   = 8;

  let y = M;

  // ══════════════════════════════════════════════════════════
  // ENCABEZADO
  // ══════════════════════════════════════════════════════════

  const row1Height   = 24;
  const row2Height   = 6;
  const row3Height   = 6;
  const totalHeaderH = row1Height + row2Height + row3Height;

  // ── LOGO (izquierda) ────────────────────────────────────────
  const logoW = 30;
  const logoH = 24;

  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);
  doc.rect(M, y, logoW, logoH);

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", M + 2, y + 2, logoW - 4, logoH - 4);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...BLACK);
      doc.text("GRUPO", M + logoW/2, y + 10, { align: "center" });
      doc.setFontSize(16);
      doc.text("EB", M + logoW/2, y + 18, { align: "center" });
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BLACK);
    doc.text("GRUPO", M + logoW/2, y + 10, { align: "center" });
    doc.setFontSize(16);
    doc.text("EB", M + logoW/2, y + 18, { align: "center" });
  }

  // ── DATOS DE LA EMPRESA (centro) ───────────────────────────
  const centerBoxX = M + logoW + 0.3;
  const cotBoxW    = 65;
  const centerBoxW = PW - 2*M - logoW - cotBoxW - 1;

  doc.rect(centerBoxX, y, centerBoxW, row1Height);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BLACK);

  let textY = y + 4;
  doc.text("Rogelio Ledesma # 102  Col. Cruz Vieja  Tlajomulco de Zuñiga, Jalisco.", centerBoxX + 2, textY);
  textY += 4;
  doc.text("Tel. :(33) 3180-3373, 3125-9595, 3180-1460", centerBoxX + 2, textY);
  textY += 4;
  doc.text("www.grupoeb.com.mx", centerBoxX + 2, textY);
  textY += 4;
  doc.text("E-mail: ventas@grupoeb.com.mx", centerBoxX + 2, textY);

  // ── CAJA DE COTIZACIÓN (derecha) ────────────────────────────
  const cotBoxX  = PW - M - cotBoxW;
  doc.rect(cotBoxX, y, cotBoxW, totalHeaderH);

  const headerH  = totalHeaderH / 3;
  const dataRowH = totalHeaderH / 3;

  doc.setFillColor(...GRAY_MED);
  doc.rect(cotBoxX, y, cotBoxW, headerH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLACK);
  doc.text("COTIZACION", cotBoxX + cotBoxW/2, y + headerH/2 + 1.5, { align: "center" });

  doc.line(cotBoxX, y + headerH, cotBoxX + cotBoxW, y + headerH);

  // No F
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(cotBoxX, y + headerH, cotBoxW/2, dataRowH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("No F", cotBoxX + cotBoxW/4, y + headerH + dataRowH/2 + 1.5, { align: "center" });
  doc.text(String(cotizacion.no_cotizacion), cotBoxX + cotBoxW*0.75, y + headerH + dataRowH/2 + 1.5, { align: "center" });

  doc.line(cotBoxX + cotBoxW/2, y + headerH, cotBoxX + cotBoxW/2, y + totalHeaderH);
  doc.line(cotBoxX, y + headerH + dataRowH, cotBoxX + cotBoxW, y + headerH + dataRowH);

  // Fecha
  const fechaY = y + headerH + dataRowH;
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(cotBoxX, fechaY, cotBoxW/2, dataRowH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FECHA", cotBoxX + cotBoxW/4, fechaY + dataRowH/2 + 1.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    val(formatFecha(cotizacion.fecha)),
    cotBoxX + cotBoxW*0.75,
    fechaY + dataRowH/2 + 1.5,
    { align: "center" }
  );

  y += row1Height;

  // ══════════════════════════════════════════════════════════
  // FILA 2: EMPRESA + IMPRESIÓN
  // ══════════════════════════════════════════════════════════
  const empresaBoxW = PW - 2*M - cotBoxW - 1;
  doc.rect(M, y, empresaBoxW, row2Height);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...BLACK);
  doc.text("Empresa:", M + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(cotizacion.empresa), M + 16, y + 4);

  const impresionLabelX = M + 120;
  doc.setFont("helvetica", "bold");
  doc.text("Impresión:", impresionLabelX, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(cotizacion.impresion), impresionLabelX + 18, y + 4);

  y += row2Height;

  // ══════════════════════════════════════════════════════════
  // FILA 3: ATENCIÓN + TELÉFONO + EMAIL
  // ══════════════════════════════════════════════════════════
  doc.rect(M, y, empresaBoxW, row3Height);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Atención:", M + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(cotizacion.cliente), M + 18, y + 4);

  const telX = M + 70;
  doc.setFont("helvetica", "bold");
  doc.text("Teléfono:", telX, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(cotizacion.telefono), telX + 16, y + 4);

  const emailX = M + 140;
  doc.setFont("helvetica", "bold");
  doc.text("E-mail:", emailX, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text(val(cotizacion.correo), emailX + 12, y + 4);

  y += row3Height + 3;

  // ══════════════════════════════════════════════════════════
  // TABLA DE PRODUCTOS
  // ══════════════════════════════════════════════════════════
  const maxDetalles = Math.max(...cotizacion.productos.map(p => p.detalles.length), 1);
  const numCantCols = Math.min(maxDetalles, 3);

  const headFixed = ["Descripción", "Medida", "B/K", "Tintas", "Caras", "Material", "Calibre", "Foil", "Asa/Suaje", "Alto Rel", "Laminado", "UV/BR"];
  const headCant  = Array.from({ length: numCantCols }, (_, i) => `Cant ${i + 1}`);
  const headAll   = [...headFixed, ...headCant];

  const bodyRows: any[][] = [];

  cotizacion.productos.forEach((prod) => {
    const row: any[] = [
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
    ];

    for (let i = 0; i < numCantCols; i++) {
      const det = prod.detalles[i];
      if (det && det.cantidad > 0) {
        const precioUnit = det.precio_total / det.cantidad;
        row.push(`${det.cantidad.toLocaleString("es-MX")}\n$${precioUnit.toFixed(2)}`);
      } else {
        row.push("—");
      }
    }

    bodyRows.push(row);

    // Fila de observación
    if (prod.observacion && prod.observacion.trim() !== "") {
      const obsRow = new Array(headAll.length).fill("");
      obsRow[0] = `Obs: ${prod.observacion}`;
      bodyRows.push(obsRow);
    }
  });

  // Anchos de columna
  const availW: number = PW - M * 2;
  const colWidths: Record<number, number> = {
    0: 38, 1: 18, 2: 8, 3: 10, 4: 10,
    5: 18, 6: 13, 7: 10, 8: 15, 9: 13, 10: 15, 11: 13,
  };
  const fixedTotal = Object.values(colWidths).reduce((a, b) => a + b, 0);
  const cantW = Math.max((availW - fixedTotal) / numCantCols, 14);
  for (let i = 0; i < numCantCols; i++) colWidths[12 + i] = cantW;

  // Altura fija para el pie: siempre reservamos 35mm al fondo
  const FOOTER_H = 35;
  const tableMaxY = PH - M - FOOTER_H;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head:   [headAll],
    body:   bodyRows,
    theme:  "grid",
    // La tabla no puede crecer más allá de tableMaxY
    // (jspdf-autotable respeta pageBreak automático; aquí limitamos visualmente)
    headStyles: {
      fillColor:   GRAY_DARK,
      textColor:   WHITE,
      fontStyle:   "bold",
      fontSize:    6.5,
      cellPadding: 1.5,
      halign:      "center",
      valign:      "middle",
    },
    bodyStyles: {
      fontSize:      6.5,
      textColor:     BLACK,
      cellPadding:   1.5,
      valign:        "middle",
      minCellHeight: 7,
    },
    columnStyles: Object.fromEntries(
      Object.entries(colWidths).map(([k, v]) => [
        Number(k),
        { cellWidth: v, halign: Number(k) === 0 ? "left" : "center" },
      ])
    ),
    alternateRowStyles: { fillColor: GRAY_ROW },
    didParseCell(data) {
      if (data.section === "head" && data.column.index >= 12) {
        data.cell.styles.fillColor = GRAY_MED;
      }
      if (data.section === "body") {
        const rawRow    = data.row.raw as any[];
        const firstCell = String(rawRow?.[0] ?? "");
        if (firstCell.startsWith("Obs:")) {
          if (data.column.index === 0) {
            data.cell.colSpan = headAll.length;
            data.cell.styles.fillColor = GRAY_LIGHT;
            data.cell.styles.fontStyle = "italic";
            data.cell.styles.fontSize  = 6.5;
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

  // ══════════════════════════════════════════════════════════
  // PIE ADAPTATIVO: Observaciones generales | Condiciones de Venta
  // Los recuadros se adaptan según su contenido propio
  // ══════════════════════════════════════════════════════════

  // El pie siempre arranca a PH - M - FOOTER_H
  const fY  = PH - M - FOOTER_H;
  const colW = (PW - M * 2) / 2;   // 2 columnas iguales

  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.3);

  // ── Caja Observaciones ────────────────────────────────────
  const footerHeaderH = 6;
  
  // Primero calculamos la altura que necesita condiciones de venta
  const condLines = [
    "• Precios más IVA.",
    "• Tiempo de entrega: 30-35 días después de autorizado el diseño.",
    "• L.A.B. Guadalajara. EL FLETE VA POR CUENTA DEL CLIENTE.",
    "• Condiciones de Pago: 50% ANTICIPO, resto contra entrega.",
    "• Esta cotización puede variar +/- 10% en la cantidad final.",
    "• Precios sujetos a cambio sin previo aviso.",
  ];

  const condContentH = condLines.length * 3.8 + 4;
  const uniformBoxH = footerHeaderH + condContentH;

  // Calculamos las observaciones
  const obsGeneral = cotizacion.productos
    .filter(p => p.observacion && p.observacion.trim() !== "")
    .map(p => `• ${p.observacion}`)
    .join("\n");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);

  let obsLines: string[] = [];
  if (obsGeneral) {
    obsLines = doc.splitTextToSize(obsGeneral, colW - 6);
  }

  // Ambas cajas tendrán la misma altura (uniformBoxH)
  
  // Dibujar caja de observaciones
  doc.rect(M, fY, colW - 2, uniformBoxH);

  // Header de observaciones
  doc.setFillColor(...GRAY_DARK);
  doc.rect(M, fY, colW - 2, footerHeaderH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("Observaciones", M + (colW - 2) / 2, fY + 4, { align: "center" });
  doc.setTextColor(...BLACK);

  // Contenido de observaciones
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);

  if (obsGeneral) {
    doc.text(obsLines, M + 2, fY + footerHeaderH + 4);
  } else {
    doc.setTextColor(...GRAY_MED);
    doc.text("—", M + 2, fY + footerHeaderH + 4);
    doc.setTextColor(...BLACK);
  }

  // ── Caja Condiciones de Venta ─────────────────────────────
  const cvX = M + colW;
  // Dibujar caja de condiciones (misma altura que observaciones)
  doc.rect(cvX, fY, colW - 2, uniformBoxH);

  // Header de condiciones
  doc.setFillColor(...GRAY_DARK);
  doc.rect(cvX, fY, colW - 2, footerHeaderH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text("Condiciones de Venta", cvX + (colW - 2) / 2, fY + 4, { align: "center" });
  doc.setTextColor(...BLACK);

  // Contenido de condiciones
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  let cvY = fY + footerHeaderH + 4;
  condLines.forEach(line => {
    doc.text(line, cvX + 2, cvY);
    cvY += 3.8;
  });

  // ── Pie de página ─────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Folio #${cotizacion.no_cotizacion}  ·  ${val(formatFecha(cotizacion.fecha))}  ·  Página ${p} de ${totalPages}`,
      PW / 2, PH - 3, { align: "center" }
    );
  }

  doc.save(`Cotizacion_${cotizacion.no_cotizacion}.pdf`);
}