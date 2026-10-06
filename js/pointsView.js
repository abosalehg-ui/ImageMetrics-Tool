import { store } from './state.js';
import { t } from './i18n.js';
import { distance } from './measurements.js';
import { formatLength } from './calibration.js';
import { canUndo, canRedo } from './history.js';

/** Sync the undo/redo buttons' disabled state with the history stacks. */
export function updateHistoryButtons() {
  const undoBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btnUndo'));
  const redoBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btnRedo'));
  if (undoBtn) undoBtn.disabled = !canUndo();
  if (redoBtn) redoBtn.disabled = !canRedo();
}

export function updatePointsList() {
  const list = document.getElementById('pointsList');
  if (!list) return;
  const { points } = store;

  list.innerHTML = '';

  if (points.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = t('noPoints');
    list.appendChild(empty);
    return;
  }

  points.forEach((point, idx) => {
    const div = document.createElement('div');
    div.className = 'point-item';

    const info = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = `${t('point')} ${idx + 1}`;
    const coords = document.createElement('bdi');
    coords.textContent = `X: ${point.x}, Y: ${point.y}`;
    const small = document.createElement('small');
    // "#ff0000" would render as "ff0000#" in an RTL line without isolation.
    small.dir = 'ltr';
    small.textContent = point.color;
    info.append(strong, document.createElement('br'), coords, document.createElement('br'), small);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-point';
    deleteBtn.dataset.index = String(idx);
    deleteBtn.textContent = '❌';
    deleteBtn.setAttribute('aria-label', `${t('ariaDeletePoint')} ${idx + 1}`);

    div.append(info, deleteBtn);
    list.appendChild(div);
  });
}

export function updateDistanceDisplay() {
  const { points } = store;
  const displayEl = document.getElementById('distanceDisplay');
  if (!displayEl) return;
  if (points.length >= 2) {
    const dist = distance(points[points.length - 2], points[points.length - 1]);
    const valueEl = document.getElementById('distanceValue');
    if (valueEl) valueEl.textContent = formatLength(dist, store.calibration);
    displayEl.classList.add('active');
  } else {
    displayEl.classList.remove('active');
  }
}
