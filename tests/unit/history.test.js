import { describe, it, expect, beforeEach } from 'vitest';
import {
  pushHistory,
  undoHistory,
  redoHistory,
  resetHistory,
  canUndo,
  canRedo,
  MAX_HISTORY,
} from '../../js/history.js';

const p = (x) => ({ x, y: x, color: '#000' });

describe('history', () => {
  beforeEach(() => resetHistory());

  it('starts empty', () => {
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
  });

  it('undo returns the previously recorded snapshot', () => {
    const empty = [];
    pushHistory(empty); // record state before adding a point
    const current = [p(1)];
    expect(canUndo()).toBe(true);
    expect(undoHistory(current)).toEqual([]);
    expect(canUndo()).toBe(false);
  });

  it('returns null when there is nothing to undo or redo', () => {
    expect(undoHistory([p(1)])).toBeNull();
    expect(redoHistory([p(1)])).toBeNull();
  });

  it('redo re-applies what was undone', () => {
    pushHistory([]);
    const afterAdd = [p(1)];
    const undone = undoHistory(afterAdd) ?? []; // -> []
    expect(undone).toEqual([]);
    expect(canRedo()).toBe(true);
    expect(redoHistory(undone)).toEqual([p(1)]);
    expect(canRedo()).toBe(false);
  });

  it('a new action clears the redo stack', () => {
    pushHistory([]);
    undoHistory([p(1)]); // redo now available
    expect(canRedo()).toBe(true);
    pushHistory([p(2)]); // new branch
    expect(canRedo()).toBe(false);
  });

  it('stores immutable snapshots (later mutation does not leak in)', () => {
    const snapshot = [p(1)];
    pushHistory(snapshot);
    snapshot.push(p(2)); // mutate the original array after recording
    expect(undoHistory([p(9)])).toEqual([p(1)]);
  });

  it('resetHistory clears both stacks', () => {
    pushHistory([]);
    undoHistory([p(1)]);
    resetHistory();
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
  });

  it('drops the oldest snapshot once past MAX_HISTORY entries', () => {
    for (let i = 0; i < MAX_HISTORY + 10; i++) {
      pushHistory([p(i)]);
    }
    let current = [p(MAX_HISTORY + 10)];
    let undoCount = 0;
    while (canUndo()) {
      current = undoHistory(current) ?? current;
      undoCount++;
    }
    expect(undoCount).toBe(MAX_HISTORY);
  });
});
