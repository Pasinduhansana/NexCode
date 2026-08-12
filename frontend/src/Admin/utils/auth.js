const TOKEN_KEY = "nexcode_admin_token";
const USER_KEY = "nexcode_admin_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

export const clearUser = () => localStorage.removeItem(USER_KEY);

export const clearSession = () => {
  clearToken();
  clearUser();
};
