import { setState } from './state.js';
import { updatePointsList, updateDistanceDisplay, updateHistoryButtons } from './points.js';
import { updateMetricsPanel } from './metrics.js';
import { clearCalibration } from './calibration.js';
import { resetHistory } from './history.js';
import { setZoom, resetZoomCapWarning } from './controls.js';
import { t } from './i18n.js';
import { showToast } from './ui/toast.js';

/** Maximum accepted image file size (25 MB) before we refuse to load it. */
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export function setupUploadHandlers() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = /** @type {HTMLInputElement | null} */ (document.getElementById('fileInput'));
  if (!uploadZone || !fileInput) return;

  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) loadImage(file);
  });

  fileInput.addEventListener('change', (e) => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const file = target.files?.[0];
    if (file) loadImage(file);
    // Reset so selecting the same file again still fires a change event.
    target.value = '';
  });
}

/**
 * Validate a file is an acceptable image within the size limit.
 * @param {File} file
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function validateImageFile(file) {
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: t('errorNotImage') };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, reason: t('errorFileTooLarge') };
  }
  return { ok: true };
}

/** @param {File} file */
export function loadImage(file) {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    showToast(validation.reason, 'error');
    return;
  }

  // An object URL avoids base64-inflating the file into a ~33% larger string
  // held in memory for the whole session (what FileReader.readAsDataURL did).
  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onerror = () => {
    URL.revokeObjectURL(url);
    showToast(t('errorImageDecode'), 'error');
  };

  img.onload = () => {
    URL.revokeObjectURL(url);

    // A malformed/dimensionless SVG decodes "successfully" but yields a
    // zero-size image, which would otherwise produce a silently blank canvas.
    if (img.width === 0 || img.height === 0) {
      showToast(t('errorZeroDimension'), 'error');
      return;
    }

    document.getElementById('canvasContainer')?.classList.add('active');
    setState({ img, points: [] });
    // Calibration is tied to a specific image's pixel scale, so a new image
    // invalidates it.
    clearCalibration();
    resetHistory();
    resetZoomCapWarning();
    setZoom(100);
    updatePointsList();
    updateDistanceDisplay();
    updateHistoryButtons();
    updateMetricsPanel();
  };

  img.src = url;
}
