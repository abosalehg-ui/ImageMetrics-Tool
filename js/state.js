/** @typedef {import('./types.d.ts').Store} Store */
/** @typedef {import('./types.d.ts').Listener} Listener */
/** @typedef {import('./types.d.ts').Unsubscribe} Unsubscribe */

/** @type {Set<Listener>} */
const listeners = new Set();

/** @type {Store} */
export const store = {
  img: null,
  points: [],
  zoom: 1,
  showGrid: false,
  lang: 'ar',
  isDragging: false,
};

/**
 * Merge a partial patch into the store and notify all subscribers.
 * @param {Partial<Store>} patch
 */
export function setState(patch) {
  Object.assign(store, patch);
  listeners.forEach((fn) => fn(store));
}

/**
 * Register a listener that fires on every setState call.
 * @param {Listener} fn
 * @returns {Unsubscribe} call to detach the listener
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
