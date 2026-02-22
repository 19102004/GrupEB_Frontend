// generarPdfCotizacion.ts — LANDSCAPE A4 — B&N

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Tipos ────────────────────────────────────────────────────────────────────
interface DetallePdf {
  cantidad:      number;
  precio_total:  number;
  kilogramos?:   number | null;
  // ✅ modo_cantidad vive en cada detalle
  modo_cantidad?: "unidad" | "kilo";
}

interface ProductoPdf {
  nombre:              string;
  tintas:              number | string;
  caras:               number | string;
  calibre?:            string;
  material?:           string;
  medidasFormateadas?: string;
  medidas?: {
    altura?:         string;
    ancho?:          string;
    fuelleFondo?:    string;
    fuelleLateral1?: string;
    fuelleLateral2?: string;
    refuerzo?:       string;
  };
  bk?:          boolean | string | null;
  foil?:        boolean | string | null;
  laminado?:    boolean | string | null;
  uvBr?:        boolean | string | null;
  pigmentos?:   string | null;
  pantones?:    string | string[] | null;
  asa_suaje?:   boolean | string | null;
  alto_rel?:    boolean | string | null;
  observacion?: string | null;
  por_kilo?:    string | number | null;
  detalles:     DetallePdf[];
}

interface CotizacionPdf {
  no_cotizacion: number;
  fecha:         string;
  cliente:       string;
  empresa:       string;
  telefono:      string;
  correo:        string;
  estado:        string;
  impresion?:    string | null;
  logoBase64?:   string;
  productos:     ProductoPdf[];
  total:         number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function cargarLogoBase64(ruta: string): Promise<string | null> {
  try {
    const r = await fetch(ruta);
    const b = await r.blob();
    return await new Promise<string>((res, rej) => {
      const reader  = new FileReader();
      reader.onload  = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(b);
    });
  } catch { return null; }
}

function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

function boolLabel(v: boolean | string | null | undefined): string {
  if (v === true  || v === "true"  || v === "1") return "SI";
  if (v === false || v === "false" || v === "0") return "—";
  const s = v ? String(v).trim() : "";
  return s !== "" ? s : "—";
}

function parsePantones(p: string | string[] | null | undefined): string {
  if (!p) return "—";
  if (Array.isArray(p)) { const f = p.filter(Boolean); return f.length ? f.join(", ") : "—"; }
  const s = String(p).trim();
  return s || "—";
}

function getMedida(prod: ProductoPdf): string {
  if (prod.medidasFormateadas?.trim()) return prod.medidasFormateadas;
  if (!prod.medidas) return "—";
  const ps = [prod.medidas.altura, prod.medidas.ancho, prod.medidas.fuelleFondo]
    .filter(v => v?.trim());
  return ps.length ? ps.join("X") : "—";
}

function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

// ✅ Formatear celda de cantidad según modo_cantidad del detalle
function formatCantidadCelda(det: DetallePdf, porKilo?: string | number | null): string {
  const precioUnit = det.precio_total / det.cantidad;

  if (det.modo_cantidad === "kilo" && det.kilogramos && det.kilogramos > 0) {
    const pk  = Number(porKilo || 1);
    const kgStr = Number.isInteger(det.kilogramos)
      ? det.kilogramos.toString()
      : Number(det.kilogramos).toFixed(2);
    return `${kgStr} kg\n(${det.cantidad.toLocaleString("es-MX")} pzas)\n$${(precioUnit * pk).toFixed(2)}/kg`;
  }

  return `${det.cantidad.toLocaleString("es-MX")}\n$${precioUnit.toFixed(2)}/pza`;
}

// ── Paleta B&N ────────────────────────────────────────────────────────────────
const GRAY_DARK  = [80,  80,  80]  as [number, number, number];
const GRAY_MED   = [160, 160, 160] as [number, number, number];
const GRAY_LIGHT = [220, 220, 220] as [number, number, number];
const GRAY_ROW   = [240, 240, 240] as [number, number, number];
const BLACK      = [0,   0,   0]   as [number, number, number];
const WHITE      = [255, 255, 255] as [number, number, number];

// ── Función principal ─────────────────────────────────────────────────────────
export async function generarPdfCotizacion(cotizacion: CotizacionPdf): Promise<void> {

  const logoBase64 = cotizacion.logoBase64
    ?? await cargarLogoBase64("/src/assets/logogrupeb.png");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PW  = 297;
  const PH  = 210;
  const M   = 8;
  let   y   = M;

  // ══════════════════════════════════════════════════════════
  // ENCABEZADO
  // ══════════════════════════════════════════════════════════
  const row1H = 24; const row2H = 6; const row3H = 6;
  const totalHeaderH = row1H + row2H + row3H;
  const logoW = 30;

  doc.setDrawColor(...BLACK); doc.setLineWidth(0.3);
  doc.rect(M, y, logoW, row1H);

  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", M + 2, y + 2, logoW - 4, row1H - 4); }
    catch {
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...BLACK);
      doc.text("GRUPO", M + logoW / 2, y + 10, { align: "center" });
      doc.setFontSize(16); doc.text("EB", M + logoW / 2, y + 18, { align: "center" });
    }
  }

  const cotBoxW = 65;
  const centerW = PW - 2 * M - logoW - cotBoxW - 1;
  const centerX = M + logoW + 0.3;

  doc.rect(centerX, y, centerW, row1H);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...BLACK);
  let ty = y + 4;
  ["Rogelio Ledesma # 102  Col. Cruz Vieja  Tlajomulco de Zuñiga, Jalisco.",
   "Tel. :(33) 3180-3373, 3125-9595, 3180-1460",
   "www.grupoeb.com.mx",
   "E-mail: ventas@grupoeb.com.mx",
  ].forEach(line => { doc.text(line, centerX + 2, ty); ty += 4; });

  const cotBoxX = PW - M - cotBoxW;
  const hH      = totalHeaderH / 3;

  doc.rect(cotBoxX, y, cotBoxW, totalHeaderH);
  doc.setFillColor(...GRAY_MED);
  doc.rect(cotBoxX, y, cotBoxW, hH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BLACK);
  doc.text("COTIZACION", cotBoxX + cotBoxW / 2, y + hH / 2 + 1.5, { align: "center" });

  doc.line(cotBoxX, y + hH, cotBoxX + cotBoxW, y + hH);
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(cotBoxX, y + hH, cotBoxW / 2, hH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.text("No F",  cotBoxX + cotBoxW / 4,    y + hH + hH / 2 + 1.5, { align: "center" });
  doc.text(String(cotizacion.no_cotizacion), cotBoxX + cotBoxW * 0.75, y + hH + hH / 2 + 1.5, { align: "center" });
  doc.line(cotBoxX + cotBoxW / 2, y + hH, cotBoxX + cotBoxW / 2, y + totalHeaderH);
  doc.line(cotBoxX, y + hH * 2, cotBoxX + cotBoxW, y + hH * 2);

  const fecY = y + hH * 2;
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(cotBoxX, fecY, cotBoxW / 2, hH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("FECHA", cotBoxX + cotBoxW / 4, fecY + hH / 2 + 1.5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text(val(formatFecha(cotizacion.fecha)), cotBoxX + cotBoxW * 0.75, fecY + hH / 2 + 1.5, { align: "center" });

  y += row1H;

  const infoW = PW - 2 * M - cotBoxW - 1;

  // Fila empresa / impresión
  doc.rect(M, y, infoW, row2H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...BLACK);
  doc.text("Empresa:", M + 2, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cotizacion.empresa), M + 16, y + 4);
  const impX = M + 120;
  doc.setFont("helvetica", "bold"); doc.text("Impresión:", impX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cotizacion.impresion), impX + 18, y + 4);
  y += row2H;

  // Fila atención / teléfono / email
  doc.rect(M, y, infoW, row3H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7);
  doc.text("Atención:", M + 2, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cotizacion.cliente), M + 18, y + 4);
  const telX = M + 70;
  doc.setFont("helvetica", "bold"); doc.text("Teléfono:", telX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cotizacion.telefono), telX + 16, y + 4);
  const emlX = M + 140;
  doc.setFont("helvetica", "bold"); doc.text("E-mail:", emlX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cotizacion.correo), emlX + 12, y + 4);
  y += row3H + 3;

  // ══════════════════════════════════════════════════════════
  // TABLA DE PRODUCTOS
  // ══════════════════════════════════════════════════════════
  const maxDet      = Math.max(...cotizacion.productos.map(p => p.detalles.length), 1);
  const numCantCols = Math.min(maxDet, 3);

  const headFixed = [
    "Descripción", "Medida", "B/K", "Tintas", "Caras",
    "Material", "Calibre", "Foil", "Asa/Suaje", "Alto Rel",
    "Laminado", "UV/BR", "Pantones", "Pigmento",
  ];
  const headAll = [...headFixed, ...Array.from({ length: numCantCols }, (_, i) => `Cant ${i + 1}`)];

  const bodyRows: any[][] = [];

  cotizacion.productos.forEach(prod => {
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
      parsePantones(prod.pantones),
      prod.pigmentos ? String(prod.pigmentos).trim() || "—" : "—",
    ];

    for (let i = 0; i < numCantCols; i++) {
      const det = prod.detalles[i];
      // ✅ cada detalle tiene su propio modo_cantidad
      row.push(det && det.cantidad > 0
        ? formatCantidadCelda(det, prod.por_kilo)
        : "—"
      );
    }

    bodyRows.push(row);

    // ✅ Fila de obs siempre presente: modo de cotización + observación si la hay
    const tieneKilo   = prod.detalles.some(d => d.modo_cantidad === "kilo");
    const tieneUnidad = prod.detalles.some(d => d.modo_cantidad !== "kilo");
    const modoLabel   = tieneKilo && tieneUnidad ? "Por kilo y por unidad"
                      : tieneKilo                ? "Cotizado por kilo"
                      :                            "Cotizado por unidad";
    const obsTexto    = prod.observacion?.trim()
      ? `Obs: ${modoLabel}  —  ${prod.observacion.trim()}`
      : `Obs: ${modoLabel}`;
    const obsRow = new Array(headAll.length).fill("");
    obsRow[0] = obsTexto;
    bodyRows.push(obsRow);
  });

  const availW = PW - M * 2;
  const colW: Record<number, number> = {
    0: 32, 1: 16, 2: 7, 3: 9, 4: 9,
    5: 16, 6: 11, 7: 9, 8: 14, 9: 11,
    10: 13, 11: 11, 12: 28, 13: 18,
  };
  const fixedTotal = Object.values(colW).reduce((a, b) => a + b, 0);
  const cantW = Math.max((availW - fixedTotal) / numCantCols, 13);
  for (let i = 0; i < numCantCols; i++) colW[14 + i] = cantW;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head:   [headAll],
    body:   bodyRows,
    theme:  "grid",
    headStyles: {
      fillColor:   GRAY_DARK,
      textColor:   WHITE,
      fontStyle:   "bold",
      fontSize:    6,
      cellPadding: 1.2,
      halign:      "center",
      valign:      "middle",
    },
    bodyStyles: {
      fontSize:      6,
      textColor:     BLACK,
      cellPadding:   1.2,
      valign:        "middle",
      minCellHeight: 7,
    },
    columnStyles: Object.fromEntries(
      Object.entries(colW).map(([k, v]) => [
        Number(k),
        { cellWidth: v, halign: Number(k) === 0 || Number(k) === 12 ? "left" : "center" },
      ])
    ),
    alternateRowStyles: { fillColor: GRAY_ROW },
    didParseCell(data) {
      if (data.section === "head" && data.column.index >= 14) {
        data.cell.styles.fillColor = GRAY_MED;
      }
      if (data.section === "body") {
        const raw0 = String((data.row.raw as any[])?.[0] ?? "");
        if (raw0.startsWith("Obs:")) {
          if (data.column.index === 0) {
            data.cell.colSpan             = headAll.length;
            data.cell.styles.fillColor    = GRAY_LIGHT;
            data.cell.styles.fontStyle    = "italic";
            data.cell.styles.fontSize     = 6;
            data.cell.styles.textColor    = [80, 80, 80];
            data.cell.styles.halign       = "left";
          } else {
            data.cell.styles.fillColor = GRAY_LIGHT;
            data.cell.text = [];
          }
        }
      }
    },
  });

  // ══════════════════════════════════════════════════════════
  // PIE: Observaciones | Condiciones de Venta
  // ══════════════════════════════════════════════════════════
  const FOOTER_H      = 35;
  const fY            = PH - M - FOOTER_H;
  const halfW         = (PW - M * 2) / 2;
  const footerHeaderH = 6;

  const condLines = [
    "• Precios más IVA.",
    "• Tiempo de entrega: 30-35 días después de autorizado el diseño.",
    "• L.A.B. Guadalajara. EL FLETE VA POR CUENTA DEL CLIENTE.",
    "• Condiciones de Pago: 50% ANTICIPO, resto contra entrega.",
    "• Esta cotización puede variar +/- 10% en la cantidad final.",
    "• Precios sujetos a cambio sin previo aviso.",
  ];
  const boxH = footerHeaderH + condLines.length * 3.8 + 4;

  const obsText = cotizacion.productos
    .filter(p => p.observacion?.trim())
    .map(p => `• ${p.observacion}`)
    .join("\n");

  doc.setDrawColor(...BLACK); doc.setLineWidth(0.3);

  // Caja observaciones
  doc.rect(M, fY, halfW - 2, boxH);
  doc.setFillColor(...GRAY_DARK);
  doc.rect(M, fY, halfW - 2, footerHeaderH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...WHITE);
  doc.text("Observaciones", M + (halfW - 2) / 2, fY + 4, { align: "center" });
  doc.setTextColor(...BLACK); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
  if (obsText) {
    doc.text(doc.splitTextToSize(obsText, halfW - 6), M + 2, fY + footerHeaderH + 4);
  } else {
    doc.setTextColor(...GRAY_MED); doc.text("—", M + 2, fY + footerHeaderH + 4); doc.setTextColor(...BLACK);
  }

  // Caja condiciones
  const cvX = M + halfW;
  doc.rect(cvX, fY, halfW - 2, boxH);
  doc.setFillColor(...GRAY_DARK);
  doc.rect(cvX, fY, halfW - 2, footerHeaderH, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...WHITE);
  doc.text("Condiciones de Venta", cvX + (halfW - 2) / 2, fY + 4, { align: "center" });
  doc.setTextColor(...BLACK); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
  let cvY = fY + footerHeaderH + 4;
  condLines.forEach(line => { doc.text(line, cvX + 2, cvY); cvY += 3.8; });

  // Pie de página
  const total = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(150, 150, 150);
    doc.text(
      `Folio #${cotizacion.no_cotizacion}  ·  ${val(formatFecha(cotizacion.fecha))}  ·  Página ${p} de ${total}`,
      PW / 2, PH - 3, { align: "center" }
    );
  }

  doc.save(`Cotizacion_${cotizacion.no_cotizacion}.pdf`);
}