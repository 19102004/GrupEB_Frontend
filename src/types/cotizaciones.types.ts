// cotizaciones.types.ts

// ============================================================
// DETALLE DE COTIZACIÓN
// ============================================================
export interface DetalleCotizacion {
  iddetalle: number;
  cantidad: number;
  precio_total: number;
  aprobado: boolean | null;  // 🔥 NUEVO: null=pendiente, true=aprobado, false=rechazado
}

// ============================================================
// PRODUCTO EN COTIZACIÓN
// ============================================================
export interface ProductoCotizacion {
  idcotizacion: number;
  idcotizacion_producto: number;  // 🔥 Agregado para aprobar
  producto_id: number;
  nombre: string;
  medida: string;
  material: string;
  calibre: string;
  por_kilo: string;
  tintas: number;
  caras: number;
  observacion?: string;  // 🔥 NUEVO
  detalles: DetalleCotizacion[];
  subtotal: number;
}

// ============================================================
// COTIZACIÓN COMPLETA
// ============================================================
export interface Cotizacion {
  no_cotizacion: number;
  fecha: string;
  estado_id: number;
  estado: string;
  cliente_id: number;
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: ProductoCotizacion[];
  total: number;
}

// ============================================================
// TIPOS PARA CREAR COTIZACIÓN
// ============================================================
export interface ProductoCrearCotizacion {
  productoId?: number;
  cantidades: [number, number, number];
  precios: [number, number, number];
  tintasId: number;
  carasId: number;
  observacion?: string;  // 🔥 NUEVO
  [key: string]: any;
}

export interface DatosCrearCotizacion {
  clienteId?: number;
  productos: ProductoCrearCotizacion[];
  [key: string]: any;
}

export interface DetalleCrearCotizacion {
  cantidad: number;
  precio_total: number;
}

export interface ProductoEnviarCotizacion {
  productoId: number;
  tintasId: number;
  carasId: number;
  observacion?: string;  // 🔥 NUEVO
  detalles: DetalleCrearCotizacion[];
}

export interface RespuestaCrearCotizacion {
  message: string;
  no_cotizacion: number;
  cotizacion_ids: number[];
}