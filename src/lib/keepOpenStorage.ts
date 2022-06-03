const storageName = "keep-open";

function get() {
  return localStorage.getItem(storageName);
}

function set(filename: string) {
  return localStorage.setItem(storageName, filename);
}

function clear() {
  localStorage.removeItem(storageName);
}

function matches(filename: string) {
  return get() === filename;
}

export { clear, get, matches, set };
