// cotizaciones.types.ts

// ============================================================
// DETALLE DE COTIZACIÓN
// ============================================================
export interface DetalleCotizacion {
  iddetalle:    number;
  cantidad:     number;
  precio_total: number;
  aprobado:     boolean | null;
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

  // Booleanos de acabado
  bk?:       boolean | null;
  foil?:     boolean | null;
  alto_rel?: boolean | null;
  laminado?: boolean | null;
  uv_br?:    boolean | null;

  // ✅ pigmentos: string con el nombre del pigmento o null
  pigmentos?: string | null;

  // ✅ pantones: string con nombres separados por comas "Negro, Blanco, Rojo"
  //    null si no aplica
  pantones?: string | null;

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
  idsuaje?:     number | null;
  observacion?: string;

  // ✅ pigmentos: string con el nombre del pigmento o null
  pigmentos?: string | null;

  // ✅ pantones: string "Negro, Blanco"
  pantones?: string | null;

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
  pigmentos?:   boolean | null;
  pantones?:    string | null;
  detalles:     DetalleCrearCotizacion[];
}

export interface RespuestaCrearCotizacion {
  message:        string;
  no_cotizacion:  number;
  cotizacion_ids: number[];
}