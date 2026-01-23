import { useState } from "react";

interface Producto {
  descripcion: string;
  medidas: string;
  cantidad: number;
  calibre: string;
  tintas: number;
  caras: number;
  material: string;
  asaSuaje: string;
  precioUnitario: number;
  importe: number;
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

export default function FormularioPedido({ 
  pedido, 
  onSave, 
  onCancel 
}: FormularioPedidoProps) {
  const [datos, setDatos] = useState<Pedido>(pedido);

  const handleProductoChange = (index: number, campo: string, valor: any) => {
    const nuevosProductos = [...datos.productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [campo]: valor
    };

    if (campo === 'cantidad' || campo === 'precioUnitario') {
      const cantidad = campo === 'cantidad' ? Number(valor) : nuevosProductos[index].cantidad;
      const precio = campo === 'precioUnitario' ? Number(valor) : nuevosProductos[index].precioUnitario;
      nuevosProductos[index].importe = cantidad * precio;
    }

    const nuevoTotal = nuevosProductos.reduce((sum, p) => sum + p.importe, 0);

    setDatos({
      ...datos,
      productos: nuevosProductos,
      total: nuevoTotal
    });
  };

  const handleSubmit = () => {
    onSave(datos);
  };

  return (
    <div className="p-6 space-y-6">
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

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Productos</h4>
        {datos.productos.map((producto, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={producto.descripcion}
                  onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medidas
                </label>
                <input
                  type="text"
                  value={producto.medidas}
                  onChange={(e) => handleProductoChange(index, 'medidas', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={producto.cantidad}
                  onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calibre
                </label>
                <input
                  type="text"
                  value={producto.calibre}
                  onChange={(e) => handleProductoChange(index, 'calibre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tintas
                </label>
                <input
                  type="number"
                  value={producto.tintas}
                  onChange={(e) => handleProductoChange(index, 'tintas', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caras
                </label>
                <select
                  value={producto.caras}
                  onChange={(e) => handleProductoChange(index, 'caras', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value={1}>1 cara</option>
                  <option value={2}>2 caras</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <select
                  value={producto.material}
                  onChange={(e) => handleProductoChange(index, 'material', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="Alta Densidad">Alta Densidad</option>
                  <option value="Baja Densidad">Baja Densidad</option>
                  <option value="BOPP">BOPP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asa/Suaje
                </label>
                <input
                  type="text"
                  value={producto.asaSuaje}
                  onChange={(e) => handleProductoChange(index, 'asaSuaje', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={producto.precioUnitario}
                  onChange={(e) => handleProductoChange(index, 'precioUnitario', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe
                </label>
                <input
                  type="text"
                  value={`$${producto.importe.toFixed(2)}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-100"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones
        </label>
        <textarea
          value={datos.observaciones}
          onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
        />
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-bold text-gray-900">
          Total: ${datos.total.toFixed(2)}
        </p>
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