import { store } from './state.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';
import {
  distance,
  angleAt,
  pathLength,
  polygonArea,
  boundingBox,
  imageMetrics,
} from './measurements.js';
import { calibrateFromPixels, clearCalibration, formatLength, formatArea } from './calibration.js';
import { refreshPointsUI } from './points.js';

/**
 * @param {string} id
 * @param {string} value
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/** Refresh the image-level metrics (dimensions, aspect ratio, megapixels). */
export function updateImageMetrics() {
  const { img } = store;
  if (!img) {
    setText('imgDimensions', '-');
    setText('imgAspect', '-');
    setText('imgMegapixels', '-');
    return;
  }
  const m = imageMetrics(img.width, img.height);
  setText('imgDimensions', `${m.width} × ${m.height} px`);
  setText('imgAspect', m.aspectRatio);
  setText('imgMegapixels', `${m.megapixels} MP`);
}

/**
 * Refresh the geometry read-outs (angle, path length, polygon area, bounding
 * box) derived from the saved points and the active calibration.
 */
export function updateMeasurements() {
  const { points, calibration } = store;
  const dash = '-';

  setText('metricCount', String(points.length));

  // Angle at the middle of the last three saved points.
  if (points.length >= 3) {
    const n = points.length;
    setText('metricAngle', `${angleAt(points[n - 2], points[n - 3], points[n - 1])}°`);
  } else {
    setText('metricAngle', dash);
  }

  setText('metricPath', points.length >= 2 ? formatLength(pathLength(points), calibration) : dash);

  setText('metricArea', points.length >= 3 ? formatArea(polygonArea(points), calibration) : dash);

  const box = boundingBox(points);
  setText('metricBBox', box ? `${box.width} × ${box.height} px` : dash);
}

/** Reflect the current calibration state in its status line. */
export function updateCalibrationStatus() {
  const { calibration } = store;
  const resetBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById('btnCalReset'));
  if (calibration) {
    setText(
      'calStatus',
      `${t('calScaleLabel')} ${calibration.refPixels} px = ${calibration.refLength} ${calibration.unit}`
    );
    if (resetBtn) resetBtn.disabled = false;
  } else {
    setText('calStatus', t('calNotSet'));
    if (resetBtn) resetBtn.disabled = true;
  }
}

/** Refresh every metrics-panel read-out in one call. */
export function updateMetricsPanel() {
  updateImageMetrics();
  updateMeasurements();
  updateCalibrationStatus();
}

/** Read the real-world length entered by the user, or null when invalid. */
function readCalibrationLength() {
  const input = /** @type {HTMLInputElement | null} */ (document.getElementById('calLength'));
  if (!input) return null;
  const value = Number(input.value);
  return value > 0 ? value : null;
}

/** Apply a calibration from the last two saved points and the entered length. */
function handleCalibrate() {
  const { points } = store;
  if (points.length < 2) {
    showToast(t('calNeedTwoPoints'), 'warning');
    return;
  }
  const realLength = readCalibrationLength();
  if (realLength === null) {
    showToast(t('calInvalidLength'), 'warning');
    return;
  }
  const unitSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('calUnit'));
  const unit = unitSelect?.value ?? 'cm';
  const pixelDistance = distance(points[points.length - 2], points[points.length - 1]);

  if (!calibrateFromPixels(pixelDistance, realLength, unit)) {
    showToast(t('calZeroDistance'), 'warning');
    return;
  }
  // Distance/path/area read-outs all embed real units now, so refresh everything.
  refreshPointsUI();
  showToast(t('calApplied'), 'success');
}

/** Clear the active calibration and refresh dependent read-outs. */
function handleResetCalibration() {
  clearCalibration();
  refreshPointsUI();
}

/** Wire up the calibrate / reset buttons. Call once at startup. */
export function setupMetricsControls() {
  document.getElementById('btnCalibrate')?.addEventListener('click', handleCalibrate);
  document.getElementById('btnCalReset')?.addEventListener('click', handleResetCalibration);
}
