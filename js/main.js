import { initCanvas } from './canvas.js';
import { setupUploadHandlers } from './upload.js';
import { setupCanvasEvents } from './events.js';
import { loadLocale, toggleLanguage, getStoredLang } from './i18n.js';
import { exportToCSV } from './export.js';
import { clearAllPoints, deletePoint, undo, redo } from './points.js';
import { setGrid, setZoom } from './controls.js';
import { initTheme, toggleTheme } from './theme.js';
import { setupKeyboardShortcuts, toggleShortcutsHelp } from './shortcuts.js';

const mainCanvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById('mainCanvas'));
if (mainCanvas) initCanvas(mainCanvas);

initTheme();
setupUploadHandlers();
setupCanvasEvents();
setupKeyboardShortcuts();

loadLocale(getStoredLang()).catch((err) => console.error('Failed to load locale:', err));

document.querySelector('.lang-switch')?.addEventListener('click', () => {
  toggleLanguage().catch((err) => console.error('Failed to toggle language:', err));
});

document.getElementById('btnTheme')?.addEventListener('click', toggleTheme);
document.getElementById('btnHelp')?.addEventListener('click', toggleShortcutsHelp);

document.getElementById('btnNewImage')?.addEventListener('click', () => {
  document.getElementById('fileInput')?.click();
});

document.getElementById('btnExport')?.addEventListener('click', exportToCSV);
document.getElementById('btnClear')?.addEventListener('click', () => {
  clearAllPoints().catch((err) => console.error('Failed to clear points:', err));
});

document.getElementById('btnUndo')?.addEventListener('click', undo);
document.getElementById('btnRedo')?.addEventListener('click', redo);

document.getElementById('gridToggle')?.addEventListener('change', (e) => {
  const target = /** @type {HTMLInputElement} */ (e.target);
  setGrid(target.checked);
});

document.getElementById('zoomSlider')?.addEventListener('input', (e) => {
  const target = /** @type {HTMLInputElement} */ (e.target);
  setZoom(Number(target.value));
});

document.getElementById('pointsList')?.addEventListener('click', (e) => {
  const target = /** @type {HTMLElement} */ (e.target);
  if (target.classList.contains('delete-point')) {
    deletePoint(parseInt(target.dataset.index || '0', 10));
  }
});
