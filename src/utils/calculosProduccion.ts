import type { TarifaProduccion } from "../types/catalogos-produccion.types";

export interface ResultadoCalculo {
  peso_total_kg: number;
  precio_kg: number;
  merma_porcentaje: number;
  costo_produccion: number;
  costo_merma: number; // Informativo (NO afecta el precio)
  costo_total: number; // Solo producción
  precio_unitario: number;
  kilogramos_rango: number; // kg_min aplicado
  tarifa_id: number;
  kilogramos_id: number;
}

// ============================================
// BUSCAR TARIFA CORRECTA (usando kg_min / kg_max)
// ============================================
const buscarTarifa = (
  tarifas: TarifaProduccion[],
  tintasId: number,
  carasId: number,
  pesoTotalKg: number
): TarifaProduccion | null => {

  const tarifa = tarifas.find(
    (t) =>
      t.tintas_idtintas === tintasId &&
      t.caras_idcaras === carasId &&
      pesoTotalKg >= t.kg_min &&
      (t.kg_max === null || pesoTotalKg < t.kg_max)
  );

  if (!tarifa) {
    console.warn("⚠️ No se encontró tarifa para:", pesoTotalKg, "kg");
    return null;
  }

  return tarifa;
};

// ============================================
// CALCULAR PRECIO UNITARIO
// ============================================
export const calcularPrecioUnitario = (
  cantidad: number,
  porKilo: number,
  tintasId: number,
  carasId: number,
  tarifas: TarifaProduccion[]
): ResultadoCalculo | null => {

  if (cantidad <= 0 || porKilo <= 0 || !tarifas.length) return null;

  // 1️⃣ Calcular peso total
  const peso_total_kg = cantidad / porKilo;

  // 2️⃣ Buscar tarifa según rango definido en BD
  const tarifa = buscarTarifa(tarifas, tintasId, carasId, peso_total_kg);

  if (!tarifa) return null;

  // 3️⃣ Calcular costos base
  const costo_produccion = peso_total_kg * tarifa.precio;

  // ⚠️ Merma solo informativa
  const costo_merma = costo_produccion * (tarifa.merma_porcentaje / 100);

  // ✅ El costo total NO incluye merma
  const costo_total = costo_produccion;

  // ✅ Precio unitario limpio
  const precio_unitario = costo_produccion / cantidad;

  console.log("💰 Cálculo producción:", {
    cantidad,
    peso_total_kg: peso_total_kg.toFixed(2) + " kg",
    rango_aplicado: `${tarifa.kg_min} - ${tarifa.kg_max ?? "∞"} kg`,
    tintas: tintasId,
    caras: carasId,
    precio_kg: "$" + tarifa.precio,
    merma: tarifa.merma_porcentaje + "%",
    costo_produccion: "$" + costo_produccion.toFixed(2),
    costo_merma: "$" + costo_merma.toFixed(2) + " (informativo)",
    costo_total: "$" + costo_total.toFixed(2),
    precio_unitario: "$" + precio_unitario.toFixed(4),
  });

  return {
    peso_total_kg,
    precio_kg: tarifa.precio,
    merma_porcentaje: tarifa.merma_porcentaje,
    costo_produccion,
    costo_merma,
    costo_total,
    precio_unitario,
    kilogramos_rango: tarifa.kg_min,
    tarifa_id: tarifa.id,
    kilogramos_id: tarifa.kilogramos_idkilogramos,
  };
};
