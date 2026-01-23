import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import EditarDiseno from "../components/EditarDiseno";
import { useState } from "react";

interface Producto {
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  caras: number;
  disenoAprobado: boolean;
  observacionesDiseno?: string;
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

export default function Diseno() {
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
        { 
          nombre: "Bolsa plana 30x40 baja densidad", 
          cantidades: [1000, 2000, 3000],
          precios: [1.5, 1.4, 1.3],
          calibre: "200", 
          tintas: 2, 
          caras: 1, 
          disenoAprobado: false,
          observacionesDiseno: ""
        },
        { 
          nombre: "Bolsa troquelada 40x50 alta densidad", 
          cantidades: [500, 1000, 1500],
          precios: [2.0, 1.9, 1.8],
          calibre: "250", 
          tintas: 3, 
          caras: 2, 
          disenoAprobado: true,
          observacionesDiseno: "Cliente solicitó cambiar el color azul por verde"
        }
      ],
      observaciones: "Entrega urgente",
      total: 3800,
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
        { 
          nombre: "Bolsa celofán 30x40 BOPP", 
          cantidades: [2000, 3000, 5000],
          precios: [1.8, 1.7, 1.6],
          calibre: "175", 
          tintas: 1, 
          caras: 1, 
          disenoAprobado: true,
          observacionesDiseno: "Logo actualizado según nueva imagen corporativa"
        }
      ],
      observaciones: "",
      total: 8000,
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

  const handleEditarSubmit = (cotizacionActualizada: Cotizacion) => {
    setCotizaciones(cotizaciones.map(cot => 
      cot.id === cotizacionActualizada.id ? cotizacionActualizada : cot
    ));
    setModalEditarOpen(false);
    setCotizacionEditando(null);
  };

  const handleCancelarEditar = () => {
    setModalEditarOpen(false);
    setCotizacionEditando(null);
  };

  const getEstadoBadge = (cotizacion: Cotizacion) => {
    const { estado, productos } = cotizacion;
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          todosDisenos ? 'bg-blue-100 text-blue-800' : 'bg-orange-50 text-orange-700'
        }`}>
          🎨 {productosAprobados}/{productos.length} diseños
        </span>
      </div>
    );
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Gestión de Diseños</h1>

      <p className="text-slate-400 mb-6">
        Administra y aprueba los diseños de productos de cada cotización.
      </p>

      {/* BUSCADOR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, empresa, estado o ID..."
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
                          <div key={i} className="flex items-center gap-1">
                            {p.disenoAprobado ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-orange-600">⏱️</span>
                            )}
                            {p.nombre.substring(0, 30)}...
                          </div>
                        ))}
                        {cotizacion.productos.length > 2 && (
                          <div>+ {cotizacion.productos.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getEstadoBadge(cotizacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditar(cotizacion.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver/Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron cotizaciones que coincidan con "{busqueda}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalEditarOpen} onClose={handleCancelarEditar} title="Gestionar Diseños">
        {cotizacionEditando && (
          <EditarDiseno 
            cotizacion={cotizacionEditando} 
            onSave={handleEditarSubmit} 
            onCancel={handleCancelarEditar} 
          />
        )}
      </Modal>
    </Dashboard>
  );
}