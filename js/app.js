let currentLang = 'ar';
const translations = {
  ar: {
    mainTitle: 'ImageMetrics Tool',
    subtitle: 'أداة قياسات الصور - قياس الإحداثيات والمسافات بدقة',
    instrTitle: '📋 تعليمات الاستخدام:',
    instrList: [
      'ارفع صورة بالنقر أو السحب والإفلات',
      'انقر على الصورة لحفظ نقطة وإحداثياتها',
      'حرك الفأرة لمشاهدة الإحداثيات الحية',
      'اختر نقطتين لقياس المسافة بينهما',
      'صدّر النقاط إلى ملف CSV',
    ],
    uploadTitle: 'اسحب وأفلت الصورة هنا',
    uploadText: 'أو انقر للاختيار من جهازك',
    btnNewImage: '📁 صورة جديدة',
    btnExport: '💾 تصدير CSV',
    btnClear: '🗑️ مسح الكل',
    gridLabel: 'إظهار الشبكة',
    zoomLabel: 'تكبير:',
    liveCoordTitle: '📍 الإحداثيات الحية',
    savedPointsTitle: '📌 النقاط المحفوظة',
    noPoints: 'لا توجد نقاط محفوظة',
    distanceLabel: 'المسافة:',
    point: 'نقطة',
  },
  en: {
    mainTitle: 'ImageMetrics Tool',
    subtitle: 'Image Measurement Tool - Precise Coordinates and Distance Measurement',
    instrTitle: '📋 Instructions:',
    instrList: [
      'Upload an image by clicking or drag & drop',
      'Click on the image to save a point and its coordinates',
      'Move mouse to see live coordinates',
      'Select two points to measure distance',
      'Export points to CSV file',
    ],
    uploadTitle: 'Drag & Drop Image Here',
    uploadText: 'Or click to select from your device',
    btnNewImage: '📁 New Image',
    btnExport: '💾 Export CSV',
    btnClear: '🗑️ Clear All',
    gridLabel: 'Show Grid',
    zoomLabel: 'Zoom:',
    liveCoordTitle: '📍 Live Coordinates',
    savedPointsTitle: '📌 Saved Points',
    noPoints: 'No saved points',
    distanceLabel: 'Distance:',
    point: 'Point',
  },
};

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');
let img = null;
let points = [];
let showGrid = false;
let zoom = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
const colors = ['#d97757', '#cc6244', '#b85739', '#a34d30', '#8f4427', '#7a3b1f', '#663218'];

// Upload handlers
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file);
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      document.getElementById('canvasContainer').classList.add('active');
      points = [];
      zoom = 1;
      document.getElementById('zoomSlider').value = 100;
      document.getElementById('zoomValue').textContent = '100%';
      renderCanvas();
      updatePointsList();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderCanvas() {
  if (!img) return;

  // Set canvas size based on zoom
  canvas.width = img.width * zoom;
  canvas.height = img.height * zoom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (showGrid) {
    drawGrid();
  }

  points.forEach((point, idx) => {
    drawPoint(point.x * zoom, point.y * zoom, colors[idx % colors.length], idx + 1);
  });
}

function drawGrid() {
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

// Canvas drag to pan when zoomed
canvas.addEventListener('mousedown', (e) => {
  if (zoom > 1 && e.button === 0 && e.shiftKey) {
    isDragging = true;
    canvas.classList.add('grabbing');
    startX = e.pageX - canvasContainer.offsetLeft;
    startY = e.pageY - canvasContainer.offsetTop;
    scrollLeft = canvasContainer.scrollLeft;
    scrollTop = canvasContainer.scrollTop;
    e.preventDefault();
  }
});

canvasContainer.addEventListener('mousemove', (e) => {
  if (isDragging) {
    e.preventDefault();
    const x = e.pageX - canvasContainer.offsetLeft;
    const y = e.pageY - canvasContainer.offsetTop;
    const walkX = x - startX;
    const walkY = y - startY;
    canvasContainer.scrollLeft = scrollLeft - walkX;
    canvasContainer.scrollTop = scrollTop - walkY;
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    canvas.classList.remove('grabbing');
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!img || isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / zoom);
  const y = Math.round((e.clientY - rect.top) / zoom);

  document.getElementById('liveX').textContent = x;
  document.getElementById('liveY').textContent = y;

  const imgData = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
  const pixel = imgData.data;
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  const hex =
    '#' + [pixel[0], pixel[1], pixel[2]].map((c) => c.toString(16).padStart(2, '0')).join('');

  document.getElementById('liveRGB').textContent = rgb;
  document.getElementById('liveHEX').textContent = hex;
  document.getElementById('colorPreview').style.background = hex;
});

canvas.addEventListener('click', (e) => {
  if (!img || isDragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.round((e.clientX - rect.left) / zoom);
  const y = Math.round((e.clientY - rect.top) / zoom);

  const imgData = ctx.getImageData(e.clientX - rect.left, e.clientY - rect.top, 1, 1);
  const pixel = imgData.data;
  const hex =
    '#' + [pixel[0], pixel[1], pixel[2]].map((c) => c.toString(16).padStart(2, '0')).join('');

  points.push({ x, y, color: hex });
  renderCanvas();
  updatePointsList();
  calculateDistance();
});

function updatePointsList() {
  const list = document.getElementById('pointsList');

  if (points.length === 0) {
    list.innerHTML =
      '<p id="noPoints" style="text-align:center;color:#999;">' +
      translations[currentLang].noPoints +
      '</p>';
    return;
  }

  list.innerHTML = '';

  points.forEach((point, idx) => {
    const div = document.createElement('div');
    div.className = 'point-item';
    div.innerHTML = `
                    <div>
                        <strong>${translations[currentLang].point} ${idx + 1}</strong><br>
                        X: ${point.x}, Y: ${point.y}<br>
                        <small>${point.color}</small>
                    </div>
                    <button class="delete-point" data-index="${idx}">❌</button>
                `;
    list.appendChild(div);
  });
}

function deletePoint(idx) {
  points.splice(idx, 1);
  renderCanvas();
  updatePointsList();
  calculateDistance();
}

function clearAllPoints() {
  if (confirm(currentLang === 'ar' ? 'هل تريد حذف جميع النقاط؟' : 'Delete all points?')) {
    points = [];
    renderCanvas();
    updatePointsList();
    document.getElementById('distanceDisplay').classList.remove('active');
  }
}

function calculateDistance() {
  if (points.length >= 2) {
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    const distance = Math.round(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
    document.getElementById('distanceValue').textContent = distance;
    document.getElementById('distanceDisplay').classList.add('active');
  } else {
    document.getElementById('distanceDisplay').classList.remove('active');
  }
}

function exportToCSV() {
  if (points.length === 0) {
    alert(currentLang === 'ar' ? 'لا توجد نقاط لتصديرها' : 'No points to export');
    return;
  }

  let csv = 'Point,X,Y,Color\n';
  points.forEach((point, idx) => {
    csv += `${idx + 1},${point.x},${point.y},${point.color}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image_coordinates.csv';
  a.click();
}

function toggleGrid() {
  showGrid = document.getElementById('gridToggle').checked;
  renderCanvas();
}

function updateZoom(value) {
  zoom = value / 100;
  document.getElementById('zoomValue').textContent = value + '%';
  renderCanvas();
}

function toggleLanguage() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  document.querySelector('.lang-switch').textContent = currentLang === 'ar' ? 'English' : 'العربية';

  const t = translations[currentLang];
  document.getElementById('mainTitle').textContent = t.mainTitle;
  document.getElementById('subtitle').textContent = t.subtitle;
  document.getElementById('instrTitle').textContent = t.instrTitle;

  const instrList = document.getElementById('instrList');
  instrList.innerHTML = '';
  t.instrList.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    instrList.appendChild(li);
  });

  document.getElementById('uploadTitle').textContent = t.uploadTitle;
  document.getElementById('uploadText').textContent = t.uploadText;
  document.getElementById('btnNewImage').textContent = t.btnNewImage;
  document.getElementById('btnExport').textContent = t.btnExport;
  document.getElementById('btnClear').textContent = t.btnClear;
  document.getElementById('gridLabel').textContent = t.gridLabel;
  document.getElementById('zoomLabel').textContent = t.zoomLabel;
  document.getElementById('liveCoordTitle').textContent = t.liveCoordTitle;
  document.getElementById('savedPointsTitle').textContent = t.savedPointsTitle;
  document.getElementById('noPoints').textContent = t.noPoints;
  document.getElementById('distanceLabel').textContent = t.distanceLabel;

  updatePointsList();
}

// UI event listeners (previously inline onclick/onchange/oninput attributes)
document.querySelector('.lang-switch').addEventListener('click', toggleLanguage);
document.getElementById('btnNewImage').addEventListener('click', () => fileInput.click());
document.getElementById('btnExport').addEventListener('click', exportToCSV);
document.getElementById('btnClear').addEventListener('click', clearAllPoints);
document.getElementById('gridToggle').addEventListener('change', toggleGrid);
document.getElementById('zoomSlider').addEventListener('input', (e) => updateZoom(e.target.value));

// Event delegation for dynamically-rendered delete buttons in the points list
document.getElementById('pointsList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-point')) {
    deletePoint(parseInt(e.target.dataset.index, 10));
  }
});
