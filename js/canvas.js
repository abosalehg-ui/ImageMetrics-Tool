import { store } from './state.js';
import { getPixelColor } from './utils/color.js';

/** @typedef {import('./types.d.ts').PixelColor} PixelColor */

const POINT_COLORS = ['#d97757', '#cc6244', '#b85739', '#a34d30', '#8f4427', '#7a3b1f', '#663218'];

/**
 * Conservative per-axis canvas size cap shared across major desktop browsers.
 * Exceeding a browser's internal canvas limit produces a silently blank
 * canvas rather than an error, so zoom is kept from ever pushing a rendered
 * dimension past this value.
 */
export const MAX_CANVAS_DIMENSION = 16384;

/** Total-pixel canvas limit of desktop Chrome/Firefox/Edge (16384²). */
export const DESKTOP_MAX_CANVAS_AREA = 16384 * 16384;

/**
 * Total-pixel canvas limit of Safari on iOS/iPadOS (4096²). Past this the
 * canvas silently renders blank, which a per-axis cap alone does not prevent.
 */
export const MOBILE_SAFARI_MAX_CANVAS_AREA = 4096 * 4096;

/**
 * The largest zoom percentage that keeps a rendered image within both the
 * per-axis limit and the given total-area limit. Pure function.
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @param {number} [maxArea]
 * @returns {number}
 */
export function maxSafeZoomPercent(imgWidth, imgHeight, maxArea = DESKTOP_MAX_CANVAS_AREA) {
  const longest = Math.max(imgWidth, imgHeight);
  if (longest <= 0) return 100;
  const byDimension = MAX_CANVAS_DIMENSION / longest;
  const byArea = Math.sqrt(maxArea / (imgWidth * imgHeight));
  return Math.floor(Math.min(byDimension, byArea) * 100);
}

/**
 * The canvas area limit for the current browser. iPadOS reports itself as a
 * Mac, so a touch-capable "Macintosh" is treated as iOS too.
 * @param {{ userAgent?: string, maxTouchPoints?: number }} [nav]
 * @returns {number}
 */
export function canvasAreaLimit(nav = globalThis.navigator) {
  const ua = nav?.userAgent ?? '';
  const isIOS =
    /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (nav?.maxTouchPoints ?? 0) > 1);
  return isIOS ? MOBILE_SAFARI_MAX_CANVAS_AREA : DESKTOP_MAX_CANVAS_AREA;
}

/**
 * Map an on-canvas offset (CSS px from the canvas edge) to the index of the
 * image pixel under it. Pixel `i` covers [i, i + 1) in image space, so this
 * floors rather than rounds, and clamps to the image so an offset on the very
 * last rendered column can never produce an out-of-range index. Pure.
 * @param {number} offset
 * @param {number} zoom
 * @param {number} size image width or height in pixels
 * @returns {number}
 */
export function toImagePixel(offset, zoom, size) {
  return Math.min(size - 1, Math.max(0, Math.floor(offset / zoom)));
}

/** Bottom layer: the image itself, redrawn only when the image or zoom changes. */
/** @type {HTMLCanvasElement | null} */
let imageCanvas = null;
/** @type {CanvasRenderingContext2D | null} */
let imageCtx = null;

/** Top layer: grid, points and cursor, cheap to redraw on every change. */
/** @type {HTMLCanvasElement | null} */
let overlay = null;
/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/** 1×1 scratch canvas used to read exact source pixels. */
/** @type {CanvasRenderingContext2D | null} */
let sampleCtx = null;

/** What the image layer currently shows, to skip redundant redraws. */
/** @type {HTMLImageElement | null} */
let renderedImage = null;
let renderedZoom = 0;

/**
 * @param {HTMLCanvasElement} imageEl bottom layer that shows the image
 * @param {HTMLCanvasElement} overlayEl top layer that receives pointer events
 */
export function initCanvas(imageEl, overlayEl) {
  imageCanvas = imageEl;
  imageCtx = imageEl.getContext('2d');
  overlay = overlayEl;
  ctx = overlayEl.getContext('2d');
}

/** @returns {HTMLCanvasElement} the interactive (top) canvas */
export function getCanvas() {
  if (!overlay) throw new Error('Canvas not initialized — call initCanvas() first');
  return overlay;
}

/**
 * Read the true color of image pixel (x, y) from the decoded source image, not
 * from the rendered canvas — so markers, grid lines and zoom scaling can never
 * leak into the reading. Returns null when no image is loaded.
 * @param {number} x
 * @param {number} y
 * @returns {PixelColor | null}
 */
export function samplePixel(x, y) {
  const { img } = store;
  if (!img) return null;
  if (!sampleCtx) {
    const scratch = document.createElement('canvas');
    scratch.width = 1;
    scratch.height = 1;
    sampleCtx = scratch.getContext('2d', { willReadFrequently: true });
    if (!sampleCtx) return null;
  }
  sampleCtx.imageSmoothingEnabled = false;
  sampleCtx.clearRect(0, 0, 1, 1);
  sampleCtx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
  return getPixelColor(sampleCtx, 0, 0);
}

/**
 * Set a canvas's pixel size, only when it actually changes — assigning width
 * or height reallocates the backing store even with an unchanged value.
 * @param {HTMLCanvasElement} el
 * @param {number} width
 * @param {number} height
 */
function resize(el, width, height) {
  if (el.width !== width) el.width = width;
  if (el.height !== height) el.height = height;
}

export function renderCanvas() {
  if (!imageCanvas || !imageCtx || !overlay || !ctx) return;
  const { img, zoom } = store;
  if (!img) return;

  if (img !== renderedImage || zoom !== renderedZoom) {
    const width = Math.max(1, Math.round(img.width * zoom));
    const height = Math.max(1, Math.round(img.height * zoom));
    resize(imageCanvas, width, height);
    resize(overlay, width, height);
    // Magnify with nearest-neighbour so each image pixel stays a crisp,
    // true-colored block; smooth only when shrinking.
    imageCtx.imageSmoothingEnabled = zoom < 1;
    imageCtx.clearRect(0, 0, width, height);
    imageCtx.drawImage(img, 0, 0, width, height);
    renderedImage = img;
    renderedZoom = zoom;
  }

  drawOverlay();
}

function drawOverlay() {
  if (!overlay || !ctx) return;
  const { zoom, showGrid, points, cursor } = store;
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  if (showGrid) drawGrid();

  drawConnections(points, zoom);

  points.forEach((point, idx) => {
    drawPoint(
      center(point.x, zoom),
      center(point.y, zoom),
      POINT_COLORS[idx % POINT_COLORS.length],
      idx + 1
    );
  });

  if (cursor) drawCursor(cursor.x, cursor.y, zoom);
}

/**
 * Canvas coordinate of the center of image pixel `v`.
 * @param {number} v
 * @param {number} zoom
 */
function center(v, zoom) {
  return (v + 0.5) * zoom;
}

/**
 * Draw the polyline through consecutive saved points, a dashed closing segment
 * that completes the polygon once three or more points exist, and a small arc
 * marking the interior angle at the middle of the last three points. These are
 * visual aids for the path-length, area, and angle metrics.
 * @param {import('./types.d.ts').Point[]} points
 * @param {number} zoom
 */
function drawConnections(points, zoom) {
  if (!ctx || points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(217, 119, 87, 0.85)';
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(center(points[0].x, zoom), center(points[0].y, zoom));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(center(points[i].x, zoom), center(points[i].y, zoom));
  }
  ctx.stroke();

  if (points.length >= 3) {
    const first = points[0];
    const last = points[points.length - 1];
    ctx.setLineDash([6 * zoom, 5 * zoom]);
    ctx.beginPath();
    ctx.moveTo(center(last.x, zoom), center(last.y, zoom));
    ctx.lineTo(center(first.x, zoom), center(first.y, zoom));
    ctx.stroke();
    ctx.setLineDash([]);

    drawAngleArc(points[points.length - 3], points[points.length - 2], last, zoom);
  }

  ctx.restore();
}

/**
 * Draw a short arc at `vertex` spanning the angle between the arms to `a` and
 * `b`, to visualise the angle read-out. No-op when either arm is degenerate.
 * @param {import('./types.d.ts').Point} a
 * @param {import('./types.d.ts').Point} vertex
 * @param {import('./types.d.ts').Point} b
 * @param {number} zoom
 */
function drawAngleArc(a, vertex, b, zoom) {
  if (!ctx) return;
  const a1 = Math.atan2(a.y - vertex.y, a.x - vertex.x);
  const a2 = Math.atan2(b.y - vertex.y, b.x - vertex.x);
  if (!Number.isFinite(a1) || !Number.isFinite(a2)) return;

  // Sweep the shorter way around so the arc traces the interior angle.
  let delta = a2 - a1;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = Math.max(1, 1.5 * zoom);
  ctx.arc(center(vertex.x, zoom), center(vertex.y, zoom), 18 * zoom, a1, a1 + delta, delta < 0);
  ctx.stroke();
}

function drawGrid() {
  if (!overlay || !ctx) return;
  const { zoom } = store;
  const gridSize = 50 * zoom;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  for (let x = 0; x < overlay.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, overlay.height);
    ctx.stroke();
  }

  for (let y = 0; y < overlay.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(overlay.width, y);
    ctx.stroke();
  }
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} number
 */
function drawPoint(x, y, color, number) {
  if (!ctx) return;
  const { zoom } = store;
  const radius = 8 * zoom;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.font = `bold ${12 * zoom}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(String(number), x, y + 4 * zoom);
}

/**
 * Keyboard cursor: a crosshair outlining the selected pixel, drawn twice
 * (dark under light) so it stays visible on any image.
 * @param {number} x
 * @param {number} y
 * @param {number} zoom
 */
function drawCursor(x, y, zoom) {
  if (!ctx) return;
  const cx = center(x, zoom);
  const cy = center(y, zoom);
  const arm = Math.max(10, 6 * zoom);
  const box = Math.max(zoom, 3);

  ctx.save();
  for (const [style, width] of [
    ['rgba(0, 0, 0, 0.8)', 3],
    ['rgba(255, 255, 255, 0.95)', 1],
  ]) {
    ctx.strokeStyle = /** @type {string} */ (style);
    ctx.lineWidth = /** @type {number} */ (width);
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy);
    ctx.lineTo(cx - box, cy);
    ctx.moveTo(cx + box, cy);
    ctx.lineTo(cx + arm, cy);
    ctx.moveTo(cx, cy - arm);
    ctx.lineTo(cx, cy - box);
    ctx.moveTo(cx, cy + box);
    ctx.lineTo(cx, cy + arm);
    ctx.stroke();
    ctx.strokeRect(x * zoom, y * zoom, zoom, zoom);
  }
  ctx.restore();
}
