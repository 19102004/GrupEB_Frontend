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
// ============================================================
export const crearCotizacion = async (datos: {
  clienteId?: number;
  productos: {
    productoId?: number;
    cantidades: [number, number, number];
    precios: [number, number, number];
    tintasId: number;
    carasId: number;
    observacion?: string;
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
      productoId:  prod.productoId,
      tintasId:    prod.tintasId,
      carasId:     prod.carasId,
      observacion: prod.observacion || null,
      detalles,
    };
  });

  const response = await api.post("/cotizaciones", {
    clienteId: datos.clienteId,
    productos,
  });

  return response.data;
};

// ============================================================
// APROBAR O RECHAZAR UN DETALLE INDIVIDUAL
// aprobado: true = aprobar | false = rechazar
// ============================================================
export const aprobarDetalle = async (
  detalleId: number,
  aprobado: boolean
) => {
  const response = await api.patch(
    `/cotizaciones/detalle/${detalleId}/aprobar`,
    { aprobado }
  );
  return response.data;
};

// ============================================================
// ACTUALIZAR OBSERVACIÓN DE UN PRODUCTO
// ============================================================
export const actualizarObservacion = async (
  productoId: number,
  observacion: string
) => {
  const response = await api.patch(
    `/cotizaciones/producto/${productoId}/observacion`,
    { observacion }
  );
  return response.data;
};

// ============================================================
// ACTUALIZAR ESTADO DE LA COTIZACIÓN
// estadoId: 1=Pendiente | 2=Aprobada | 3=Rechazada
// ============================================================
export const actualizarEstado = async (
  noCotizacion: number,
  estadoId: number
) => {
  const response = await api.patch(
    `/cotizaciones/${noCotizacion}/estado`,
    { estadoId }
  );
  return response.data;
};

// ============================================================
// ELIMINAR COTIZACIÓN
// ============================================================
export const eliminarCotizacion = async (noCotizacion: number) => {
  const response = await api.delete(`/cotizaciones/${noCotizacion}`);
  return response.data;
};