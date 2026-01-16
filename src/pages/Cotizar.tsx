import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import FormularioCotizacion from "../components/FormularioCotizacion";
import EditarCotizacion from "../components/EditarCotizacion";
import { useState } from "react";

interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
  calibre: string;
  tintas: number;
  caras: number;
  disenoAprobado: boolean;
}

interface Cotizacion {
  id: number;
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: Producto[];
  observaciones: string;
  total: number;
  fecha: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  anticipoAprobado: boolean;
}

interface DatosCotizacion {
  cliente: string;
  telefono: string;
  correo: string;
  empresa: string;
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
    calibre: string;
    tintas: number;
    caras: number;
  }[];
  observaciones: string;
}

export default function Cotizaciones() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [cotizacionEditando, setCotizacionEditando] = useState<Cotizacion | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([
    {
      id: 1,
      cliente: "María González García",
      telefono: "33-1234-5678",
      correo: "maria.gonzalez@empresa.com",
      empresa: "Distribuidora González",
      productos: [
        { nombre: "Bolsa plana 30x40 baja densidad", cantidad: 1000, precio: 1.5, calibre: "200", tintas: 2, caras: 1, disenoAprobado: false },
        { nombre: "Bolsa troquelada 40x50 alta densidad", cantidad: 500, precio: 2.0, calibre: "250", tintas: 3, caras: 2, disenoAprobado: true }
      ],
      observaciones: "Entrega urgente",
      total: 2500,
      fecha: "2025-01-15",
      estado: "Pendiente",
      anticipoAprobado: false
    },
    {
      id: 2,
      cliente: "Carlos Hernández López",
      telefono: "33-8765-4321",
      correo: "carlos.hdez@comercial.mx",
      empresa: "Comercial Hernández",
      productos: [
        { nombre: "Bolsa celofán 30x40 BOPP", cantidad: 2000, precio: 1.8, calibre: "175", tintas: 1, caras: 1, disenoAprobado: true }
      ],
      observaciones: "",
      total: 3600,
      fecha: "2025-01-14",
      estado: "Aprobada",
      anticipoAprobado: true
    }
  ]);

  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,\-]/g, "")
      .trim();
  };

  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    if (!busqueda) return true;

    const terminoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(cotizacion.cliente).includes(terminoBusqueda) ||
      normalizarTexto(cotizacion.empresa).includes(terminoBusqueda) ||
      normalizarTexto(cotizacion.correo).includes(terminoBusqueda) ||
      normalizarTexto(cotizacion.telefono).includes(terminoBusqueda) ||
      normalizarTexto(cotizacion.estado).includes(terminoBusqueda) ||
      cotizacion.id.toString().includes(terminoBusqueda)
    );
  });

  const handleEditar = (id: number) => {
    const cotizacion = cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      setCotizacionEditando(cotizacion);
      setModalEditarOpen(true);
    }
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta cotización?")) {
      setCotizaciones(cotizaciones.filter(cotizacion => cotizacion.id !== id));
    }
  };

  const handleAgregarCotizacion = () => {
    setModalOpen(true);
  };

  const calcularTotal = (productos: { cantidad: number; precio: number }[]) => {
    return productos.reduce((sum, prod) => sum + prod.cantidad * prod.precio, 0);
  };

  const handleSubmit = (datos: DatosCotizacion) => {
    const productosConDiseno = datos.productos.map(p => ({
      ...p,
      disenoAprobado: false
    }));

    const nuevaCotizacion: Cotizacion = {
      id: cotizaciones.length + 1,
      cliente: datos.cliente,
      telefono: datos.telefono,
      correo: datos.correo,
      empresa: datos.empresa,
      productos: productosConDiseno,
      observaciones: datos.observaciones,
      total: calcularTotal(datos.productos),
      fecha: new Date().toISOString().split('T')[0],
      estado: "Pendiente",
      anticipoAprobado: false
    };

    setCotizaciones([...cotizaciones, nuevaCotizacion]);
    setModalOpen(false);
  };

  const handleEditarSubmit = (cotizacionActualizada: Cotizacion) => {
    setCotizaciones(cotizaciones.map(cot => 
      cot.id === cotizacionActualizada.id ? cotizacionActualizada : cot
    ));
    setModalEditarOpen(false);
    setCotizacionEditando(null);
  };

  const handleCancelar = () => {
    setModalOpen(false);
  };

  const handleCancelarEditar = () => {
    setModalEditarOpen(false);
    setCotizacionEditando(null);
  };

  const getEstadoBadge = (cotizacion: Cotizacion) => {
    const { estado, anticipoAprobado, productos } = cotizacion;
    let color = "bg-yellow-100 text-yellow-800";
    let icono = "⏱️";
    
    if (estado === "Aprobada") {
      color = "bg-green-100 text-green-800";
      icono = "✓";
    } else if (estado === "Rechazada") {
      color = "bg-red-100 text-red-800";
      icono = "✕";
    }

    const productosAprobados = productos.filter(p => p.disenoAprobado).length;
    const todosDisenos = productos.every(p => p.disenoAprobado);

    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
          {icono} {estado}
        </span>
        {productosAprobados > 0 && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            todosDisenos ? 'bg-blue-100 text-blue-800' : 'bg-blue-50 text-blue-700'
          }`}>
            🎨 {productosAprobados}/{productos.length} diseños
          </span>
        )}
        {anticipoAprobado && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            💰 Anticipo OK
          </span>
        )}
      </div>
    );
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>

      <p className="text-slate-400 mb-6">
        Gestión de cotizaciones y seguimiento de aprobaciones.
      </p>

      {/* BUSCADOR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, empresa, correo, teléfono, estado o ID..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {busqueda && (
          <p className="mt-2 text-sm text-gray-600">
            Se encontraron {cotizacionesFiltradas.length} resultado(s)
          </p>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {cotizacionesFiltradas.length > 0 ? (
              cotizacionesFiltradas.map((cotizacion) => (
                <tr key={cotizacion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{cotizacion.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cotizacion.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cotizacion.cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cotizacion.empresa || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">
                      {cotizacion.productos.length} producto(s)
                      <div className="text-xs text-gray-400 mt-1">
                        {cotizacion.productos.slice(0, 2).map((p, i) => (
                          <div key={i}>• {p.nombre.substring(0, 30)}...</div>
                        ))}
                        {cotizacion.productos.length > 2 && (
                          <div>+ {cotizacion.productos.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${cotizacion.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getEstadoBadge(cotizacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditar(cotizacion.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Ver/Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(cotizacion.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron cotizaciones que coincidan con "{busqueda}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleAgregarCotizacion}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          + Nueva Cotización
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCancelar} title="Nueva Cotización">
        <FormularioCotizacion onSubmit={handleSubmit} onCancel={handleCancelar} />
      </Modal>

      <Modal isOpen={modalEditarOpen} onClose={handleCancelarEditar} title="Editar Cotización">
        {cotizacionEditando && (
          <EditarCotizacion 
            cotizacion={cotizacionEditando} 
            onSave={handleEditarSubmit} 
            onCancel={handleCancelarEditar} 
          />
        )}
      </Modal>
    </Dashboard>
  );
}