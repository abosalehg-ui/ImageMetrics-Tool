import { store, setState } from './state.js';
import { renderCanvas, maxSafeZoomPercent } from './canvas.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';

export const ZOOM_MIN = 50;
export const ZOOM_MAX = 300;
export const ZOOM_STEP = 25;

/**
 * The zoom percentage last capped by the current image's safe-size limit, or
 * null when zoom isn't currently capped. Used to avoid re-toasting on every
 * slider tick once the user has already hit the ceiling.
 * @type {number | null}
 */
let lastCapToastValue = null;

/** Clear the cap-warning suppression, e.g. when a new image is loaded. */
export function resetZoomCapWarning() {
  lastCapToastValue = null;
}

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
 * re-render. The value is clamped to the supported range, and further capped
 * so the rendered canvas never exceeds a browser-safe pixel size for the
 * current image (warning the user when that cap kicks in).
 * @param {number} percent
 */
export function setZoom(percent) {
  const requested = clampZoom(percent);
  let applied = requested;
  if (store.img) {
    const safeMax = maxSafeZoomPercent(store.img.width, store.img.height);
    applied = Math.min(requested, safeMax);
  }

  if (applied < requested) {
    if (lastCapToastValue !== applied) {
      showToast(t('zoomCapped'), 'warning');
      lastCapToastValue = applied;
    }
  } else {
    lastCapToastValue = null;
  }

  setState({ zoom: applied / 100 });
  const slider = /** @type {HTMLInputElement | null} */ (document.getElementById('zoomSlider'));
  if (slider) slider.value = String(applied);
  const label = document.getElementById('zoomValue');
  if (label) label.textContent = `${applied}%`;
  renderCanvas();
}

/**
 * Adjust the zoom by a relative percentage delta.
 * @param {number} deltaPercent
 */
export function zoomBy(deltaPercent) {
  setZoom(Math.round(store.zoom * 100) + deltaPercent);
}
