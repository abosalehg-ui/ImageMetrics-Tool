import { store, setState } from './state.js';
import { renderCanvas } from './canvas.js';

export const ZOOM_MIN = 100;
export const ZOOM_MAX = 300;
export const ZOOM_STEP = 25;

/**
 * Clamp a zoom percentage into the supported range.
 * @param {number} percent
 * @returns {number}
 */
export function clampZoom(percent) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(percent)));
}

/**
 * Set the grid visibility, keeping the checkbox in sync, then re-render.
 * @param {boolean} show
 */
export function setGrid(show) {
  setState({ showGrid: show });
  const checkbox = /** @type {HTMLInputElement | null} */ (document.getElementById('gridToggle'));
  if (checkbox) checkbox.checked = show;
  renderCanvas();
}

export function toggleGrid() {
  setGrid(!store.showGrid);
}

/**
 * Set the zoom level (as a percentage), syncing the slider + label, then
 * re-render. The value is clamped to the supported range.
 * @param {number} percent
 */
export function setZoom(percent) {
  const clamped = clampZoom(percent);
  setState({ zoom: clamped / 100 });
  const slider = /** @type {HTMLInputElement | null} */ (document.getElementById('zoomSlider'));
  if (slider) slider.value = String(clamped);
  const label = document.getElementById('zoomValue');
  if (label) label.textContent = `${clamped}%`;
  renderCanvas();
}

/**
 * Adjust the zoom by a relative percentage delta.
 * @param {number} deltaPercent
 */
export function zoomBy(deltaPercent) {
  setZoom(Math.round(store.zoom * 100) + deltaPercent);
}
