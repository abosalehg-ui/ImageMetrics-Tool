import { describe, it, expect } from 'vitest';
import { pointsToCSV } from '../../js/export.js';

describe('pointsToCSV', () => {
  it('always includes the header row', () => {
    const csv = pointsToCSV([]);
    expect(csv).toBe('Point,X,Y,Color\n');
  });

  it('serializes a single point', () => {
    const csv = pointsToCSV([{ x: 100, y: 200, color: '#ff0000' }]);
    expect(csv).toBe('Point,X,Y,Color\n1,100,200,#ff0000\n');
  });

  it('numbers points starting from 1', () => {
    const csv = pointsToCSV([
      { x: 10, y: 20, color: '#aaa' },
      { x: 30, y: 40, color: '#bbb' },
      { x: 50, y: 60, color: '#ccc' },
    ]);
    const rows = csv.trim().split('\n');
    expect(rows[1]).toBe('1,10,20,#aaa');
    expect(rows[2]).toBe('2,30,40,#bbb');
    expect(rows[3]).toBe('3,50,60,#ccc');
  });

  it('produces one row per point plus the header', () => {
    const points = Array.from({ length: 5 }, (_, i) => ({
      x: i,
      y: i * 2,
      color: '#000000',
    }));
    const csv = pointsToCSV(points);
    expect(csv.trim().split('\n').length).toBe(6); // 1 header + 5 data rows
  });

  it('preserves point order', () => {
    const csv = pointsToCSV([
      { x: 99, y: 99, color: '#z1' },
      { x: 11, y: 11, color: '#z2' },
    ]);
    expect(csv).toContain('1,99,99,#z1');
    expect(csv).toContain('2,11,11,#z2');
  });
});
