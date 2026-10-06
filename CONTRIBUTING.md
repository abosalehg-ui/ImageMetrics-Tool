# المساهمة في ImageMetrics Tool | Contributing

نرحب بمساهماتكم. هذه الصفحة تشرح تجهيز بيئة التطوير، وتشغيل الفحوصات، وفتح Pull Request.

Contributions are welcome. This page covers setting up a dev environment, running the checks, and opening a pull request.

---

## الإعداد | Setup

```bash
npm install                     # أدوات التطوير فقط — لا اعتماديات وقت تشغيل / dev tooling only, no runtime deps
npx playwright install chromium # مرة واحدة لاختبارات E2E / once, for the E2E tests
npm run dev                     # خادم محلي على المنفذ 8080 / local server on port 8080
```

لا يمكن فتح `index.html` مباشرة من نظام الملفات (ES Modules و`fetch` لملفات الترجمة تتطلب خادماً).

`index.html` can't be opened straight from the filesystem — ES Modules and the `fetch` of locale files need a server.

## السكريبتات | Scripts

```bash
npm run lint             # ESLint
npm run format           # تطبيق Prettier / apply Prettier
npm run format:check     # التحقق من التنسيق / verify formatting
npm run typecheck        # فحص الأنواع عبر JSDoc + tsc / type-check via JSDoc + tsc
npm test                 # اختبارات الوحدة (مراقبة) / unit tests (watch)
npm run test:run         # اختبارات الوحدة مرة واحدة / unit tests once
npm run test:coverage    # مع تقرير التغطية / with coverage report
npm run test:e2e         # اختبارات Playwright / Playwright E2E tests
npm run test:e2e:ui      # Playwright بواجهة تفاعلية / Playwright UI mode
```

CI يشغّل بالترتيب: lint ← format:check ← typecheck ← unit ← e2e، ولا يُنشر على GitHub Pages إلا بعد نجاحها كلها.

CI runs lint → format:check → typecheck → unit → e2e, and only deploys to GitHub Pages once all of them pass.

## البنية | Architecture

| الملف / File                                                                | المسؤولية / Responsibility                                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `js/measurements.js`, `js/calibration.js`, `js/history.js`                  | دوال نقية بلا DOM / pure functions, no DOM                                                                         |
| `js/state.js`                                                               | المخزن الوحيد للحالة / the single state store                                                                      |
| `js/canvas.js`                                                              | طبقتا الرسم + قراءة لون البكسل من الصورة الأصلية / both canvas layers + reading pixel colors from the source image |
| `js/render.js`                                                              | `refreshPointsUI()` — نقطة تحديث الواجهة الوحيدة / the single UI refresh entry point                               |
| `js/pointsView.js`, `js/metrics.js`                                         | عرض القوائم واللوحات / list and panel views                                                                        |
| `js/points.js`, `js/calibrationControls.js`, `js/events.js`, `js/upload.js` | الأفعال ومعالجات الأحداث / actions and event handlers                                                              |

قواعد يلتزم بها الكود / Rules the code follows:

- الإحداثي هو رقم البكسل: `Math.floor(offset / zoom)` مقيّد بـ `[0, size − 1]` (`toImagePixel`).
  A coordinate is a pixel index: `Math.floor(offset / zoom)` clamped to `[0, size − 1]` (`toImagePixel`).
- اللون يُقرأ من الصورة الأصلية عبر `samplePixel()`، لا من الكانفس المعروض.
  Colors are read from the source image via `samplePixel()`, never from the displayed canvas.
- القياسات تُحسب بلا تقريب؛ التقريب للعرض فقط (`formatLength`، `formatArea`).
  Measurements are computed unrounded; rounding happens only for display (`formatLength`, `formatArea`).
- النصوص الظاهرة للمستخدم تمر عبر `t()` ولها مفتاح في `locales/ar.json` و`locales/en.json`.
  User-visible strings go through `t()` and have a key in both `locales/ar.json` and `locales/en.json`.

## فتح Pull Request | Opening a pull request

1. افتح Issue لمناقشة التغيير إن كان كبيراً. / Open an issue first for anything sizeable.
2. أضف اختباراً لكل خطأ تصلحه أو ميزة تضيفها — والأفضل اختبار يتحقق من **صحة** القيمة لا من حدوث الفعل فقط.
   Add a test for every fix or feature — ideally one that checks the value is **correct**, not just that something happened.
3. شغّل `npm run lint && npm run format:check && npm run typecheck && npm run test:run && npm run test:e2e`.
4. اتبع قالب الـ PR في `.github/PULL_REQUEST_TEMPLATE.md` وحدّث `CHANGELOG.md`.
   Follow `.github/PULL_REQUEST_TEMPLATE.md` and update `CHANGELOG.md`.
