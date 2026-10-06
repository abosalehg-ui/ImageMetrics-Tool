import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(__dirname, '../fixtures/sample.png');
// 100×100: columns 0–49 pure red (#ff0000), columns 50–99 pure blue (#0000ff).
const RED_BLUE = resolve(__dirname, '../fixtures/red-blue.png');

async function uploadFixture(page, fixture = FIXTURE) {
  await page.setInputFiles('#fileInput', fixture);
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

    // The zoom slider sits below the canvas; filling it can scroll the page far
    // enough that the canvas leaves the viewport. Bring the container back so
    // the mouse lands on it (this doesn't change its internal scroll).
    await container.scrollIntoViewIfNeeded();

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

test.describe('measurement accuracy', () => {
  test('live color reads the image, not the marker drawn over it', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page, RED_BLUE);
    const canvas = page.locator('#mainCanvas');

    await canvas.click({ position: { x: 20, y: 20 } });
    // Hover the white number/outline of the saved point's marker.
    await canvas.hover({ position: { x: 21, y: 21 } });
    await canvas.hover({ position: { x: 20, y: 13 } });
    await expect(page.locator('#liveHEX')).toHaveText('#ff0000');
  });

  test('grid lines do not change the sampled color', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page, RED_BLUE);
    await page.locator('#gridToggle').check();

    const canvas = page.locator('#mainCanvas');
    await canvas.hover({ position: { x: 30, y: 49 } });
    await canvas.hover({ position: { x: 30, y: 50 } });
    await expect(page.locator('#liveHEX')).toHaveText('#ff0000');
  });

  test('saves the exact pixel index and color at 300% zoom', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page, RED_BLUE);
    await page.locator('#zoomSlider').fill('300');
    await expect(page.locator('#zoomValue')).toHaveText('300%');

    const canvas = page.locator('#mainCanvas');
    const lastPoint = page.locator('.point-item').last();

    // Offset 149 lies inside pixel 49 (147–150): the last red column.
    await canvas.click({ position: { x: 149, y: 200 } });
    await expect(lastPoint).toContainText('X: 49, Y: 66');
    await expect(lastPoint).toContainText('#ff0000');

    // Offset 151 is pixel 50: the first blue column, with no blended color.
    await canvas.click({ position: { x: 151, y: 200 } });
    await expect(lastPoint).toContainText('X: 50, Y: 66');
    await expect(lastPoint).toContainText('#0000ff');

    // The very last rendered column is pixel 99, never an out-of-range 100.
    await canvas.click({ position: { x: 299, y: 299 } });
    await expect(lastPoint).toContainText('X: 99, Y: 99');
  });
});

test.describe('keyboard measurement', () => {
  test('arrow keys move the cursor and Enter saves a point', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page, RED_BLUE);

    await page.locator('#mainCanvas').focus();
    // The cursor starts at the image center (50, 50).
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Shift+ArrowDown');
    await expect(page.locator('#liveX')).toHaveText('53');
    await expect(page.locator('#liveY')).toHaveText('61');

    await page.keyboard.press('Enter');
    await expect(page.locator('.point-item')).toHaveCount(1);
    await expect(page.locator('.point-item')).toContainText('X: 53, Y: 61');
    await expect(page.locator('.point-item')).toContainText('#0000ff');
  });

  test('the cursor is clamped to the image bounds', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page, RED_BLUE);

    await page.locator('#mainCanvas').focus();
    for (let i = 0; i < 8; i++) await page.keyboard.press('Shift+ArrowLeft');
    await expect(page.locator('#liveX')).toHaveText('0');
  });
});

test.describe('confirm dialog keyboard safety', () => {
  test('Enter on a focused Cancel button keeps the points', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    await page.click('#btnClear');
    await page.locator('.dialog-box .btn-secondary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.dialog-overlay')).toHaveCount(0);
    await expect(page.locator('.point-item')).toHaveCount(2);
  });

  test('global shortcuts are ignored while the dialog is open', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    const canvas = page.locator('#mainCanvas');
    await canvas.click({ position: { x: 10, y: 10 } });
    await canvas.click({ position: { x: 40, y: 50 } });

    await page.click('#btnClear');
    await page.keyboard.press('Delete');
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Escape');
    await expect(page.locator('.dialog-overlay')).toHaveCount(0);
    await expect(page.locator('.point-item')).toHaveCount(2);
  });
});
