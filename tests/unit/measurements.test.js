import { describe, it, expect } from 'vitest';
import { distance } from '../../js/measurements.js';

describe('distance', () => {
  it('returns 0 for identical points', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates Euclidean distance for a 3-4-5 right triangle', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('handles purely horizontal distance', () => {
    expect(distance({ x: 10, y: 5 }, { x: 25, y: 5 })).toBe(15);
  });

  it('handles purely vertical distance', () => {
    expect(distance({ x: 5, y: 10 }, { x: 5, y: 25 })).toBe(15);
  });

  it('rounds to the nearest integer', () => {
    // sqrt(2) ≈ 1.414 → 1
    expect(distance({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(1);
  });

  it('handles negative coordinates', () => {
    expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
  });

  it('is symmetric: d(a, b) === d(b, a)', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 4, y: 6 };
    expect(distance(a, b)).toBe(distance(b, a));
  });

  it('handles large coordinates without overflow', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3000, y: 4000 })).toBe(5000);
  });
});
