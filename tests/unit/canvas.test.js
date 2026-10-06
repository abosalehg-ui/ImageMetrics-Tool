import { describe, it, expect } from 'vitest';
import {
  maxSafeZoomPercent,
  canvasAreaLimit,
  toImagePixel,
  MAX_CANVAS_DIMENSION,
  DESKTOP_MAX_CANVAS_AREA,
  MOBILE_SAFARI_MAX_CANVAS_AREA,
} from '../../js/canvas.js';

describe('maxSafeZoomPercent', () => {
  it('allows full zoom range for small images', () => {
    expect(maxSafeZoomPercent(800, 600)).toBeGreaterThanOrEqual(300);
  });

  it('caps zoom so the longer axis stays within MAX_CANVAS_DIMENSION', () => {
    const longest = 10000;
    const result = maxSafeZoomPercent(longest, 5000);
    expect(Math.floor(longest * (result / 100))).toBeLessThanOrEqual(MAX_CANVAS_DIMENSION);
  });

  it('uses the longer of the two axes', () => {
    expect(maxSafeZoomPercent(20000, 100)).toBe(maxSafeZoomPercent(100, 20000));
  });

  it('falls back to 100 for a zero-size image', () => {
    expect(maxSafeZoomPercent(0, 0)).toBe(100);
  });
});

describe('maxSafeZoomPercent area limit', () => {
  it('caps zoom so total pixels stay within the given area', () => {
    // A 12 MP phone photo on iOS Safari (4096² area limit).
    const percent = maxSafeZoomPercent(4032, 3024, MOBILE_SAFARI_MAX_CANVAS_AREA);
    const scale = percent / 100;
    expect(4032 * scale * (3024 * scale)).toBeLessThanOrEqual(MOBILE_SAFARI_MAX_CANVAS_AREA);
    expect(percent).toBe(117);
  });

  it('defaults to the desktop area limit', () => {
    expect(maxSafeZoomPercent(4032, 3024)).toBe(
      maxSafeZoomPercent(4032, 3024, DESKTOP_MAX_CANVAS_AREA)
    );
    expect(maxSafeZoomPercent(4032, 3024)).toBeGreaterThanOrEqual(300);
  });
});

describe('canvasAreaLimit', () => {
  it('uses the mobile Safari limit on iPhone', () => {
    expect(canvasAreaLimit({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })).toBe(
      MOBILE_SAFARI_MAX_CANVAS_AREA
    );
  });

  it('treats a touch-capable Macintosh (iPadOS) as iOS', () => {
    expect(canvasAreaLimit({ userAgent: 'Mozilla/5.0 (Macintosh)', maxTouchPoints: 5 })).toBe(
      MOBILE_SAFARI_MAX_CANVAS_AREA
    );
  });

  it('uses the desktop limit for a desktop Mac and other browsers', () => {
    expect(canvasAreaLimit({ userAgent: 'Mozilla/5.0 (Macintosh)', maxTouchPoints: 0 })).toBe(
      DESKTOP_MAX_CANVAS_AREA
    );
    expect(canvasAreaLimit({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })).toBe(
      DESKTOP_MAX_CANVAS_AREA
    );
  });
});

describe('toImagePixel', () => {
  it('floors instead of rounding: pixel i covers [i, i + 1)', () => {
    // At 300% zoom, offset 149 is inside pixel 49 (147–150), not 50.
    expect(toImagePixel(149, 3, 100)).toBe(49);
    expect(toImagePixel(150, 3, 100)).toBe(50);
  });

  it('never returns an index past the last pixel', () => {
    expect(toImagePixel(299.9, 3, 100)).toBe(99);
    expect(toImagePixel(300, 3, 100)).toBe(99);
  });

  it('never returns a negative index', () => {
    expect(toImagePixel(-0.5, 1, 100)).toBe(0);
  });

  it('maps correctly when zoomed out', () => {
    expect(toImagePixel(10, 0.5, 100)).toBe(20);
  });
});
