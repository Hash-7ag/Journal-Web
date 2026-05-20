const STORAGE_KEY = "app_user_role";

// ── Helpers ──────────────────────────────────────────────
const getDefaultData = () => ({ role: null });

const readStorage = () => {
  // сначала localStorage (залогиненный), потом sessionStorage (в процессе логина)
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

// Вызывается при выборе роли на "/" — пишем только в session
export const setUserStoreData = (role) => {
  userData = { role };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

// Вызывается после успешного логина — переносим из session в local
export const persistUserToLocal = (role) => {
  userData = { role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  sessionStorage.removeItem(STORAGE_KEY);
};

// Вызывается при logout — чистим оба
export const clearUserStoreData = () => {
  userData = getDefaultData();
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const getUserStoreData = () => ({ ...userData });
