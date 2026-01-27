import { useState } from "react";

interface Producto {
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  caras: number;
}

interface Pedido {
  id: number;
  numeroPedido: string;
  fecha: string;
  cliente: string;
  empresa: string;
  telefono: string;
  correo: string;
  productos: Producto[];
  total: number;
  observaciones: string;
  disenoAprobado: boolean;
  anticipoAprobado: boolean;
}

interface FormularioPedidoProps {
  pedido: Pedido;
  onSave: (pedido: Pedido) => void;
  onCancel: () => void;
}

const PRODUCTOS_DISPONIBLES = [
  "Bolsa plana 30x40 baja densidad",
  "Bolsa plana 40x50 baja densidad",
  "Bolsa plana 50x60 baja densidad",
  "Bolsa troquelada 30x40 alta densidad",
  "Bolsa troquelada 40x50 alta densidad",
  "Bolsa troquelada 50x60 alta densidad",
  "Bolsa celofán 20x30 BOPP",
  "Bolsa celofán 30x40 BOPP",
  "Bolsa celofán 40x50 BOPP",
  "Bolsa envíos 30x40 alta densidad",
  "Bolsa envíos 40x50 alta densidad",
  "Bolsa envíos 50x70 alta densidad",
  "Bolsa asa flexible 30x40 alta densidad",
  "Bolsa asa flexible 40x50 alta densidad",
  "Bolsa asa flexible 50x60 alta densidad",
  "Bobina alta densidad 30cm",
  "Bobina alta densidad 50cm",
  "Bobina baja densidad 40cm",
  "Faldón BOPP 60x90",
  "Faldón BOPP 80x120",
  "Lámina BOPP 100x150",
  "Lámina BOPP 120x180"
];

const CALIBRES = ["150", "175", "200", "225", "250", "275", "300", "325", "350", "375", "400"];

export default function FormularioPedido({ 
  pedido, 
  onSave, 
  onCancel 
}: FormularioPedidoProps) {
  const [datos, setDatos] = useState<Pedido>(pedido);
  
  const [productoActual, setProductoActual] = useState<Producto>({
    nombre: "",
    cantidades: [0, 0, 0],
    precios: [0, 0, 0],
    calibre: "200",
    tintas: 1,
    caras: 1,
  });

  const [productosFiltrados, setProductosFiltrados] = useState<string[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [mostrarDropdownCalibre, setMostrarDropdownCalibre] = useState(false);
  const [mostrarDropdownCaras, setMostrarDropdownCaras] = useState(false);

  /* FUNCIÓN PARA NORMALIZAR TEXTO (QUITAR ACENTOS) */
  const normalizarTexto = (texto: string) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Inputs del producto
  const handleProductoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tintas") {
      if (value === "") {
        setProductoActual({
          ...productoActual,
          [name]: "" as any,
        });
      } else {
        setProductoActual({
          ...productoActual,
          [name]: Number(value),
        });
      }
    } else {
      setProductoActual({
        ...productoActual,
        [name]: value,
      });

      // Si es el nombre del producto, filtrar lista sin acentos
      if (name === "nombre") {
        const valorNormalizado = normalizarTexto(value);
        const filtered = PRODUCTOS_DISPONIBLES.filter((p) =>
          normalizarTexto(p).includes(valorNormalizado)
        );
        setProductosFiltrados(filtered);
        setMostrarDropdown(value.length > 0);
      }
    }
  };

  // Función para calcular precio por bolsa según cantidad
  const calcularPrecioPorBolsa = (cantidad: number): number => {
    if (cantidad === 0) return 0;
    
    const BOLSAS_POR_KG = 88.652;
    const kilos = cantidad / BOLSAS_POR_KG;
    
    // Tabla de precios por kilo según volumen
    let precioKg: number;
    if (kilos >= 1000) precioKg = 90;
    else if (kilos >= 500) precioKg = 90;
    else if (kilos >= 300) precioKg = 95;
    else if (kilos >= 200) precioKg = 120;
    else if (kilos >= 100) precioKg = 150;
    else if (kilos >= 75) precioKg = 180;
    else if (kilos >= 50) precioKg = 200;
    else if (kilos >= 30) precioKg = 250;
    else precioKg = 250; // Menos de 30kg
    
    // Calcular precio por bolsa
    const precioPorBolsa = precioKg / BOLSAS_POR_KG;
    return Number(precioPorBolsa.toFixed(4));
  };

  const handleCantidadChange = (index: number, value: string) => {
    const nuevasCantidades = [...productoActual.cantidades];
    const nuevosPrecios = [...productoActual.precios];
    
    const cantidad = value === "" ? 0 : Number(value);
    nuevasCantidades[index] = cantidad;
    
    // Calcular automáticamente el precio según la cantidad
    nuevosPrecios[index] = calcularPrecioPorBolsa(cantidad);

    setProductoActual({
      ...productoActual,
      cantidades: nuevasCantidades as [number, number, number],
      precios: nuevosPrecios as [number, number, number],
    });
  };

  const handleAgregarProducto = () => {
    const tieneValoresValidos = productoActual.cantidades.some(
      (cant, i) => cant > 0 && productoActual.precios[i] > 0
    );

    if (productoActual.nombre && tieneValoresValidos) {
      setDatos({
        ...datos,
        productos: [...datos.productos, productoActual],
      });

      setProductoActual({
        nombre: "",
        cantidades: [0, 0, 0],
        precios: [0, 0, 0],
        calibre: "200",
        tintas: 1,
        caras: 1,
      });

      setProductosFiltrados([]);
      setMostrarDropdown(false);
    }
  };

  const handleEliminarProducto = (index: number) => {
    const nuevosProductos = datos.productos.filter((_, i) => i !== index);
    const nuevoTotal = nuevosProductos.reduce((total, prod) => {
      const subtotal = prod.cantidades.reduce(
        (sum, cant, i) => sum + cant * prod.precios[i],
        0
      );
      return total + subtotal;
    }, 0);

    setDatos({
      ...datos,
      productos: nuevosProductos,
      total: nuevoTotal
    });
  };

  const calcularTotal = () => {
    return datos.productos.reduce((total, prod) => {
      const subtotal = prod.cantidades.reduce(
        (sum, cant, i) => sum + cant * prod.precios[i],
        0
      );
      return total + subtotal;
    }, 0);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
  };

  const handleSubmit = () => {
    const totalActualizado = calcularTotal();
    onSave({
      ...datos,
      total: totalActualizado
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Editar Productos
      </h3>

      {/* Formulario de producto */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 relative">
        <div className="space-y-3">
          {/* Producto */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Producto
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="nombre"
                value={productoActual.nombre}
                onChange={handleProductoChange}
                placeholder="Escribe para buscar..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                autoComplete="off"
                onFocus={() => {
                  if (productoActual.nombre) {
                    setMostrarDropdown(true);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setMostrarDropdown(!mostrarDropdown);
                  if (!mostrarDropdown) {
                    setProductosFiltrados(PRODUCTOS_DISPONIBLES);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${mostrarDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {/* Lista de sugerencias */}
            {mostrarDropdown && productosFiltrados.length > 0 && (
              <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                {productosFiltrados.map((p, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                    onClick={() => {
                      setProductoActual({ ...productoActual, nombre: p });
                      setProductosFiltrados([]);
                      setMostrarDropdown(false);
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Calibre y Cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calibre
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productoActual.calibre}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                  onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarDropdownCalibre(!mostrarDropdownCalibre)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${mostrarDropdownCalibre ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {mostrarDropdownCalibre && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                  {CALIBRES.map((calibre) => (
                    <li
                      key={calibre}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                      onClick={() => {
                        setProductoActual({ ...productoActual, calibre });
                        setMostrarDropdownCalibre(false);
                      }}
                    >
                      {calibre}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidades
              </label>
              <div className="grid grid-cols-3 gap-2">
                {productoActual.cantidades.map((cantidad, index) => (
                  <input
                    key={index}
                    type="number"
                    min="0"
                    value={cantidad === 0 ? "" : cantidad}
                    onChange={(e) => handleCantidadChange(index, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    placeholder={`Cant. ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tintas y Caras */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tintas
              </label>
              <input
                type="number"
                name="tintas"
                value={productoActual.tintas}
                onChange={handleProductoChange}
                min="1"
                max="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                placeholder="0"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caras
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${productoActual.caras} cara${productoActual.caras > 1 ? 's' : ''}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white cursor-pointer"
                  onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                />
                <button
                  type="button"
                  onClick={() => setMostrarDropdownCaras(!mostrarDropdownCaras)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${mostrarDropdownCaras ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {mostrarDropdownCaras && (
                <ul className="border border-gray-300 mt-1 max-h-60 overflow-auto rounded-lg bg-white z-10 absolute w-full shadow-lg">
                  <li
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                    onClick={() => {
                      setProductoActual({ ...productoActual, caras: 1 });
                      setMostrarDropdownCaras(false);
                    }}
                  >
                    1 cara
                  </li>
                  <li
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
                    onClick={() => {
                      setProductoActual({ ...productoActual, caras: 2 });
                      setMostrarDropdownCaras(false);
                    }}
                  >
                    2 caras
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precios unitarios (calculados automáticamente)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {productoActual.precios.map((precio, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={precio === 0 ? "" : `${precio.toFixed(4)}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
                    placeholder="Auto"
                  />
                  {productoActual.cantidades[index] > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {(productoActual.cantidades[index] / 88.652).toFixed(2)} kg
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAgregarProducto}
          className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Lista de productos */}
      {datos.productos.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Productos agregados:
          </h4>
          <div className="space-y-2">
            {datos.productos.map((prod, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{prod.nombre}</p>
                  <p className="text-sm text-gray-500">
                    Calibre: {prod.calibre} | Tintas: {prod.tintas} | Caras: {prod.caras}
                  </p>
                  {prod.cantidades.map((cant, i) =>
                    cant > 0 ? (
                      <p key={i} className="text-sm text-gray-600">
                        {cant} x ${prod.precios[i].toFixed(2)} = $
                        {(cant * prod.precios[i]).toFixed(2)}
                      </p>
                    ) : null
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarProducto(index)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              Total: ${calcularTotal().toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Checkboxes de Aprobación */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Estado del Pedido
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="disenoAprobado"
              checked={datos.disenoAprobado}
              onChange={(e) => setDatos({ ...datos, disenoAprobado: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="disenoAprobado" className="ml-2 block text-sm font-medium text-gray-700">
              Diseño Aprobado
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anticipoAprobado"
              checked={datos.anticipoAprobado}
              onChange={(e) => setDatos({ ...datos, anticipoAprobado: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="anticipoAprobado" className="ml-2 block text-sm font-medium text-gray-700">
              Anticipo Pagado
            </label>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (Opcional)
        </label>
        <textarea
          name="observaciones"
          value={datos.observaciones}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    text-gray-900 bg-white placeholder-gray-400"
          placeholder="Notas adicionales sobre el pedido..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}