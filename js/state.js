/** @typedef {import('./types.d.ts').Store} Store */

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
 * Merge a partial patch into the store. Callers that need the UI to reflect
 * the change re-render explicitly afterwards (see points.js refreshPointsUI,
 * controls.js setZoom, etc.) — there is no subscriber/observer indirection.
 * @param {Partial<Store>} patch
 */
export function setState(patch) {
  Object.assign(store, patch);
}
