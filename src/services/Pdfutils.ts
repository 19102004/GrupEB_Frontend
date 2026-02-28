// pdfUtils.ts — Utilidades compartidas entre generadores de PDF

import jsPDF from "jspdf";

// ── Paleta B&N ────────────────────────────────────────────────────────────────
export const GRAY_DARK  = [80,  80,  80]  as [number, number, number];
export const GRAY_MED   = [160, 160, 160] as [number, number, number];
export const GRAY_LIGHT = [220, 220, 220] as [number, number, number];
export const GRAY_ROW   = [240, 240, 240] as [number, number, number];
export const BLACK      = [0,   0,   0]   as [number, number, number];
export const WHITE      = [255, 255, 255] as [number, number, number];

// ── Tipos compartidos ─────────────────────────────────────────────────────────
export interface DetallePdf {
  cantidad:       number;
  precio_total:   number;
  kilogramos?:    number | null;
  modo_cantidad?: "unidad" | "kilo";
}

export interface ProductoPdf {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
export async function cargarLogoBase64(ruta: string): Promise<string | null> {
  try {
    const r = await fetch(ruta);
    const b = await r.blob();
    return await new Promise<string>((res, rej) => {
      const reader   = new FileReader();
      reader.onload  = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(b);
    });
  } catch { return null; }
}

export function val(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s === "" ? "—" : s;
}

export function boolLabel(v: boolean | string | null | undefined): string {
  if (v === true  || v === "true"  || v === "1") return "SI";
  if (v === false || v === "false" || v === "0") return "—";
  const s = v ? String(v).trim() : "";
  return s !== "" ? s : "—";
}

export function parsePantones(p: string | string[] | null | undefined): string {
  if (!p) return "—";
  if (Array.isArray(p)) { const f = p.filter(Boolean); return f.length ? f.join(", ") : "—"; }
  const s = String(p).trim();
  return s || "—";
}

export function getMedida(prod: ProductoPdf): string {
  if (prod.medidasFormateadas?.trim()) return prod.medidasFormateadas;
  if (!prod.medidas) return "—";
  const ps = [prod.medidas.altura, prod.medidas.ancho, prod.medidas.fuelleFondo]
    .filter(v => v?.trim());
  return ps.length ? ps.join("X") : "—";
}

export function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

export function formatCantidadCelda(det: DetallePdf, porKilo?: string | number | null): string {
  const precioUnit = det.precio_total / det.cantidad;

  if (det.modo_cantidad === "kilo" && det.kilogramos && det.kilogramos > 0) {
    const pk    = Number(porKilo || 1);
    const kgStr = Number.isInteger(det.kilogramos)
      ? det.kilogramos.toString()
      : Number(det.kilogramos).toFixed(2);
    return `${kgStr} kg\n$${(precioUnit * pk).toFixed(2)}/kg`;
  }

  return `${det.cantidad.toLocaleString("es-MX")}\n$${precioUnit.toFixed(2)}/pza`;
}

// ── Encabezado compartido (logo + dirección + caja folio + datos cliente) ─────
export interface OpcionesEncabezado {
  doc:           jsPDF;
  logoBase64:    string | null;
  labelDocumento: string;   // "COTIZACION" | "PEDIDO"
  labelFolio:    string;    // "No F" | "No P"
  folio:         number;
  refTexto?:     string;    // texto pequeño debajo del folio, ej: "Ref. Cot. #12"
  fecha:         string;
  empresa:       string;
  impresion?:    string | null;
  cliente:       string;
  telefono:      string;
  correo:        string;
}

/**
 * Dibuja el encabezado completo y devuelve la Y donde termina,
 * lista para empezar la tabla de productos.
 */
export function dibujarEncabezado(opts: OpcionesEncabezado): number {
  const { doc, logoBase64, labelDocumento, labelFolio, folio, refTexto,
          fecha, empresa, impresion, cliente, telefono, correo } = opts;

  const PW = 297; const M = 8;
  const row1H = 24; const row2H = 6; const row3H = 6;
  const totalHeaderH = row1H + row2H + row3H;
  const logoW  = 30;
  let y = M;

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
  [
    "Rogelio Ledesma # 102  Col. Cruz Vieja  Tlajomulco de Zuñiga, Jalisco.",
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
  doc.text(labelDocumento, cotBoxX + cotBoxW / 2, y + hH / 2 + 1.5, { align: "center" });

  doc.line(cotBoxX, y + hH, cotBoxX + cotBoxW, y + hH);
  doc.line(cotBoxX + cotBoxW / 2, y + hH, cotBoxX + cotBoxW / 2, y + totalHeaderH);
  doc.line(cotBoxX, y + hH * 2, cotBoxX + cotBoxW, y + hH * 2);
  // Fila No F — sin fondo, etiqueta pequeña + valor
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY_DARK);
  doc.text(labelFolio, cotBoxX + cotBoxW / 4, y + hH + hH - 2, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLACK);
  doc.text(String(folio), cotBoxX + cotBoxW * 0.75, y + hH + hH / 2 + 1.5, { align: "center" });

  const fecY = y + hH * 2;
  // Fila FECHA — sin fondo, etiqueta pequeña + valor
  doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY_DARK);
  doc.text("FECHA", cotBoxX + cotBoxW / 4, fecY + hH - 2, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...BLACK);
  doc.text(val(formatFecha(fecha)), cotBoxX + cotBoxW * 0.75, fecY + hH / 2 + 1.5, { align: "center" });

  y += row1H;

  if (refTexto) {
    // refTexto va debajo de la caja de cliente (filas 2 y 3), no en el encabezado
    // Se dibuja después de las filas de datos para no encimarse
  }

  const infoW = PW - 2 * M - cotBoxW - 1;

  doc.rect(M, y, infoW, row2H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...BLACK);
  doc.text("Empresa:", M + 2, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(empresa), M + 16, y + 4);
  const impX = M + 120;
  doc.setFont("helvetica", "bold"); doc.text("Impresión:", impX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(impresion), impX + 18, y + 4);
  y += row2H;

  doc.rect(M, y, infoW, row3H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7);
  doc.text("Atención:", M + 2, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(cliente), M + 18, y + 4);
  const telX = M + 70;
  doc.setFont("helvetica", "bold"); doc.text("Teléfono:", telX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(telefono), telX + 16, y + 4);
  const emlX = M + 140;
  doc.setFont("helvetica", "bold"); doc.text("E-mail:", emlX, y + 4);
  doc.setFont("helvetica", "normal"); doc.text(val(correo), emlX + 12, y + 4);
  y += row3H;

  if (refTexto) {
    // Pequeño texto debajo de las filas de cliente, alineado a la derecha bajo la caja de folio
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(...GRAY_DARK);
    doc.text(refTexto, cotBoxX + cotBoxW / 2, y + 3.5, { align: "center" });
    doc.setTextColor(...BLACK);
    y += 5;
  } else {
    y += 3;
  }

  return y;
}

// ── Pie de página (número de página en todas) ─────────────────────────────────
export function dibujarPiePagina(doc: jsPDF, labelDocumento: string, folio: number, fecha: string): void {
  const PW = 297; const PH = 210;
  const total = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(150, 150, 150);
    doc.text(
      `${labelDocumento} #${folio}  ·  ${val(formatFecha(fecha))}  ·  Página ${p} de ${total}`,
      PW / 2, PH - 3, { align: "center" }
    );
  }
}

// ── Cajas de pie (observaciones + condiciones + totales opcionales) ───────────
export interface TotalesPdf {
  subtotal:  number;
  iva:       number;
  total:     number;
  anticipo?: number;  // solo pedido
  saldo?:    number;  // solo pedido
}

export function dibujarCajasPie(
  doc:       jsPDF,
  productos: ProductoPdf[],
  condLines: string[],
  totales?:  TotalesPdf    // solo se pasa en PDF de pedido
): void {
  const PW = 297; const PH = 210; const M = 8;
  const FOOTER_H      = 50;
  const fY            = PH - M - FOOTER_H;
  const footerHeaderH = 6;
  const boxH          = FOOTER_H;

  doc.setDrawColor(...BLACK); doc.setLineWidth(0.3);
  doc.setTextColor(...BLACK);

  // ════════════════════════════════════════════════════════
  // COTIZACIÓN — 2 cajas: Observaciones | Condiciones Venta
  // ════════════════════════════════════════════════════════
  if (!totales) {
    const obsText = productos
      .filter(p => p.observacion?.trim())
      .map(p => `• ${p.observacion}`)
      .join("\n");

    const totalW = PW - M * 2;
    const halfW  = totalW / 2;
    const cotBoxH = footerHeaderH + condLines.length * 3.8 + 4;

    // Observaciones
    doc.rect(M, fY, halfW - 1, cotBoxH);
    doc.setFillColor(...GRAY_DARK);
    doc.rect(M, fY, halfW - 1, footerHeaderH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...WHITE);
    doc.text("Observaciones", M + (halfW - 1) / 2, fY + 4, { align: "center" });
    doc.setTextColor(...BLACK); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
    if (obsText) {
      doc.text(doc.splitTextToSize(obsText, halfW - 5), M + 2, fY + footerHeaderH + 4);
    } else {
      doc.setTextColor(...GRAY_MED); doc.text("—", M + 2, fY + footerHeaderH + 4); doc.setTextColor(...BLACK);
    }

    // Condiciones de Venta
    const cvX = M + halfW;
    doc.rect(cvX, fY, halfW - 1, cotBoxH);
    doc.setFillColor(...GRAY_DARK);
    doc.rect(cvX, fY, halfW - 1, footerHeaderH, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...WHITE);
    doc.text("Condiciones de Venta", cvX + (halfW - 1) / 2, fY + 4, { align: "center" });
    doc.setTextColor(...BLACK); doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
    let cvY = fY + footerHeaderH + 4;
    condLines.forEach(line => { doc.text(line, cvX + 2, cvY); cvY += 3.8; });
    return;
  }

  // ════════════════════════════════════════════════════════
  // PEDIDO — bloque bancario/firmas (izq) + Resumen (der)
  // ════════════════════════════════════════════════════════
  const fmtN = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const RESUMEN_W = 70;   // ancho caja resumen derecha
  const LEFT_W    = PW - M * 2 - RESUMEN_W - 1;

  // ── RESUMEN (derecha) ──────────────────────────────────
  const tvX = M + LEFT_W + 1;
  const tvW = RESUMEN_W;

  const resumenRows: { label: string; value: string; bold: boolean }[] = [
    { label: "Sub-Total", value: fmtN(totales.subtotal),       bold: false },
    { label: "I.V.A.",    value: fmtN(totales.iva),            bold: false },
    { label: "Total",     value: fmtN(totales.total),          bold: true  },
    { label: "Anticipo",  value: fmtN(totales.anticipo ?? 0),  bold: false },
    { label: "Saldo",     value: fmtN(totales.saldo    ?? 0),  bold: false },
  ];

  const etW   = tvW * 0.45;
  const lineH = boxH / resumenRows.length;

  // Borde exterior resumen
  doc.rect(tvX, fY, tvW, boxH);

  resumenRows.forEach((row, i) => {
    const ry = fY + i * lineH;

    if (i > 0) {
      doc.setDrawColor(...GRAY_MED);
      doc.line(tvX, ry, tvX + tvW, ry);
      doc.setDrawColor(...BLACK);
    }

    // Fondo total en gris
    if (row.bold) {
      doc.setFillColor(...GRAY_LIGHT);
      doc.rect(tvX, ry, tvW, lineH, "F");
    }

    // Etiqueta izquierda con fondo gris
    doc.setFillColor(...GRAY_DARK);
    doc.rect(tvX, ry, etW, lineH, "F");
    doc.line(tvX + etW, ry, tvX + etW, ry + lineH);

    // Texto etiqueta
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(7.5); doc.setTextColor(...WHITE);
    doc.text(row.label, tvX + etW / 2, ry + lineH / 2 + 1.5, { align: "center" });

    // Valor
    doc.setFont("helvetica", row.bold ? "bold" : "normal");
    doc.setFontSize(7.5); doc.setTextColor(...BLACK);
    doc.text(row.value, tvX + tvW - 2, ry + lineH / 2 + 1.5, { align: "right" });
  });

  // ── BLOQUE IZQUIERDA ───────────────────────────────────
  // Dividido en: [fila bancaria arriba] / [Anticipo$ | Cheque | Banco | Firma | Condiciones | Autorización | Cliente]
  const lX = M;
  const lW = LEFT_W;

  // Fila 1 — datos bancarios (ancho completo)
  const BANCO_H = 14;
  doc.rect(lX, fY, lW, BANCO_H);
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...BLACK);
  doc.text("Favor de depositar en Banamex.   CTA # 7001070896964.   CLABE", lX + lW / 2, fY + 5, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  doc.text("0023207001070896943.   A nombre de Grupeb S.A. de C.V. y enviar comprobante.", lX + lW / 2, fY + 10, { align: "center" });

  // Fila 2 — subfilas: Anticipo$ | Cheque No. | Banco  (izquierda 40%)
  //           texto legal (centro 35%) | Autorización + Cliente (derecha 25%)
  const F2_Y   = fY + BANCO_H;
  const F2_H   = boxH - BANCO_H;
  const COL1_W = lW * 0.28;   // Anticipo / Cheque / Banco / Firma
  const COL2_W = lW * 0.46;   // texto legal
  const COL3_W = lW - COL1_W - COL2_W;  // Condiciones de Pago / Autorización / Cliente

  // Columna 1 — Anticipo por $ / Cheque No. / Banco / Firma de Recibido
  doc.rect(lX, F2_Y, COL1_W, F2_H);
  const subH = F2_H / 4;
  ["Anticipo por $", "Cheque No.", "Banco", "Firma de Recibido"].forEach((label, i) => {
    const sy = F2_Y + i * subH;
    if (i > 0) doc.line(lX, sy, lX + COL1_W, sy);
    doc.setFont("helvetica", i === 3 ? "normal" : "bold"); doc.setFontSize(6.5); doc.setTextColor(...BLACK);
    const textY = i === 3 ? sy + subH - 2 : sy + subH / 2 + 1;
    doc.text(label, lX + 2, textY);
  });

  // Columna 2 — texto legal (con wrap y clip estricto)
  const col2X = lX + COL1_W;
  doc.rect(col2X, F2_Y, COL2_W, F2_H);
  const legal = [
    "* Para su mayor comodidad en el pago de su anticipo y/o liquidación deberá cubrirlo con cheque nominativo a favor de GRUPEB S.A. de C.V. con la leyenda para depósito en cuenta.",
    "* No nos hacemos responsables por pagos en efectivo.",
    "* En Bolsas impresas, existen cargos adicionales (negativos, diseño, etc.) que deberán cubrirse a contra entrega.",
    "* Todo cheque devuelto causará un 20% por daños y perjuicios según el art. 193 de la Ley de Títulos y Operaciones de Crédito.",
    "* Flete por cuenta del Cliente.",
    "* Su pedido puede tener una variación de un 20% más o un 20% menos en la cantidad final.",
  ];
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...BLACK);
  const maxLy = F2_Y + F2_H - 2;
  let ly = F2_Y + 3.5;
  for (const line of legal) {
    const wrapped: string[] = doc.splitTextToSize(line, COL2_W - 3);
    for (const wl of wrapped) {
      if (ly + 3 > maxLy) break;
      doc.text(wl, col2X + 1.5, ly);
      ly += 3.0;
    }
    if (ly + 3 > maxLy) break;
  }

    // Columna 3 — Condiciones de Pago (header) / Autorización / Cliente
  const col3X = col2X + COL2_W;
  doc.rect(col3X, F2_Y, COL3_W, F2_H);

  // Header "Condiciones de Pago"
  const CON_H = 6;
  doc.setFillColor(...GRAY_DARK);
  doc.rect(col3X, F2_Y, COL3_W, CON_H, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(6); doc.setTextColor(...WHITE);
  doc.text("Condiciones de Pago", col3X + COL3_W / 2, F2_Y + 4, { align: "center" });
  doc.setTextColor(...BLACK);

  // Autorización — label pequeño abajo de la celda, sin relleno marcado
  const AUT_H = (F2_H - CON_H) / 2;
  doc.rect(col3X, F2_Y + CON_H, COL3_W, AUT_H);
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...GRAY_DARK);
  doc.text("Autorización", col3X + COL3_W / 2, F2_Y + CON_H + AUT_H - 1.5, { align: "center" });

  // Cliente — label pequeño abajo de la celda, sin relleno marcado
  doc.rect(col3X, F2_Y + CON_H + AUT_H, COL3_W, AUT_H);
  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5); doc.setTextColor(...GRAY_DARK);
  doc.text("Cliente", col3X + COL3_W / 2, F2_Y + CON_H + AUT_H * 2 - 1.5, { align: "center" });
  doc.setTextColor(...BLACK);
}