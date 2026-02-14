import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { loginService, logoutService, verifyTokenService } from "../services/authService";

interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol?: string;
  acceso_total?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (correo: string, codigo: string) => Promise<void>; // ← Actualizado
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ SOLUCIÓN: useRef para evitar múltiples llamadas en StrictMode
  const isCheckingAuth = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // ✅ Evitar múltiples llamadas simultáneas
    if (isCheckingAuth.current) {
      console.log("⏳ Ya se está verificando la autenticación, omitiendo...");
      return;
    }

    isCheckingAuth.current = true;

    try {
      console.log("🔍 Verificando autenticación...");
      
      const data = await verifyTokenService();
      
      if (data.isAuthenticated && data.usuario) {
        console.log("✅ Token válido, usuario autenticado");
        setUser(data.usuario);
        localStorage.setItem("user", JSON.stringify(data.usuario));
      } else {
        console.log("❌ Token inválido o expirado");
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error: any) {
      console.error("❌ Error al verificar token:", error.response?.status || error.message);
      
      // Si es error 429 (rate limit), intentar recuperar de localStorage
      if (error.response?.status === 429) {
        console.log("⚠️ Rate limit alcanzado, usando datos de localStorage temporalmente");
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
      isCheckingAuth.current = false;
    }
  };

  const login = async (correo: string, codigo: string) => { // ← Actualizado
    try {
      console.log("🔑 Intentando login con correo y código...");
      const data = await loginService(correo, codigo); // ← Actualizado
      console.log("✅ Login exitoso");
      
      setUser(data.usuario);
      localStorage.setItem("user", JSON.stringify(data.usuario));
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Cerrando sesión...");
      await logoutService();
      setUser(null);
      localStorage.removeItem("user");
      console.log("✅ Sesión cerrada");
    } catch (error) {
      console.error("❌ Error en logout:", error);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};