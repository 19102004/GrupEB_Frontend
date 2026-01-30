import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, Usuario } from "../types/auth.types";
import { loginService, saveAuthData, getAuthData, clearAuthData } from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { token: savedToken, usuario: savedUsuario } = getAuthData();
    if (savedToken && savedUsuario) {
      setToken(savedToken);
      setUsuario(savedUsuario);
    }
    setLoading(false);
  }, []);

  const login = async (codigo: string) => {
    try {
      const data = await loginService(codigo);
      
      saveAuthData(data.token, data.usuario);
      
      setToken(data.token);
      setUsuario(data.usuario);
    } catch (error: any) {
      clearAuthData();
      setToken(null);
      setUsuario(null);
      
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUsuario(null);
  };

  const value = {
    usuario,
    token,
    isAuthenticated: !!token,
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