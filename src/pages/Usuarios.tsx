import Dashboard from "../layouts/Sidebar";
import Modal from "../components/Modal";
import FormularioUsuario from "../components/FormularioUsuario";
import { useState } from "react";

interface Usuario {
  id: number;
  nombre: string;
  puesto: string;
  telefono: string;
  codigo: string;
  correo: string;
}

interface DatosUsuario {
  correo: string;
  nombre: string;
  apellido: string;
  codigo: string;
  privilegios: {
    crearUsuarios: boolean;
    altaProductos: boolean;
    cotizaciones: boolean;
    pedidos: boolean;
    produccion: boolean;
    ventas: boolean;
  };
}

export default function Usuarios() {
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nombre: "Juan Pérez", puesto: "Gerente", telefono: "33-1234-5678", codigo: "USR001", correo: "juan@grupeb.com" },
    { id: 2, nombre: "María García", puesto: "Contador", telefono: "33-2345-6789", codigo: "USR002", correo: "maria@grupeb.com" },
    { id: 3, nombre: "Carlos López", puesto: "Vendedor", telefono: "33-3456-7890", codigo: "USR003", correo: "carlos@grupeb.com" },
    { id: 4, nombre: "Ana Martínez", puesto: "Administrador", telefono: "33-4567-8901", codigo: "USR004", correo: "ana@grupeb.com" },
    { id: 5, nombre: "Luis Rodríguez", puesto: "Almacenista", telefono: "33-5678-9012", codigo: "USR005", correo: "luis@grupeb.com" },
    { id: 6, nombre: "Sofia Hernández", puesto: "Cajero", telefono: "33-6789-0123", codigo: "USR006", correo: "sofia@grupeb.com" },
    { id: 7, nombre: "Pedro Ramírez", puesto: "Supervisor", telefono: "33-7890-1234", codigo: "USR007", correo: "pedro@grupeb.com" },
    { id: 8, nombre: "Laura González", puesto: "Asistente", telefono: "33-8901-2345", codigo: "USR008", correo: "laura@grupeb.com" },
    { id: 9, nombre: "Diego Torres", puesto: "Vendedor", telefono: "33-9012-3456", codigo: "USR009", correo: "diego@grupeb.com" },
    { id: 10, nombre: "Carmen Flores", puesto: "Recepcionista", telefono: "33-0123-4567", codigo: "USR010", correo: "carmen@grupeb.com" }
  ]);

  /* FUNCIÓN PARA NORMALIZAR TEXTO (QUITAR ACENTOS, MAYÚSCULAS, PUNTOS, COMAS) */
  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,\-]/g, "")
      .trim();
  };

  /* FILTRAR USUARIOS SEGÚN LA BÚSQUEDA */
  const usuariosFiltrados = usuarios.filter((usuario) => {
    if (!busqueda) return true;

    const terminoBusqueda = normalizarTexto(busqueda);

    return (
      normalizarTexto(usuario.nombre).includes(terminoBusqueda) ||
      normalizarTexto(usuario.correo).includes(terminoBusqueda) ||
      normalizarTexto(usuario.puesto).includes(terminoBusqueda) ||
      normalizarTexto(usuario.telefono).includes(terminoBusqueda) ||
      normalizarTexto(usuario.codigo).includes(terminoBusqueda)
    );
  });

  const handleEditar = (id: number) => {
    console.log("Editar usuario:", id);
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      setUsuarios(usuarios.filter(usuario => usuario.id !== id));
    }
  };

  const handleAgregarUsuario = () => {
    setModalOpen(true);
  };

  const handleSubmit = (datos: DatosUsuario) => {
    const nuevoUsuario: Usuario = {
      id: usuarios.length + 1,
      nombre: `${datos.nombre} ${datos.apellido}`,
      puesto: "Sin asignar",
      telefono: "Sin asignar",
      codigo: datos.codigo,
      correo: datos.correo
    };

    setUsuarios([...usuarios, nuevoUsuario]);
    setModalOpen(false);
  };

  const handleCancelar = () => {
    setModalOpen(false);
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      <p className="text-slate-400 mb-6">
        Usuarios existentes en el sistema GRUPEB.
      </p>

      {/* BUSCADOR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo, puesto, teléfono o código..."
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
            Se encontraron {usuariosFiltrados.length} resultado(s)
          </p>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puesto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {usuario.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.correo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.puesto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.telefono}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditar(usuario.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron usuarios que coincidan con "{busqueda}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleAgregarUsuario}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          + Agregar Nuevo Usuario
        </button>
      </div>

      <Modal isOpen={modalOpen} onClose={handleCancelar} title="Nuevo Usuario">
        <FormularioUsuario onSubmit={handleSubmit} onCancel={handleCancelar} />
      </Modal>
    </Dashboard>
  );
}