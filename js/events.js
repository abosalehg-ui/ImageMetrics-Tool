import { store, setState } from './state.js';
import { getContext, getCanvas } from './canvas.js';
import { getPixelColor } from './utils/color.js';
import { rafThrottle } from './utils/throttle.js';
import { addPoint } from './points.js';

let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

export function setupCanvasEvents() {
  const canvas = getCanvas();
  const ctx = getContext();
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
    const { zoom } = store;
    const x = Math.round(px / zoom);
    const y = Math.round(py / zoom);

    const liveX = document.getElementById('liveX');
    const liveY = document.getElementById('liveY');
    if (liveX) liveX.textContent = String(x);
    if (liveY) liveY.textContent = String(y);

    const { rgb, hex } = getPixelColor(ctx, px, py);
    const liveRGB = document.getElementById('liveRGB');
    const liveHEX = document.getElementById('liveHEX');
    const preview = document.getElementById('colorPreview');
    if (liveRGB) liveRGB.textContent = rgb;
    if (liveHEX) liveHEX.textContent = hex;
    if (preview) preview.style.background = hex;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    updateLiveReadout(e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener('click', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const { zoom } = store;
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    const { hex } = getPixelColor(ctx, e.clientX - rect.left, e.clientY - rect.top);
    addPoint(x, y, hex);
  });
}
