import { store } from './state.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';
import { distance } from './measurements.js';
import { calibrateFromPixels, clearCalibration } from './calibration.js';
import { refreshPointsUI } from './render.js';

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
export function setupCalibrationControls() {
  document.getElementById('btnCalibrate')?.addEventListener('click', handleCalibrate);
  document.getElementById('btnCalReset')?.addEventListener('click', handleResetCalibration);
}
