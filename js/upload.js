import { setState } from './state.js';
import { renderCanvas, getCanvas } from './canvas.js';
import { updatePointsList } from './points.js';
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

  const reader = new FileReader();
  reader.onerror = () => showToast(t('errorReadFailed'), 'error');
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result !== 'string') {
      showToast(t('errorReadFailed'), 'error');
      return;
    }
    const img = new Image();
    img.onerror = () => showToast(t('errorImageDecode'), 'error');
    img.onload = () => {
      const canvas = getCanvas();
      canvas.width = img.width;
      canvas.height = img.height;
      document.getElementById('canvasContainer')?.classList.add('active');
      setState({ img, points: [], zoom: 1 });
      const slider = /** @type {HTMLInputElement | null} */ (document.getElementById('zoomSlider'));
      if (slider) slider.value = '100';
      const zoomValue = document.getElementById('zoomValue');
      if (zoomValue) zoomValue.textContent = '100%';
      renderCanvas();
      updatePointsList();
      document.getElementById('distanceDisplay')?.classList.remove('active');
    };
    img.src = result;
  };
  reader.readAsDataURL(file);
}
