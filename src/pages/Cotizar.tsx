import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import FormularioCotizacion from "../components/FormularioCotizacion";
import { useState, useEffect } from "react";
import { getCatalogosPlastico } from "../services/productosPlasticoService";
import {
  getCotizaciones,
  crearCotizacion,
  eliminarCotizacion,
  actualizarEstado,
} from "../services/cotizacionesService";
import type { CatalogosPlastico } from "../types/productos-plastico.types";
import type { Cotizacion } from "../types/cotizaciones.types";

// ============================================================
// COMPONENTE
// ============================================================
export default function Cotizaciones() {
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loadingCots, setLoadingCots] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [catalogos, setCatalogos] = useState<CatalogosPlastico>({ 
    tiposProducto: [], 
    materiales: [], 
    calibres: [] 
  });
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [errorCatalogos, setErrorCatalogos] = useState("");

  
  // Cargar al montar
  useEffect(() => {
    cargarCatalogos();
    cargarCotizaciones();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);
      setErrorCatalogos("");
      const data = await getCatalogosPlastico();
      setCatalogos(data);
    } catch (error: any) {
      setErrorCatalogos(error.response?.data?.error || "Error al cargar catálogos");
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const cargarCotizaciones = async () => {
    try {
      setLoadingCots(true);
      const data = await getCotizaciones();
      setCotizaciones(data);
    } catch (error: any) {
      console.error("❌ Error al cargar cotizaciones:", error);
    } finally {
      setLoadingCots(false);
    }
  };

  // Filtrado
  const normalizar = (t: string) =>
    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    if (!busqueda) return true;
    const t = normalizar(busqueda);
    return (
      normalizar(c.cliente  ?? "").includes(t) ||
      normalizar(c.empresa  ?? "").includes(t) ||
      normalizar(c.correo   ?? "").includes(t) ||
      normalizar(c.telefono ?? "").includes(t) ||
      normalizar(c.estado).includes(t)         ||
      c.no_cotizacion.toString().includes(t)
    );
  });

  // Crear
  const handleSubmit = async (datos: any) => {
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await crearCotizacion(datos);
      setModalOpen(false);
      await cargarCotizaciones();
    } catch (error: any) {
      console.error("❌ Error al guardar cotización:", error);
      setErrorGuardar(error.message || error.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  // Eliminar
  const handleEliminar = async (noCotizacion: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cotización?")) return;
    try {
      await eliminarCotizacion(noCotizacion);
      setCotizaciones((prev) => prev.filter((c) => c.no_cotizacion !== noCotizacion));
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al eliminar cotización");
    }
  };

  // Badge estado
  const estadoBadge = (estado: string) => {
    const mapa: Record<string, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Aprobada:  "bg-green-100 text-green-800",
      Rechazada: "bg-red-100 text-red-800",
    };
    const color = mapa[estado] ?? "bg-gray-100 text-gray-700";
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {estado}
      </span>
    );
  };

  const formatFecha = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return iso; }
  };

  // ============================================================
  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-2">Cotizaciones</h1>
      <p className="text-slate-400 mb-6">Gestión de cotizaciones y seguimiento de aprobaciones.</p>

      {/* BUSCADOR */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por cliente, empresa, correo, teléfono, estado o folio..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {busqueda && (
          <p className="mt-2 text-sm text-gray-500">{cotizacionesFiltradas.length} resultado(s)</p>
        )}
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto bg-white rounded-lg shadow mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Folio", "Fecha", "Cliente", "Empresa", "Productos", "Total", "Estado", "Acciones"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingCots ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-3 text-gray-500">Cargando cotizaciones...</p>
                </td>
              </tr>
            ) : cotizacionesFiltradas.length > 0 ? (
              cotizacionesFiltradas.map((cot) => (
                <tr key={cot.no_cotizacion} className="hover:bg-gray-50">

                  {/* Folio */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    #{cot.no_cotizacion}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFecha(cot.fecha)}
                  </td>

                  {/* Cliente */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{cot.cliente || "—"}</p>
                    {cot.telefono && <p className="text-xs text-gray-400">{cot.telefono}</p>}
                  </td>

                  {/* Empresa */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cot.empresa || "—"}
                  </td>

                  {/* Productos */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">
                      {cot.productos.length} producto(s)
                    </span>
                    <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                      {cot.productos.slice(0, 2).map((p, i) => (
                        <div key={i}>• {p.nombre.length > 35 ? p.nombre.slice(0, 35) + "…" : p.nombre}</div>
                      ))}
                      {cot.productos.length > 2 && (
                        <div className="text-blue-400">+ {cot.productos.length - 2} más</div>
                      )}
                    </div>
                    {/* Cantidades como pills */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {cot.productos
                        .flatMap((p) => p.detalles.map((d) => d.cantidad))
                        .slice(0, 6)
                        .map((cant, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {cant.toLocaleString()}
                          </span>
                        ))}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${cot.total.toFixed(2)}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {estadoBadge(cot.estado)}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEliminar(cot.no_cotizacion)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  {busqueda
                    ? `No se encontraron cotizaciones para "${busqueda}"`
                    : "No hay cotizaciones registradas"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOTÓN NUEVA COTIZACIÓN */}
      <button
        onClick={() => { setErrorGuardar(null); setModalOpen(true); }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
      >
        + Nueva Cotización
      </button>

      {/* MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Cotización">
        {cargandoCatalogos ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando catálogos...</span>
          </div>
        ) : errorCatalogos ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error al cargar catálogos</h3>
            <p className="text-red-600 mb-4">{errorCatalogos}</p>
            <button onClick={cargarCatalogos} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </div>
        ) : (
          <div>
            {errorGuardar && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">❌ {errorGuardar}</p>
              </div>
            )}
            {guardando && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-blue-700 text-sm">Guardando cotización...</p>
              </div>
            )}
            <FormularioCotizacion
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
              catalogos={catalogos}
            />
          </div>
        )}
      </Modal>
    </Dashboard>
  );
}