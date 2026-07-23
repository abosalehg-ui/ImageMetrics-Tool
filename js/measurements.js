/** @typedef {import('./types.d.ts').BoundingBox} BoundingBox */
/** @typedef {import('./types.d.ts').ImageMetrics} ImageMetrics */

/**
 * Euclidean distance between two 2D points, rounded to nearest integer.
 * @param {{ x: number, y: number }} p1
 * @param {{ x: number, y: number }} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  return Math.round(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
}

/**
 * Interior angle (in degrees, rounded) at `vertex` between the arms reaching
 * out to `a` and `b`. Returns a value in [0, 180]; yields 0 when either arm has
 * zero length (the angle is undefined). Pure.
 * @param {{ x: number, y: number }} vertex
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 * @returns {number}
 */
export function angleAt(vertex, a, b) {
  const v1x = a.x - vertex.x;
  const v1y = a.y - vertex.y;
  const v2x = b.x - vertex.x;
  const v2y = b.y - vertex.y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) return 0;
  // Clamp guards against floating-point drift pushing the ratio past ±1.
  const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / (mag1 * mag2)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

/**
 * Total length of the open polyline through `points`, i.e. the sum of the
 * distances between consecutive points, rounded to nearest integer. Returns 0
 * for fewer than two points. Pure.
 * @param {{ x: number, y: number }[]} points
 * @returns {number}
 */
export function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return Math.round(total);
}

/**
 * Area of the closed polygon whose vertices are `points`, via the shoelace
 * formula, rounded to nearest integer. Returns 0 for fewer than three points.
 * The result is unsigned, so winding order does not matter. Pure.
 * @param {{ x: number, y: number }[]} points
 * @returns {number}
 */
export function polygonArea(points) {
  const n = points.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return Math.round(Math.abs(sum) / 2);
}

/**
 * Axis-aligned bounding box enclosing every point, or null when empty. Pure.
 * @param {{ x: number, y: number }[]} points
 * @returns {BoundingBox | null}
 */
export function boundingBox(points) {
  if (points.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * Greatest common divisor of two non-negative integers (Euclid's algorithm).
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Simplified aspect-ratio string like "16:9" for the given pixel dimensions.
 * Falls back to "width:height" when the two share no common factor. Pure.
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
export function aspectRatio(width, height) {
  const divisor = gcd(width, height) || 1;
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

/**
 * Summary metrics for an image of the given pixel dimensions. Megapixels are
 * rounded to two decimals. Pure.
 * @param {number} width
 * @param {number} height
 * @returns {ImageMetrics}
 */
export function imageMetrics(width, height) {
  return {
    width,
    height,
    aspectRatio: aspectRatio(width, height),
    megapixels: Math.round(((width * height) / 1e6) * 100) / 100,
  };
}
