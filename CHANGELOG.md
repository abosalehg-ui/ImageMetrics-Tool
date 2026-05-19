# سجل التغييرات | Changelog

جميع التغييرات المهمة في هذا المشروع موثّقة في هذا الملف.

All notable changes to this project will be documented in this file.

الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)،
ويتبع المشروع [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed — تغيّر
- **المرحلة 1:** فُصل `index.html` إلى ثلاثة ملفات:
  - `css/styles.css` (الأنماط، كانت في `<style>` المضمّن)
  - `js/app.js` (المنطق، كان في `<script>` المضمّن)
  - `index.html` (هيكل HTML فقط)
- استُبدلت سمات `onclick`/`onchange`/`oninput` المضمّنة في HTML بـ `addEventListener` في `js/app.js`.
- استُخدم event delegation لأزرار حذف النقاط (`.delete-point`) بدلاً من inline `onclick`.

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
