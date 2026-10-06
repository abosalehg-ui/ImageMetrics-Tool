import { store, setState } from './state.js';
import { getCanvas, samplePixel, toImagePixel, renderCanvas } from './canvas.js';
import { rafThrottle } from './utils/throttle.js';
import { addPoint } from './points.js';

let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

/** Pixels the keyboard cursor moves per arrow press (with Shift held). */
const CURSOR_STEP_FAST = 10;

/**
 * Image pixel under an on-canvas offset, or null when no image is loaded.
 * @param {number} px
 * @param {number} py
 * @returns {{ x: number, y: number } | null}
 */
function pixelAtOffset(px, py) {
  const { img, zoom } = store;
  if (!img) return null;
  return { x: toImagePixel(px, zoom, img.width), y: toImagePixel(py, zoom, img.height) };
}

/**
 * Show coordinates and the true source color of image pixel (x, y).
 * @param {number} x
 * @param {number} y
 */
function showReadout(x, y) {
  const liveX = document.getElementById('liveX');
  const liveY = document.getElementById('liveY');
  if (liveX) liveX.textContent = String(x);
  if (liveY) liveY.textContent = String(y);

  const color = samplePixel(x, y);
  if (!color) return;
  const liveRGB = document.getElementById('liveRGB');
  const liveHEX = document.getElementById('liveHEX');
  const preview = document.getElementById('colorPreview');
  if (liveRGB) liveRGB.textContent = color.rgb;
  if (liveHEX) liveHEX.textContent = color.hex;
  if (preview) preview.style.background = color.hex;
}

/**
 * Save image pixel (x, y) as a point, with its true source color.
 * @param {number} x
 * @param {number} y
 */
function savePixel(x, y) {
  const color = samplePixel(x, y);
  if (color) addPoint(x, y, color.hex);
}

/**
 * Scroll the container just enough to keep image pixel (x, y) in view.
 * @param {HTMLElement} container
 * @param {HTMLCanvasElement} canvas
 * @param {number} x
 * @param {number} y
 */
function scrollPixelIntoView(container, canvas, x, y) {
  const { zoom } = store;
  const canvasRect = canvas.getBoundingClientRect();
  const viewRect = container.getBoundingClientRect();
  const margin = 24;
  const left = canvasRect.left + x * zoom;
  const right = left + zoom;
  const top = canvasRect.top + y * zoom;
  const bottom = top + zoom;
  let dx = 0;
  let dy = 0;
  if (left < viewRect.left + margin) dx = left - viewRect.left - margin;
  else if (right > viewRect.right - margin) dx = right - viewRect.right + margin;
  if (top < viewRect.top + margin) dy = top - viewRect.top - margin;
  else if (bottom > viewRect.bottom - margin) dy = bottom - viewRect.bottom + margin;
  if (dx || dy) container.scrollBy(dx, dy);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLElement} container
 */
function setupKeyboardCursor(canvas, container) {
  /** @param {{ x: number, y: number }} cursor */
  const moveCursor = (cursor) => {
    setState({ cursor });
    renderCanvas();
    showReadout(cursor.x, cursor.y);
    scrollPixelIntoView(container, canvas, cursor.x, cursor.y);
  };

  const centerCursor = () => {
    const { img } = store;
    if (!img) return null;
    return { x: Math.floor(img.width / 2), y: Math.floor(img.height / 2) };
  };

  canvas.addEventListener('focus', () => {
    // Only show the cursor for keyboard focus; a mouse click focuses the canvas
    // too, and a crosshair appearing under the pointer would be noise.
    let keyboardFocus = true;
    try {
      keyboardFocus = canvas.matches(':focus-visible');
    } catch {
      // Older engines without :focus-visible: fall back to always showing it.
    }
    const start = centerCursor();
    if (keyboardFocus && start && !store.cursor) moveCursor(start);
  });

  canvas.addEventListener('blur', () => {
    if (!store.cursor) return;
    setState({ cursor: null });
    renderCanvas();
  });

  canvas.addEventListener('keydown', (e) => {
    const { img } = store;
    if (!img || e.ctrlKey || e.metaKey || e.altKey) return;
    const current = store.cursor ?? centerCursor();
    if (!current) return;
    const step = e.shiftKey ? CURSOR_STEP_FAST : 1;
    let { x, y } = current;

    switch (e.key) {
      case 'ArrowLeft':
        x -= step;
        break;
      case 'ArrowRight':
        x += step;
        break;
      case 'ArrowUp':
        y -= step;
        break;
      case 'ArrowDown':
        y += step;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!store.cursor) moveCursor(current);
        savePixel(current.x, current.y);
        return;
      default:
        return;
    }
    e.preventDefault();
    moveCursor({
      x: Math.min(img.width - 1, Math.max(0, x)),
      y: Math.min(img.height - 1, Math.max(0, y)),
    });
  });
}

export function setupCanvasEvents() {
  const canvas = getCanvas();
  const canvasContainer = document.getElementById('canvasContainer');
  if (!canvasContainer) return;

  canvas.addEventListener('mousedown', (e) => {
    if (store.zoom > 1 && e.button === 0 && e.shiftKey) {
      setState({ isDragging: true });
      canvas.classList.add('grabbing');
      startX = e.pageX - canvasContainer.offsetLeft;
      startY = e.pageY - canvasContainer.offsetTop;
      scrollLeft = canvasContainer.scrollLeft;
      scrollTop = canvasContainer.scrollTop;
      e.preventDefault();
    }
  });

  canvasContainer.addEventListener('mousemove', (e) => {
    if (store.isDragging) {
      e.preventDefault();
      const x = e.pageX - canvasContainer.offsetLeft;
      const y = e.pageY - canvasContainer.offsetTop;
      canvasContainer.scrollLeft = scrollLeft - (x - startX);
      canvasContainer.scrollTop = scrollTop - (y - startY);
    }
  });

  document.addEventListener('mouseup', () => {
    if (store.isDragging) {
      setState({ isDragging: false });
      canvas.classList.remove('grabbing');
    }
  });

  // getImageData + DOM writes are expensive, so coalesce them to one update per
  // animation frame instead of running on every mousemove event.
  const updateLiveReadout = rafThrottle((/** @type {number} */ px, /** @type {number} */ py) => {
    const pixel = pixelAtOffset(px, py);
    if (pixel) showReadout(pixel.x, pixel.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    updateLiveReadout(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener('click', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const pixel = pixelAtOffset(e.clientX - rect.left, e.clientY - rect.top);
    if (pixel) savePixel(pixel.x, pixel.y);
  });

  setupKeyboardCursor(canvas, canvasContainer);
}
