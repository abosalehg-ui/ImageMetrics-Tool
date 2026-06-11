import { store } from './state.js';
import { undo, redo, deletePoint } from './points.js';
import { toggleGrid, zoomBy, ZOOM_STEP } from './controls.js';
import { exportToCSV } from './export.js';
import { toggleTheme } from './theme.js';

/**
 * Whether keyboard events should be ignored because the user is typing in a
 * form field or contenteditable element.
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/** Register global keyboard shortcuts. */
export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (isEditableTarget(e.target)) return;

    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (mod && (key === 'y' || (key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    } else if (mod && key === 's') {
      e.preventDefault();
      exportToCSV();
    } else if (!mod && (e.key === 'Delete' || e.key === 'Backspace')) {
      if (store.points.length > 0) {
        e.preventDefault();
        deletePoint(store.points.length - 1);
      }
    } else if (!mod && key === 'g') {
      toggleGrid();
    } else if (!mod && key === 'd') {
      toggleTheme();
    } else if (!mod && (e.key === '+' || e.key === '=')) {
      zoomBy(ZOOM_STEP);
    } else if (!mod && (e.key === '-' || e.key === '_')) {
      zoomBy(-ZOOM_STEP);
    } else if (e.key === '?') {
      toggleShortcutsHelp();
    } else if (e.key === 'Escape') {
      closeShortcutsHelp();
    }
  });
}

function closeShortcutsHelp() {
  document.getElementById('shortcutsHelp')?.classList.remove('open');
}

/** Toggle the keyboard shortcuts help panel. */
export function toggleShortcutsHelp() {
  document.getElementById('shortcutsHelp')?.classList.toggle('open');
}
