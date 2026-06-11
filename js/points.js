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

  if (points.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:#999;">${t('noPoints')}</p>`;
    return;
  }

  list.innerHTML = '';
  points.forEach((point, idx) => {
    const div = document.createElement('div');
    div.className = 'point-item';
    div.innerHTML = `
      <div>
        <strong>${t('point')} ${idx + 1}</strong><br>
        X: ${point.x}, Y: ${point.y}<br>
        <small>${point.color}</small>
      </div>
      <button class="delete-point" data-index="${idx}">❌</button>
    `;
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
