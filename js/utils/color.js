/** @typedef {import('../types.d.ts').PixelColor} PixelColor */

/**
 * Convert RGB channel values (0-255) to a lowercase hex color string.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Read a single pixel's color from a canvas-like 2D context.
 * @param {Pick<CanvasRenderingContext2D, 'getImageData'>} ctx
 * @param {number} x
 * @param {number} y
 * @returns {PixelColor}
 */
export function getPixelColor(ctx, x, y) {
  const imgData = ctx.getImageData(x, y, 1, 1);
  const [r, g, b] = imgData.data;
  return {
    r,
    g,
    b,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hex: rgbToHex(r, g, b),
  };
}
