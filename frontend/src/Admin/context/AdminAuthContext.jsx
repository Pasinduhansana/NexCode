import { createContext, useContext, useState, useEffect, useCallback } from "react";
import adminApi from "../utils/adminApi";
import { getToken, getUser, setToken, setUser, clearSession } from "../utils/auth";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setReady(true);
      return;
    }

    adminApi
      .get("/auth/verify")
      .then(({ data }) => {
        if (data.valid && data.user) {
          setUserState(data.user);
          setUser(data.user);
        }
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        clearSession();
        setTokenState(null);
        setUserState(null);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setTokenState(nextToken);
    setUserState(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setTokenState(null);
    setUserState(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, user, ready, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};
