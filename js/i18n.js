import { store, setState } from './state.js';

let translations = {};

export async function loadLocale(lang) {
  const res = await fetch(`locales/${lang}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load locale: ${lang}`);
  }
  translations = await res.json();
  setState({ lang });
  applyTranslations();
}

export function t(key) {
  return translations[key] ?? key;
}

export function tArray(key) {
  return translations[key] ?? [];
}

function applyTranslations() {
  document.documentElement.lang = store.lang;
  document.documentElement.dir = store.lang === 'ar' ? 'rtl' : 'ltr';

  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) {
    langSwitch.textContent = store.lang === 'ar' ? 'English' : 'العربية';
  }

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
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

export async function toggleLanguage() {
  const newLang = store.lang === 'ar' ? 'en' : 'ar';
  await loadLocale(newLang);
}
