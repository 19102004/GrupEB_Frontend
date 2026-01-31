import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, Usuario } from "../types/auth.types";
import {
  loginService,
  saveUsuario,
  getUsuario,
  clearUsuario,
} from "../services/authService";
import api from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión desde localStorage (solo usuario)
  useEffect(() => {
    const savedUsuario = getUsuario();
    if (savedUsuario) {
      setUsuario(savedUsuario);
    }
    setLoading(false);
  }, []);

  const login = async (codigo: string) => {
    try {
      const data = await loginService(codigo);

      saveUsuario(data.usuario);
      setUsuario(data.usuario);
    } catch (error) {
      clearUsuario();
      setUsuario(null);
      throw error;
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    clearUsuario();
    setUsuario(null);
  };

  const value = {
    usuario,
    token: null, // ya no se usa, pero mantiene compatibilidad
    isAuthenticated: !!usuario,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
