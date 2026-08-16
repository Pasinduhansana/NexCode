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

  const hasAccess = useCallback(
    (pageId) => {
      if (!user) return false;
      if (user.superAdmin) return true;
      return user.access?.pages?.includes(pageId) || false;
    },
    [user]
  );

  const hasExpenseAccess = useCallback(
    () => {
      if (!user) return "none";
      if (user.superAdmin) return "edit";
      return user.access?.expenseAccess || "none";
    },
    [user]
  );

  const hasProjectAccess = useCallback(
    () => {
      if (!user) return "none";
      if (user.superAdmin) return "all";
      return user.access?.projectAccess || "all";
    },
    [user]
  );

  const hasDashboardComponent = useCallback(
    (compId) => {
      if (!user) return false;
      if (user.superAdmin) return true;
      return user.access?.dashboardComponents?.includes(compId) || false;
    },
    [user]
  );

  return (
    <AdminAuthContext.Provider value={{ token, user, ready, isAuthenticated: Boolean(token), login, logout, hasAccess, hasExpenseAccess, hasProjectAccess, hasDashboardComponent }}>
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
