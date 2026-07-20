import { describe, it, expect } from 'vitest';
import { maxSafeZoomPercent, MAX_CANVAS_DIMENSION } from '../../js/canvas.js';

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
