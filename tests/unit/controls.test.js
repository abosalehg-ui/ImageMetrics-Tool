import { describe, it, expect } from 'vitest';
import { clampZoom, ZOOM_MIN, ZOOM_MAX } from '../../js/controls.js';

describe('clampZoom', () => {
  it('keeps values within range unchanged', () => {
    expect(clampZoom(150)).toBe(150);
  });

  it('clamps below the minimum', () => {
    expect(clampZoom(10)).toBe(ZOOM_MIN);
  });

  it('clamps above the maximum', () => {
    expect(clampZoom(500)).toBe(ZOOM_MAX);
  });

  it('rounds fractional percentages', () => {
    expect(clampZoom(149.6)).toBe(150);
  });
});
