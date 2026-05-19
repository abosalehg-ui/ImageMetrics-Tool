import { store, setState } from './state.js';
import { getContext, getCanvas } from './canvas.js';
import { rgbToHex } from './utils/color.js';
import { addPoint } from './points.js';

let startX = 0;
let startY = 0;
let scrollLeft = 0;
let scrollTop = 0;

export function setupCanvasEvents() {
  const canvas = getCanvas();
  const ctx = getContext();
  const canvasContainer = document.getElementById('canvasContainer');

  // Drag to pan when zoomed
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

  // Live coordinates + color preview
  canvas.addEventListener('mousemove', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const { zoom } = store;
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    document.getElementById('liveX').textContent = x;
    document.getElementById('liveY').textContent = y;

    const imgData = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
    const [r, g, b] = imgData.data;
    const hex = rgbToHex(r, g, b);
    document.getElementById('liveRGB').textContent = `rgb(${r}, ${g}, ${b})`;
    document.getElementById('liveHEX').textContent = hex;
    document.getElementById('colorPreview').style.background = hex;
  });

  // Click to save point
  canvas.addEventListener('click', (e) => {
    if (!store.img || store.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const { zoom } = store;
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    const imgData = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
    const [r, g, b] = imgData.data;
    addPoint(x, y, rgbToHex(r, g, b));
  });
}
