import { store, setState } from './state.js';

/** @typedef {import('./types.d.ts').Lang} Lang */
/** @typedef {import('./types.d.ts').Translations} Translations */

/** @type {Translations} */
let translations = {};

/**
 * Fetch a locale JSON file and apply translations to the DOM.
 * @param {Lang} lang
 * @returns {Promise<void>}
 */
export async function loadLocale(lang) {
  const res = await fetch(`locales/${lang}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load locale: ${lang}`);
  }
  translations = await res.json();
  setState({ lang });
  applyTranslations();
}

/**
 * Look up a string translation, falling back to the key if missing.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  const value = translations[key];
  return typeof value === 'string' ? value : key;
}

/**
 * Look up an array translation, falling back to empty array if missing.
 * @param {string} key
 * @returns {string[]}
 */
export function tArray(key) {
  const value = translations[key];
  return Array.isArray(value) ? value : [];
}

function applyTranslations() {
  document.documentElement.lang = store.lang;
  document.documentElement.dir = store.lang === 'ar' ? 'rtl' : 'ltr';

  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    langSwitch.textContent = store.lang === 'ar' ? 'English' : 'العربية';
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = /** @type {HTMLElement} */ (el).dataset.i18n;
    if (key) el.textContent = t(key);
  });

  const instrList = document.getElementById('instrList');
  if (instrList) {
    instrList.innerHTML = '';
    tArray('instrList').forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      instrList.appendChild(li);
    });
  }
}

/** @returns {Promise<void>} */
export async function toggleLanguage() {
  /** @type {Lang} */
  const newLang = store.lang === 'ar' ? 'en' : 'ar';
  await loadLocale(newLang);
}
