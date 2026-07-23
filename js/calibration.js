import { setState } from './state.js';

/** @typedef {import('./types.d.ts').Calibration} Calibration */

/**
 * Real-world units the user can calibrate against. Values are treated as a
 * label only — a scale of `unitsPerPixel` is stored regardless of unit, so the
 * app never needs to know how, say, cm relates to inches.
 * @type {readonly string[]}
 */
export const UNITS = ['mm', 'cm', 'm', 'in', 'ft'];

/**
 * Build a calibration from a measured pixel distance and its known real-world
 * length, or null when either input is non-positive (which would yield a
 * meaningless or infinite scale). Pure — does not touch the store.
 * @param {number} pixelDistance
 * @param {number} realLength
 * @param {string} unit
 * @returns {Calibration | null}
 */
export function buildCalibration(pixelDistance, realLength, unit) {
  if (!(pixelDistance > 0) || !(realLength > 0)) return null;
  return {
    unitsPerPixel: realLength / pixelDistance,
    unit,
    refPixels: pixelDistance,
    refLength: realLength,
  };
}

/**
 * Store a calibration derived from a pixel distance and known length.
 * @param {number} pixelDistance
 * @param {number} realLength
 * @param {string} unit
 * @returns {boolean} whether a valid calibration was applied
 */
export function calibrateFromPixels(pixelDistance, realLength, unit) {
  const calibration = buildCalibration(pixelDistance, realLength, unit);
  if (!calibration) return false;
  setState({ calibration });
  return true;
}

/** Remove any active calibration, reverting measurements to pixels only. */
export function clearCalibration() {
  setState({ calibration: null });
}

/**
 * Format a number to at most two decimals with trailing zeros trimmed. Pure.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return Number(value.toFixed(2)).toString();
}

/**
 * Render a pixel length as text, appending the real-world equivalent when a
 * calibration is active. Pure.
 * @param {number} pixels
 * @param {Calibration | null} [calibration]
 * @returns {string}
 */
export function formatLength(pixels, calibration = null) {
  const base = `${Math.round(pixels)} px`;
  if (!calibration) return base;
  return `${base} · ${formatNumber(pixels * calibration.unitsPerPixel)} ${calibration.unit}`;
}

/**
 * Render a pixel area as text, appending the real-world equivalent (in squared
 * units) when a calibration is active. Pure.
 * @param {number} pixelArea
 * @param {Calibration | null} [calibration]
 * @returns {string}
 */
export function formatArea(pixelArea, calibration = null) {
  const base = `${Math.round(pixelArea)} px²`;
  if (!calibration) return base;
  const real = pixelArea * calibration.unitsPerPixel * calibration.unitsPerPixel;
  return `${base} · ${formatNumber(real)} ${calibration.unit}²`;
}
