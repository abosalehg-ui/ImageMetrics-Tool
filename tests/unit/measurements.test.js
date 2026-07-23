import { describe, it, expect } from 'vitest';
import {
  distance,
  angleAt,
  pathLength,
  polygonArea,
  boundingBox,
  aspectRatio,
  imageMetrics,
} from '../../js/measurements.js';

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

describe('angleAt', () => {
  it('measures a right angle as 90 degrees', () => {
    // Arms along +x and +y from the origin.
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 })).toBe(90);
  });

  it('measures a straight line as 180 degrees', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 })).toBe(180);
  });

  it('measures coincident arms as 0 degrees', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 3, y: 0 })).toBe(0);
  });

  it('measures a 45 degree angle', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 })).toBe(45);
  });

  it('returns 0 when an arm has zero length', () => {
    expect(angleAt({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })).toBe(0);
  });

  it('is independent of arm length', () => {
    const near = angleAt({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 });
    const far = angleAt({ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 0, y: 50 });
    expect(near).toBe(far);
  });
});

describe('pathLength', () => {
  it('returns 0 for zero or one point', () => {
    expect(pathLength([])).toBe(0);
    expect(pathLength([{ x: 5, y: 5 }])).toBe(0);
  });

  it('equals the distance for two points', () => {
    expect(
      pathLength([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ])
    ).toBe(5);
  });

  it('sums consecutive segments', () => {
    // (0,0)->(3,4) = 5, (3,4)->(3,9) = 5, total 10.
    expect(
      pathLength([
        { x: 0, y: 0 },
        { x: 3, y: 4 },
        { x: 3, y: 9 },
      ])
    ).toBe(10);
  });
});

describe('polygonArea', () => {
  it('returns 0 for fewer than three points', () => {
    expect(polygonArea([])).toBe(0);
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ])
    ).toBe(0);
  });

  it('computes the area of a unit square scaled to 10x10', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];
    expect(polygonArea(square)).toBe(100);
  });

  it('computes the area of a right triangle', () => {
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ])
    ).toBe(6);
  });

  it('is independent of winding order', () => {
    const cw = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 0 },
    ];
    expect(polygonArea(cw)).toBe(100);
  });
});

describe('boundingBox', () => {
  it('returns null for no points', () => {
    expect(boundingBox([])).toBeNull();
  });

  it('wraps a single point with zero size', () => {
    expect(boundingBox([{ x: 7, y: 9 }])).toEqual({
      minX: 7,
      minY: 9,
      maxX: 7,
      maxY: 9,
      width: 0,
      height: 0,
    });
  });

  it('encloses all points', () => {
    const box = boundingBox([
      { x: 5, y: 20 },
      { x: 30, y: 4 },
      { x: 12, y: 40 },
    ]);
    expect(box).toEqual({ minX: 5, minY: 4, maxX: 30, maxY: 40, width: 25, height: 36 });
  });
});

describe('aspectRatio', () => {
  it('simplifies 1920x1080 to 16:9', () => {
    expect(aspectRatio(1920, 1080)).toBe('16:9');
  });

  it('simplifies a square to 1:1', () => {
    expect(aspectRatio(500, 500)).toBe('1:1');
  });

  it('simplifies 800x600 to 4:3', () => {
    expect(aspectRatio(800, 600)).toBe('4:3');
  });
});

describe('imageMetrics', () => {
  it('reports dimensions, aspect ratio, and megapixels', () => {
    expect(imageMetrics(1920, 1080)).toEqual({
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      megapixels: 2.07,
    });
  });
});
