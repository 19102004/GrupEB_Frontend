import { useState, useEffect } from "react";
import Dashboard from "../layouts/Sidebar";
import SelectorProducto, { type DatosProducto } from "../components/ConfigurarProducto";

const MERMA_PRODUCCION: Record<number, number> = {
  30: 20,
  50: 10,
  75: 8,
  100: 7,
  200: 5,
  300: 4,
  500: 3,
  1000: 1,
};

const COSTOS_PRODUCCION: Record<number, number> = {
  30: 250,
  50: 200,
  75: 180,
  100: 150,
  200: 120,
  300: 95,
  500: 90,
  1000: 90,
};

export default function Plastico() {
  // Estados para datos del producto
  const [datosProducto, setDatosProducto] = useState<DatosProducto>({
    tipoProducto: "",
    material: "",
    calibre: "",
    medidas: {
      altura: "",
      ancho: "",
      fuelleFondo: "",
      fuelleLateral1: "",
      fuelleLateral2: "",
      refuerzo: "",
      solapa: "",
    },
    medidasFormateadas: "",
    nombreCompleto: "",
  });

  const [bolsasPorKilo, setBolsasPorKilo] = useState("");

  // Calcular bolsas por kilo automáticamente
  useEffect(() => {
    if (!datosProducto.tipoProducto || !datosProducto.calibre || !datosProducto.material) {
      setBolsasPorKilo("");
      return;
    }

    const altura = parseFloat(datosProducto.medidas.altura) || 0;
    const ancho = parseFloat(datosProducto.medidas.ancho) || 0;
    const fuelleFondo = parseFloat(datosProducto.medidas.fuelleFondo) || 0;
    const refuerzo = parseFloat(datosProducto.medidas.refuerzo) || 0;
    const fuelleLateral1 = parseFloat(datosProducto.medidas.fuelleLateral1) || 0;
    const fuelleLateral2 = parseFloat(datosProducto.medidas.fuelleLateral2) || 0;
    const calibreNum = parseFloat(datosProducto.calibre) || 0;

    // Verificar que tengamos al menos altura y ancho
    if (altura === 0 || ancho === 0 || calibreNum === 0) {
      setBolsasPorKilo("");
      return;
    }

    // Factor cambia según el material
    const factor = datosProducto.material === "Baja densidad" ? 0.50 : 0.47;

    // Suma vertical: Altura + Fuelle Fondo + Refuerzo
    const sumaVertical = altura + fuelleFondo + refuerzo;

    // Suma horizontal: Ancho + Fuelle Lateral 1 + Fuelle Lateral 2
    const sumaHorizontal = ancho + fuelleLateral1 + fuelleLateral2;

    // Fórmula: 1000 / ((((suma vertical) / 100) * ((suma horizontal) / 100) * Calibre) * Factor)
    const resultado = 1000 / ((((sumaVertical) / 100) * ((sumaHorizontal) / 100) * calibreNum) * factor);

    setBolsasPorKilo(resultado.toFixed(3));
  }, [datosProducto]);

  // Manejar cambios del producto
  const handleProductoChange = (datos: DatosProducto) => {
    setDatosProducto(datos);
  };

  // Función para redondear a centenas superiores
  const redondearACentenas = (valor: number) => {
    return Math.ceil(valor / 100) * 100;
  };

  // Calcular tabla de amortización
  const kilosReferencia = [30, 50, 75, 100, 200, 300, 500, 1000];
  
  const calcularBolsasPorKilos = (kilos: number) => {
    if (!bolsasPorKilo) return "--";
    const bolsas = parseFloat(bolsasPorKilo) * kilos;
    return redondearACentenas(bolsas).toLocaleString();
  };

  const calcularBolsasConMerma = (kilos: number) => {
    if (!bolsasPorKilo) return "--";

    const bpk = parseFloat(bolsasPorKilo);
    const bolsasBase = redondearACentenas(bpk * kilos);

    const porcentajeMerma = MERMA_PRODUCCION[kilos] || 0;
    const bolsasMerma = Math.ceil(bolsasBase * (porcentajeMerma / 100));

    const total = bolsasBase + bolsasMerma;

    return {
      porcentajeMerma,
      bolsasMerma,
      total,
    };
  };

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-6">Dar de alta producto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULARIO Y FIGURA - Usando SelectorProducto */}
        <div className="bg-white p-6 rounded-xl shadow col-span-2">
          <SelectorProducto
            onProductoChange={handleProductoChange}
            mostrarFigura={true}
          />

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Medidas formateadas */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Medidas
              </label>
              <input
                value={datosProducto.medidasFormateadas || "--"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium bg-gray-50"
              />
            </div>

            {/* Bolsas por kilo */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Bolsas por kilo
              </label>
              <input
                value={bolsasPorKilo || "--"}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE AMORTIZACIÓN */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Tabla de producción por kilogramos</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                {kilosReferencia.map((kilos) => (
                  <th
                    key={kilos}
                    className="px-4 py-3 text-center border border-blue-700"
                  >
                    {kilos}k
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* FILA: BOLSAS TOTALES */}
              <tr className="bg-gray-50">
                {kilosReferencia.map((kilos) => (
                  <td
                    key={kilos}
                    className="px-4 py-3 text-center border border-gray-300 font-medium"
                  >
                    {calcularBolsasPorKilos(kilos)}
                  </td>
                ))}
              </tr>

              {/* FILA: PRECIO POR UNIDAD (C/U) */}
              <tr className="bg-white">
                {kilosReferencia.map((kilos) => {
                  const costo = COSTOS_PRODUCCION[kilos];
                  const bpk = parseFloat(bolsasPorKilo);

                  if (!costo || !bpk) {
                    return (
                      <td
                        key={kilos}
                        className="px-4 py-3 text-center border border-gray-300 text-gray-400"
                      >
                        --
                      </td>
                    );
                  }

                  const precioUnitario = costo / bpk;

                  return (
                    <td
                      key={kilos}
                      className="px-4 py-3 text-center border border-gray-300 text-green-600 font-semibold"
                    >
                      ${precioUnitario.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          {/* MERMA */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Merma y total de bolsas
            </h3>

            <div className="grid grid-cols-8 gap-2 text-center text-sm">
              {kilosReferencia.map((kilos) => {
                const data = calcularBolsasConMerma(kilos);

                if (data === "--") {
                  return (
                    <div key={kilos} className="text-gray-400">
                      --
                    </div>
                  );
                }

                return (
                  <div
                    key={kilos}
                    className="bg-gray-50 rounded-lg p-2 border"
                  >
                    <p className="text-xs text-gray-500">
                      Merma {data.porcentajeMerma}%
                    </p>
                    <p className="text-xs text-orange-600 font-medium">
                      +{data.bolsasMerma.toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-green-700">
                      {data.total.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}