import { store } from './state.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';
import { pathLength, polygonArea, boundingBox, imageMetrics } from './measurements.js';

/** @typedef {import('./types.d.ts').Point} Point */

/**
 * Escape a single CSV field per RFC 4180: wrap in double quotes and double any
 * embedded quotes when the value contains a comma, quote, or newline. Pure.
 * @param {string | number} value
 * @returns {string}
 */
export function escapeCsvField(value) {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serialize an array of points into a CSV string. Pure function.
 * @param {Point[]} points
 * @returns {string}
 */
export function pointsToCSV(points) {
  let csv = 'Point,X,Y,Color\n';
  points.forEach((point, idx) => {
    const row = [idx + 1, point.x, point.y, point.color].map(escapeCsvField).join(',');
    csv += `${row}\n`;
  });
  return csv;
}

/**
 * Build a filename-safe timestamp like 2026-06-11_14-30-05.
 * @param {Date} [date]
 * @returns {string}
 */
export function timestampSlug(date = new Date()) {
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  );
}

/**
 * Serialize points plus optional metadata (image info, calibration, computed
 * measurements) into a pretty-printed JSON string. Pure — the caller supplies
 * any non-deterministic metadata such as timestamps.
 * @param {Point[]} points
 * @param {Record<string, unknown>} [meta]
 * @returns {string}
 */
export function pointsToJSON(points, meta = {}) {
  const payload = {
    ...meta,
    pointCount: points.length,
    points: points.map((point, idx) => ({
      index: idx + 1,
      x: point.x,
      y: point.y,
      color: point.color,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Trigger a browser download of `content` as a file named `filename`.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV() {
  const { points } = store;
  if (points.length === 0) {
    showToast(t('noPointsToExport'), 'warning');
    return;
  }

  const csv = pointsToCSV(points);
  downloadFile(csv, `image_coordinates_${timestampSlug()}.csv`, 'text/csv');
  showToast(t('exportSuccess'), 'success');
}

/**
 * Export points together with the full measurement context (image metrics,
 * calibration, path length, polygon area, bounding box) as a JSON file.
 */
export function exportToJSON() {
  const { points, img, calibration } = store;
  if (points.length === 0) {
    showToast(t('noPointsToExport'), 'warning');
    return;
  }

  /** @type {Record<string, unknown>} */
  const meta = {
    generatedAt: new Date().toISOString(),
  };
  if (img) meta.image = imageMetrics(img.width, img.height);
  if (calibration) meta.calibration = calibration;
  meta.measurements = {
    pathLength: pathLength(points),
    polygonArea: polygonArea(points),
    boundingBox: boundingBox(points),
  };

  const json = pointsToJSON(points, meta);
  downloadFile(json, `image_metrics_${timestampSlug()}.json`, 'application/json');
  showToast(t('exportSuccess'), 'success');
}
