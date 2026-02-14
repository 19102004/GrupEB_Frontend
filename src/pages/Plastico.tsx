import { useState, useEffect } from "react";
import Dashboard from "../layouts/Sidebar";
import SelectorProducto from "../components/ConfigurarProducto";
import {
  getCatalogosPlastico,
  createProductoPlastico,
} from "../services/productosPlasticoService";
import type {
  CatalogosPlastico,
  DatosProducto,
} from "../types/productos-plastico.types";

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
    tipoProductoId: 0,
    material: "",
    materialId: 0,
    calibre: "",
    calibreId: 0,
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

  // Estados para catálogos
  const [catalogos, setCatalogos] = useState<CatalogosPlastico>({
    tiposProducto: [],
    materiales: [],
    calibres: [],
  });

  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState("");

  // Estados para guardar
  const [guardando, setGuardando] = useState(false);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);
      setErrorCatalogos("");
      console.log("📋 Cargando catálogos...");

      const data = await getCatalogosPlastico();
      setCatalogos(data);

      console.log("✅ Catálogos cargados:", data);
    } catch (error: any) {
      console.error("❌ Error al cargar catálogos:", error);
      setErrorCatalogos(
        error.response?.data?.error || "Error al cargar los catálogos"
      );
    } finally {
      setCargandoCatalogos(false);
    }
  };

  // ✅ Calcular bolsas por kilo automáticamente (CON VALOR DE LA BD)
  useEffect(() => {
    if (
      !datosProducto.tipoProducto ||
      !datosProducto.calibre ||
      !datosProducto.material ||
      !datosProducto.materialId
    ) {
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

    // ✅ OBTENER FACTOR DESDE LA BD
    const materialSeleccionado = catalogos.materiales.find(
      (m) => m.id === datosProducto.materialId
    );

    if (!materialSeleccionado) {
      setBolsasPorKilo("");
      return;
    }

    const factor = parseFloat(materialSeleccionado.valor);

    console.log("🧮 Calculando con factor:", factor, "del material:", materialSeleccionado.nombre);

    // Suma vertical: Altura + Fuelle Fondo + Refuerzo
    const sumaVertical = altura + fuelleFondo + refuerzo;

    // Suma horizontal: Ancho + Fuelle Lateral 1 + Fuelle Lateral 2
    const sumaHorizontal = ancho + fuelleLateral1 + fuelleLateral2;

    // Fórmula: 1000 / ((((suma vertical) / 100) * ((suma horizontal) / 100) * Calibre) * Factor)
    const resultado =
      1000 /
      (((sumaVertical / 100) * (sumaHorizontal / 100) * calibreNum) * factor);

    setBolsasPorKilo(resultado.toFixed(3));
  }, [datosProducto, catalogos.materiales]);

  // Manejar cambios del producto
  const handleProductoChange = (datos: DatosProducto) => {
    setDatosProducto(datos);
  };

  // Guardar producto
  const guardarProducto = async () => {
    // Validaciones
    if (
      !datosProducto.tipoProductoId ||
      !datosProducto.materialId ||
      !datosProducto.calibreId
    ) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (!bolsasPorKilo) {
      alert("No se pudo calcular las bolsas por kilo");
      return;
    }

    if (!datosProducto.medidas.altura || !datosProducto.medidas.ancho) {
      alert("Altura y Ancho son obligatorios");
      return;
    }

    setGuardando(true);

    try {
      const payload = {
        tipo_producto_plastico_id: datosProducto.tipoProductoId,
        material_plastico_id: datosProducto.materialId,
        calibre_id: datosProducto.calibreId,
        altura: parseInt(datosProducto.medidas.altura),
        ancho: parseInt(datosProducto.medidas.ancho),
        fuelle_fondo: datosProducto.medidas.fuelleFondo
          ? parseInt(datosProducto.medidas.fuelleFondo)
          : 0,
        fuelle_latIz: datosProducto.medidas.fuelleLateral1
          ? parseInt(datosProducto.medidas.fuelleLateral1)
          : 0,
        fuelle_latDe: datosProducto.medidas.fuelleLateral2
          ? parseInt(datosProducto.medidas.fuelleLateral2)
          : 0,
        refuerzo: datosProducto.medidas.refuerzo
          ? parseInt(datosProducto.medidas.refuerzo)
          : 0,
        medida: datosProducto.medidasFormateadas,
        por_kilo: parseFloat(bolsasPorKilo),
      };

      console.log("💾 Guardando producto:", payload);

      const response = await createProductoPlastico(payload);

      console.log("✅ Producto guardado:", response);

      alert(`✅ Producto creado exitosamente\n\n🔖 Identificador: ${response.producto.identificador}\n📦 Bolsas por kilo: ${response.producto.por_kilo}`);

      // Resetear formulario
      setDatosProducto({
        tipoProducto: "",
        tipoProductoId: 0,
        material: "",
        materialId: 0,
        calibre: "",
        calibreId: 0,
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
      setBolsasPorKilo("");
    } catch (error: any) {
      console.error("❌ Error al guardar producto:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details?.join(", ") ||
        "Error al guardar el producto";

      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
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

  // Mostrar loading mientras cargan los catálogos
  if (cargandoCatalogos) {
    return (
      <Dashboard userName="Administrador">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando catálogos...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  // Mostrar error si falló la carga
  if (errorCatalogos) {
    return (
      <Dashboard userName="Administrador">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">
              Error al cargar catálogos
            </h2>
            <p className="text-red-600 mb-4">{errorCatalogos}</p>
            <button
              onClick={cargarCatalogos}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard userName="Administrador">
      <h1 className="text-2xl font-bold mb-6">Dar de alta producto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULARIO Y FIGURA - Usando SelectorProducto */}
        <div className="bg-white p-6 rounded-xl shadow col-span-2">
          <SelectorProducto
            catalogos={catalogos}
            onProductoChange={handleProductoChange}
            mostrarFigura={true}
          />

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 mt-6">
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

          {/* Botón de guardar */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={guardarProducto}
              disabled={guardando || !bolsasPorKilo}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                guardando || !bolsasPorKilo
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {guardando ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </span>
              ) : (
                "Guardar Producto"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE AMORTIZACIÓN */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">
          Tabla de producción por kilogramos
        </h2>

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
                  <div key={kilos} className="bg-gray-50 rounded-lg p-2 border">
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