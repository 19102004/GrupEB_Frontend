import { useState } from "react";
import type { Cotizacion, ProductoCotizacion } from "../types/cotizaciones.types";
import {
  aprobarDetalle,
  actualizarObservacion,
  actualizarEstado,
} from "../services/cotizacionesService";

const ESTADO_ID = {
  PENDIENTE:  1,
  EN_PROCESO: 2,
  APROBADO:   3,
  RECHAZADO:  4,
} as const;

interface EditarCotizacionProps {
  cotizacion: Cotizacion;
  onSave: (cotizacionActualizada: Cotizacion) => void;
  onCancel: () => void;
}

function normalizarEstado(estado: string): "Pendiente" | "Aprobada" | "Rechazada" {
  const s = (estado ?? "").toLowerCase().trim();
  if (s === "aprobado" || s === "aprobada") return "Aprobada";
  if (s === "rechazado" || s === "rechazada") return "Rechazada";
  return "Pendiente";
}

export default function EditarCotizacion({
  cotizacion,
  onSave,
  onCancel,
}: EditarCotizacionProps) {
  const [estadoActual, setEstadoActual] = useState<"Pendiente" | "Aprobada" | "Rechazada">(
    normalizarEstado(cotizacion.estado)
  );

  const [productos, setProductos] = useState<ProductoCotizacion[]>(
    cotizacion.productos.map((p) => ({ ...p, detalles: [...p.detalles] }))
  );

  const [guardando,      setGuardando]      = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [mensajeExito,   setMensajeExito]   = useState<string | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState<number | null>(null);

  const totalDetallesAprobados = productos
    .flatMap((p) => p.detalles)
    .filter((d) => d.aprobado === true).length;

  const totalDetalles = productos.flatMap((p) => p.detalles).length;

  const textoBtnAprobar =
    estadoActual === "Pendiente" && totalDetallesAprobados === 0
      ? "Aprobar Cotización"
      : "Guardar Cambios";

  const handleToggleDetalle = async (
    indexProd:   number,
    indexDet:    number,
    detalleId:   number,
    valorActual: boolean | null
  ) => {
    const nuevoValor = valorActual !== true;
    setLoadingDetalle(detalleId);
    setError(null);
    setMensajeExito(null);
    try {
      await aprobarDetalle(detalleId, nuevoValor);
      setProductos((prev) => {
        const copia = prev.map((p) => ({ ...p, detalles: [...p.detalles] }));
        copia[indexProd].detalles[indexDet] = {
          ...copia[indexProd].detalles[indexDet],
          aprobado: nuevoValor,
        };
        return copia;
      });
    } catch {
      setError("No se pudo actualizar la selección. Intenta de nuevo.");
    } finally {
      setLoadingDetalle(null);
    }
  };

  const handleObservacion = async (
    indexProd:  number,
    productoId: number,
    valor:      string
  ) => {
    setProductos((prev) => {
      const copia = [...prev];
      copia[indexProd] = { ...copia[indexProd], observacion: valor };
      return copia;
    });
    try {
      await actualizarObservacion(productoId, valor);
    } catch {
      setError("No se pudo guardar la observación.");
    }
  };

  const handleCambiarEstado = async (estadoId: number) => {
    if (estadoId === ESTADO_ID.RECHAZADO) {
      const msg =
        totalDetallesAprobados === 0
          ? "¿Estás seguro de rechazar esta cotización sin haber aprobado ninguna opción?"
          : "¿Estás seguro de rechazar esta cotización?";
      if (!confirm(msg)) return;
    }
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      await actualizarEstado(cotizacion.no_cotizacion, estadoId);
      const estadoNombre = estadoId === ESTADO_ID.APROBADO ? "Aprobada" : "Rechazada";
      setEstadoActual(estadoNombre);
      setMensajeExito(
        estadoId === ESTADO_ID.APROBADO
          ? "✓ Cotización aprobada exitosamente"
          : "Cotización marcada como rechazada"
      );
      onSave({
        ...cotizacion,
        productos,
        estado_id: estadoId,
        estado:    estadoNombre,
      });
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setGuardando(false);
    }
  };

  const calcularTotal = () =>
    productos.reduce(
      (sum, prod) =>
        sum + prod.detalles
          .filter((d) => d.aprobado === true)
          .reduce((s, d) => s + d.precio_total, 0),
      0
    );

  const estadoColor = { Aprobada: "text-green-600", Rechazada: "text-red-600", Pendiente: "text-yellow-600" };
  const estadoIcono = { Aprobada: "✓", Rechazada: "✕", Pendiente: "⏱" };

  // ✅ Parsear pantones: puede venir como string "Negro, Blanco" o array ["Negro","Blanco"]
  const parsearPantones = (pantones: any): string[] => {
    if (!pantones) return [];
    if (Array.isArray(pantones)) return pantones.filter(Boolean);
    if (typeof pantones === "string") return pantones.split(",").map((p: string) => p.trim()).filter(Boolean);
    return [];
  };

  return (
    <div className="space-y-5">

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-2">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 text-lg leading-none">×</button>
        </div>
      )}

      {mensajeExito && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between gap-2">
          <p className="text-green-700 text-sm font-medium">{mensajeExito}</p>
          <button onClick={() => setMensajeExito(null)} className="text-green-400 hover:text-green-700 text-lg leading-none">×</button>
        </div>
      )}

      {/* Info cliente */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">Información del Cliente</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Cliente:</span><span className="ml-1 font-semibold text-gray-900">{cotizacion.cliente || "—"}</span></div>
          <div><span className="text-gray-500">Empresa:</span><span className="ml-1 font-semibold text-gray-900">{cotizacion.empresa || "—"}</span></div>
          <div><span className="text-gray-500">Teléfono:</span><span className="ml-1 text-gray-900">{cotizacion.telefono || "—"}</span></div>
          <div><span className="text-gray-500">Correo:</span><span className="ml-1 text-gray-900">{cotizacion.correo || "—"}</span></div>
        </div>
      </div>

      {/* Productos */}
      <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-purple-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Selección de Cantidades</h3>
            <p className="text-xs text-gray-500 mt-0.5">Haz clic para aprobar o desaprobar.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Cantidades aprobadas</div>
            <div className={`text-lg font-bold ${totalDetallesAprobados > 0 ? "text-green-600" : "text-orange-500"}`}>
              {totalDetallesAprobados}/{totalDetalles}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 bg-gray-50">
          {productos.map((prod, iProd) => {
            const pantonesList = parsearPantones(prod.pantones);
            const tienePantones = pantonesList.length > 0;
            const tienePigmentos = !!prod.pigmentos;

            return (
              <div key={prod.idcotizacion_producto} className="bg-white border-2 border-gray-200 rounded-lg p-4">

                {/* Encabezado producto */}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 text-base">{prod.nombre}</h4>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    {prod.calibre  && <span>Calibre: <strong className="text-gray-700">{prod.calibre}</strong></span>}
                    <span>Tintas: <strong className="text-gray-700">{prod.tintas}</strong></span>
                    <span>Caras: <strong className="text-gray-700">{prod.caras}</strong></span>
                    {prod.asa_suaje && <span>Suaje: <strong className="text-blue-700">{prod.asa_suaje}</strong></span>}
                  </div>

                  {/* ✅ Pantones */}
                  {tienePantones && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">🎨 Pantones:</span>
                      {pantonesList.map((p, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium border border-purple-200"
                        >
                          <span className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-xs">{i + 1}</span>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ✅ Pigmentos */}
                  {tienePigmentos && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">🧪 Pigmento:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-medium border border-orange-200">
                        {prod.pigmentos}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cantidades */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mb-3">
                  <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">
                    Cantidades cotizadas — selecciona las que aprueba el cliente
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {prod.detalles.map((det, iDet) => {
                      const isSelected = det.aprobado === true;
                      const isRejected = det.aprobado === false;
                      const isLoading  = loadingDetalle === det.iddetalle;
                      const precioUnit = det.cantidad > 0 ? det.precio_total / det.cantidad : 0;

                      return (
                        <div
                          key={det.iddetalle}
                          onClick={() => !isLoading && handleToggleDetalle(iProd, iDet, det.iddetalle, det.aprobado)}
                          className={`p-3 rounded-lg border-2 transition-all select-none ${
                            isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"
                          } ${
                            isSelected ? "bg-green-100 border-green-500 shadow-md" :
                            isRejected ? "bg-red-50 border-red-300 opacity-60 hover:opacity-80" :
                            "bg-white border-gray-300 hover:border-green-400 hover:shadow"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isLoading  ? "border-gray-300 bg-gray-100" :
                              isSelected ? "bg-green-600 border-green-600" :
                              "border-gray-400 bg-white"
                            }`}>
                              {isLoading ? (
                                <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                              ) : isSelected ? (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : null}
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isSelected ? "bg-green-600 text-white" :
                              isRejected ? "bg-red-200 text-red-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {isSelected ? "✓ Aprobada" : isRejected ? "✕ Rechazada" : `Opción ${iDet + 1}`}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Cantidad:</span>
                              <span className="font-bold text-gray-900">{det.cantidad.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Precio c/u:</span>
                              <span className="font-semibold text-gray-900">${precioUnit.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                              <span className="font-semibold text-gray-700">Subtotal:</span>
                              <span className="font-bold text-green-700">${det.precio_total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Observación */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observación del producto</label>
                  <textarea
                    value={prod.observacion ?? ""}
                    onChange={(e) => handleObservacion(iProd, prod.idcotizacion_producto, e.target.value)}
                    rows={2}
                    placeholder="Notas internas sobre este producto..."
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Resumen</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-600 text-sm">Estado actual:</span>
            <span className={`font-bold text-lg ${estadoColor[estadoActual]}`}>
              {estadoIcono[estadoActual]} {estadoActual}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total aprobado:</span>
            <span className="text-2xl font-bold text-gray-900">${calcularTotal().toFixed(2)}</span>
          </div>
          {totalDetallesAprobados === 0 && (
            <p className="text-xs text-orange-500 mt-1">⚠️ Ninguna cantidad seleccionada aún</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={guardando || totalDetallesAprobados === 0}
            onClick={() => handleCambiarEstado(ESTADO_ID.APROBADO)}
            title={totalDetallesAprobados === 0 ? "Selecciona al menos una cantidad primero" : ""}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            {guardando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {guardando ? "Guardando..." : textoBtnAprobar}
          </button>

          <button
            disabled={guardando}
            onClick={() => handleCambiarEstado(ESTADO_ID.RECHAZADO)}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rechazar
          </button>
        </div>

        {estadoActual !== "Pendiente" && (
          <div className={`p-3 rounded-lg text-center text-sm font-medium ${
            estadoActual === "Aprobada"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-yellow-50 text-yellow-800 border border-yellow-300"
          }`}>
            {estadoActual === "Aprobada"
              ? "✓ Cotización aprobada. Puedes cambiar la selección y guardar de nuevo si es necesario."
              : "⚠️ Cotización rechazada. Cambia la selección y aprueba de nuevo si lo requieres."}
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}