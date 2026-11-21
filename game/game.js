// Spot the Difference Game
const canvasA = document.getElementById('canvasA');
const canvasB = document.getElementById('canvasB');
const ctxA = canvasA.getContext('2d');
const ctxB = canvasB.getContext('2d');
const foundEl = document.getElementById('found');
const totalEl = document.getElementById('total');
const timerEl = document.getElementById('timer');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const winEl = document.getElementById('win');
const winTimeEl = document.getElementById('winTime');
const nextBtn = document.getElementById('nextBtn');

let level = 1;
let found = 0;
let totalDiffs = 0;
let startTime = 0;
let timerInterval = null;
let hintsLeft = 3;
let diffs = [];
let foundMarkers = [];

// Scene definitions: each level has a set of differences
const levels = [
  {
    name: "Garden",
    bg: '#2d5a27',
    elements: [
      { type: 'circle', x: 100, y: 100, r: 30, color: '#ff6b6b' },
      { type: 'circle', x: 200, y: 150, r: 20, color: '#4ecdc4' },
      { type: 'circle', x: 300, y: 80, r: 25, color: '#ffe66d' },
      { type: 'circle', x: 400, y: 120, r: 35, color: '#ff6b6b' },
      { type: 'circle', x: 500, y: 90, r: 20, color: '#4ecdc4' },
      { type: 'rect', x: 80, y: 250, w: 60, h: 40, color: '#8b4513' },
      { type: 'rect', x: 180, y: 280, w: 80, h: 50, color: '#654321' },
      { type: 'rect', x: 350, y: 260, w: 70, h: 45, color: '#8b4513' },
      { type: 'rect', x: 480, y: 290, w: 90, h: 55, color: '#654321' },
      { type: 'triangle', x: 150, y: 350, size: 40, color: '#90ee90' },
      { type: 'triangle', x: 350, y: 340, size: 50, color: '#90ee90' },
      { type: 'triangle', x: 520, y: 360, size: 35, color: '#90ee90' },
    ],
    // Differences: index of element, and what changes
    diffs: [
      { elem: 0, change: 'color', value: '#4ecdc4' },
      { elem: 2, change: 'r', value: 35 },
      { elem: 5, change: 'color', value: '#654321' },
      { elem: 7, change: 'w', value: 90 },
      { elem: 9, change: 'size', value: 55 },
    ]
  },
  {
    name: "City",
    bg: '#1a1a3e',
    elements: [
      { type: 'rect', x: 50, y: 200, w: 80, h: 200, color: '#3498db' },
      { type: 'rect', x: 150, y: 150, w: 60, h: 250, color: '#e74c3c' },
      { type: 'rect', x: 230, y: 180, w: 70, h: 220, color: '#2ecc71' },
      { type: 'rect', x: 320, y: 120, w: 90, h: 280, color: '#f39c12' },
      { type: 'rect', x: 430, y: 160, w: 65, h: 240, color: '#9b59b6' },
      { type: 'rect', x: 510, y: 190, w: 75, h: 210, color: '#1abc9c' },
      { type: 'circle', x: 120, y: 80, r: 15, color: '#f1c40f' },
      { type: 'circle', x: 280, y: 60, r: 20, color: '#e67e22' },
      { type: 'circle', x: 450, y: 90, r: 15, color: '#f1c40f' },
      { type: 'circle', x: 550, y: 70, r: 25, color: '#e67e22' },
    ],
    diffs: [
      { elem: 0, change: 'h', value: 180 },
      { elem: 2, change: 'color', value: '#e74c3c' },
      { elem: 4, change: 'y', value: 140 },
      { elem: 6, change: 'r', value: 25 },
      { elem: 8, change: 'color', value: '#e67e22' },
    ]
  },
  {
    name: "Ocean",
    bg: '#006994',
    elements: [
      { type: 'circle', x: 100, y: 100, r: 40, color: '#ff6b6b' },
      { type: 'circle', x: 250, y: 150, r: 30, color: '#feca57' },
      { type: 'circle', x: 400, y: 80, r: 50, color: '#48dbfb' },
      { type: 'circle', x: 500, y: 200, r: 35, color: '#1dd1a1' },
      { type: 'rect', x: 50, y: 300, w: 100, h: 20, color: '#576574' },
      { type: 'rect', x: 200, y: 320, w: 120, h: 20, color: '#576574' },
      { type: 'rect', x: 400, y: 310, w: 90, h: 20, color: '#576574' },
      { type: 'triangle', x: 150, y: 250, size: 30, color: '#ff9ff3' },
      { type: 'triangle', x: 350, y: 280, size: 40, color: '#54a0ff' },
      { type: 'triangle', x: 520, y: 260, size: 35, color: '#5f27cd' },
    ],
    diffs: [
      { elem: 0, change: 'r', value: 55 },
      { elem: 2, change: 'color', value: '#ff6b6b' },
      { elem: 4, change: 'w', value: 130 },
      { elem: 7, change: 'size', value: 45 },
      { elem: 9, change: 'color', value: '#ff9ff3' },
    ]
  }
];

function drawScene(ctx, scene, isModified) {
  ctx.fillStyle = scene.bg;
  ctx.fillRect(0, 0, 600, 400);

  scene.elements.forEach((el, i) => {
    ctx.fillStyle = el.color;
    ctx.beginPath();

    if (el.type === 'circle') {
      ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
    } else if (el.type === 'rect') {
      ctx.rect(el.x, el.y, el.w, el.h);
    } else if (el.type === 'triangle') {
      ctx.moveTo(el.x, el.y - el.size);
      ctx.lineTo(el.x - el.size, el.y + el.size);
      ctx.lineTo(el.x + el.size, el.y + el.size);
      ctx.closePath();
    }
    ctx.fill();
  });

  // Apply differences for modified canvas
  if (isModified) {
    scene.diffs.forEach(d => {
      const el = scene.elements[d.elem];
      if (d.change === 'color') el.color = d.value;
      if (d.change === 'r') el.r = d.value;
      if (d.change === 'w') el.w = d.value;
      if (d.change === 'h') el.h = d.value;
      if (d.change === 'y') el.y = d.value;
      if (d.change === 'size') el.size = d.value;
    });
  }
}

function loadLevel() {
  const scene = levels[level - 1];
  if (!scene) return;

  // Reset elements to original
  scene.elements = JSON.parse(JSON.stringify(scene.originalElements || scene.elements));
  if (!scene.originalElements) {
    scene.originalElements = JSON.parse(JSON.stringify(scene.elements));
  }

  found = 0;
  foundMarkers = [];
  hintsLeft = 3;
  foundEl.textContent = '0';
  totalEl.textContent = scene.diffs.length;
  hintBtn.textContent = `Hint (${hintsLeft})`;
  hintBtn.disabled = false;

  drawScene(ctxA, scene, false);
  drawScene(ctxB, scene, true);

  // Clear any found markers
  document.querySelectorAll('.marker').forEach(m => m.remove());

  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  timerEl.textContent = `${mins}:${secs}`;
}

function handleClick(e, isCanvasB) {
  const canvas = isCanvasB ? canvasB : canvasA;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const scene = levels[level - 1];
  if (!scene) return;

  // Check if click is near a difference
  for (let i = 0; i < scene.diffs.length; i++) {
    if (foundMarkers.includes(i)) continue;

    const d = scene.diffs[i];
    const el = scene.elements[d.elem];
    let ex = el.x, ey = el.y;

    // Adjust for element type
    if (el.type === 'rect') {
      ex = el.x + (el.w || 0) / 2;
      ey = el.y + (el.h || 0) / 2;
    } else if (el.type === 'triangle') {
      ey = el.y;
    }

    const dist = Math.sqrt((x - ex) ** 2 + (y - ey) ** 2);
    if (dist < 40) {
      // Found!
      foundMarkers.push(i);
      found++;
      foundEl.textContent = found;

      // Add marker
      const marker = document.createElement('div');
      marker.className = 'marker';
      marker.style.left = (ex / scaleX) - 15 + 'px';
      marker.style.top = (ey / scaleY) - 15 + 'px';
      canvas.parentElement.appendChild(marker);

      // Check win
      if (found >= scene.diffs.length) {
        clearInterval(timerInterval);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        winTimeEl.textContent = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
        winEl.classList.remove('hidden');
      }
      return;
    }
  }
}

canvasA.addEventListener('click', (e) => handleClick(e, false));
canvasB.addEventListener('click', (e) => handleClick(e, true));

hintBtn.addEventListener('click', () => {
  if (hintsLeft <= 0) return;
  hintsLeft--;
  hintBtn.textContent = `Hint (${hintsLeft})`;
  if (hintsLeft <= 0) hintBtn.disabled = true;

  const scene = levels[level - 1];
  if (!scene) return;

  // Find first unfound difference
  for (let i = 0; i < scene.diffs.length; i++) {
    if (foundMarkers.includes(i)) continue;

    const d = scene.diffs[i];
    const el = scene.elements[d.elem];
    let ex = el.x, ey = el.y;

    if (el.type === 'rect') {
      ex = el.x + (el.w || 0) / 2;
      ey = el.y + (el.h || 0) / 2;
    }

    // Flash a hint circle
    const hint = document.createElement('div');
    hint.className = 'marker';
    hint.style.borderColor = '#ffd700';
    hint.style.left = (ex / (canvasB.getBoundingClientRect().width / canvasB.width)) - 15 + 'px';
    hint.style.top = (ey / (canvasB.getBoundingClientRect().height / canvasB.height)) - 15 + 'px';
    canvasB.parentElement.appendChild(hint);
    setTimeout(() => hint.remove(), 2000);
    return;
  }
});

restartBtn.addEventListener('click', () => {
  loadLevel();
});

nextBtn.addEventListener('click', () => {
  level = (level % levels.length) + 1;
  winEl.classList.add('hidden');
  loadLevel();
});

// Start
loadLevel();