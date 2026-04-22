let userData = {
  username: null,
  role: null,
};

export const setUserData = (username, role) => {
  userData = { username, role };
};

export const getUserData = () => userData;

export const clearUserData = () => {
  userData = { username: null, role: null };
};
