import { useState } from "react";
import Dashboard from "../layouts/Sidebar";

interface Precio {
  kilos: number;
  tinta1: number;
  tinta2: number;
  tinta3: number;
  tinta4: number;
  merma1: number;
  merma2: number;
  merma3: number;
  merma4: number;
}

export default function PrecioPlastico() {
  const [editando, setEditando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [precios, setPrecios] = useState<Precio[]>([
    { kilos: 30, tinta1: 250, tinta2: 280, tinta3: 310, tinta4: 340, merma1: 20, merma2: 22, merma3: 24, merma4: 26 },
    { kilos: 50, tinta1: 200, tinta2: 225, tinta3: 250, tinta4: 275, merma1: 10, merma2: 12, merma3: 14, merma4: 16 },
    { kilos: 75, tinta1: 180, tinta2: 200, tinta3: 220, tinta4: 240, merma1: 8, merma2: 10, merma3: 12, merma4: 14 },
    { kilos: 100, tinta1: 150, tinta2: 170, tinta3: 190, tinta4: 210, merma1: 7, merma2: 9, merma3: 11, merma4: 13 },
    { kilos: 200, tinta1: 95, tinta2: 115, tinta3: 135, tinta4: 155, merma1: 5, merma2: 7, merma3: 9, merma4: 11 },
    { kilos: 300, tinta1: 90, tinta2: 110, tinta3: 130, tinta4: 150, merma1: 4, merma2: 6, merma3: 8, merma4: 10 },
    { kilos: 500, tinta1: 90, tinta2: 105, tinta3: 120, tinta4: 135, merma1: 3, merma2: 5, merma3: 7, merma4: 9 },
    { kilos: 1000, tinta1: 90, tinta2: 100, tinta3: 110, tinta4: 120, merma1: 1, merma2: 3, merma3: 5, merma4: 7 },
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
                <th className="border px-3 py-2" rowSpan={2}>Kg</th>
                <th className="border px-3 py-2" colSpan={2}>1 tinta</th>
                <th className="border px-3 py-2" colSpan={2}>2 tintas</th>
                <th className="border px-3 py-2" colSpan={2}>3 tintas</th>
                <th className="border px-3 py-2" colSpan={2}>4 tintas</th>
              </tr>
              <tr className="bg-blue-500 text-white">
                <th className="border px-2 py-1 text-xs">Precio</th>
                <th className="border px-2 py-1 text-xs">Merma %</th>
                <th className="border px-2 py-1 text-xs">Precio</th>
                <th className="border px-2 py-1 text-xs">Merma %</th>
                <th className="border px-2 py-1 text-xs">Precio</th>
                <th className="border px-2 py-1 text-xs">Merma %</th>
                <th className="border px-2 py-1 text-xs">Precio</th>
                <th className="border px-2 py-1 text-xs">Merma %</th>
              </tr>
            </thead>

            <tbody>
              {precios.map((item) => (
                <tr key={item.kilos} className="even:bg-gray-50">
                  <td className="border px-3 py-2 text-center font-medium bg-gray-100">
                    {item.kilos}k
                  </td>

                  {[
                    { precio: "tinta1", merma: "merma1" },
                    { precio: "tinta2", merma: "merma2" },
                    { precio: "tinta3", merma: "merma3" },
                    { precio: "tinta4", merma: "merma4" },
                  ].map(({ precio, merma }) => (
                    <>
                      <td
                        key={precio}
                        className="border px-3 py-2 text-center"
                      >
                        {editando ? (
                          <input
                            type="number"
                            value={item[precio as keyof Precio]}
                            onChange={(e) =>
                              actualizarCampo(
                                item.kilos,
                                precio as keyof Precio,
                                Number(e.target.value)
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="w-20 text-center border rounded-lg px-2 py-1
                                     focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-semibold text-gray-700">
                            ${item[precio as keyof Precio]}
                          </span>
                        )}
                      </td>
                      <td
                        key={merma}
                        className="border px-3 py-2 text-center bg-amber-50"
                      >
                        {editando ? (
                          <input
                            type="number"
                            value={item[merma as keyof Precio]}
                            onChange={(e) =>
                              actualizarCampo(
                                item.kilos,
                                merma as keyof Precio,
                                Number(e.target.value)
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="w-16 text-center border rounded-lg px-2 py-1
                                     focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span className="font-semibold text-amber-700">
                            {item[merma as keyof Precio]}%
                          </span>
                        )}
                      </td>
                    </>
                  ))}
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