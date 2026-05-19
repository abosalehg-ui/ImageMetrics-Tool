import { setState } from './state.js';
import { initCanvas, renderCanvas } from './canvas.js';
import { setupUploadHandlers } from './upload.js';
import { setupCanvasEvents } from './events.js';
import { loadLocale, toggleLanguage } from './i18n.js';
import { exportToCSV } from './export.js';
import { clearAllPoints, deletePoint } from './points.js';

initCanvas(document.getElementById('mainCanvas'));
setupUploadHandlers();
setupCanvasEvents();

loadLocale('ar').catch((err) => console.error('Failed to load default locale:', err));

document.querySelector('.lang-switch').addEventListener('click', () => {
  toggleLanguage().catch((err) => console.error('Failed to toggle language:', err));
});

document.getElementById('btnNewImage').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('btnExport').addEventListener('click', exportToCSV);
document.getElementById('btnClear').addEventListener('click', clearAllPoints);

document.getElementById('gridToggle').addEventListener('change', (e) => {
  setState({ showGrid: e.target.checked });
  renderCanvas();
});

document.getElementById('zoomSlider').addEventListener('input', (e) => {
  setState({ zoom: e.target.value / 100 });
  document.getElementById('zoomValue').textContent = e.target.value + '%';
  renderCanvas();
});

document.getElementById('pointsList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-point')) {
    deletePoint(parseInt(e.target.dataset.index, 10));
  }
});
