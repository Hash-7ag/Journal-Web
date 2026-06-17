const KEY = 'password_reset_access';

export const setResetAccess = (data) => {
  sessionStorage.setItem(KEY, JSON.stringify(data));
};

export const getResetAccess = () => {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearResetAccess = () => {
  sessionStorage.removeItem(KEY);
};
