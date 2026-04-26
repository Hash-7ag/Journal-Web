const STORAGE_KEY = "app_user_data";

const getDefaultData = () => ({ username: null, role: null });

let userData = (() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultData;
    }
  }
  return getDefaultData;
})();

const persist = () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

export const setUserData = (username, role) => {
  userData = { username, role };
  persist();
};

export const getUserData = () => ({ ...userData });

export const clearUserData = () => {
  userData = getDefaultData();
  persist();
};
