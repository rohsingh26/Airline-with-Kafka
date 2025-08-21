// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.token);
    localStorage.setItem("token", res.token);
    const me = await api.getMe(res.token);
    setUser(me);
    localStorage.setItem("user", JSON.stringify(me));
  };

  const register = async (name, email, password, role) => {
    await api.register({ name, email, password, role });
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateName = async (name) => {
    const updated = await api.updateMe({ name }, token);
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.getMe(token);
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []); // eslint-disable-line

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, updateName }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
