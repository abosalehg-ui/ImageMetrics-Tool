# سجل التغييرات | Changelog

جميع التغييرات المهمة في هذا المشروع موثّقة في هذا الملف.

All notable changes to this project will be documented in this file.

الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)،
ويتبع المشروع [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### إصلاحات مراجعة مِحَك / Mihak Review Fixes

- **Fixed:**
  - لون البكسل كان يُقرأ من الكانفس المعروض، فيلتقط علامات النقاط وخطوط الشبكة وألواناً مُنعَّمة غير موجودة في الصورة عند التكبير (وتُحفظ في CSV). أصبح يُقرأ من الصورة الأصلية عبر كانفس 1×1 (`samplePixel` في `js/canvas.js`). / Pixel colors were read from the displayed canvas, picking up point markers, grid lines and interpolated colors that don't exist in the image (and saving them to CSV). They're now read from the source image through a 1×1 canvas (`samplePixel`).
  - الإحداثيات كانت تُقرَّب بـ `Math.round` فتنزاح بكسلاً وقد تتجاوز الصورة (`X: 100` في صورة عرضها 100). أصبحت `Math.floor` مقيّدة بحدود الصورة (`toImagePixel`). / Coordinates used `Math.round`, shifting by a pixel and able to exceed the image (`X: 100` in a 100-px-wide image). They now floor and clamp (`toImagePixel`).
  - المعايرة وطول المسار والمساحة كانت تُبنى على قيم مقرّبة لعدد صحيح (خطأ حتى 11% مع المراجع القصيرة). `distance` و`pathLength` و`polygonArea` أصبحت بلا تقريب، والتقريب للعرض فقط. / Calibration, path length and area were built on integer-rounded values (up to 11% error with short references). `distance`, `pathLength` and `polygonArea` are now unrounded; rounding is display-only.
  - Enter على زر "إلغاء" في حوار التأكيد كان يمسح كل النقاط. / Pressing Enter on the confirm dialog's Cancel button cleared all points.
  - اختصارات لوحة المفاتيح كانت تعدّل الحالة خلف حوار التأكيد المفتوح. / Keyboard shortcuts mutated state behind an open confirm dialog.
  - التنزيل قد يُلغى في بعض نسخ Safari/Firefox بسبب `revokeObjectURL` المتزامن. / Downloads could be cancelled in some Safari/Firefox versions by a synchronous `revokeObjectURL`.
  - النصوص المختلطة (`#ff0000`، `52.2 px = 10 cm`) كانت تنقلب في سياق RTL. / Mixed-direction values (`#ff0000`, `52.2 px = 10 cm`) were reordered in RTL.
- **Added:**
  - إضافة النقاط بلوحة المفاتيح: Tab إلى الصورة، الأسهم لتحريك مؤشر (Shift = 10 بكسل)، Enter/Space للحفظ. / Keyboard point placement: Tab to the image, arrow keys move a cursor (Shift = 10 px), Enter/Space saves.
  - رفض الصور التي تتجاوز 100 ميجابكسل قبل فك ترميزها (حماية من decompression bombs). / Images over 100 megapixels are rejected before decoding (decompression-bomb guard).
  - حد مساحة للكانفس على iOS/iPadOS (4096²) يمنع الكانفس الفارغ عند التكبير. / A canvas area cap on iOS/iPadOS (4096²) prevents a blank canvas when zooming.
  - Dependabot لاعتماديات npm وGitHub Actions، و`CONTRIBUTING.md`. / Dependabot for npm and GitHub Actions, and `CONTRIBUTING.md`.
  - اختبارات E2E تتحقق من صحة الإحداثي واللون (صورة اختبار بألوان معروفة)، ومن لوحة المفاتيح وأمان الحوار؛ واختبارات وحدة جديدة (`upload`، `dialog`، `pointsView`). / E2E tests that assert coordinate and color correctness against a known-color fixture, plus keyboard and dialog-safety tests; new unit tests (`upload`, `dialog`, `pointsView`).
- **Changed:**
  - الكانفس طبقتان: طبقة الصورة تُرسم فقط عند تغيّر الصورة أو التكبير، وطبقة علوية خفيفة للنقاط والشبكة. لم يعد الكانفس يُعاد تخصيصه مع كل نقرة. التكبير يعرض البكسلات بحدّة (nearest-neighbour). / The canvas is now two layers: the image layer redraws only on image/zoom change, a light overlay holds points and grid. No more reallocation on every click. Magnification is nearest-neighbour so pixels stay crisp.
  - النقاط تُرسم في منتصف البكسل. / Points are drawn at the pixel center.
  - فك الاستيراد الدائري `points.js` ↔ `metrics.js`: `refreshPointsUI` انتقلت لـ `js/render.js`، والعروض لـ `js/pointsView.js`، وأزرار المعايرة لـ `js/calibrationControls.js`. / Broke the `points.js` ↔ `metrics.js` import cycle: `refreshPointsUI` moved to `js/render.js`, views to `js/pointsView.js`, calibration buttons to `js/calibrationControls.js`.
  - تباين WCAG AA: اللون الأساسي `#b85739` (4.7:1 مع الأبيض) والنص الخافت `#78716c`. / WCAG AA contrast: primary `#b85739` (4.7:1 with white), subtle text `#78716c`.
  - رموز الوضع الليلي معرّفة مرة واحدة؛ `theme.js` يضبط `data-theme` دائماً ويتابع تفضيل النظام حيّاً. / Dark tokens are defined once; `theme.js` always sets `data-theme` and follows the system preference live.
  - أهداف لمس 44px على الجوال، واسم مقروء لزر حذف النقطة، و`aria-labelledby` للوحة الاختصارات، وتذييل مترجم بسنة ديناميكية. / 44px touch targets on mobile, an accessible name for the delete-point button, `aria-labelledby` on the shortcuts panel, and a translated footer with a dynamic year.
- **Security:**
  - حُذف `'unsafe-inline'` من `style-src`، وحُذف `frame-ancestors` الذي لا أثر له داخل `<meta>`. / Removed `'unsafe-inline'` from `style-src` and the `frame-ancestors` directive, which has no effect in a `<meta>` CSP.
  - ترقية `vitest` و`@vitest/coverage-v8` إلى 5.x و`serve` إلى 14.2.6 مع `overrides` لـ `compression` — `npm audit` نظيف (كان 17 ثغرة في أدوات التطوير). / Upgraded `vitest` and `@vitest/coverage-v8` to 5.x and `serve` to 14.2.6 with a `compression` override — `npm audit` is clean (was 17 dev-tooling vulnerabilities).

### خواص قياس جديدة / New Image Metrics Features

- **Added:**
  - **قياس الزوايا:** حساب الزاوية الداخلية (بالدرجات) عند منتصف آخر ثلاث نقاط، مع رسم قوس الزاوية على الكانفس (`angleAt` في `js/measurements.js`). / **Angle measurement:** the interior angle (in degrees) at the middle of the last three saved points, with an arc drawn on the canvas (`angleAt` in `js/measurements.js`).
  - **طول المسار والمساحة:** مجموع المسافات عبر كل النقاط (polyline) ومساحة المضلّع عبر صيغة Shoelace، مع خط رابط بين النقاط وإغلاق منقّط للمضلّع (`pathLength`، `polygonArea`). / **Path length & area:** the total polyline length across all points and the polygon area via the shoelace formula, with a connecting line and a dashed polygon closure drawn on the canvas (`pathLength`, `polygonArea`).
  - **المعايرة للوحدات الحقيقية:** تحديد مقياس من مسافة مرجعية معروفة (مثلاً 10 سم) لتحويل كل القياسات (المسافة، المسار، المساحة) إلى مم/سم/م/إنش/قدم (`js/calibration.js`). المعايرة تُلغى تلقائياً عند تحميل صورة جديدة. / **Real-world calibration:** set a scale from a known reference distance (e.g. 10 cm) to convert every measurement (distance, path, area) into mm/cm/m/in/ft (`js/calibration.js`). Calibration is cleared automatically when a new image loads.
  - **مقاييس الصورة:** الأبعاد ونسبة الأبعاد المبسّطة (مثل 16:9) والميجابكسل (`imageMetrics`). / **Image metrics:** dimensions, simplified aspect ratio (e.g. 16:9), and megapixels (`imageMetrics`).
  - **الصندوق المحيط:** أبعاد أصغر مستطيل يحيط بكل النقاط المحفوظة (`boundingBox`). / **Bounding box:** the size of the smallest axis-aligned rectangle enclosing all saved points (`boundingBox`).
  - **تصدير JSON:** زر جديد يصدّر النقاط مع كامل سياق القياس (مقاييس الصورة، المعايرة، طول المسار، المساحة، الصندوق المحيط، وطابع زمني) (`exportToJSON`، `pointsToJSON`). / **JSON export:** a new button exports the points together with the full measurement context (image metrics, calibration, path length, area, bounding box, and a timestamp) (`exportToJSON`, `pointsToJSON`).
  - ثلاث لوحات جانبية جديدة (القياسات، المعايرة، مقاييس الصورة) مع سلاسل i18n بالعربية والإنجليزية، واختبارات وحدة جديدة لكل الدوال الحسابية النقية (`tests/unit/calibration.test.js` + توسعة `measurements.test.js` و`export.test.js`، 39 اختباراً جديداً). / Three new sidebar panels (Measurements, Calibration, Image metrics) with Arabic and English i18n strings, plus new unit tests covering every pure computation (`tests/unit/calibration.test.js` and expanded `measurements.test.js` / `export.test.js`, 39 new tests).

### مراجعة هندسية شاملة / Comprehensive Engineering Review

- **Fixed:**
  - الزوم لم يكن يدعم التصغير رغم ادعاء README بذلك؛ أصبح النطاق الفعلي 50%–300%. / Zoom never actually supported values below 100% despite README claiming 50%–300%; the real range now matches.
  - كانفس الصورة كان ينهار بصمت (canvas فارغ) مع الصور الكبيرة عند التكبير العالي، متجاوزاً حدود المتصفح الداخلية. أصبح التكبير يُحد تلقائياً ضمن حجم آمن (`maxSafeZoomPercent` في `js/canvas.js`) مع تنبيه Toast عند التقييد. / Large images at high zoom silently overflowed the browser's internal canvas size limit, producing a blank canvas. Zoom is now capped to a browser-safe size per image, with a warning toast when the cap kicks in.
  - نشر GitHub Pages كان يعمل بالتوازي مع CI دون انتظار نجاح الاختبارات، فيمكن أن ينشر كوداً معطوباً. أصبح النشر job تابعاً لنجاح `quality` و `e2e` في نفس workflow (`ci.yml`)، وحُذف `deploy.yml` المستقل. / GitHub Pages deploy ran in parallel with CI instead of gating on it, so a broken commit could reach production. Deploy is now a job in `ci.yml` that `needs: [quality, e2e]`; the standalone `deploy.yml` was removed.
  - حذف نقطة عبر `dataset.index` المفقود كان يحذف النقطة رقم 0 خطأً بدل تجاهل الحدث. / Deleting a point with a missing `dataset.index` silently deleted point 0 instead of being a no-op.
  - صورة SVG بلا أبعاد كانت تُحمَّل "بنجاح" فتُنتج كانفس فارغاً بصمت؛ الآن تُرفض مع رسالة خطأ. / A dimensionless SVG "succeeded" at loading yet produced a silently blank canvas; it's now rejected with an error toast.
- **Changed:**
  - تحميل الصور يستخدم الآن `URL.createObjectURL` بدل `FileReader.readAsDataURL`، مما يوفر الذاكرة (تُلغى زيادة ~33% من ترميز base64). / Image loading now uses `URL.createObjectURL` instead of `FileReader.readAsDataURL`, avoiding the ~33% memory overhead of base64 encoding.
  - سياق الكانفس ثنائي الأبعاد يُنشأ بـ `{ willReadFrequently: true }` لتفادي كلفة قراءة الـ GPU المتكررة عبر `getImageData`. / The 2D canvas context is created with `{ willReadFrequently: true }` to avoid repeated GPU-readback cost from `getImageData`.
  - حُذف نمط pub/sub غير المستخدم (`subscribe`/`listeners` في `js/state.js`) ودالة `throttle` القائمة على الوقت غير المستخدمة (أُبقيت `rafThrottle`)؛ التحديثات تبقى صريحة عبر استدعاءات مباشرة. / Removed the unused pub/sub pattern (`subscribe`/`listeners` in `js/state.js`) and the unused time-based `throttle` (kept `rafThrottle`); UI updates stay explicit direct calls.
  - وُحِّدت قراءة لون البكسل المكرَّرة في `js/events.js` لتستخدم `getPixelColor()` بدل التكرار اليدوي مرتين. / De-duplicated the repeated pixel-color extraction in `js/events.js` to use `getPixelColor()` instead of two inline copies.
  - قائمة النقاط (`js/points.js`) تُبنى الآن عبر DOM APIs بدل `innerHTML` (دفاع استباقي). / The points list (`js/points.js`) is now built via DOM APIs instead of `innerHTML` (defense in depth).
  - مكدّسا التراجع/الإعادة محدودان الآن بـ `MAX_HISTORY = 100` لقطة. / The undo/redo stacks are now capped at `MAX_HISTORY = 100` snapshots.
  - نص "لا توجد نقاط محفوظة" لم يعد يستخدم لوناً مضمّناً `#999`؛ يعتمد الآن على قاعدة CSS الموجودة `.points-list > p` القائمة على design tokens. / The "no saved points" text no longer hardcodes an inline `#999` color; it now relies on the existing `.points-list > p` CSS rule built on design tokens.
- **Added:**
  - إتاحة الحوارين (تأكيد الحذف ولوحة الاختصارات) الآن تحبس Tab داخلها، وتُدير التركيز عند الفتح/الإغلاق، وتُحدّث `aria-modal` ديناميكياً (`js/ui/focusTrap.js`). / Both dialogs (delete confirmation and the shortcuts panel) now trap Tab focus, manage focus on open/close, and update `aria-modal` dynamically (`js/ui/focusTrap.js`).
  - زر إغلاق مخصص للوحة اختصارات لوحة المفاتيح، وإغلاق بالنقر على الخلفية. / A dedicated close button for the keyboard-shortcuts panel, plus click-outside-to-close.
  - أيقونة موقع (favicon) وسياسة أمان محتوى (CSP) عبر `<meta>` في `index.html`. / A favicon and a Content-Security-Policy `<meta>` tag in `index.html`.
  - ملف `LICENSE` بنص MIT الكامل (كان منقوصاً داخل README فقط). / A `LICENSE` file with the full MIT text (previously only an incomplete copy lived in README).
  - اختبارات جديدة: `tests/unit/canvas.test.js`، اختبار سقف التاريخ، واختبارات E2E لتراص Tab وإغلاق لوحة الاختصارات والسحب (Pan) بـ Shift+drag في وضع RTL. / New tests: `tests/unit/canvas.test.js`, a history-cap test, and E2E tests for Tab trapping, closing the shortcuts panel, and Shift+drag panning in RTL.
- **Security:**
  - أُضيفت CSP تقيّد `script-src` إلى `'self'` فقط. / Added a CSP restricting `script-src` to `'self'` only.

### Added — أُضيف (المرحلة 2: ميزات UX الأساسية / Phase 2: Core UX Features)

- **تراجع/إعادة (Undo/Redo)** لطفرات النقاط عبر `js/history.js` (مكدّسا past/future بلقطات غير قابلة للتغيير)، مع أزرار في الشريط وحالة تعطيل تلقائية. تحميل صورة جديدة يصفّر التاريخ.
- **الوضع الليلي بتبديل يدوي** (`js/theme.js`): زر يكتب `data-theme` على `<html>` ويحفظ التفضيل في `localStorage`، مع احترام `prefers-color-scheme` عند غياب اختيار صريح.
- **اختصارات لوحة المفاتيح** (`js/shortcuts.js`): `Ctrl+Z/Y` تراجع/إعادة، `Ctrl+S` تصدير، `Delete` حذف آخر نقطة، `G` الشبكة، `D` الوضع الليلي، `+/-` تكبير/تصغير، `?` لوحة المساعدة. + لوحة مساعدة منبثقة.
- **حفظ تفضيل اللغة** في `localStorage` (`getStoredLang`) — يبدأ التطبيق باللغة المختارة سابقًا.
- وحدة `js/controls.js` موحّدة (`setGrid`/`toggleGrid`/`setZoom`/`zoomBy`/`clampZoom`) يستخدمها كلٌّ من عناصر الواجهة واختصارات لوحة المفاتيح (إزالة ازدواج المنطق).
- اختبارات وحدة جديدة لـ `history` و `clampZoom`، واختبارات E2E للتراجع/الإعادة والوضع الليلي ولوحة المساعدة.

### Added — أُضيف (المرحلة 1: المتانة والأساس / Phase 1: Robustness & Foundation)

- نظام **Toast** إشعارات غير معطِّل (`js/ui/toast.js`) مع منطقة `aria-live` للقارئات.
- مربع حوار تأكيد **Dialog** نمطي يدعم لوحة المفاتيح (`js/ui/dialog.js`) بدل `confirm()` الأصلي.
- معالجة أخطاء تحميل الصور: `img.onerror`، `reader.onerror`، والتحقق من نوع الملف وحجمه (حد 25MB) في `js/upload.js` مع دالة `validateImageFile`.
- تهريب حقول CSV وفق RFC 4180 (`escapeCsvField`) واسم ملف بطابع زمني (`timestampSlug`) في `js/export.js`.
- أدوات `throttle` / `rafThrottle` (`js/utils/throttle.js`) لتقليل استدعاءات `getImageData` على حركة الفأرة.
- سمات إمكانية الوصول (ARIA): `role`/`aria-label` للأزرار والكانفس، و `aria-live` للإحداثيات الحية، ودعم `data-i18n-aria` في نظام الترجمة.
- اختبارات وحدة جديدة لـ `escapeCsvField` و `timestampSlug` و `throttle`/`rafThrottle`.

### Changed — تغيّر (المرحلة 1)

- استُبدلت نداءات `alert()`/`confirm()` الخام بنظام Toast/Dialog.
- يقرأ مدخل الملف نوع الصورة الآن (سابقًا كان الفحص في drop فقط).

### Added — أُضيف (المرحلة 6)

- نهج **TypeScript تدريجي عبر JSDoc** بدون تغيير امتدادات الملفات أو إضافة build step:
  - `tsconfig.json` بـ `allowJs: true`, `checkJs: true`, `noEmit: true`, `strict: true`.
  - `js/types.d.ts` — تعريفات الأنواع المشتركة (`Point`, `Store`, `Lang`, `Translations`, `PixelColor`, إلخ).
  - JSDoc type annotations مضافة لجميع الـ 10 وحدات في `js/`.
- `typescript` كـ devDependency.
- سكريبت `npm run typecheck` (`tsc --noEmit`).
- خطوة "Type check (TypeScript)" في CI workflow بعد lint و format.
- تحسينات في معالجة الأخطاء (null checks) في الوحدات التي تتعامل مع DOM.

### Design Decision — قرار تصميمي

**اخترنا JSDoc بدلاً من تحويل `.js` إلى `.ts`** للأسباب التالية:

- صفر تغيير في النشر: الملفات تبقى `.js` ويخدمها GitHub Pages مباشرة.
- لا حاجة لـ bundler أو خطوة build (نحافظ على فلسفة "بدون build step" للمشروع).
- type safety كاملة عبر `tsc --noEmit` و `checkJs: true`.
- يمكن الانتقال إلى ملفات `.ts` لاحقاً في Phase 6b دون تعقيدات.

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
