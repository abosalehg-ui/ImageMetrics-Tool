const listeners = new Set();

export const store = {
  img: null,
  points: [],
  zoom: 1,
  showGrid: false,
  lang: 'ar',
  isDragging: false,
};

export function setState(patch) {
  Object.assign(store, patch);
  listeners.forEach((fn) => fn(store));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
