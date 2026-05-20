/**
 * Euclidean distance between two 2D points, rounded to nearest integer.
 * @param {{ x: number, y: number }} p1
 * @param {{ x: number, y: number }} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  return Math.round(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
}
