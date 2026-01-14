import { useState } from "react";

interface FormularioUsuarioProps {
  onSubmit: (datos: DatosUsuario) => void;
  onCancel: () => void;
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

export default function FormularioUsuario({
  onSubmit,
  onCancel,
}: FormularioUsuarioProps) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<DatosUsuario>({
    correo: "",
    nombre: "",
    apellido: "",
    codigo: "",
    privilegios: {
      crearUsuarios: false,
      altaProductos: false,
      cotizaciones: false,
      pedidos: false,
      produccion: false,
      ventas: false,
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handlePrivilegioChange = (
    privilegio: keyof typeof datos.privilegios
  ) => {
    setDatos({
      ...datos,
      privilegios: {
        ...datos.privilegios,
        [privilegio]: !datos.privilegios[privilegio],
      },
    });
  };

  const handleSiguiente = () => {
    if (datos.correo && datos.nombre && datos.apellido && datos.codigo) {
      setPaso(2);
    }
  };

  const handleAtras = () => setPaso(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(datos);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Indicador de pasos */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso === 1 ? "bg-blue-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {paso === 1 ? "1" : "✓"}
          </div>
          <div
            className={`w-24 h-1 ${
              paso === 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              paso === 2
                ? "bg-blue-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* PASO 1 */}
      <div className={paso === 1 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Datos del Usuario
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={datos.correo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white placeholder-gray-400"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={datos.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Juan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={datos.apellido}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 bg-white placeholder-gray-400"
                placeholder="Pérez"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Usuario
            </label>
            <input
              type="text"
              name="codigo"
              value={datos.codigo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 bg-white placeholder-gray-400"
              placeholder="USR011"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSiguiente}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* PASO 2 */}
      <div className={paso === 2 ? "block" : "hidden"}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Seleccionar Privilegios
        </h3>

        <div className="space-y-3">
          {(
            Object.keys(datos.privilegios) as Array<
              keyof typeof datos.privilegios
            >
          ).map((key) => (
            <label
              key={key}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={datos.privilegios[key]}
                onChange={() => handlePrivilegioChange(key)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700 capitalize">{key}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleAtras}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
          >
            Atrás
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Crear Usuario
          </button>
        </div>
      </div>
    </form>
  );
}
