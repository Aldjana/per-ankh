import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("per_ankh_token"));
  const [loading, setLoading] = useState(true);

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);

    if (!res.data?.user) {
      throw new Error("Enregistrement échoué : données utilisateur manquantes");
    }

    // Note: Le backend n'envoie pas le session token pour register
    // L'utilisateur doit faire un login après register
    setUser(res.data.user);

    return res.data;
  };

  const login = async (formData) => {
    const res = await api.post("/auth/login", formData);

    localStorage.setItem("per_ankh_token", res.data.session.access_token);
    setToken(res.data.session.access_token);
    setUser(res.data.user);

    return res.data;
  };

  const logout = async () => {
    try {
      // Appeler l'API pour logout côté serveur
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Nettoyer le localStorage et le state peu importe le résultat
      localStorage.removeItem("per_ankh_token");
      setToken(null);
      setUser(null);
    }
  };

  const getMe = async () => {
    try {
      if (!localStorage.getItem("per_ankh_token")) {
        setLoading(false);
        return;
      }

      const res = await api.get("/me");
      setUser(res.data.user);
    } catch (error) {
      localStorage.removeItem("per_ankh_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};