# سجل التغييرات | Changelog

جميع التغييرات المهمة في هذا المشروع موثّقة في هذا الملف.

All notable changes to this project will be documented in this file.

الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)،
ويتبع المشروع [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — أُضيف (المرحلة 5)
- اختبارات شاملة (E2E) بـ Playwright:
  - `tests/e2e/app.spec.js` — 11 سيناريو مغطّاة:
    - تحميل الصفحة وظهور منطقة الرفع
    - الاتجاه الأولي (RTL مع `lang=ar`)
    - تبديل اللغة مع تغيير `dir`/`lang` والنصوص
    - رفع صورة وتفعيل canvas
    - النقر لإضافة نقاط وحساب المسافة
    - حذف نقطة واحدة عبر زر ❌
    - مسح الكل مع التأكيد، والحفاظ عند الإلغاء
    - شريط التكبير وتحديث النسبة المئوية
    - تشغيل/إيقاف الشبكة
    - تنزيل CSV بالاسم الصحيح
  - `tests/fixtures/sample.png` — صورة اختبار صغيرة (100×100، RGB صلب).
- `playwright.config.js` بإعداد متصفّح Chromium وخادم محلي تلقائي.
- `serve` كـ devDependency لاستضافة الملفات في E2E.
- وظيفة `e2e` جديدة في CI workflow:
  - تعتمد على نجاح وظيفة `quality` (تتجنّب هدر CI minutes).
  - تثبّت Chromium مع تبعيات النظام.
  - ترفع تقرير Playwright كأرتيفاكت عند الفشل (للتشخيص).
- سكريبتات npm: `test:e2e`, `test:e2e:ui`.

### Added — أُضيف (المرحلة 4)
- `.github/workflows/ci.yml` — تشغيل ESLint و Prettier و Vitest على كل push و pull_request إلى `main`.
- `.github/workflows/deploy.yml` — نشر تلقائي إلى GitHub Pages عند الـ push إلى `main`.
- ميزات الـ workflow:
  - تخزين مؤقت لـ npm (`cache: 'npm'` في `setup-node`).
  - إلغاء تشغيلات CI المكرّرة على نفس الـ ref (`concurrency: cancel-in-progress: true`).
  - منع تداخل عمليات النشر (`concurrency.group: pages, cancel-in-progress: false`).
  - استخدام أحدث إصدارات الـ actions: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- شارة CI status في README.

### Added — أُضيف (المرحلة 3)
- بنية اختبارات الوحدة بـ Vitest:
  - `tests/unit/measurements.test.js` (8 اختبارات)
  - `tests/unit/color.test.js` (10 اختبارات)
  - `tests/unit/state.test.js` (8 اختبارات)
  - `tests/unit/export.test.js` (5 اختبارات)
- `vitest.config.js` مع بيئة jsdom وتقارير تغطية v8
- `@vitest/coverage-v8` إلى devDependencies
- استُخرجت `pointsToCSV(points)` كدالة خالصة من `exportToCSV()` لتسهيل الاختبار
- **31 اختباراً تمر، تغطية 100% على الدوال الخالصة:** `distance`, `rgbToHex`, `getPixelColor`, `setState`, `subscribe`, `pointsToCSV`

### Changed — تغيّر
- **المرحلة 2:** قُسّم `js/app.js` إلى وحدات ES (ES Modules):
  - `js/main.js` — نقطة الدخول
  - `js/state.js` — حالة موحّدة مع pub/sub
  - `js/canvas.js` — رسم Canvas (renderCanvas, drawGrid, drawPoint)
  - `js/upload.js` — رفع وتحميل الصور
  - `js/events.js` — مستمعو أحداث الفأرة
  - `js/points.js` — إدارة النقاط (CRUD)
  - `js/measurements.js` — حساب المسافة (دالة خالصة)
  - `js/export.js` — تصدير CSV
  - `js/i18n.js` — نظام الترجمة
  - `js/utils/color.js` — تحويلات الألوان
- نُقلت الترجمات من JS مدمج إلى `locales/ar.json` و `locales/en.json`.
- استُبدلت معالجة الترجمة المعتمدة على IDs بـ `data-i18n` attributes (يقلّل 30+ سطر من الكود اليدوي).
- `index.html`: `<script type="module" src="js/main.js">` (يلغي `<script src=... defer>`).
- **المرحلة 1:** فُصل `index.html` إلى ثلاثة ملفات:
  - `css/styles.css` (الأنماط، كانت في `<style>` المضمّن)
  - `js/app.js` (المنطق، كان في `<script>` المضمّن)
  - `index.html` (هيكل HTML فقط)
- استُبدلت سمات `onclick`/`onchange`/`oninput` المضمّنة في HTML بـ `addEventListener` في `js/app.js`.
- استُخدم event delegation لأزرار حذف النقاط (`.delete-point`) بدلاً من inline `onclick`.

### Breaking — تغييرات جوهرية
- لم يعد بالإمكان تشغيل التطبيق بفتح `index.html` مباشرة من نظام الملفات (`file://`) بسبب سياسة CORS لـ ES Modules و fetch. يجب استخدام خادم محلي (`npm run dev` أو `npx serve .` أو `python3 -m http.server`). راجع README.md للتفاصيل.
- GitHub Pages يعمل بشكل طبيعي دون أي تغيير.

### Added — أُضيف
- `package.json` مع devDependencies لاختبار و linting و formatting
- إعداد ESLint بالـ flat config (`eslint.config.js`)
- إعداد Prettier (`.prettierrc` و `.prettierignore`)
- ملف `.gitignore`
- قوالب GitHub للـ Issues و PRs (في `.github/`)
- وثيقة `IMPROVEMENTS.md` بأفكار التطوير وخطة إعادة الهيكلة

## [1.0.0] - 2024

### Added — أُضيف
- إطلاق الإصدار الأول
- دعم كامل للغتين العربية والإنجليزية
- قياس الإحداثيات والمسافات
- تحليل الألوان RGB/HEX
- تصدير البيانات إلى CSV
- واجهة مستخدم عصرية
- تكبير من 50% إلى 300%
- شبكة مساعدة اختيارية
