import { store } from './state.js';

const POINT_COLORS = ['#d97757', '#cc6244', '#b85739', '#a34d30', '#8f4427', '#7a3b1f', '#663218'];

/**
 * Conservative per-axis canvas size cap shared across major desktop browsers.
 * Exceeding a browser's internal canvas limit produces a silently blank
 * canvas rather than an error, so zoom is kept from ever pushing a rendered
 * dimension past this value.
 */
export const MAX_CANVAS_DIMENSION = 16384;

/**
 * The largest zoom percentage that keeps an image's longer axis within
 * MAX_CANVAS_DIMENSION once rendered. Pure function of the image size.
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @returns {number}
 */
export function maxSafeZoomPercent(imgWidth, imgHeight) {
  const longest = Math.max(imgWidth, imgHeight);
  if (longest <= 0) return 100;
  return Math.floor((MAX_CANVAS_DIMENSION / longest) * 100);
}

/** @type {HTMLCanvasElement | null} */
let canvas = null;

/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/** @param {HTMLCanvasElement} canvasEl */
export function initCanvas(canvasEl) {
  canvas = canvasEl;
  // Pixel colors are read on every mousemove/click via getImageData, so hint
  // the browser to avoid the GPU-readback penalty on repeated reads.
  ctx = canvas.getContext('2d', { willReadFrequently: true });
}

/** @returns {HTMLCanvasElement} */
export function getCanvas() {
  if (!canvas) throw new Error('Canvas not initialized — call initCanvas() first');
  return canvas;
}

/** @returns {CanvasRenderingContext2D} */
export function getContext() {
  if (!ctx) throw new Error('Canvas context not initialized — call initCanvas() first');
  return ctx;
}

export function renderCanvas() {
  if (!canvas || !ctx) return;
  const { img, zoom, showGrid, points } = store;
  if (!img) return;

  canvas.width = img.width * zoom;
  canvas.height = img.height * zoom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (showGrid) {
    drawGrid();
  }

  drawConnections(points, zoom);

  points.forEach((point, idx) => {
    drawPoint(point.x * zoom, point.y * zoom, POINT_COLORS[idx % POINT_COLORS.length], idx + 1);
  });
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
  ctx.moveTo(points[0].x * zoom, points[0].y * zoom);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * zoom, points[i].y * zoom);
  }
  ctx.stroke();

  if (points.length >= 3) {
    const first = points[0];
    const last = points[points.length - 1];
    ctx.setLineDash([6 * zoom, 5 * zoom]);
    ctx.beginPath();
    ctx.moveTo(last.x * zoom, last.y * zoom);
    ctx.lineTo(first.x * zoom, first.y * zoom);
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
  ctx.arc(vertex.x * zoom, vertex.y * zoom, 18 * zoom, a1, a1 + delta, delta < 0);
  ctx.stroke();
}

function drawGrid() {
  if (!canvas || !ctx) return;
  const { zoom } = store;
  const gridSize = 50 * zoom;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
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
