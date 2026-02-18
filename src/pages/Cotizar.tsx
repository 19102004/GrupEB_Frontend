import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import FormularioCotizacion from "../components/FormularioCotizacion";
import EditarCotizacion from "../components/EditarCotizacion";
import { useState, useEffect } from "react";
import { getCatalogosPlastico } from "../services/productosPlasticoService";
import {
  getCotizaciones,
  crearCotizacion,
  eliminarCotizacion,
} from "../services/cotizacionesService";
import { generarPdfCotizacion } from "../services/generarPdfCotizacion";
import type { CatalogosPlastico } from "../types/productos-plastico.types";
import type { Cotizacion } from "../types/cotizaciones.types";

export default function Cotizaciones() {
  const [cotizaciones,  setCotizaciones]  = useState<Cotizacion[]>([]);
  const [loadingCots,   setLoadingCots]   = useState(false);
  const [busqueda,      setBusqueda]      = useState("");

  const [modalOpen,    setModalOpen]    = useState(false);
  const [guardando,    setGuardando]    = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [modalEditarOpen,    setModalEditarOpen]    = useState(false);
  const [cotizacionEditando, setCotizacionEditando] = useState<Cotizacion | null>(null);

  const [catalogos, setCatalogos] = useState<CatalogosPlastico>({
    tiposProducto: [], materiales: [], calibres: [],
  });
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [errorCatalogos,    setErrorCatalogos]    = useState("");

  // ✅ Estado para controlar qué filas tienen productos expandidos
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());

  useEffect(() => { cargarCatalogos(); cargarCotizaciones(); }, []);

  const toggleExpandida = (noCotizacion: number) => {
    setExpandidas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(noCotizacion)) {
        nuevo.delete(noCotizacion);
      } else {
        nuevo.add(noCotizacion);
      }
      return nuevo;
    });
  };

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

  const handleSubmit = async (datos: any) => {
    setGuardando(true);
    setErrorGuardar(null);
    try {
      const respuesta = await crearCotizacion(datos);
      await cargarCotizaciones();
      setModalOpen(false);

      try {
        await generarPdfCotizacion({
          no_cotizacion: respuesta.no_cotizacion,
          fecha:         new Date().toISOString(),
          cliente:       datos.cliente   || "",
          empresa:       datos.empresa   || "",
          telefono:      datos.telefono  || "",
          correo:        datos.correo    || "",
          estado:        "Pendiente",
          impresion:     datos.impresion ?? null,
          total: datos.productos.reduce((sum: number, prod: any) =>
            sum + prod.cantidades.reduce((s: number, cant: number, i: number) =>
              cant > 0 && prod.precios[i] > 0 ? s + cant * prod.precios[i] : s
            , 0)
          , 0),
          productos: datos.productos.map((prod: any) => ({
            nombre:             prod.nombre || `Producto #${prod.productoId}`,
            material:           prod.material           || "",
            calibre:            prod.calibre            || "",
            tintas:             prod.tintas             ?? prod.tintasId ?? "—",
            caras:              prod.caras              ?? prod.carasId  ?? "—",
            medidasFormateadas: prod.medidasFormateadas || "",
            medidas:            prod.medidas            || {},
            bk:                 prod.bk        || null,
            foil:               prod.foil      || null,
            laminado:           prod.laminado  || null,
            uvBr:               prod.uvBr      || null,
            pigmentos:          prod.pigmentos || null,
            pantones:           prod.pantones  || null,
            asa_suaje:          prod.suajeTipo || null,
            observacion:        prod.observacion || null,
            detalles: prod.cantidades
              .map((cant: number, i: number) =>
                cant > 0 && prod.precios[i] > 0
                  ? { cantidad: cant, precio_total: Number((cant * prod.precios[i]).toFixed(2)) }
                  : null
              )
              .filter(Boolean),
          })),
        });
      } catch (pdfError) {
        console.warn("⚠️ PDF no generado:", pdfError);
      }

    } catch (error: any) {
      console.error("❌ Error al guardar:", error);
      setErrorGuardar(error.message || error.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (noCotizacion: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cotización?")) return;
    try {
      await eliminarCotizacion(noCotizacion);
      setCotizaciones((prev) => prev.filter((c) => c.no_cotizacion !== noCotizacion));
    } catch (error: any) {
      alert(error.response?.data?.error || "Error al eliminar cotización");
    }
  };

  const handleEditar = (cot: Cotizacion) => {
    setCotizacionEditando(cot);
    setModalEditarOpen(true);
  };

  const handleCerrarEditar = () => {
    setModalEditarOpen(false);
    setCotizacionEditando(null);
  };

  const handleGuardarEdicion = (cotActualizada: Cotizacion) => {
    setCotizaciones((prev) =>
      prev.map((c) => c.no_cotizacion === cotActualizada.no_cotizacion ? cotActualizada : c)
    );
    handleCerrarEditar();
  };

  const handleDescargarPdf = async (cot: Cotizacion) => {
    await generarPdfCotizacion({
      no_cotizacion: cot.no_cotizacion,
      fecha:         cot.fecha,
      cliente:       cot.cliente,
      empresa:       cot.empresa,
      telefono:      cot.telefono,
      correo:        cot.correo,
      estado:        cot.estado,
      impresion:     cot.impresion ?? null,
      total:         cot.total,
      productos: cot.productos.map((p: any) => ({
        nombre:             p.nombre,
        material:           p.material             || "",
        calibre:            p.calibre              || "",
        tintas:             p.tintas,
        caras:              p.caras,
        medidasFormateadas: p.medidasFormateadas    || "",
        medidas:            p.medidas              || {},
        bk:                 p.bk                   || null,
        foil:               p.foil                 || null,
        laminado:           p.laminado             || null,
        uvBr:               p.uv_br                || null,
        pigmentos:          p.pigmentos             || null,
        pantones:           p.pantones              || null,
        asa_suaje:          p.asa_suaje             || null,
        observacion:        p.observacion           || null,
        detalles: p.detalles.map((d: any) => ({
          cantidad:     d.cantidad,
          precio_total: d.precio_total,
        })),
      })),
    });
  };

  const estadoBadge = (estado: string) => {
    const mapa: Record<string, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Aprobada:  "bg-green-100 text-green-800",
      Rechazada: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mapa[estado] ?? "bg-gray-100 text-gray-700"}`}>
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

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-2">Cotizaciones</h1>
      <p className="text-slate-400 mb-6">Gestión de cotizaciones y seguimiento de aprobaciones.</p>

      {/* Buscador */}
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
        {busqueda && <p className="mt-2 text-sm text-gray-500">{cotizacionesFiltradas.length} resultado(s)</p>}
      </div>

      {/* Tabla */}
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
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                  <p className="mt-3 text-gray-500">Cargando cotizaciones...</p>
                </td>
              </tr>
            ) : cotizacionesFiltradas.length > 0 ? (
              cotizacionesFiltradas.map((cot) => {
                const estaExpandida = expandidas.has(cot.no_cotizacion);
                return (
                  <>
                    {/* ── Fila principal ── */}
                    <tr key={cot.no_cotizacion} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        #{cot.no_cotizacion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFecha(cot.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{cot.cliente || "—"}</p>
                        {cot.telefono && <p className="text-xs text-gray-400">{cot.telefono}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cot.empresa || "—"}
                      </td>

                      {/* ✅ Columna productos compacta con botón expandir */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => toggleExpandida(cot.no_cotizacion)}
                          className="flex items-center gap-2 group"
                        >
                          <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                            {cot.productos.length} producto(s)
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-transform duration-200 ${estaExpandida ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${cot.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {estadoBadge(cot.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {/* ✅ Ver/Editar → Gestionar */}
                          <button onClick={() => handleEditar(cot)} className="text-blue-600 hover:text-blue-900 font-medium transition-colors">
                            Gestionar
                          </button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleDescargarPdf(cot)} className="text-green-600 hover:text-green-800 transition-colors" title="Descargar PDF">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleEliminar(cot.no_cotizacion)} className="text-red-600 hover:text-red-900 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ✅ Fila de detalle expandible */}
                    {estaExpandida && (
                      <tr key={`detalle-${cot.no_cotizacion}`} className="bg-blue-50 border-t border-blue-100">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="space-y-3">
                            {cot.productos.map((p: any, i: number) => (
                              <div key={i} className="flex items-start gap-4 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                                {/* Número de producto */}
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                                  {i + 1}
                                </span>

                                {/* Nombre y detalle */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                                  {p.medidasFormateadas && (
                                    <p className="text-xs text-gray-400 mt-0.5">Medidas: {p.medidasFormateadas}</p>
                                  )}
                                </div>

                                {/* Cantidades y precios */}
                                <div className="flex flex-wrap gap-2 flex-shrink-0">
                                  {p.detalles.map((d: any, j: number) => (
                                    <div key={j} className="text-center bg-gray-50 rounded px-2 py-1 border border-gray-200">
                                      <p className="text-xs font-semibold text-gray-700">{d.cantidad.toLocaleString()}</p>
                                      <p className="text-xs text-green-600">${d.precio_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
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

      <button
        onClick={() => { setErrorGuardar(null); setModalOpen(true); }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
      >
        + Nueva Cotización
      </button>

      {/* Modal nueva cotización */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Cotización">
        {cargandoCatalogos ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                <p className="text-blue-700 text-sm">Guardando cotización y generando PDF...</p>
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

      {/* Modal editar cotización */}
      <Modal
        isOpen={modalEditarOpen}
        onClose={handleCerrarEditar}
        title={
          cotizacionEditando
            ? `Cotización #${cotizacionEditando.no_cotizacion} — ${cotizacionEditando.cliente || "Sin cliente"}`
            : "Cotización"
        }
      >
        {cotizacionEditando && (
          <EditarCotizacion
            cotizacion={cotizacionEditando}
            onSave={handleGuardarEdicion}
            onCancel={handleCerrarEditar}
          />
        )}
      </Modal>
    </Dashboard>
  );
}