export type Lang = 'ar' | 'en';

export interface Point {
  x: number;
  y: number;
  color: string;
}

export interface Store {
  img: HTMLImageElement | null;
  points: Point[];
  zoom: number;
  showGrid: boolean;
  lang: Lang;
  isDragging: boolean;
}

export type Listener = (s: Store) => void;
export type Unsubscribe = () => boolean;

export type Translations = Record<string, string | string[]>;

export interface PixelColor {
  r: number;
  g: number;
  b: number;
  rgb: string;
  hex: string;
}
