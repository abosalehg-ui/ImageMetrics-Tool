import { store, setState } from './state.js';
import { t } from './i18n.js';
import { refreshPointsUI } from './render.js';
import { confirmDialog } from './ui/dialog.js';
import { pushHistory, undoHistory, redoHistory } from './history.js';

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
