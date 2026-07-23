export type Lang = 'ar' | 'en';

export interface Point {
  x: number;
  y: number;
  color: string;
}

export interface Calibration {
  /** Real-world units represented by a single pixel. */
  unitsPerPixel: number;
  /** Unit label, e.g. "cm". */
  unit: string;
  /** Pixel distance the calibration was measured from. */
  refPixels: number;
  /** Known real-world length the reference pixels map to. */
  refLength: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ImageMetrics {
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: number;
}

export interface Store {
  img: HTMLImageElement | null;
  points: Point[];
  zoom: number;
  showGrid: boolean;
  lang: Lang;
  isDragging: boolean;
  calibration: Calibration | null;
}

export type Translations = Record<string, string | string[]>;

export interface PixelColor {
  r: number;
  g: number;
  b: number;
  rgb: string;
  hex: string;
}
