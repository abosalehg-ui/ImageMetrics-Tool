import { describe, it, expect } from 'vitest';
import { rgbToHex, getPixelColor } from '../../js/utils/color.js';

describe('rgbToHex', () => {
  it('converts pure black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  it('converts pure white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('converts pure red', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
  });

  it('converts pure green', () => {
    expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
  });

  it('converts pure blue', () => {
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
  });

  it('pads single-digit hex values with a leading zero', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203');
  });

  it('uses lowercase hex characters', () => {
    expect(rgbToHex(170, 187, 204)).toBe('#aabbcc');
  });

  it('handles the project brand color', () => {
    expect(rgbToHex(217, 119, 87)).toBe('#d97757');
  });
});

describe('getPixelColor', () => {
  /**
   * @param {number[]} bytes
   * @returns {Pick<CanvasRenderingContext2D, 'getImageData'>}
   */
  function mockCtx(bytes) {
    return {
      getImageData: (_x, _y, w, h) =>
        /** @type {ImageData} */ ({
          data: new Uint8ClampedArray(bytes),
          width: w,
          height: h,
          colorSpace: 'srgb',
        }),
    };
  }

  it('extracts color from a canvas context-like object', () => {
    const result = getPixelColor(mockCtx([255, 100, 50, 255]), 10, 20);
    expect(result.r).toBe(255);
    expect(result.g).toBe(100);
    expect(result.b).toBe(50);
    expect(result.rgb).toBe('rgb(255, 100, 50)');
    expect(result.hex).toBe('#ff6432');
  });

  it('returns black for fully transparent black pixel', () => {
    expect(getPixelColor(mockCtx([0, 0, 0, 0]), 0, 0).hex).toBe('#000000');
  });
});
