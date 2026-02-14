import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/grupeblanco.png";
import bolsas from "../assets/bolsas.png";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log("🔵 Iniciando login con correo:", correo, "y código");

    // Validación de correo
    if (!correo || !correo.includes("@")) {
      setError("Ingresa un correo válido");
      return;
    }

    // Validación: mínimo 4 dígitos
    if (codigo.length < 4) {
      setError("El código debe tener al menos 4 dígitos");
      return;
    }

    setLoading(true);

    try {
      console.log("🔵 Llamando a login()...");
      await login(correo, codigo);
      console.log("✅ Login exitoso, navegando a /home");
      navigate("/home");
    } catch (err: any) {
      console.error("❌ Error en login:", err);
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* IZQUIERDA */}
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            BIENVENIDO
          </h1>
          <img src={bolsas} alt="Bolsas" className="max-w-sm w-full" />
        </div>

        {/* DERECHA */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-slate-700">
            <img src={logo} alt="Grupo EB" className="w-28 mx-auto mb-4" />
            
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Inicio de sesión
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* CORREO */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  placeholder="ejemplo@correo.com"
                  onChange={(e) => setCorreo(e.target.value.trim().toLowerCase())}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* CÓDIGO */}
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Código de acceso
                </label>
                <input
                  type="password"
                  value={codigo}
                  inputMode="numeric"
                  placeholder="Mínimo 4 dígitos"
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              {/* MENSAJE DE ERROR */}
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Iniciando sesión..." : "Entrar"}
              </button>
            </form>

            <p className="text-xs text-slate-500 text-center mt-6">
              Acceso restringido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}