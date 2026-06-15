const STORAGE_KEY = 'app_user_role';

// ── Helpers ──────────────────────────────────────────────
const getDefaultData = () => ({ role: null });

const readStorage = () => {
  const ls = localStorage.getItem(STORAGE_KEY);
  if (ls) {
    try {
      return JSON.parse(ls);
    } catch {
      return getDefaultData();
    }
  }
  const ss = sessionStorage.getItem(STORAGE_KEY);
  if (ss) {
    try {
      return JSON.parse(ss);
    } catch {
      return getDefaultData();
    }
  }
  return getDefaultData();
};

let userData = readStorage();

// ── Exports ───────────────────────────────────────────────

export const setUserStoreData = (role) => {
  userData = { role };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

export const persistUserToLocal = (role) => {
  userData = { role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  sessionStorage.removeItem(STORAGE_KEY);
};

export const clearUserStoreData = () => {
  userData = getDefaultData();
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const getUserStoreData = () => ({ ...userData });

// Реальная авторизация — только из localStorage
export const getAuthRole = () => {
  const ls = localStorage.getItem(STORAGE_KEY);
  if (!ls) return null;
  try {
    return JSON.parse(ls).role ?? null;
  } catch {
    return null;
  }
};
