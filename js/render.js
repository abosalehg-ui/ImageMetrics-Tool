import { renderCanvas } from './canvas.js';
import { updatePointsList, updateDistanceDisplay, updateHistoryButtons } from './pointsView.js';
import { updateMetricsPanel } from './metrics.js';

/**
 * Re-render the canvas and every point-derived view in one place. Anything
 * that changes points, calibration or the image calls this, so a new read-out
 * only has to be wired up here.
 */
export function refreshPointsUI() {
  renderCanvas();
  updatePointsList();
  updateDistanceDisplay();
  updateHistoryButtons();
  updateMetricsPanel();
}
