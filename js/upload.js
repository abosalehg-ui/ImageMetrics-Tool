import { setState } from './state.js';
import { renderCanvas, getCanvas } from './canvas.js';
import { updatePointsList } from './points.js';

export function setupUploadHandlers() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');

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
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });
}

export function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = getCanvas();
      canvas.width = img.width;
      canvas.height = img.height;
      document.getElementById('canvasContainer').classList.add('active');
      setState({ img, points: [], zoom: 1 });
      document.getElementById('zoomSlider').value = 100;
      document.getElementById('zoomValue').textContent = '100%';
      renderCanvas();
      updatePointsList();
      document.getElementById('distanceDisplay').classList.remove('active');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
