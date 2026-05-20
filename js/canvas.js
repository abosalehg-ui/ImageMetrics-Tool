import { store } from './state.js';

const POINT_COLORS = ['#d97757', '#cc6244', '#b85739', '#a34d30', '#8f4427', '#7a3b1f', '#663218'];

/** @type {HTMLCanvasElement | null} */
let canvas = null;

/** @type {CanvasRenderingContext2D | null} */
let ctx = null;

/** @param {HTMLCanvasElement} canvasEl */
export function initCanvas(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
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

  points.forEach((point, idx) => {
    drawPoint(point.x * zoom, point.y * zoom, POINT_COLORS[idx % POINT_COLORS.length], idx + 1);
  });
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
