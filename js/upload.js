import { setState } from './state.js';
import { renderCanvas, getCanvas } from './canvas.js';
import { updatePointsList } from './points.js';

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
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const file = target.files?.[0];
    if (file) loadImage(file);
  });
}

/** @param {File} file */
export function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result !== 'string') return;
    const img = new Image();
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
