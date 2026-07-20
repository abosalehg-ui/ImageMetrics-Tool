/** @typedef {import('./types.d.ts').Point} Point */

/**
 * Undo/redo history for the points array. The stacks hold immutable snapshots
 * (shallow copies) of the points list. This module is UI-agnostic and pure with
 * respect to the DOM — callers apply the returned snapshots to the store.
 */

/** Maximum snapshots kept per stack, to bound memory on very long sessions. */
export const MAX_HISTORY = 100;

/** @type {Point[][]} */
let past = [];
/** @type {Point[][]} */
let future = [];

/**
 * Record the current points as a restore point before a mutation. Clears the
 * redo stack, since a new action invalidates any redo branch. Drops the
 * oldest snapshot once past MAX_HISTORY entries.
 * @param {Point[]} snapshot current points, before the change
 */
export function pushHistory(snapshot) {
  past.push([...snapshot]);
  if (past.length > MAX_HISTORY) past.shift();
  future = [];
}

/**
 * Step back one entry. Saves `current` onto the redo stack and returns the
 * previous snapshot, or null if there is nothing to undo.
 * @param {Point[]} current
 * @returns {Point[] | null}
 */
export function undoHistory(current) {
  const prev = past.pop();
  if (prev === undefined) return null;
  future.push([...current]);
  return prev;
}

/**
 * Step forward one entry. Saves `current` onto the undo stack and returns the
 * next snapshot, or null if there is nothing to redo.
 * @param {Point[]} current
 * @returns {Point[] | null}
 */
export function redoHistory(current) {
  const next = future.pop();
  if (next === undefined) return null;
  past.push([...current]);
  return next;
}

/** Clear both stacks (e.g. when a new image is loaded). */
export function resetHistory() {
  past = [];
  future = [];
}

/** @returns {boolean} */
export function canUndo() {
  return past.length > 0;
}

/** @returns {boolean} */
export function canRedo() {
  return future.length > 0;
}
