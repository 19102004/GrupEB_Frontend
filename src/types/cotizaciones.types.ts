// cotizaciones.types.ts

// ============================================================
// DETALLE DE COTIZACIÓN
// ============================================================
export interface DetalleCotizacion {
  iddetalle:    number;
  cantidad:     number;
  precio_total: number;
  aprobado:     boolean | null; // null=pendiente | true=aprobado | false=rechazado
}

// ============================================================
// MEDIDAS INDIVIDUALES DEL PRODUCTO
// ============================================================
export interface MedidasProducto {
  altura:         string;
  ancho:          string;
  fuelleFondo:    string;
  fuelleLateral1: string;
  fuelleLateral2: string;
  refuerzo:       string;
  solapa:         string;
}

// ============================================================
// PRODUCTO EN COTIZACIÓN
// ============================================================
export interface ProductoCotizacion {
  idcotizacion:          number;
  idcotizacion_producto: number;
  producto_id:           number;

  nombre:             string;
  material:           string;
  calibre:            string;
  medidasFormateadas: string;
  medidas:            MedidasProducto;

  tintas: number;
  caras:  number;

  // Booleanos de impresión/acabado
  bk?:       boolean | null;
  foil?:     boolean | null;
  alto_rel?: boolean | null;
  laminado?: boolean | null;
  uv_br?:    boolean | null;
  pigmentos?: boolean | null;
  pantones?:  boolean | null;

  // 🔥 idsuaje: FK integer hacia asa_suaje (null si no aplica)
  // 🔥 asa_suaje: texto del tipo de suaje (viene del JOIN en el backend)
  idsuaje?:   number | null;
  asa_suaje?: string | null;

  observacion?: string | null;

  detalles: DetalleCotizacion[];
  subtotal: number;
}

// ============================================================
// COTIZACIÓN COMPLETA
// ============================================================
export interface Cotizacion {
  no_cotizacion: number;
  fecha:         string;
  estado_id:     number;
  estado:        string;
  cliente_id:    number;
  cliente:       string;
  telefono:      string;
  correo:        string;
  empresa:       string;
  // 🔥 Campo impresion viene de clientes.impresion
  impresion?:    string | null;
  productos:     ProductoCotizacion[];
  total:         number;
}

// ============================================================
// TIPOS PARA CREAR COTIZACIÓN
// ============================================================
export interface ProductoCrearCotizacion {
  productoId?:  number;
  cantidades:   [number, number, number];
  precios:      [number, number, number];
  tintasId:     number;
  carasId:      number;
  // 🔥 idsuaje: FK integer hacia asa_suaje
  idsuaje?:     number | null;
  observacion?: string;
  [key: string]: any;
}

export interface DatosCrearCotizacion {
  clienteId?: number;
  productos:  ProductoCrearCotizacion[];
  [key: string]: any;
}

export interface DetalleCrearCotizacion {
  cantidad:     number;
  precio_total: number;
}

export interface ProductoEnviarCotizacion {
  productoId:   number;
  tintasId:     number;
  carasId:      number;
  idsuaje?:     number | null;
  observacion?: string;
  detalles:     DetalleCrearCotizacion[];
}

export interface RespuestaCrearCotizacion {
  message:        string;
  no_cotizacion:  number;
  cotizacion_ids: number[];
}