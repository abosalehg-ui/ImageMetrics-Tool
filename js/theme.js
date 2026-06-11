/** @typedef {'light' | 'dark'} Theme */

const STORAGE_KEY = 'imagemetrics-theme';

/**
 * Read the user's stored theme preference, if any.
 * @returns {Theme | null}
 */
export function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/**
 * Apply a theme by setting (or clearing) the data-theme attribute on <html>.
 * Passing null removes the override so the system preference takes over again.
 * @param {Theme | null} theme
 */
export function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * The theme currently in effect: an explicit override if set, otherwise the
 * system preference.
 * @returns {Theme}
 */
export function effectiveTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function updateToggleButton() {
  const btn = document.getElementById('btnTheme');
  if (!btn) return;
  const isDark = effectiveTheme() === 'dark';
  // Show the icon for the mode you'd switch TO.
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.setAttribute('aria-pressed', String(isDark));
}

/** Apply the stored preference (if any) on startup and sync the toggle button. */
export function initTheme() {
  applyTheme(getStoredTheme());
  updateToggleButton();
}

/** Flip between light and dark, persisting the choice. */
export function toggleTheme() {
  /** @type {Theme} */
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore storage failures (e.g. private mode); the in-page theme still applies.
  }
  applyTheme(next);
  updateToggleButton();
}
