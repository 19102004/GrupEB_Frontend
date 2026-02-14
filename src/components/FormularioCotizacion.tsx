import { useState, useEffect } from "react";
import SelectorProducto from "./ConfigurarProducto";
import type { DatosProducto, MedidaKey } from "../types/productos-plastico.types";
import { searchClientes, createClienteLigero } from "../services/clientesService";
import { searchProductosPlastico, crearOObtenerProducto } from "../services/productosPlasticoService";
import { getCatalogosProduccion } from "../services/catalogosProduccionService";
import { usePreciosBatch } from "../hooks/usePrecioCalculado"; // 🔥 NUEVO
import type { ClienteBusqueda } from "../types/clientes.types";
import type { ProductoBusqueda, ProductoPlasticoCreate } from "../types/productos-plastico.types";
import type { Cara, Tinta } from "../types/catalogos-produccion.types";

interface FormularioCotizacionProps {
  onSubmit: (datos: DatosCotizacion) => void;
  onCancel: () => void;
  catalogos: {
    tiposProducto: any[];
    materiales: any[];
    calibres: any[];
  };
}

interface Producto {
  productoId?: number;
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  tintasId: number;
  caras: number;
  carasId: number;
  material: string;
  medidas: Record<MedidaKey, string>;
  medidasFormateadas: string;
  porKilo?: string;
  observacion?: string;  // 🔥 NUEVO
}

interface DatosCotizacion {
  clienteId?: number;
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: Producto[];
  observaciones: string;
}

export default function FormularioCotizacion({
  onSubmit,
  onCancel,
  catalogos,
}: FormularioCotizacionProps) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<DatosCotizacion>({
    cliente: "",
    telefono: "",
    correo: "",
    empresa: "",
    productos: [],
    observaciones: "",
  });

  // ====================================
  // ESTADOS PARA CATÁLOGOS
  // ====================================
  const [caras, setCaras] = useState<Cara[]>([]);
  const [tintas, setTintas] = useState<Tinta[]>([]);

  // ====================================
  // ESTADOS PARA CLIENTES
  // ====================================
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clientesCargados, setClientesCargados] = useState<ClienteBusqueda[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [errorCrearCliente, setErrorCrearCliente] = useState<string | null>(null);

  // ====================================
  // ESTADOS PARA PRODUCTOS
  // ====================================
  const [modoProducto, setModoProducto] = useState<"registrado" | "nuevo">("registrado");
  const [mostrarModalProductos, setMostrarModalProductos] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productosCargados, setProductosCargados] = useState<ProductoBusqueda[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);
  const [mostrarDropdownCaras, setMostrarDropdownCaras] = useState(false);
  const [mostrarDropdownTintas, setMostrarDropdownTintas] = useState(false);
  const [guardandoProducto, setGuardandoProducto] = useState(false);

  const [productoActual, setProductoActual] = useState<Producto>({
    nombre: "",
    cantidades: [0, 0, 0],
    precios: [0, 0, 0],
    calibre: "200",
    tintas: 1,
    tintasId: 1,
    caras: 1,
    carasId: 1,
    material: "",
    medidas: {
      altura: "",
      ancho: "",
      fuelleFondo: "",
      fuelleLateral1: "",
      fuelleLateral2: "",
      refuerzo: "",
      solapa: "",
    },
    medidasFormateadas: "",
    observacion: "",  // 🔥 NUEVO
  });

  const [datosProductoNuevo, setDatosProductoNuevo] = useState<DatosProducto>({
    tipoProducto: "",
    tipoProductoId: 0,
    material: "",
    materialId: 0,
    calibre: "",
    calibreId: 0,
    medidas: {
      altura: "",
      ancho: "",
      fuelleFondo: "",
      fuelleLateral1: "",
      fuelleLateral2: "",
      refuerzo: "",
      solapa: "",
    },
    medidasFormateadas: "",
    nombreCompleto: "",
  });

  // ====================================
  // 🔥 HOOK PARA CALCULAR PRECIOS CON DEBOUNCE
  // ====================================
  const { resultados, loading: calculandoPrecios, error: errorCalculo } = usePreciosBatch({
    cantidades: productoActual.cantidades,
    porKilo: productoActual.porKilo,
    tintasId: productoActual.tintasId,
    carasId: productoActual.carasId,
    enabled: productoActual.cantidades.some(c => c > 0) && !!productoActual.porKilo,
  });

  // ====================================
  // CARGAR CATÁLOGOS AL MONTAR
  // ====================================
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const catalogosData = await getCatalogosProduccion();
      setCaras(catalogosData.caras);
      setTintas(catalogosData.tintas);
      console.log("✅ Catálogos cargados:", {
        caras: catalogosData.caras.length,
        tintas: catalogosData.tintas.length,
      });
    } catch (error) {
      console.error("❌ Error al cargar catálogos:", error);
    }
  };

  // ====================================
  // 🔥 ACTUALIZAR PRECIOS CUANDO LLEGAN DEL BACKEND
  // ====================================
  useEffect(() => {
    if (resultados.length > 0) {
      const nuevosPrecios = resultados.map((r, i) => {
        return r?.precio_unitario ?? productoActual.precios[i];
      });
      
      setProductoActual(prev => ({
        ...prev,
        precios: nuevosPrecios as [number, number, number],
      }));
    }
  }, [resultados]);

  // ====================================
  // EFECTOS PARA BÚSQUEDA DE CLIENTES
  // ====================================
  useEffect(() => {
    if (mostrarModalClientes && clientesCargados.length === 0) {
      cargarClientes();
    }
  }, [mostrarModalClientes]);

  useEffect(() => {
    if (!mostrarModalClientes) return;
    const timer = setTimeout(() => {
      cargarClientes(busquedaCliente);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  // ====================================
  // EFECTOS PARA BÚSQUEDA DE PRODUCTOS
  // ====================================
  useEffect(() => {
    if (mostrarModalProductos && productosCargados.length === 0) {
      cargarProductos();
    }
  }, [mostrarModalProductos]);

  useEffect(() => {
    if (!mostrarModalProductos) return;
    const timer = setTimeout(() => {
      cargarProductos(busquedaProducto);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaProducto]);

  // ====================================
  // FUNCIONES DE API - CLIENTES
  // ====================================
  const cargarClientes = async (query?: string) => {
    setLoadingClientes(true);
    setErrorClientes(null);
    try {
      const clientes = await searchClientes(query);
      setClientesCargados(clientes);
    } catch (error: any) {
      console.error("Error al cargar clientes:", error);
      setErrorClientes(error.response?.data?.error || "Error al cargar clientes");
    } finally {
      setLoadingClientes(false);
    }
  };

  const crearNuevoClienteLigero = async () => {
    if (!datos.cliente && !datos.correo) {
      setErrorCrearCliente("Se requiere al menos nombre o correo");
      return;
    }
    setCreandoCliente(true);
    setErrorCrearCliente(null);
    try {
      const response = await createClienteLigero({
        nombre: datos.cliente || undefined,
        telefono: datos.telefono || undefined,
        correo: datos.correo || undefined,
        empresa: datos.empresa || undefined,
      });
      setDatos({ ...datos, clienteId: response.cliente.id });
      setPaso(2);
    } catch (error: any) {
      console.error("Error al crear cliente:", error);
      setErrorCrearCliente(error.response?.data?.error || "Error al crear cliente");
    } finally {
      setCreandoCliente(false);
    }
  };

  const seleccionarCliente = (cliente: ClienteBusqueda) => {
    setDatos({
      ...datos,
      clienteId: cliente.idclientes,
      cliente: cliente.atencion || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      empresa: cliente.empresa || "",
    });
    setMostrarModalClientes(false);
    setBusquedaCliente("");
  };

  // ====================================
  // FUNCIONES DE API - PRODUCTOS
  // ====================================
  const cargarProductos = async (query?: string) => {
    setLoadingProductos(true);
    setErrorProductos(null);
    try {
      const productos = await searchProductosPlastico(query);
      setProductosCargados(productos);
    } catch (error: any) {
      console.error("Error al cargar productos:", error);
      setErrorProductos(error.response?.data?.error || "Error al cargar productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  const seleccionarProducto = (producto: ProductoBusqueda) => {
    const medidasMapeadas: Record<MedidaKey, string> = {
      altura: producto.altura.toString(),
      ancho: producto.ancho.toString(),
      fuelleFondo: producto.fuelle_fondo.toString(),
      fuelleLateral1: producto.fuelle_lateral_izquierdo.toString(),
      fuelleLateral2: producto.fuelle_lateral_derecho.toString(),
      refuerzo: producto.refuerzo.toString(),
      solapa: "",
    };
    setProductoActual({
      productoId: producto.id,
      nombre: `${producto.tipo_producto} ${producto.medida} ${producto.material.toLowerCase()}`,
      cantidades: [0, 0, 0],
      precios: [0, 0, 0],
      calibre: producto.calibre.toString(),
      tintas: tintas[0]?.cantidad || 1,
      tintasId: tintas[0]?.id || 1,
      caras: caras[0]?.cantidad || 1,
      carasId: caras[0]?.id || 1,
      material: producto.material,
      medidas: medidasMapeadas,
      medidasFormateadas: producto.medida,
      porKilo: producto.por_kilo,
    });
    setMostrarModalProductos(false);
    setBusquedaProducto("");
  };

  const crearYAgregarProductoNuevo = async () => {
    setGuardandoProducto(true);
    try {
      const productoData: ProductoPlasticoCreate = {
        tipo_producto_plastico_id: datosProductoNuevo.tipoProductoId,
        material_plastico_id: datosProductoNuevo.materialId,
        calibre_id: datosProductoNuevo.calibreId,
        altura: Number(datosProductoNuevo.medidas.altura) || 0,
        ancho: Number(datosProductoNuevo.medidas.ancho) || 0,
        fuelle_fondo: Number(datosProductoNuevo.medidas.fuelleFondo) || 0,
        fuelle_latIz: Number(datosProductoNuevo.medidas.fuelleLateral1) || 0,
        fuelle_latDe: Number(datosProductoNuevo.medidas.fuelleLateral2) || 0,
        refuerzo: Number(datosProductoNuevo.medidas.refuerzo) || 0,
        medida: datosProductoNuevo.medidasFormateadas,
        por_kilo: calcularBolsasPorKilo(datosProductoNuevo),
      };
      const response = await crearOObtenerProducto(productoData);
      setProductoActual((prev) => ({
        ...prev,
        productoId: response.producto.id,
        porKilo: response.producto.por_kilo,
      }));
    } catch (error: any) {
      console.error("Error al crear/obtener producto:", error);
      alert(error.response?.data?.error || "Error al guardar producto");
    } finally {
      setGuardandoProducto(false);
    }
  };

  // ====================================
  // FUNCIONES DE UI
  // ====================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleProductoNuevoChange = (datos: DatosProducto) => {
    setDatosProductoNuevo(datos);
    setProductoActual((prev) => ({
      ...prev,
      nombre: datos.nombreCompleto,
      material: datos.material,
      calibre: datos.calibre,
      medidas: { ...datos.medidas },
      medidasFormateadas: datos.medidasFormateadas,
    }));
  };

  const calcularBolsasPorKilo = (datos: DatosProducto): number => {
    return 88.652;
  };

  // ====================================
  // 🔥 MANEJAR CAMBIO DE CANTIDAD (SIN CÁLCULO LOCAL)
  // ====================================
  const handleCantidadChange = (index: number, value: string) => {
    const nuevasCantidades = [...productoActual.cantidades];
    const cantidad = value === "" ? 0 : Number(value);
    nuevasCantidades[index] = cantidad;
    
    setProductoActual({
      ...productoActual,
      cantidades: nuevasCantidades as [number, number, number],
    });
  };

  const handlePrecioChange = (index: number, value: string) => {
    const nuevosPrecios = [...productoActual.precios];
    nuevosPrecios[index] = value === "" ? 0 : Number(value);
    setProductoActual({
      ...productoActual,
      precios: nuevosPrecios as [number, number, number],
    });
  };

  // 🔥 NUEVO: Manejar cambio de observación
  const handleObservacionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProductoActual({
      ...productoActual,
      observacion: e.target.value,
    });
  };

  const handleAgregarProducto = async () => {
    const tieneValoresValidos = productoActual.cantidades.some(
      (cant, i) => cant > 0 && productoActual.precios[i] > 0
    );
    if (!productoActual.nombre || !tieneValoresValidos) {
      alert("Por favor completa los datos del producto");
      return;
    }
    if (modoProducto === "nuevo" && !productoActual.productoId) {
      await crearYAgregarProductoNuevo();
    }
    setDatos({ ...datos, productos: [...datos.productos, productoActual] });
    resetearFormularioProducto();
  };

  const resetearFormularioProducto = () => {
    setModoProducto("registrado");
    setProductoActual({
      nombre: "",
      cantidades: [0, 0, 0],
      precios: [0, 0, 0],
      calibre: "200",
      tintas: tintas[0]?.cantidad || 1,
      tintasId: tintas[0]?.id || 1,
      caras: caras[0]?.cantidad || 1,
      carasId: caras[0]?.id || 1,
      material: "",
      medidas: {
        altura: "", ancho: "", fuelleFondo: "",
        fuelleLateral1: "", fuelleLateral2: "",
        refuerzo: "", solapa: "",
      },
      medidasFormateadas: "",
      observacion: "",  // 🔥 NUEVO
    });
    setDatosProductoNuevo({
      tipoProducto: "", tipoProductoId: 0,
      material: "", materialId: 0,
      calibre: "", calibreId: 0,
      medidas: {
        altura: "", ancho: "", fuelleFondo: "",
        fuelleLateral1: "", fuelleLateral2: "",
        refuerzo: "", solapa: "",
      },
      medidasFormateadas: "",
      nombreCompleto: "",
    });
  };

  const handleEliminarProducto = (index: number) => {
    setDatos({ ...datos, productos: datos.productos.filter((_, i) => i !== index) });
  };

  const handleSiguiente = async () => {
    if (!datos.cliente && !datos.correo) {
      setErrorCrearCliente("Se requiere al menos nombre o correo");
      return;
    }
    if (datos.clienteId) {
      setPaso(2);
      return;
    }
    await crearNuevoClienteLigero();
  };

  const handleAtras = () => setPaso(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (datos.productos.length > 0) onSubmit(datos);
  };

  const calcularTotal = () => {
    return datos.productos.reduce((total, prod) => {
      return total + prod.cantidades.reduce((sum, cant, i) => sum + cant * prod.precios[i], 0);
    }, 0);
  };

  return (
    <div className="relative">
      {/* MODAL CLIENTES */}
      {mostrarModalClientes && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Buscar Cliente Existente</h3>
                <button onClick={() => { setMostrarModalClientes(false); setBusquedaCliente(""); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="relative">
                <input type="text" value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)} placeholder="Buscar por nombre, empresa, teléfono o correo..." className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white" autoFocus />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {loadingClientes ? (
                <div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div><p className="mt-4 text-gray-600">Cargando clientes...</p></div>
              ) : errorClientes ? (
                <div className="p-8 text-center"><p className="text-gray-700 font-medium">{errorClientes}</p><button onClick={() => cargarClientes(busquedaCliente)} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Reintentar</button></div>
              ) : clientesCargados.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {clientesCargados.map((cliente) => (
                    <div key={cliente.idclientes} onClick={() => seleccionarCliente(cliente)} className="p-4 hover:bg-purple-50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{cliente.atencion || "Sin nombre"}</h4>
                          {cliente.empresa && <p className="text-sm text-gray-600 mt-1">{cliente.empresa}</p>}
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {cliente.telefono && <span>{cliente.telefono}</span>}
                            {cliente.correo && <span>{cliente.correo}</span>}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500"><p className="text-lg font-medium">No se encontraron clientes</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTOS */}
      {mostrarModalProductos && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Buscar Producto Existente</h3>
                <button onClick={() => { setMostrarModalProductos(false); setBusquedaProducto(""); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="relative">
                <input type="text" value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} placeholder="Buscar por medidas, material, calibre o tipo..." className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white" autoFocus />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {loadingProductos ? (
                <div className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div><p className="mt-4 text-gray-600">Cargando productos...</p></div>
              ) : errorProductos ? (
                <div className="p-8 text-center"><p className="text-gray-700 font-medium">{errorProductos}</p><button onClick={() => cargarProductos(busquedaProducto)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Reintentar</button></div>
              ) : productosCargados.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {productosCargados.map((producto) => (
                    <div key={producto.id} onClick={() => seleccionarProducto(producto)} className="p-4 hover:bg-blue-50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{producto.tipo_producto} {producto.medida} {producto.material.toLowerCase()}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                            <span>Calibre: {producto.calibre}</span>
                            <span>Medidas: {producto.medida}</span>
                            <span>Por kilo: {producto.por_kilo}</span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500"><p className="text-lg font-medium">No se encontraron productos</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de pasos */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${paso === 1 ? "bg-blue-600 text-white" : "bg-green-600 text-white"}`}>
            {paso === 1 ? "1" : "✓"}
          </div>
          <div className={`w-24 h-1 ${paso === 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${paso === 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}>
            2
          </div>
        </div>
      </div>

      {/* PASO 1 */}
      <div className={paso === 1 ? "block" : "hidden"}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Datos del Cliente</h3>
          <button type="button" onClick={() => setMostrarModalClientes(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Cliente Existente
          </button>
        </div>
        {errorCrearCliente && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorCrearCliente}</p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente</label>
            <input type="text" name="cliente" value={datos.cliente} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400" placeholder="Juan Pérez" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input type="tel" name="telefono" value={datos.telefono} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400" placeholder="33-1234-5678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input type="email" name="correo" value={datos.correo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400" placeholder="cliente@ejemplo.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa (Opcional)</label>
            <input type="text" name="empresa" value={datos.empresa} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400" placeholder="Nombre de la empresa" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" disabled={creandoCliente}>Cancelar</button>
          <button type="button" onClick={handleSiguiente} disabled={creandoCliente} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
            {creandoCliente ? (<><div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Guardando...</>) : "Siguiente"}
          </button>
        </div>
      </div>

      {/* PASO 2 - PRODUCTOS */}
      <div className={paso === 2 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Agregar Productos</h3>

        <div className="mb-6 flex gap-4 bg-gray-100 p-1 rounded-lg w-fit">
          <button type="button" onClick={() => setModoProducto("registrado")} className={`px-6 py-2 rounded-md font-medium transition-all ${modoProducto === "registrado" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"}`}>Producto Registrado</button>
          <button type="button" onClick={() => setModoProducto("nuevo")} className={`px-6 py-2 rounded-md font-medium transition-all ${modoProducto === "nuevo" ? "bg-white text-blue-600 shadow" : "text-gray-600 hover:text-gray-900"}`}>Producto Nuevo</button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-4">
          {modoProducto === "registrado" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Producto</label>
                <button type="button" onClick={() => setMostrarModalProductos(true)} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Click para buscar producto registrado
                </button>
              </div>
              {productoActual.nombre && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">{productoActual.nombre}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Material:</span> {productoActual.material}</p>
                    <p><span className="font-semibold">Calibre:</span> {productoActual.calibre}</p>
                    <p><span className="font-semibold">Medidas:</span> {productoActual.medidasFormateadas}</p>
                    <p><span className="font-semibold">Por kilo:</span> {productoActual.porKilo}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {modoProducto === "nuevo" && (
            <SelectorProducto catalogos={catalogos} onProductoChange={handleProductoNuevoChange} mostrarFigura={true} />
          )}

          {((modoProducto === "registrado" && productoActual.nombre) ||
            (modoProducto === "nuevo" && datosProductoNuevo.nombreCompleto)) && (
            <div className="mt-6 space-y-4 border-t pt-4">

              {/* TINTAS Y CARAS */}
              <div className="grid grid-cols-2 gap-4">

                {/* Tintas */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tintas</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${productoActual.tintas} tinta${productoActual.tintas > 1 ? "s" : ""}`}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                      onClick={() => setMostrarDropdownTintas(!mostrarDropdownTintas)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarDropdownTintas(!mostrarDropdownTintas)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <svg className={`w-5 h-5 transition-transform ${mostrarDropdownTintas ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {mostrarDropdownTintas && (
                    <ul className="absolute w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-lg z-20">
                      {tintas.map((tinta) => (
                        <li
                          key={tinta.id}
                          onClick={() => {
                            setProductoActual({
                              ...productoActual,
                              tintas: tinta.cantidad,
                              tintasId: tinta.id,
                            });
                            setMostrarDropdownTintas(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                        >
                          {tinta.cantidad} tinta{tinta.cantidad > 1 ? "s" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Caras */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caras</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${productoActual.caras} cara${productoActual.caras > 1 ? "s" : ""}`}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                      onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <svg className={`w-5 h-5 transition-transform ${mostrarDropdownCaras ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {mostrarDropdownCaras && (
                    <ul className="absolute w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-lg z-20">
                      {caras.map((cara) => (
                        <li
                          key={cara.id}
                          onClick={() => {
                            setProductoActual({
                              ...productoActual,
                              caras: cara.cantidad,
                              carasId: cara.id,
                            });
                            setMostrarDropdownCaras(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                        >
                          {cara.cantidad} cara{cara.cantidad > 1 ? "s" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Cantidades */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidades</label>
                <div className="grid grid-cols-3 gap-3">
                  {productoActual.cantidades.map((cantidad, index) => (
                    <input 
                      key={index} 
                      type="number" 
                      min="0" 
                      value={cantidad === 0 ? "" : cantidad} 
                      onChange={(e) => handleCantidadChange(index, e.target.value)} 
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white" 
                      placeholder={`Cantidad ${index + 1}`} 
                    />
                  ))}
                </div>
              </div>

              {/* 🔥 PRECIOS CON DEBOUNCE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precios unitarios (calculados automáticamente)
                </label>
                
                {/* Error si hay */}
                {errorCalculo && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">⚠️ {errorCalculo}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-3">
                  {productoActual.precios.map((precio, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={precio === 0 ? "" : `$${precio.toFixed(4)}`}
                        onChange={(e) => handlePrecioChange(index, e.target.value.replace("$", ""))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white pr-10"
                        placeholder="Auto"
                        disabled={calculandoPrecios}
                      />
                      
                      {/* Loading spinner */}
                      {calculandoPrecios && productoActual.cantidades[index] > 0 && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                      )}
                      
                      {/* Kilogramos */}
                      {productoActual.cantidades[index] > 0 && productoActual.porKilo && (
                        <div className="text-xs text-gray-500 mt-1">
                          {(productoActual.cantidades[index] / Number(productoActual.porKilo)).toFixed(2)} kg
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Indicador de cálculo */}
                {calculandoPrecios && (
                  <div className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                    Calculando precios...
                  </div>
                )}
              </div>

              {/* 🔥 CAMPO DE OBSERVACIONES */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones del producto (Opcional)
                </label>
                <textarea
                  value={productoActual.observacion || ""}
                  onChange={handleObservacionChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Ej: Impresión a 2 colores, acabado mate, entrega urgente, etc."
                />
              </div>

              <button type="button" onClick={handleAgregarProducto} disabled={guardandoProducto} className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {guardandoProducto ? (<><div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>Guardando producto...</>) : "+ Agregar Producto"}
              </button>
            </div>
          )}
        </div>

        {/* Lista de productos */}
        {datos.productos.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Productos agregados:</h4>
            <div className="space-y-3">
              {datos.productos.map((prod, index) => (
                <div key={index} className="flex items-start justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{prod.nombre}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>Material: {prod.material}</span>
                      <span>Calibre: {prod.calibre}</span>
                      <span>Tintas: {prod.tintas}</span>
                      <span>Caras: {prod.caras}</span>
                      {prod.productoId && <span className="text-green-600">✓ En BD (ID: {prod.productoId})</span>}
                    </div>
                    <div className="mt-2 space-y-1">
                      {prod.cantidades.map((cant, i) => cant > 0 ? (
                        <p key={i} className="text-sm text-gray-700">{cant.toLocaleString()} unidades × ${prod.precios[i].toFixed(2)} = ${(cant * prod.precios[i]).toFixed(2)}</p>
                      ) : null)}
                    </div>
                    
                    {/* 🔥 MOSTRAR OBSERVACIÓN */}
                    {prod.observacion && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <span className="font-semibold text-blue-900">Observaciones:</span>
                        <span className="text-blue-800 ml-1">{prod.observacion}</span>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => handleEliminarProducto(index)} className="ml-4 text-red-600 hover:text-red-800 font-bold text-xl">✕</button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xl font-bold text-gray-900">Total: ${calcularTotal().toFixed(2)}</p>
            </div>
          </div>
        )}


        <div className="flex justify-end gap-3">
          <button type="button" onClick={handleAtras} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Atrás</button>
          <button type="button" onClick={handleSubmit} disabled={datos.productos.length === 0} className={`px-6 py-2 rounded-lg font-semibold ${datos.productos.length === 0 ? "bg-gray-400 cursor-not-allowed text-gray-200" : "bg-green-600 text-white hover:bg-green-700"}`}>
            Crear Cotización
          </button>
        </div>
      </div>
    </div>
  );
}