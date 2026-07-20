import { store, setState } from './state.js';
import { t } from './i18n.js';
import { renderCanvas } from './canvas.js';
import { distance } from './measurements.js';
import { confirmDialog } from './ui/dialog.js';
import { pushHistory, undoHistory, redoHistory, canUndo, canRedo } from './history.js';

/** @typedef {import('./types.d.ts').Point} Point */

/**
 * Commit a new points array, recording the previous state for undo and
 * refreshing every dependent view.
 * @param {Point[]} newPoints
 */
function commitPoints(newPoints) {
  pushHistory(store.points);
  setState({ points: newPoints });
  refreshPointsUI();
}

/** Re-render the canvas and all point-derived UI in one place. */
export function refreshPointsUI() {
  renderCanvas();
  updatePointsList();
  updateDistanceDisplay();
  updateHistoryButtons();
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} color
 */
export function addPoint(x, y, color) {
  commitPoints([...store.points, { x, y, color }]);
}

/** @param {number} idx */
export function deletePoint(idx) {
  if (idx < 0 || idx >= store.points.length) return;
  const newPoints = [...store.points];
  newPoints.splice(idx, 1);
  commitPoints(newPoints);
}

export async function clearAllPoints() {
  if (store.points.length === 0) return;
  const confirmed = await confirmDialog(t('confirmClearAll'), {
    confirmText: t('btnConfirm'),
    cancelText: t('btnCancel'),
  });
  if (!confirmed) return;
  commitPoints([]);
}

/** Restore the previous points snapshot, if any. */
export function undo() {
  const prev = undoHistory(store.points);
  if (prev === null) return;
  setState({ points: prev });
  refreshPointsUI();
}

/** Re-apply the next points snapshot, if any. */
export function redo() {
  const next = redoHistory(store.points);
  if (next === null) return;
  setState({ points: next });
  refreshPointsUI();
}

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
    const small = document.createElement('small');
    small.textContent = point.color;
    info.append(
      strong,
      document.createElement('br'),
      document.createTextNode(`X: ${point.x}, Y: ${point.y}`),
      document.createElement('br'),
      small
    );

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-point';
    deleteBtn.dataset.index = String(idx);
    deleteBtn.textContent = '❌';

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
    if (valueEl) valueEl.textContent = String(dist);
    displayEl.classList.add('active');
  } else {
    displayEl.classList.remove('active');
  }
}
