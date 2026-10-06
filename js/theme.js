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
 * The system color-scheme preference.
 * @returns {Theme}
 */
export function systemTheme() {
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Apply a theme by setting the data-theme attribute on <html>. The attribute
 * is always present so the stylesheet only needs a single dark-token block.
 * @param {Theme} theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * The theme currently in effect: an explicit override if set, otherwise the
 * system preference.
 * @returns {Theme}
 */
export function effectiveTheme() {
  return getStoredTheme() ?? systemTheme();
}

function updateToggleButton() {
  const btn = document.getElementById('btnTheme');
  if (!btn) return;
  const isDark = effectiveTheme() === 'dark';
  // Show the icon for the mode you'd switch TO.
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.setAttribute('aria-pressed', String(isDark));
}

/**
 * Apply the effective theme on startup, and keep following the system
 * preference live for as long as the user hasn't made an explicit choice.
 */
export function initTheme() {
  applyTheme(effectiveTheme());
  updateToggleButton();

  if (typeof window.matchMedia !== 'function') return;
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (getStoredTheme()) return;
    applyTheme(systemTheme());
    updateToggleButton();
  });
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
