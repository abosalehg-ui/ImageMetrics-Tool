# سجل التغييرات | Changelog

جميع التغييرات المهمة في هذا المشروع موثّقة في هذا الملف.

All notable changes to this project will be documented in this file.

الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)،
ويتبع المشروع [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
