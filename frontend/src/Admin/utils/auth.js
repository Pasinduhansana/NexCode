const TOKEN_KEY = "nexcode_admin_token";
const USER_KEY = "nexcode_admin_user";

const hasStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getToken = () => (hasStorage() ? localStorage.getItem(TOKEN_KEY) : null);

export const setToken = (token) => {
  if (!hasStorage()) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (!hasStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = () => {
  try {
    return hasStorage() ? JSON.parse(localStorage.getItem(USER_KEY) || "null") : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (!hasStorage()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearUser = () => {
  if (!hasStorage()) return;
  localStorage.removeItem(USER_KEY);
};

export const clearSession = () => {
  clearToken();
  clearUser();
};
