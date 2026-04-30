const STORAGE_KEY = "app_user_role";

const getDefaultStoreData = () => ({ role: null });

let userData = (() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return getDefaultStoreData;
    }
  }
  return getDefaultStoreData;
})();

const persist = () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

export const setUserStoreData = (role) => {
  userData = { role };
  persist();
};

export const getUserStoreData = () => ({ ...userData });

export const clearUserStoreData = () => {
  userData = getDefaultStoreData();
  persist();
};
