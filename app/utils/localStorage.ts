export const setItem = (key: string, value: string) => {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('storage'));
};

export const getItem = (key: string) => {
  return JSON.parse(window.localStorage.getItem(key) || 'null');
};

export const removeItem = (key: string) => {
  window.localStorage.removeItem(key);
  window.dispatchEvent(new Event('storage'));
};

export const clear = () => {
  window.localStorage.clear();
  window.dispatchEvent(new Event('storage'));
};

export const localStorage = {
  setItem,
  getItem,
  removeItem,
  clear,
};

export default localStorage;
