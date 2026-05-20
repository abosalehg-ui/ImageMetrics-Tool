import { setState } from './state.js';
import { initCanvas, renderCanvas } from './canvas.js';
import { setupUploadHandlers } from './upload.js';
import { setupCanvasEvents } from './events.js';
import { loadLocale, toggleLanguage } from './i18n.js';
import { exportToCSV } from './export.js';
import { clearAllPoints, deletePoint } from './points.js';

const mainCanvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById('mainCanvas'));
if (mainCanvas) initCanvas(mainCanvas);

setupUploadHandlers();
setupCanvasEvents();

loadLocale('ar').catch((err) => console.error('Failed to load default locale:', err));

document.querySelector('.lang-switch')?.addEventListener('click', () => {
  toggleLanguage().catch((err) => console.error('Failed to toggle language:', err));
});

document.getElementById('btnNewImage')?.addEventListener('click', () => {
  document.getElementById('fileInput')?.click();
});

document.getElementById('btnExport')?.addEventListener('click', exportToCSV);
document.getElementById('btnClear')?.addEventListener('click', clearAllPoints);

document.getElementById('gridToggle')?.addEventListener('change', (e) => {
  const target = /** @type {HTMLInputElement} */ (e.target);
  setState({ showGrid: target.checked });
  renderCanvas();
});

document.getElementById('zoomSlider')?.addEventListener('input', (e) => {
  const target = /** @type {HTMLInputElement} */ (e.target);
  setState({ zoom: Number(target.value) / 100 });
  const zoomValue = document.getElementById('zoomValue');
  if (zoomValue) zoomValue.textContent = target.value + '%';
  renderCanvas();
});

document.getElementById('pointsList')?.addEventListener('click', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  if (target.classList.contains('delete-point')) {
    deletePoint(parseInt(target.dataset.index || '0', 10));
  }
});
