import { useState } from "react";
import Dashboard from "../layouts/Sidebar";

interface Precio {
  kilos: number;
  tinta1: number;
  tinta2: number;
  tinta3: number;
  tinta4: number;
  merma: number;
}

export default function PrecioPlastico() {
  const [editando, setEditando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [precios, setPrecios] = useState<Precio[]>([
    { kilos: 30, tinta1: 250, tinta2: 280, tinta3: 310, tinta4: 340, merma: 20 },
    { kilos: 50, tinta1: 200, tinta2: 225, tinta3: 250, tinta4: 275, merma: 10 },
    { kilos: 75, tinta1: 180, tinta2: 200, tinta3: 220, tinta4: 240, merma: 8 },
    { kilos: 100, tinta1: 150, tinta2: 170, tinta3: 190, tinta4: 210, merma: 7 },
    { kilos: 200, tinta1: 95, tinta2: 115, tinta3: 135, tinta4: 155, merma: 5 },
    { kilos: 300, tinta1: 90, tinta2: 110, tinta3: 130, tinta4: 150, merma: 4 },
    { kilos: 500, tinta1: 90, tinta2: 105, tinta3: 120, tinta4: 135, merma: 3 },
    { kilos: 1000, tinta1: 90, tinta2: 100, tinta3: 110, tinta4: 120, merma: 1 },
  ]);

  const [preciosBackup, setPreciosBackup] = useState<Precio[]>([]);

  const actualizarCampo = (
    kilos: number,
    campo: keyof Precio,
    valor: number
  ) => {
    setPrecios((prev) =>
      prev.map((p) =>
        p.kilos === kilos ? { ...p, [campo]: valor } : p
      )
    );
  };

  const iniciarEdicion = () => {
    setPreciosBackup(JSON.parse(JSON.stringify(precios)));
    setEditando(true);
  };

  const solicitarConfirmacion = () => {
    setMostrarConfirmacion(true);
  };

  const cancelarCambios = () => {
    setPrecios(preciosBackup);
    setEditando(false);
    setMostrarConfirmacion(false);
  };

  const confirmarCambios = () => {
    setEditando(false);
    setMostrarConfirmacion(false);
    console.log("Precios guardados:", precios);
    // luego -> POST a backend
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editando) {
      solicitarConfirmacion();
    }
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-6">
        Costos de Producción - Plástico
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Catálogo de costos</h2>

          <button
            onClick={() =>
              editando ? solicitarConfirmacion() : iniciarEdicion()
            }
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              editando
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editando ? "Guardar cambios" : "Modificar precios"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border px-3 py-2">Kg</th>
                <th className="border px-3 py-2">1 tinta</th>
                <th className="border px-3 py-2">2 tintas</th>
                <th className="border px-3 py-2">3 tintas</th>
                <th className="border px-3 py-2">4 tintas</th>
                <th className="border px-3 py-2">Merma %</th>
              </tr>
            </thead>

            <tbody>
              {precios.map((item) => (
                <tr key={item.kilos} className="even:bg-gray-50">
                  <td className="border px-3 py-2 text-center font-medium">
                    {item.kilos}k
                  </td>

                  {["tinta1", "tinta2", "tinta3", "tinta4", "merma"].map(
                    (campo) => (
                      <td
                        key={campo}
                        className="border px-3 py-2 text-center"
                      >
                        {editando ? (
                          <input
                            type="number"
                            value={item[campo as keyof Precio]}
                            onChange={(e) =>
                              actualizarCampo(
                                item.kilos,
                                campo as keyof Precio,
                                Number(e.target.value)
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="w-20 text-center border rounded-lg px-2 py-1
                                     focus:border-blue-500 focus:outline-none"
                          />
                        ) : campo === "merma" ? (
                          <span className="font-semibold text-gray-700">
                            {item.merma}%
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-700">
                            ${item[campo as keyof Precio]}
                          </span>
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Presiona <strong>Enter</strong> o{" "}
          <strong>Guardar cambios</strong> para confirmar.
        </p>
      </div>

      {/* MODAL */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[380px]">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Confirmar cambios
            </h3>

            <p className="text-sm text-gray-700 mb-4">
              Estás a punto de modificar los costos y mermas.
              <br />
              <strong>¿Deseas continuar?</strong>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelarCambios}
                className="px-4 py-2 rounded-lg border
                           border-gray-300 text-gray-700
                           hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCambios}
                className="px-4 py-2 rounded-lg
                           bg-red-600 text-white
                           hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
