# أفكار التطوير وخارطة التحسين — ImageMetrics Tool

> هذه الوثيقة تجمع أفكار التطوير المقترحة للأداة، مع خطة تنفيذ تفصيلية لمسار "إعادة الهيكلة التقنية" الذي تم اختياره.
>
> _This document collects proposed improvement ideas for the tool, along with a detailed implementation plan for the chosen "Technical Refactoring" track._

## الفهرس
- [القسم الأول: كتالوج الأفكار](#كتالوج-الأفكار)
  - [ميزات جديدة](#1-ميزات-جديدة-user-features)
  - [تحسينات تقنية](#2-تحسينات-تقنية-technical-improvements)
  - [الأولويات المقترحة](#3-الأولويات-المقترحة)
- [القسم الثاني: خطة إعادة الهيكلة التقنية المعتمدة](#خطة-إعادة-الهيكلة-التقنية)
- [English Summary](#english-summary)

---

## كتالوج الأفكار

### الوضع الحالي
- تطبيق ويب من ملف واحد (`index.html` بـ 802 سطر).
- صفر اعتمادات خارجية، يعمل بفتح الملف مباشرة.
- يدعم العربية والإنجليزية مع RTL/LTR.
- ميزات حالية: إحداثيات حية، حفظ نقاط، قياس مسافة، تحليل ألوان (RGB/HEX)، تصدير CSV، تكبير 50%-300%، شبكة مساعدة.

### الميزات الموعودة في README (لم تُنفّذ بعد)
حفظ المشروع، التراجع (Undo)، رسم خطوط وأشكال، قياس الزوايا، دعم PDF، الطباعة، الوضع الليلي، اختصارات لوحة المفاتيح.

---

## 1. ميزات جديدة (User Features)

### 1.1 أدوات قياس متقدمة 🎯
- **قياس الزوايا**: اختيار 3 نقاط لحساب الزاوية بينها بالدرجات.
- **قياس المساحات**: رسم مضلع لحساب مساحته بالبكسل المربع.
- **قياس المحيط**: حساب طول الحدود الإجمالي لمضلع.
- **قياس المسار المتعدد**: سلسلة نقاط متصلة مع المسافة الإجمالية.
- **المعايرة بوحدات حقيقية**: تحويل البكسل إلى مم/سم/متر/بوصة عبر إدخال مرجع معروف.
- **مكبّر زجاجي (Loupe)**: نافذة تكبير صغيرة عند المؤشر للدقة المتناهية.
- **خطوط متقاطعة (Crosshair)**: خطوط أفقية وعمودية تتبع المؤشر.

### 1.2 أدوات الرسم والتعليق ✏️
- رسم خطوط، مستطيلات، دوائر، أسهم.
- إضافة نصوص وتسميات على النقاط.
- نظام طبقات (Layers).
- تخصيص لون وحجم النقاط.
- تنظيم النقاط في مجموعات بألوان مختلفة.

### 1.3 معالجة الصور 🖼️
- فلاتر بصرية: تدرج رمادي، تباين، سطوع، حدّة، عكس الألوان.
- كشف الحواف (Edge Detection).
- تدوير وقلب الصورة (90°/180°/270°، عمودي/أفقي).
- اقتصاص (Crop).
- مخطط الألوان (Histogram).
- قراءة بيانات EXIF (الكاميرا، التاريخ، DPI/PPI).

### 1.4 إدارة البيانات والمشاريع 💾
- **حفظ/تحميل المشروع** كـ `.json` أو في `localStorage`.
- **تصدير محسّن**: JSON, Excel (XLSX), SVG, PNG مع علامات مدمجة, تقرير PDF.
- **نسخ للحافظة** (إحداثيات أو لون بنقرة).
- **سجل المشاريع الأخيرة** للوصول السريع.

### 1.5 تجربة المستخدم (UX) 🌗
- **الوضع الليلي** مع حفظ التفضيل.
- **اختصارات لوحة المفاتيح**: `Ctrl+Z/Y`, `Ctrl+S/E`, `Delete`, `G`, `+/-`.
- **التراجع/الإعادة** (Undo/Redo).
- **مربعات حوار وToast** بدلاً من `alert()`/`confirm()`.
- **جولة تعريفية** للمستخدمين الجدد.
- **قائمة سياقية** بالنقر الأيمن على النقاط.
- **سحب النقاط** لإعادة تموضعها بعد إنشائها.
- **تحديد متعدد** بـ `Shift+Click`.

### 1.6 دعم الأجهزة المحمولة 📱
- التكبير باللمس (Pinch-to-Zoom).
- اللمس المزدوج لإضافة نقطة.
- PWA — قابلية التثبيت والعمل دون اتصال.

### 1.7 دعم الصيغ والملفات 📄
- دعم PDF (عبر PDF.js).
- دعم SVG و TIFF/WebP/HEIC.
- استيراد دفعات (Batch Upload).

---

## 2. تحسينات تقنية (Technical Improvements)

### 2.1 تنظيم الكود 🏗️
- تقسيم الملف الواحد إلى HTML/CSS/JS منفصلة.
- هيكلة وحدات (ES Modules) منطقية.
- إدارة حالة مركزية بدلاً من المتغيرات العامة.
- فصل منطق الواجهة عن البيانات.
- نقل الترجمات إلى ملفات JSON منفصلة.

### 2.2 جودة الكود ✅
- ESLint و Prettier.
- التحويل التدريجي إلى TypeScript.
- إضافة `.gitignore`.
- معالجة أخطاء أفضل.

### 2.3 الاختبارات 🧪
- اختبارات وحدة (Vitest).
- اختبارات شاملة (Playwright E2E).
- اختبارات بصرية (Visual Regression).

### 2.4 الأداء ⚡
- OffscreenCanvas للرسم السريع.
- Web Workers للحسابات الثقيلة.
- Debouncing/Throttling لأحداث الفأرة.
- تصغير تلقائي للصور الضخمة.

### 2.5 إمكانية الوصول ♿
- ARIA labels لكل العناصر التفاعلية.
- تنقل بلوحة المفاتيح كامل.
- تباين ألوان بمعيار WCAG AA.
- دعم قارئ الشاشة.

### 2.6 البنية التحتية 🚀
- GitHub Actions CI/CD.
- Service Worker للعمل دون اتصال.
- إصدارات (Releases & Tags).
- CHANGELOG.md.
- GitHub Issue/PR Templates.

### 2.7 التدويل (i18n) 🌐
- إضافة لغات: فرنسية، إسبانية، تركية، أوردو، فارسية.
- نظام i18n حقيقي يستبدل سلاسل `if/else`.

---

## 3. الأولويات المقترحة

### 🟢 المستوى 1 — تأثير عالٍ، جهد منخفض
1. **التراجع/الإعادة** (Undo/Redo)
2. **الوضع الليلي** (Dark Mode)
3. **اختصارات لوحة المفاتيح**
4. **حفظ/تحميل المشروع** (LocalStorage)
5. **مربعات حوار + Toast**
6. **`.gitignore` و ESLint**

### 🟡 المستوى 2 — قيمة كبيرة، جهد متوسط
7. قياس الزوايا والمساحات
8. المعايرة بوحدات حقيقية
9. تصدير محسّن (JSON/PNG مع علامات/PDF)
10. سحب النقاط لإعادة تموضعها
11. PWA + Service Worker
12. تقسيم الكود إلى وحدات

### 🔴 المستوى 3 — تحويلية، جهد كبير (**المسار المختار**)
13. أدوات الرسم والتعليق الكاملة
14. معالجة الصور (فلاتر، Histogram)
15. دعم PDF والصيغ المتقدمة
16. **بنية اختبارات كاملة (Unit + E2E)**
17. **التحويل إلى TypeScript + إعادة هيكلة شاملة**

---

# خطة إعادة الهيكلة التقنية

تم اختيار **مسار إعادة الهيكلة التقنية الشاملة** للتنفيذ. ما يلي خطة تفصيلية بمراحل قابلة للتنفيذ والمراجعة بشكل مستقل.

## القيود الحاكمة
- يبقى الإنتاج قابلاً للنشر كملفات ثابتة على GitHub Pages.
- لا يجب فقدان أي وظيفة حالية.
- التغييرات على شكل مراحل صغيرة (PR لكل مرحلة).
- المخرج النهائي يبقى صفر اعتمادات وقت التشغيل في المتصفح (ES Modules أصلية).

## الفلسفة
الانتقال من ملف واحد إلى بنية مهنية بدون كسر بساطة "افتح index.html واستخدمه". اعتمادات `npm` تكون أدوات تطوير فقط (devDependencies).

---

## 🚧 المرحلة 0: تأسيس الصحة (Project Hygiene)
**المخاطر:** منخفضة جداً. **الهدف:** أدوات أساسية دون لمس منطق الكود.

**الأعمال:**
1. إنشاء `.gitignore` (استبعاد `node_modules/`, `dist/`, `.DS_Store`, `*.log`).
2. إنشاء `package.json` بـ `devDependencies` فقط: `vitest`, `eslint`, `prettier`, `jsdom`.
3. إنشاء `.eslintrc.json` (ES2022، modules).
4. إنشاء `.prettierrc` (2 spaces، single quotes، semicolons).
5. إنشاء `CHANGELOG.md` يبدأ بـ `[Unreleased]`.
6. إنشاء `.github/PULL_REQUEST_TEMPLATE.md` و `.github/ISSUE_TEMPLATE/`.

**التحقق:** `npm install` ينجح، `index.html` يعمل كما هو.

---

## 🧱 المرحلة 1: فصل HTML/CSS/JS
**المخاطر:** منخفضة — قص ولصق دون تعديل منطقي.

**الأعمال:**
1. نقل CSS من `index.html:7-352` إلى `css/styles.css`.
2. نقل JS من `index.html:447-800` إلى `js/app.js` (ملف واحد، لا تقسيم بعد).
3. ربط الملفات في `index.html` عبر `<link>` و `<script src="..." defer>`.
4. إزالة سمات `onclick` المضمنة (الأسطر 357, 388-390, 393, 399) واستبدالها بـ `addEventListener` في `app.js`.

**الهيكل بعد هذه المرحلة:**
```
ImageMetrics-Tool/
├── index.html        (هيكل HTML فقط)
├── css/styles.css    (الأنماط)
├── js/app.js         (المنطق - ملف واحد)
└── README.md
```

**التحقق:** افتح `index.html`، اختبر كل الوظائف (الإحداثيات، الألوان، النقاط، المسافة، CSV، الشبكة، التكبير، تبديل اللغة). لا يجب أن يتغير أي سلوك.

---

## 📦 المرحلة 2: ES Modules + إدارة حالة موحّدة
**المخاطر:** متوسطة — تتطلب الانتباه إلى ترتيب التحميل و CORS.

**ملاحظة CORS:** ES Modules لا تعمل بفتح `file://` مباشرة. الحلول:
- استخدام `npx serve .` أو `python3 -m http.server` للتطوير المحلي.
- توثيق ذلك في README.
- GitHub Pages يعمل بشكل طبيعي.

**هيكل الوحدات المقترح:**
```
js/
├── main.js          نقطة الدخول
├── state.js         الحالة المركزية (img, points, zoom, lang, showGrid)
├── canvas.js        renderCanvas, drawGrid, drawPoint
├── upload.js        loadImage + معالجات السحب والإفلات
├── events.js        مستمعو الفأرة (mousemove, click, drag-to-pan)
├── points.js        إدارة النقاط (CRUD)
├── measurements.js  calculateDistance (ومستقبلاً: angle, area)
├── export.js        exportToCSV (ومستقبلاً: JSON, PNG, PDF)
├── i18n.js          نظام الترجمة
└── utils/
    ├── color.js     rgbToHex, getPixelColor
    └── dom.js       مختصرات DOM
```

### خريطة نقل الدوال

| السطر الحالي | الدالة/الكتلة | الوحدة الهدف |
|---|---|---|
| 448-498 | `currentLang`, `translations` | `i18n.js` (+ `locales/*.json`) |
| 500-509 | المتغيرات العامة | `state.js` |
| 511-538 | معالجات الرفع | `upload.js` |
| 540-558 | `loadImage` | `upload.js` |
| 560-577 | `renderCanvas` | `canvas.js` |
| 579-597 | `drawGrid` | `canvas.js` |
| 599-613 | `drawPoint` | `canvas.js` |
| 616-645 | السحب للتجوال | `events.js` |
| 647-664 | `mousemove` (إحداثيات حية) | `events.js` (+ `utils/color.js`) |
| 666-680 | `click` (حفظ نقطة) | `events.js` |
| 682-706 | `updatePointsList` | `points.js` |
| 708-713 | `deletePoint` | `points.js` |
| 715-722 | `clearAllPoints` | `points.js` |
| 724-734 | `calculateDistance` | `measurements.js` |
| 736-753 | `exportToCSV` | `export.js` |
| 755-758 | `toggleGrid` | `main.js` |
| 760-764 | `updateZoom` | `main.js` |
| 766-799 | `toggleLanguage` | `i18n.js` |

### تصميم إدارة الحالة (`state.js`)
نهج بسيط: كائن `store` + pub/sub خفيف بدون مكتبة.

```js
// js/state.js
const listeners = new Set();

export const store = {
  img: null,
  points: [],
  zoom: 1,
  showGrid: false,
  lang: 'ar',
  isDragging: false,
};

export function setState(patch) {
  Object.assign(store, patch);
  listeners.forEach(fn => fn(store));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
```

### تصميم الترجمة (`i18n.js`)
نقل الترجمات إلى `locales/ar.json` و `locales/en.json`، تحميلها بـ `fetch`:

```js
// js/i18n.js
import { store, setState } from './state.js';

let translations = {};

export async function loadLocale(lang) {
  const res = await fetch(`locales/${lang}.json`);
  translations = await res.json();
  setState({ lang });
  applyTranslations();
}

export function t(key) {
  return translations[key] ?? key;
}

function applyTranslations() {
  document.documentElement.lang = store.lang;
  document.documentElement.dir = store.lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}
```

في HTML: استبدال `id="mainTitle"` بـ `data-i18n="mainTitle"` لكل عنصر قابل للترجمة، مما يُلغي الدالة الطويلة `toggleLanguage` (الأسطر 766-799) ويستبدلها بنمط إعلاني.

**التحقق:** تشغيل `npx serve .`، اختبار كل الوظائف عبر متصفحات Chrome/Firefox/Safari، اختبار تبديل اللغة و RTL/LTR.

---

## 🧪 المرحلة 3: اختبارات الوحدة (Vitest)
**المخاطر:** منخفضة.

**الإطار:** Vitest (يدعم ES Modules أصلياً، أسرع من Jest).

**هيكل الاختبارات:**
```
tests/
├── unit/
│   ├── measurements.test.js
│   ├── color.test.js
│   ├── state.test.js
│   ├── i18n.test.js
│   └── export.test.js
└── fixtures/
    └── sample-points.json
```

**مثال:**
```js
import { describe, it, expect } from 'vitest';
import { distance } from '../../js/measurements.js';

describe('distance', () => {
  it('returns 0 for the same point', () => {
    expect(distance({x: 5, y: 5}, {x: 5, y: 5})).toBe(0);
  });
  it('calculates Euclidean distance', () => {
    expect(distance({x: 0, y: 0}, {x: 3, y: 4})).toBe(5);
  });
});
```

**هدف التغطية:** ≥80% للدوال الخالصة.

---

## 🤖 المرحلة 4: CI/CD مع GitHub Actions

**`.github/workflows/ci.yml`:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm test -- --run
```

**سكريبتات `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint js/ tests/",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "dev": "npx serve ."
  }
}
```

**Workflow النشر** (`.github/workflows/deploy.yml`): عند الـ push إلى `main`، ينسخ الملفات الثابتة إلى GitHub Pages.

---

## 🎭 المرحلة 5 (اختيارية): اختبارات E2E بـ Playwright

سيناريوهات أساسية: تحميل صورة، نقر لحفظ نقاط، حساب مسافة، تصدير CSV، تبديل اللغة.

```js
test('user can measure distance between two points', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.setInputFiles('#fileInput', 'tests/fixtures/sample.png');
  await page.click('#mainCanvas', { position: { x: 100, y: 100 } });
  await page.click('#mainCanvas', { position: { x: 200, y: 100 } });
  await expect(page.locator('#distanceValue')).toHaveText('100');
});
```

---

## 🔷 المرحلة 6 (اختيارية): الترحيل إلى TypeScript
**نهج تدريجي:**

1. إضافة `typescript` كـ devDependency.
2. `tsconfig.json` مع `allowJs: true` للبدء.
3. تحويل الوحدات من `.js` إلى `.ts` واحدة في كل مرة (ابدأ بـ `state.ts`, `measurements.ts`, `color.ts`).
4. خياران للـ Build:
   - **خيار A:** `tsc --watch` يولّد `.js` في `dist/`، GitHub Pages يخدم من `dist/`.
   - **خيار B:** Vite (تجربة تطوير أفضل + HMR).

**توصية:** ابدأ بالخيار A لتقليل التغيير. انتقل إلى Vite فقط عند الحاجة.

---

## القرارات التصميمية

| القرار | الخيار المُعتمد | السبب |
|---|---|---|
| إدارة الحالة | `store` + pub/sub بسيط | Redux مبالغة، الأصلي يكفي |
| التواصل بين الوحدات | `import`/`export` + pub/sub | صريح وقابل للاختبار |
| Bundler | لا في المراحل 1-5؛ ربما Vite في 6 | يحافظ على بساطة "افتح وارفع" |
| Test runner | Vitest | ESM أصلي، سريع |
| TypeScript | اختياري، تدريجي | يقلل الصدمة على المساهمين |
| i18n | JSON + `data-i18n` | يلغي دالة `toggleLanguage` الطويلة |

## المخاطر والتحوّطات

| الخطر | التحوّط |
|---|---|
| ES Modules لا تعمل بـ `file://` | توثيق `npx serve .` في README |
| فقدان وظيفة أثناء التقسيم | قائمة تحقق يدوية + اختبارات لكل مرحلة |
| كسر العربية/RTL | smoke test للتبديل |
| تعقيد ESLint للمبتدئين | استخدام إعدادات قياسية |

## تسلسل الـ PRs المقترح

| PR | المرحلة | حجم تقديري | الاعتمادية |
|---|---|---|---|
| #1 | المرحلة 0: Project Hygiene | صغير | لا شيء |
| #2 | المرحلة 1: Split HTML/CSS/JS | متوسط | #1 |
| #3 | المرحلة 2: ES Modules + State + i18n | كبير | #2 |
| #4 | المرحلة 3: Unit Tests | متوسط | #3 |
| #5 | المرحلة 4: CI/CD | صغير | #4 |
| #6 | المرحلة 5: E2E (اختياري) | متوسط | #5 |
| #7 | المرحلة 6: TypeScript (اختياري) | كبير | #4 |

## ما هو خارج النطاق
- لا تغيير في وظائف المستخدم — إعادة هيكلة بحتة.
- لا ميزات جديدة (Undo، Dark Mode) — تلك خطة منفصلة.
- لا تغيير بصري (ألوان، تخطيط، خطوط).
- لا تغيير في صيغة CSV (للحفاظ على التوافق).

---

# English Summary

## Catalog of Improvement Ideas

This document proposes improvements for **ImageMetrics Tool**, organized in three priority tiers:

### 🟢 Tier 1 — High Impact, Low Effort
Undo/Redo, Dark Mode, Keyboard Shortcuts, Save/Load Projects (LocalStorage), Toast Notifications, ESLint + .gitignore.

### 🟡 Tier 2 — High Value, Medium Effort
Angle/Area measurements, real-world unit calibration, enhanced exports (JSON/PNG/PDF), drag-to-reposition points, PWA support, code modularization.

### 🔴 Tier 3 — Transformative (Selected Track)
Drawing/annotation tools, image processing (filters, histogram, edge detection), PDF support, **full testing infrastructure**, **TypeScript migration + comprehensive refactoring**.

## Selected Track: Technical Refactoring

The user selected the **Technical Refactoring** track. Implementation will proceed in 6 independently-shippable phases:

| Phase | Goal | Risk |
|---|---|---|
| **0** | Project hygiene: `.gitignore`, `package.json`, ESLint, Prettier, CHANGELOG | Very low |
| **1** | Split monolith into `index.html` + `css/styles.css` + `js/app.js` | Low |
| **2** | ES Modules + centralized state + JSON-based i18n | Medium |
| **3** | Unit testing with Vitest (≥80% coverage on pure functions) | Low |
| **4** | CI/CD via GitHub Actions (lint + test + deploy) | Low |
| **5** | _(Optional)_ E2E tests with Playwright | Low |
| **6** | _(Optional)_ Incremental TypeScript migration | Medium |

### Constraints
- Production must remain deployable as static files on GitHub Pages.
- Zero runtime dependencies in the browser (native ES Modules only).
- No regressions to existing features.
- Each phase is a separate PR for reviewable, incremental progress.

### Key Design Decisions
- **State management:** Simple `store` object with pub/sub pattern (no Redux).
- **Module communication:** ES `import`/`export` + lightweight pub/sub for events.
- **Bundler:** None for Phases 1-5; optional Vite in Phase 6.
- **Test runner:** Vitest (native ESM, fast, Jest-compatible API).
- **i18n:** JSON locale files + `data-i18n` HTML attributes (replaces the long `toggleLanguage` function).

### Next Steps
Implementation will proceed phase-by-phase. Each phase ships as a separate draft PR for review before merging.
