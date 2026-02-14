import api from "./api";

// ============================================================
// OBTENER COTIZACIONES
// ============================================================
export const getCotizaciones = async () => {
  const response = await api.get("/cotizaciones");
  return response.data;
};

// ============================================================
// CREAR COTIZACIÓN
//
// Recibe exactamente el objeto `datos` que entrega
// FormularioCotizacion en su onSubmit, más las tarifas
// no son necesarias aquí — el precio_total ya viene
// calculado en cada producto (cantidad * precio_unitario).
// ============================================================
export const crearCotizacion = async (datos: {
  clienteId?: number;
  productos: {
    productoId?: number;
    cantidades: [number, number, number];
    precios: [number, number, number];
    tintasId: number;
    carasId: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}) => {
  if (!datos.clienteId) {
    throw new Error("Se requiere clienteId para crear la cotización");
  }

  const productos = datos.productos.map((prod) => {
    if (!prod.productoId) {
      throw new Error(`El producto "${prod.nombre}" no tiene ID asignado`);
    }

    // Una fila de detalle por cada cantidad > 0 con precio > 0
    const detalles = prod.cantidades
      .map((cantidad, i) => {
        if (cantidad <= 0 || prod.precios[i] <= 0) return null;
        return {
          cantidad,
          precio_total: Number((cantidad * prod.precios[i]).toFixed(2)),
        };
      })
      .filter(Boolean);

    if (detalles.length === 0) {
      throw new Error(
        `El producto "${prod.nombre}" no tiene cantidades o precios válidos`
      );
    }

    return {
      productoId: prod.productoId,
      tintasId:   prod.tintasId,
      carasId:    prod.carasId,
      detalles,
    };
  });

  const response = await api.post("/cotizaciones", {
    clienteId: datos.clienteId,
    productos,
  });

  return response.data; // { message, no_cotizacion, cotizacion_ids }
};

// ============================================================
// ACTUALIZAR ESTADO
// ============================================================
export const actualizarEstado = async (
  noCotizacion: number,
  estadoId: number
) => {
  const response = await api.patch(`/cotizaciones/${noCotizacion}/estado`, {
    estadoId,
  });
  return response.data;
};

// ============================================================
// ELIMINAR COTIZACIÓN
// ============================================================
export const eliminarCotizacion = async (noCotizacion: number) => {
  const response = await api.delete(`/cotizaciones/${noCotizacion}`);
  return response.data;
};