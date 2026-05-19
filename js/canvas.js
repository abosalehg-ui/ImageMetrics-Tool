import { store } from './state.js';

const POINT_COLORS = ['#d97757', '#cc6244', '#b85739', '#a34d30', '#8f4427', '#7a3b1f', '#663218'];

let canvas = null;
let ctx = null;

export function initCanvas(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
}

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return ctx;
}

export function renderCanvas() {
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

function drawPoint(x, y, color, number) {
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
  ctx.fillText(number, x, y + 4 * zoom);
}
