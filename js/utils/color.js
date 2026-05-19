export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

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
