import { store, setState } from './state.js';
import { t } from './i18n.js';
import { renderCanvas } from './canvas.js';
import { distance } from './measurements.js';

export function addPoint(x, y, color) {
  setState({ points: [...store.points, { x, y, color }] });
  renderCanvas();
  updatePointsList();
  updateDistanceDisplay();
}

export function deletePoint(idx) {
  const newPoints = [...store.points];
  newPoints.splice(idx, 1);
  setState({ points: newPoints });
  renderCanvas();
  updatePointsList();
  updateDistanceDisplay();
}

export function clearAllPoints() {
  if (confirm(t('confirmClearAll'))) {
    setState({ points: [] });
    renderCanvas();
    updatePointsList();
    document.getElementById('distanceDisplay').classList.remove('active');
  }
}

export function updatePointsList() {
  const list = document.getElementById('pointsList');
  const { points } = store;

  if (points.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:#999;">${t('noPoints')}</p>`;
    return;
  }

  list.innerHTML = '';
  points.forEach((point, idx) => {
    const div = document.createElement('div');
    div.className = 'point-item';
    div.innerHTML = `
      <div>
        <strong>${t('point')} ${idx + 1}</strong><br>
        X: ${point.x}, Y: ${point.y}<br>
        <small>${point.color}</small>
      </div>
      <button class="delete-point" data-index="${idx}">❌</button>
    `;
    list.appendChild(div);
  });
}

export function updateDistanceDisplay() {
  const { points } = store;
  const displayEl = document.getElementById('distanceDisplay');
  if (points.length >= 2) {
    const dist = distance(points[points.length - 2], points[points.length - 1]);
    document.getElementById('distanceValue').textContent = dist;
    displayEl.classList.add('active');
  } else {
    displayEl.classList.remove('active');
  }
}
