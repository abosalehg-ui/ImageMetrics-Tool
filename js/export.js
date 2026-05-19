import { store } from './state.js';
import { t } from './i18n.js';

export function pointsToCSV(points) {
  let csv = 'Point,X,Y,Color\n';
  points.forEach((point, idx) => {
    csv += `${idx + 1},${point.x},${point.y},${point.color}\n`;
  });
  return csv;
}

export function exportToCSV() {
  const { points } = store;
  if (points.length === 0) {
    alert(t('noPointsToExport'));
    return;
  }

  const csv = pointsToCSV(points);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image_coordinates.csv';
  a.click();
  URL.revokeObjectURL(url);
}
