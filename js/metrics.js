import { store } from './state.js';
import { t } from './i18n.js';
import { angleAt, pathLength, polygonArea, boundingBox, imageMetrics } from './measurements.js';
import { formatLength, formatArea, formatNumber } from './calibration.js';

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
    const status = document.getElementById('calStatus');
    if (status) {
      // Keep the LTR scale ("52.2 px = 10 cm") in its own isolated run so an
      // Arabic label can't reorder it.
      const scale = document.createElement('bdi');
      scale.dir = 'ltr';
      scale.textContent = `${formatNumber(calibration.refPixels)} px = ${calibration.refLength} ${calibration.unit}`;
      status.replaceChildren(`${t('calScaleLabel')} `, scale);
    }
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
