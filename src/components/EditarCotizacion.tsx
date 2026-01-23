import { useState } from "react";

interface Producto {
  nombre: string;
  cantidades: [number, number, number];
  precios: [number, number, number];
  calibre: string;
  tintas: number;
  caras: number;
  disenoAprobado: boolean;
  cantidadesSeleccionadas?: boolean[]; // Array de 3 booleanos
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

interface EditarCotizacionProps {
  cotizacion: Cotizacion;
  onSave: (cotizacionActualizada: Cotizacion) => void;
  onCancel: () => void;
}

export default function EditarCotizacion({ cotizacion, onSave, onCancel }: EditarCotizacionProps) {
  const [form, setForm] = useState<Cotizacion>({ 
    ...cotizacion,
    productos: cotizacion.productos.map(p => ({
      ...p,
      cantidadesSeleccionadas: p.cantidadesSeleccionadas || [false, false, false]
    }))
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAprobarCotizacion = () => {
    onSave({ ...form, estado: "Aprobada" });
  };

  const handleRechazarCotizacion = () => {
    if (confirm("¿Estás seguro de rechazar esta cotización?")) {
      onSave({ ...form, estado: "Rechazada" });
    }
  };

  const handleToggleDiseno = (index: number) => {
    const nuevosProductos = [...form.productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      disenoAprobado: !nuevosProductos[index].disenoAprobado
    };
    setForm({ ...form, productos: nuevosProductos });
  };

  const handleToggleCantidad = (indexProducto: number, indexCantidad: number) => {
    const nuevosProductos = [...form.productos];
    const cantidadesActuales = nuevosProductos[indexProducto].cantidadesSeleccionadas || [false, false, false];
    const nuevasCantidades = [...cantidadesActuales];
    nuevasCantidades[indexCantidad] = !nuevasCantidades[indexCantidad];
    
    nuevosProductos[indexProducto] = {
      ...nuevosProductos[indexProducto],
      cantidadesSeleccionadas: nuevasCantidades
    };
    setForm({ ...form, productos: nuevosProductos });
  };

  const handleToggleAnticipo = () => {
    setForm({ ...form, anticipoAprobado: !form.anticipoAprobado });
  };

  const handleGuardar = () => {
    onSave({ ...form });
  };

  const calcularSubtotalPorCantidad = (producto: Producto, index: number) => {
    const cantidad = Number(producto.cantidades[index]) || 0;
    const precio = Number(producto.precios[index]) || 0;
    return cantidad * precio;
  };

  const calcularTotalCotizacion = () => {
    return form.productos.reduce((total, prod) => {
      const cantidadesSeleccionadas = prod.cantidadesSeleccionadas || [false, false, false];
      const subtotal = cantidadesSeleccionadas.reduce((sum, seleccionada, idx) => {
        if (seleccionada) {
          return sum + calcularSubtotalPorCantidad(prod, idx);
        }
        return sum;
      }, 0);
      return total + subtotal;
    }, 0);
  };

  const productosAprobados = form.productos.filter(p => p.disenoAprobado).length;
  const todosDisenos = form.productos.every(p => p.disenoAprobado);
  
  const contarCantidadesSeleccionadas = () => {
    return form.productos.reduce((count, prod) => {
      const cantidadesSeleccionadas = prod.cantidadesSeleccionadas || [false, false, false];
      const tieneSeleccion = cantidadesSeleccionadas.some(sel => sel);
      return tieneSeleccion ? count + 1 : count;
    }, 0);
  };

  return (
    <div className="space-y-5">
      {/* Información del Cliente */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider">
          Información del Cliente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Productos con Selección de Cantidades */}
      <div className="bg-white border-2 border-purple-200 rounded-lg">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Productos y Cantidades
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Selecciona una o más cantidades por producto y aprueba diseños
              </p>
            </div>
            <div className="text-right space-y-1">
              <div>
                <div className="text-xs text-gray-500">Diseños Aprobados</div>
                <div className={`text-lg font-bold ${todosDisenos ? 'text-green-600' : 'text-blue-600'}`}>
                  {productosAprobados}/{form.productos.length}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Productos con Selección</div>
                <div className={`text-lg font-bold ${contarCantidadesSeleccionadas() === form.productos.length ? 'text-green-600' : 'text-orange-600'}`}>
                  {contarCantidadesSeleccionadas()}/{form.productos.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {form.productos.map((producto, indexProd) => {
              const cantidadesSeleccionadas = producto.cantidadesSeleccionadas || [false, false, false];
              const numSeleccionadas = cantidadesSeleccionadas.filter(s => s).length;
              
              return (
                <div 
                  key={indexProd} 
                  className={`bg-white p-4 rounded-lg border-2 transition-all ${
                    producto.disenoAprobado 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200'
                  }`}
                >
                  {/* Encabezado del Producto */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">{producto.nombre}</h4>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Calibre:</span>
                        <span className="ml-1 font-medium text-gray-900">{producto.calibre}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tintas:</span>
                        <span className="ml-1 font-medium text-gray-900">{producto.tintas}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Caras:</span>
                        <span className="ml-1 font-medium text-gray-900">{producto.caras}</span>
                      </div>
                    </div>
                  </div>

                  {/* Opciones de Cantidades con Selección Múltiple */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Cantidades cotizadas
                      </h5>
                      {numSeleccionadas > 0 && (
                        <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                          {numSeleccionadas} seleccionada{numSeleccionadas > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {producto.cantidades.map((cantidad, indexCant) => {
                        if (cantidad === 0) return null;
                        const subtotal = calcularSubtotalPorCantidad(producto, indexCant);
                        const isSelected = cantidadesSeleccionadas[indexCant];
                        
                        return (
                          <div
                            key={indexCant}
                            onClick={() => handleToggleCantidad(indexProd, indexCant)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-green-100 border-green-500 shadow-lg'
                                : 'bg-white border-gray-300 hover:border-green-400 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'bg-green-600 border-green-600' : 'border-gray-400'
                              }`}>
                                {isSelected && (
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${
                                isSelected ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                Opción {indexCant + 1}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cantidad:</span>
                                <span className="font-bold text-gray-900">{cantidad.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Precio c/u:</span>
                                <span className="font-semibold text-gray-900">${producto.precios[indexCant].toFixed(2)}</span>
                              </div>
                              <div className="pt-2 border-t border-gray-200 mt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                                  <span className="text-lg font-bold text-green-700">${subtotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle de Aprobación de Diseño */}
                  <div 
                    onClick={() => handleToggleDiseno(indexProd)}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      producto.disenoAprobado 
                        ? 'bg-blue-50 border-blue-400 shadow-sm' 
                        : 'bg-gray-50 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        producto.disenoAprobado ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                      }`}>
                        {producto.disenoAprobado && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">🎨 Diseño de este producto</div>
                        <div className="text-xs text-gray-500">
                          {producto.disenoAprobado ? 'Diseño aprobado y listo' : 'Pendiente de aprobación'}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      producto.disenoAprobado ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {producto.disenoAprobado ? 'APROBADO' : 'PENDIENTE'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
        <textarea
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Agrega notas o comentarios adicionales..."
        />
      </div>

      {/* Aprobación de Anticipo (General) */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-300">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
          Aprobación General de Anticipo
        </h3>
        
        <div 
          onClick={handleToggleAnticipo}
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
            form.anticipoAprobado 
              ? 'bg-purple-100 border-purple-500 shadow-md' 
              : 'bg-white border-gray-300 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
              form.anticipoAprobado ? 'bg-purple-600 border-purple-600' : 'border-gray-400'
            }`}>
              {form.anticipoAprobado && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">💰 Anticipo Recibido</div>
              <div className="text-xs text-gray-600">
                {form.anticipoAprobado 
                  ? 'El anticipo ha sido recibido y confirmado' 
                  : 'Anticipo pendiente de confirmación'}
              </div>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
            form.anticipoAprobado ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {form.anticipoAprobado ? 'CONFIRMADO' : 'PENDIENTE'}
          </div>
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
          Resumen de Totales
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2 border-b border-gray-300">
            <span className="text-gray-600">Estado de Cotización:</span>
            <span className={`font-bold text-lg ${
              form.estado === 'Aprobada' ? 'text-green-600' : 
              form.estado === 'Rechazada' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {form.estado === 'Aprobada' ? '✓ ' : form.estado === 'Rechazada' ? '✕ ' : '⏱️ '}
              {form.estado}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-900 font-semibold text-lg">Total (cantidades seleccionadas):</span>
            <span className="text-2xl font-bold text-gray-900">${calcularTotalCotizacion().toFixed(2)}</span>
          </div>
          {contarCantidadesSeleccionadas() < form.productos.length && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Aún hay {form.productos.length - contarCantidadesSeleccionadas()} producto(s) sin cantidades seleccionadas
            </p>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-200">
        {form.estado === "Pendiente" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAprobarCotizacion}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aprobar Cotización
            </button>
            <button
              onClick={handleRechazarCotizacion}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rechazar
            </button>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}