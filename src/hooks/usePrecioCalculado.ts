import { useState, useEffect, useRef } from "react";
import api from "../services/api";

interface ResultadoCalculo {
  peso_total_kg: number;
  precio_kg: number;
  merma_porcentaje: number;
  costo_produccion: number;
  costo_merma: number;
  costo_total: number;
  precio_unitario: number;
  kilogramos_rango: number;
  tarifa_id: number;
  kilogramos_id: number;
}

interface UsePrecioCalculadoParams {
  cantidad: number;
  porKilo: number | string | undefined;
  tintasId: number;
  carasId: number;
  enabled?: boolean;
}

export const usePrecioCalculado = ({
  cantidad,
  porKilo,
  tintasId,
  carasId,
  enabled = true,
}: UsePrecioCalculadoParams) => {
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setResultado(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!cantidad || cantidad <= 0 || !porKilo || !tintasId || !carasId) {
      setResultado(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      try {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        console.log("🔍 Calculando precio en backend:", {
          cantidad,
          porKilo,
          tintasId,
          carasId,
        });

        const response = await api.post(
          "/calcular-precio",
          {
            cantidad,
            porKilo: Number(porKilo),
            tintasId,
            carasId,
          },
          {
            signal: abortController.signal,
          }
        );

        if (!abortController.signal.aborted) {
          setResultado(response.data);
          setError(null);
          console.log("✅ Precio calculado:", response.data);
        }
      } catch (err: any) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          console.log("⚠️ Petición cancelada (normal en debounce)");
          return;
        }

        console.error("❌ Error al calcular precio:", err);
        setError(
          err.response?.data?.error || 
          "Error al calcular precio. Intenta de nuevo."
        );
        setResultado(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cantidad, porKilo, tintasId, carasId, enabled]);

  return {
    resultado,
    loading,
    error,
    precioUnitario: resultado?.precio_unitario ?? 0,
  };
};

// ============================================
// HOOK BATCH - CALCULAR MÚLTIPLES CANTIDADES
// ============================================
interface UsePreciosBatchParams {
  cantidades: number[];
  porKilo: number | string | undefined;
  tintasId: number;
  carasId: number;
  enabled?: boolean;
}

export const usePreciosBatch = ({
  cantidades,
  porKilo,
  tintasId,
  carasId,
  enabled = true,
}: UsePreciosBatchParams) => {
  const [resultados, setResultados] = useState<(ResultadoCalculo | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !porKilo || !tintasId || !carasId) {
      setResultados([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      try {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        console.log("🔍 Calculando precios batch en backend:", {
          cantidades,
          porKilo,
          tintasId,
          carasId,
        });

        const response = await api.post(
          "/calcular-precios-batch",
          {
            cantidades,
            porKilo: Number(porKilo),
            tintasId,
            carasId,
          },
          {
            signal: abortController.signal,
          }
        );

        if (!abortController.signal.aborted) {
          setResultados(response.data.resultados);
          setError(null);
          console.log("✅ Precios batch calculados:", response.data.resultados);
        }
      } catch (err: any) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          console.log("⚠️ Petición cancelada (normal en debounce)");
          return;
        }

        console.error("❌ Error al calcular precios batch:", err);
        setError(err.response?.data?.error || "Error al calcular precios");
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [JSON.stringify(cantidades), porKilo, tintasId, carasId, enabled]);

  return {
    resultados,
    loading,
    error,
    preciosUnitarios: resultados.map((r) => r?.precio_unitario ?? 0),
  };
};