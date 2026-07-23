import { describe, it, expect } from 'vitest';
import { buildCalibration, formatNumber, formatLength, formatArea } from '../../js/calibration.js';

describe('buildCalibration', () => {
  it('derives units-per-pixel from a pixel distance and known length', () => {
    const cal = buildCalibration(200, 10, 'cm');
    expect(cal).toEqual({
      unitsPerPixel: 0.05,
      unit: 'cm',
      refPixels: 200,
      refLength: 10,
    });
  });

  it('returns null for a non-positive pixel distance', () => {
    expect(buildCalibration(0, 10, 'cm')).toBeNull();
    expect(buildCalibration(-5, 10, 'cm')).toBeNull();
  });

  it('returns null for a non-positive real length', () => {
    expect(buildCalibration(100, 0, 'cm')).toBeNull();
    expect(buildCalibration(100, -3, 'cm')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('trims trailing zeros', () => {
    expect(formatNumber(5)).toBe('5');
    expect(formatNumber(5.5)).toBe('5.5');
  });

  it('rounds to two decimals', () => {
    expect(formatNumber(1.23456)).toBe('1.23');
    expect(formatNumber(1.005)).toBe('1'); // rounds to 1.00 -> "1"
  });
});

describe('formatLength', () => {
  it('shows pixels only without a calibration', () => {
    expect(formatLength(150)).toBe('150 px');
    expect(formatLength(150, null)).toBe('150 px');
  });

  it('appends the real-world length when calibrated', () => {
    const cal = buildCalibration(100, 5, 'cm'); // 0.05 cm/px
    expect(formatLength(200, cal)).toBe('200 px · 10 cm');
  });

  it('rounds the pixel value', () => {
    expect(formatLength(149.6)).toBe('150 px');
  });
});

describe('formatArea', () => {
  it('shows square pixels only without a calibration', () => {
    expect(formatArea(10000)).toBe('10000 px²');
  });

  it('converts area using the squared pixel scale', () => {
    const cal = buildCalibration(100, 5, 'cm'); // 0.05 cm/px -> 0.0025 cm²/px²
    expect(formatArea(10000, cal)).toBe('10000 px² · 25 cm²');
  });
});
