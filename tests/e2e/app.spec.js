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

    await page.click('#btnClear');
    await page.locator('.dialog-box .btn-danger').click();
    await expect(page.locator('.point-item')).toHaveCount(0);
    await expect(page.locator('#distanceDisplay')).not.toHaveClass(/active/);
  });

  test('keeps points after canceling the clear confirmation', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    await page.click('#btnClear');
    await page.locator('.dialog-box .btn-secondary').click();
    await expect(page.locator('.point-item')).toHaveCount(2);
  });

  test('confirm dialog traps Tab focus between its two buttons', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await page.click('#btnClear');

    await expect(page.locator('.dialog-box .btn-danger')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.dialog-box .btn-secondary')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.dialog-box .btn-danger')).toBeFocused();

    await page.locator('.dialog-box .btn-secondary').click();
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

test.describe('pan (Shift + drag)', () => {
  // A narrow viewport forces the zoomed canvas to overflow its container even
  // with the small fixture image, so there's actually room to pan.
  test.use({ viewport: { width: 250, height: 600 } });

  test('Shift + drag scrolls the canvas container; a plain drag does not', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);
    await page.locator('#zoomSlider').fill('300');

    const container = page.locator('#canvasContainer');
    await expect(async () => {
      const { scrollWidth, clientWidth } = await container.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    }).toPass();

    // Start from the middle of the scrollable range so a drag has room to move either way.
    await container.evaluate((el) => {
      el.scrollLeft = -el.scrollWidth / 4;
    });
    const before = await container.evaluate((el) => el.scrollLeft);

    const canvas = page.locator('#mainCanvas');
    const box = /** @type {{ x: number, y: number, width: number, height: number }} */ (
      await canvas.boundingBox()
    );
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Plain drag (no Shift): the app should not intercept it as a pan.
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 60, startY, { steps: 5 });
    await page.mouse.up();
    expect(await container.evaluate((el) => el.scrollLeft)).toBe(before);

    // Shift + drag right: reveals content that was off-screen to the left, so
    // scrollLeft should move toward this RTL container's left extreme (more
    // negative), the same physical relationship a left-to-right layout has.
    await page.mouse.move(startX, startY);
    await page.keyboard.down('Shift');
    await page.mouse.down();
    await page.mouse.move(startX + 60, startY, { steps: 5 });
    await page.mouse.up();
    await page.keyboard.up('Shift');

    const after = await container.evaluate((el) => el.scrollLeft);
    expect(after).toBeLessThan(before);
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

    expect(download.suggestedFilename()).toMatch(
      /^image_coordinates_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/
    );
  });
});

test.describe('undo / redo', () => {
  test('undo and redo via toolbar buttons', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    const undoBtn = page.locator('#btnUndo');
    const redoBtn = page.locator('#btnRedo');

    await expect(undoBtn).toBeDisabled();

    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });
    await expect(page.locator('.point-item')).toHaveCount(2);
    await expect(undoBtn).toBeEnabled();

    await undoBtn.click();
    await expect(page.locator('.point-item')).toHaveCount(1);
    await expect(redoBtn).toBeEnabled();

    await undoBtn.click();
    await expect(page.locator('.point-item')).toHaveCount(0);
    await expect(undoBtn).toBeDisabled();

    await redoBtn.click();
    await expect(page.locator('.point-item')).toHaveCount(1);
  });

  test('undo via Ctrl+Z keyboard shortcut', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });
    await expect(page.locator('.point-item')).toHaveCount(2);

    await page.keyboard.press('Control+z');
    await expect(page.locator('.point-item')).toHaveCount(1);
  });
});

test.describe('theme', () => {
  test('toggles dark mode and persists the choice', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnTheme');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);

    const theme = await page.getAttribute('html', 'data-theme');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  });
});

test.describe('keyboard shortcuts help', () => {
  test('opens the shortcuts panel and focuses the close button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#shortcutsHelp')).not.toHaveClass(/open/);
    await page.click('#btnHelp');
    await expect(page.locator('#shortcutsHelp')).toHaveClass(/open/);
    await expect(page.locator('#shortcutsHelp')).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('#btnCloseShortcuts')).toBeFocused();
  });

  test('closes via the close button and restores focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnHelp').focus();
    await page.click('#btnHelp');
    await expect(page.locator('#shortcutsHelp')).toHaveClass(/open/);

    await page.click('#btnCloseShortcuts');
    await expect(page.locator('#shortcutsHelp')).not.toHaveClass(/open/);
    await expect(page.locator('#shortcutsHelp')).toHaveAttribute('aria-modal', 'false');
    await expect(page.locator('#btnHelp')).toBeFocused();
  });

  test('closes via clicking the backdrop', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnHelp');
    await expect(page.locator('#shortcutsHelp')).toHaveClass(/open/);

    await page.locator('#shortcutsHelp').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#shortcutsHelp')).not.toHaveClass(/open/);
  });

  test('Tab cycles focus within the panel instead of leaking out', async ({ page }) => {
    await page.goto('/');
    await page.click('#btnHelp');
    await expect(page.locator('#btnCloseShortcuts')).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#btnCloseShortcuts')).toBeFocused();
  });
});
