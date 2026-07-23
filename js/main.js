import { initCanvas } from './canvas.js';
import { setupUploadHandlers } from './upload.js';
import { setupCanvasEvents } from './events.js';
import { loadLocale, toggleLanguage, getStoredLang, t } from './i18n.js';
import { exportToCSV, exportToJSON } from './export.js';
import { clearAllPoints, deletePoint, undo, redo } from './points.js';
import { setupMetricsControls } from './metrics.js';
import { setGrid, setZoom } from './controls.js';
import { initTheme, toggleTheme } from './theme.js';
import { setupKeyboardShortcuts, toggleShortcutsHelp } from './shortcuts.js';
import { showToast } from './ui/toast.js';

const mainCanvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById('mainCanvas'));
if (mainCanvas) initCanvas(mainCanvas);

initTheme();
setupUploadHandlers();
setupCanvasEvents();
setupKeyboardShortcuts();
setupMetricsControls();

loadLocale(getStoredLang()).catch((err) => {
  console.error('Failed to load locale:', err);
  showToast(t('errorLocaleLoad'), 'error');
});

document.querySelector('.lang-switch')?.addEventListener('click', () => {
  toggleLanguage().catch((err) => {
    console.error('Failed to toggle language:', err);
    showToast(t('errorLocaleLoad'), 'error');
  });
});

document.getElementById('btnTheme')?.addEventListener('click', toggleTheme);
document.getElementById('btnHelp')?.addEventListener('click', toggleShortcutsHelp);

document.getElementById('btnNewImage')?.addEventListener('click', () => {
  document.getElementById('fileInput')?.click();
});

document.getElementById('btnExport')?.addEventListener('click', exportToCSV);
document.getElementById('btnExportJson')?.addEventListener('click', exportToJSON);
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
  if (!target.classList.contains('delete-point')) return;
  const index = target.dataset.index;
  if (index === undefined) return;
  deletePoint(parseInt(index, 10));
});
