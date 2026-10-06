import { describe, it, expect, beforeEach } from 'vitest';
import { setState } from '../../js/state.js';
import { updatePointsList, updateDistanceDisplay } from '../../js/pointsView.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div id="pointsList"></div>
    <div id="distanceDisplay"><span id="distanceValue"></span></div>`;
  setState({ points: [], calibration: null });
});

describe('updatePointsList', () => {
  it('gives every delete button an accessible name with the point number', () => {
    setState({
      points: [
        { x: 1, y: 2, color: '#ff0000' },
        { x: 3, y: 4, color: '#00ff00' },
      ],
    });
    updatePointsList();
    const buttons = document.querySelectorAll('.delete-point');
    expect(buttons).toHaveLength(2);
    expect(buttons[1].getAttribute('aria-label')).toBe('ariaDeletePoint 2');
    expect(buttons[1].getAttribute('type')).toBe('button');
  });

  it('shows the empty state when there are no points', () => {
    updatePointsList();
    expect(document.querySelector('#pointsList p')).not.toBeNull();
  });
});

describe('updateDistanceDisplay', () => {
  it('rounds for display while the underlying distance keeps precision', () => {
    setState({
      points: [
        { x: 0, y: 0, color: '#000000' },
        { x: 3, y: 2, color: '#000000' },
      ],
      calibration: { unitsPerPixel: 1, unit: 'cm', refPixels: 1, refLength: 1 },
    });
    updateDistanceDisplay();
    // 3.606 px → "4 px" for the pixel figure, but 3.61 cm from the true length.
    expect(document.getElementById('distanceValue')?.textContent).toBe('4 px · 3.61 cm');
  });
});
