import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, '../fixtures/sample.png');

async function uploadFixture(page) {
  await page.setInputFiles('#fileInput', FIXTURE);
  // Image must load + canvas must activate before further interactions
  await expect(page.locator('#canvasContainer')).toHaveClass(/active/);
}

test.describe('app shell', () => {
  test('loads with upload zone visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#uploadZone')).toBeVisible();
    await expect(page.locator('[data-i18n="mainTitle"]')).toHaveText('ImageMetrics Tool');
  });

  test('starts in Arabic with RTL direction', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('language toggle', () => {
  test('switches between Arabic and English with correct direction', async ({ page }) => {
    await page.goto('/');

    await page.click('.lang-switch');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('[data-i18n="btnNewImage"]')).toHaveText('📁 New Image');

    await page.click('.lang-switch');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('[data-i18n="btnNewImage"]')).toHaveText('📁 صورة جديدة');
  });
});

test.describe('image upload', () => {
  test('activates the canvas after upload', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);
    await expect(page.locator('#mainCanvas')).toBeVisible();
  });
});

test.describe('point measurement', () => {
  test('clicks add points and the distance display becomes active', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    await expect(page.locator('.point-item')).toHaveCount(2);
    await expect(page.locator('#distanceDisplay')).toHaveClass(/active/);

    const distance = await page.locator('#distanceValue').textContent();
    expect(parseInt(distance, 10)).toBeGreaterThan(0);
  });

  test('deletes a single point via its delete button', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });
    await expect(page.locator('.point-item')).toHaveCount(2);

    await page.locator('.delete-point').first().click();
    await expect(page.locator('.point-item')).toHaveCount(1);
  });

  test('clears all points after confirmation', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });
    await expect(page.locator('.point-item')).toHaveCount(2);

    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#btnClear');
    await expect(page.locator('.point-item')).toHaveCount(0);
    await expect(page.locator('#distanceDisplay')).not.toHaveClass(/active/);
  });

  test('keeps points after canceling the clear confirmation', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.click('#btnClear');
    await expect(page.locator('.point-item')).toHaveCount(2);
  });
});

test.describe('controls', () => {
  test('zoom slider updates the displayed percentage', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const slider = page.locator('#zoomSlider');
    await slider.fill('200');
    await expect(page.locator('#zoomValue')).toHaveText('200%');

    await slider.fill('150');
    await expect(page.locator('#zoomValue')).toHaveText('150%');
  });

  test('grid toggle is controllable', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const checkbox = page.locator('#gridToggle');
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe('CSV export', () => {
  test('downloads a CSV file with point data', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    const downloadPromise = page.waitForEvent('download');
    await page.click('#btnExport');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('image_coordinates.csv');
  });
});
