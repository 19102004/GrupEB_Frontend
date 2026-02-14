// generarPdfCotizacion.ts
// Genera y descarga el PDF de una cotización usando jsPDF
// Instalación: npm install jspdf jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Tipos completos del producto ─────────────────────────────────────────────
interface DetallePdf {
  cantidad: number;
  precio_total: number;
}

interface ProductoPdf {
  nombre:            string;
  tintas:            number | string;
  caras:             number | string;
  calibre?:          string;
  material?:         string;
  medidasFormateadas?: string;
  medidas?: {
    altura?:         string;
    ancho?:          string;
    fuelleFondo?:    string;
    fuelleLateral1?: string;
    fuelleLateral2?: string;
    refuerzo?:       string;
    solapa?:         string;
  };
  bk?:           string | null;
  foil?:         string | null;
  laminado?:     string | null;
  uvBr?:         string | null;
  pigmentos?:    string | null;
  pantones?:     string | null;
  observacion?:  string | null;
  detalles:      DetallePdf[];
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
  logoBase64?:   string; // se carga automáticamente si no se pasa
}

// ── Colores ──────────────────────────────────────────────────────────────────
const C = {
  primary:   [30, 64, 175]   as [number, number, number], // blue-800
  dark:      [17, 24, 39]    as [number, number, number], // gray-900
  lightBg:   [239, 246, 255] as [number, number, number], // blue-50
  gray:      [107, 114, 128] as [number, number, number], // gray-500
  lightGray: [243, 244, 246] as [number, number, number], // gray-100
  border:    [229, 231, 235] as [number, number, number], // gray-200
  green:     [22, 163, 74]   as [number, number, number], // green-600
  white:     [255, 255, 255] as [number, number, number],
  headerBg:  [15, 23, 42]    as [number, number, number], // slate-900
};

// ── Cargar imagen como base64 desde assets ───────────────────────────────────
async function cargarLogoBase64(ruta: string): Promise<string | null> {
  try {
    const response = await fetch(ruta);
    const blob     = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader  = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    console.warn("⚠️ No se pudo cargar el logo:", ruta);
    return null;
  }
}

// ── Construir texto de medidas legible ───────────────────────────────────────
function formatearMedidas(prod: ProductoPdf): string {
  if (prod.medidasFormateadas) return prod.medidasFormateadas;
  if (!prod.medidas) return "—";
  const m = prod.medidas;
  const partes: string[] = [];
  if (m.altura)        partes.push(`Alto: ${m.altura}`);
  if (m.ancho)         partes.push(`Ancho: ${m.ancho}`);
  if (m.fuelleFondo)   partes.push(`F.Fondo: ${m.fuelleFondo}`);
  if (m.fuelleLateral1) partes.push(`F.Lat.Iz: ${m.fuelleLateral1}`);
  if (m.fuelleLateral2) partes.push(`F.Lat.De: ${m.fuelleLateral2}`);
  if (m.refuerzo)      partes.push(`Refuerzo: ${m.refuerzo}`);
  if (m.solapa)        partes.push(`Solapa: ${m.solapa}`);
  return partes.join("  |  ") || "—";
}

// ── Construir lista de extras ────────────────────────────────────────────────
function extras(prod: ProductoPdf): string {
  const lista: string[] = [];
  if (prod.bk)       lista.push(`BK: ${prod.bk}`);
  if (prod.foil)     lista.push(`Foil: ${prod.foil}`);
  if (prod.laminado) lista.push(`Laminado: ${prod.laminado}`);
  if (prod.uvBr)     lista.push(`UV Brillante: ${prod.uvBr}`);
  if (prod.pigmentos) lista.push(`Pigmentos: ${prod.pigmentos}`);
  if (prod.pantones)  lista.push(`Pantones: ${prod.pantones}`);
  return lista.join("   |   ");
}

// ── Función principal ────────────────────────────────────────────────────────
export async function generarPdfCotizacion(cotizacion: CotizacionPdf): Promise<void> {
  // Cargar logo
  const logoBase64 = cotizacion.logoBase64
    ?? await cargarLogoBase64("/src/assets/grupeblanco.png");

  const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const M      = 14; // margen
  const IW     = PAGE_W - M * 2; // inner width

  let y = 0;

  // ══════════════════════════════════════════════════════════
  // ENCABEZADO
  // ══════════════════════════════════════════════════════════
  // Fondo oscuro
  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, PAGE_W, 42, "F");

  // Logo (si cargó)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", M, 6, 45, 18);
    } catch {
      // Si falla la imagen, mostrar texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...C.white);
      doc.text("GRUPE", M, 18);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C.white);
    doc.text("GRUPE", M, 18);
  }

  // Título derecha
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.white);
  doc.text("COTIZACIÓN", PAGE_W - M, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Folio #${cotizacion.no_cotizacion}`, PAGE_W - M, 24, { align: "right" });

  // Fecha
  const fechaStr = (() => {
    try {
      return new Date(cotizacion.fecha).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
      });
    } catch { return cotizacion.fecha; }
  })();
  doc.setFontSize(8.5);
  doc.text(`Fecha: ${fechaStr}`, PAGE_W - M, 31, { align: "right" });

  // Badge estado
  const estadoColor: Record<string, [number, number, number]> = {
    Aprobada:  [22, 163, 74],
    Rechazada: [220, 38, 38],
    Pendiente: [202, 138, 4],
  };
  const badgeC = estadoColor[cotizacion.estado] ?? C.gray;
  doc.setFillColor(...badgeC);
  doc.roundedRect(PAGE_W - M - 28, 33, 28, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text(cotizacion.estado.toUpperCase(), PAGE_W - M - 14, 38, { align: "center" });

  y = 50;

  // ══════════════════════════════════════════════════════════
  // DATOS DEL CLIENTE
  // ══════════════════════════════════════════════════════════
  doc.setFillColor(...C.lightBg);
  doc.roundedRect(M, y, IW, 30, 2, 2, "F");
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y, IW, 30, 2, 2, "S");

  // Barra de título sección
  doc.setFillColor(...C.primary);
  doc.roundedRect(M, y, IW, 7, 2, 2, "F");
  doc.rect(M, y + 3, IW, 4, "F"); // esquinas inferiores rectas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.white);
  doc.text("DATOS DEL CLIENTE", M + 4, y + 5.5);

  const col1x = M + 4;
  const col2x = M + IW / 2 + 2;

  const filaCliente = (label: string, val: string, x: number, yy: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.gray);
    doc.text(`${label}:`, x, yy);
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.text(val || "—", x + 22, yy);
  };

  filaCliente("Cliente",  cotizacion.cliente,  col1x, y + 14);
  filaCliente("Empresa",  cotizacion.empresa,  col1x, y + 21);
  filaCliente("Teléfono", cotizacion.telefono, col2x, y + 14);
  filaCliente("Correo",   cotizacion.correo,   col2x, y + 21);

  y += 37;

  // ══════════════════════════════════════════════════════════
  // PRODUCTOS
  // ══════════════════════════════════════════════════════════
  cotizacion.productos.forEach((prod, index) => {
    // Salto de página si hace falta
    if (y > 230) { doc.addPage(); y = 16; }

    // ── Cabecera del producto ────────────────────────────────
    doc.setFillColor(...C.primary);
    doc.roundedRect(M, y, IW, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.white);
    doc.text(`${index + 1}.  ${prod.nombre}`, M + 4, y + 6.3);
    y += 11;

    // ── Ficha técnica ────────────────────────────────────────
    doc.setFillColor(...C.lightGray);
    const fichaH = 28;
    doc.roundedRect(M, y, IW, fichaH, 1, 1, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(M, y, IW, fichaH, 1, 1, "S");

    // Col 1
    const c1 = M + 4;
    const c2 = M + IW / 3 + 2;
    const c3 = M + (IW * 2) / 3 + 2;

    const spec = (label: string, val: string | number | undefined | null, x: number, yy: number) => {
      if (!val && val !== 0) return;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.gray);
      doc.text(`${label}:`, x, yy);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dark);
      doc.text(String(val), x + 18, yy);
    };

    spec("Material",  prod.material,                   c1, y + 7);
    spec("Calibre",   prod.calibre,                    c1, y + 14);
    spec("Medidas",   formatearMedidas(prod),           c1, y + 21);

    spec("Tintas",    `${prod.tintas}`,                c2, y + 7);
    spec("Caras",     `${prod.caras}`,                 c2, y + 14);

    // Extras en c3
    const extrasStr = extras(prod);
    if (extrasStr) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.gray);
      doc.text("Extras:", c3, y + 7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dark);
      // Wrap si es muy largo
      const lines = doc.splitTextToSize(extrasStr, IW / 3 - 4);
      doc.text(lines, c3, y + 14);
    }

    y += fichaH + 2;

    // ── Tabla de cantidades ──────────────────────────────────
    if (y > 245) { doc.addPage(); y = 16; }

    const tableRows = prod.detalles.map((det, i) => {
      const precioUnit = det.cantidad > 0 ? det.precio_total / det.cantidad : 0;
      return [
        `Opción ${i + 1}`,
        det.cantidad.toLocaleString("es-MX"),
        `$${precioUnit.toFixed(4)}`,
        `$${det.precio_total.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY:  y,
      margin:  { left: M, right: M },
      head:    [["", "Cantidad", "Precio unitario", "Subtotal"]],
      body:    tableRows,
      theme:   "grid",
      headStyles: {
        fillColor:   [30, 64, 175],
        textColor:   C.white,
        fontStyle:   "bold",
        fontSize:    8,
        cellPadding: 3,
        halign:      "center",
      },
      bodyStyles: {
        fontSize:    8.5,
        textColor:   C.dark,
        cellPadding: 3.5,
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: "bold", textColor: C.gray, halign: "center" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right", fontStyle: "bold", textColor: C.green },
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      tableLineColor: C.border,
      tableLineWidth: 0.15,
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    // ── Observación ──────────────────────────────────────────
    if (prod.observacion) {
      if (y > 265) { doc.addPage(); y = 16; }
      doc.setFillColor(255, 251, 235); // amber-50
      doc.roundedRect(M, y, IW, 10, 1, 1, "F");
      doc.setDrawColor(251, 191, 36); // amber-400
      doc.setLineWidth(0.3);
      doc.roundedRect(M, y, IW, 10, 1, 1, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text("Obs:", M + 3, y + 6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 53, 15);
      const obsLines = doc.splitTextToSize(prod.observacion, IW - 16);
      doc.text(obsLines, M + 12, y + 6.5);
      y += 13;
    }

    y += 4;
  });

  // ══════════════════════════════════════════════════════════
  // TOTAL GENERAL
  // ══════════════════════════════════════════════════════════
  if (y > 262) { doc.addPage(); y = 16; }

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.5);
  doc.line(M, y, PAGE_W - M, y);
  y += 5;

  // Caja de total
  doc.setFillColor(...C.primary);
  doc.roundedRect(PAGE_W - M - 75, y, 75, 16, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text("TOTAL GENERAL:", PAGE_W - M - 71, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`$${cotizacion.total.toFixed(2)}`, PAGE_W - M - 3, y + 12, { align: "right" });

  y += 24;

  // Nota de vigencia
  if (y > 278) { doc.addPage(); y = 16; }
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.gray);
  doc.text(
    "Esta cotización tiene una vigencia de 30 días a partir de la fecha de emisión.",
    PAGE_W / 2, y, { align: "center" }
  );

  // ══════════════════════════════════════════════════════════
  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  // ══════════════════════════════════════════════════════════
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...C.headerBg);
    doc.rect(0, 285, PAGE_W, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Folio #${cotizacion.no_cotizacion}  ·  Generado el ${new Date().toLocaleDateString("es-MX")}`,
      M, 291
    );
    doc.text(`Página ${p} de ${totalPages}`, PAGE_W - M, 291, { align: "right" });
  }

  // ── Descargar ────────────────────────────────────────────────────────────
  doc.save(`Cotizacion_${cotizacion.no_cotizacion}.pdf`);
}