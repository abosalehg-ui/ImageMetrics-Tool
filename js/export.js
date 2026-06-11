import { store } from './state.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';

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

export function exportToCSV() {
  const { points } = store;
  if (points.length === 0) {
    showToast(t('noPointsToExport'), 'warning');
    return;
  }

  const csv = pointsToCSV(points);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `image_coordinates_${timestampSlug()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('exportSuccess'), 'success');
}
