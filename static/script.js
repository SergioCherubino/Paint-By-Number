const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteDiv = document.getElementById("palette");

const TILE = 20;
let WIDTH, HEIGHT;
let grid = [];
let painted = [];
let palette = [];
let selectedColor = 1;

const STORAGE_KEY = "paintbynumber_progress";

// Carregar os dados JSON
Promise.all([
  fetch("static/grid.json").then(res => res.json()),
  fetch("static/paleta.json").then(res => res.json())
]).then(([gridData, paletteData]) => {
  grid = gridData;
  HEIGHT = grid.length;
  WIDTH = grid[0].length;
  painted = loadProgress() || Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  palette = paletteData;

  canvas.width = WIDTH * TILE;
  canvas.height = HEIGHT * TILE;

  // Preencher a paleta visual
  paletteDiv.innerHTML = "";
  palette.forEach((rgb, i) => {
    const btn = document.createElement("div");
    btn.classList.add("color-button");
    btn.style.backgroundColor = `rgb(${rgb.join(",")})`;
    btn.dataset.color = i + 1;
    btn.innerText = i + 1;
    if (i + 1 === selectedColor) btn.classList.add("selected");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".color-button").forEach(el => el.classList.remove("selected"));
      btn.classList.add("selected");
      selectedColor = i + 1;
    });
    paletteDiv.appendChild(btn);
  });

  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const rectX = x * TILE;
      const rectY = y * TILE;
      if (painted[y][x]) {
        ctx.fillStyle = `rgb(${palette[painted[y][x] - 1].join(",")})`;
        ctx.fillRect(rectX, rectY, TILE, TILE);
      } else {
        ctx.fillStyle = "white";
        ctx.fillRect(rectX, rectY, TILE, TILE);
        ctx.fillStyle = "black";
        ctx.font = "8px Arial";
        ctx.fillText(grid[y][x], rectX + 2, rectY + 8);
      }
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(rectX, rectY, TILE, TILE);
    }
  }
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const gx = Math.floor(mx / TILE);
  const gy = Math.floor(my / TILE);
  if (gx >= 0 && gx < WIDTH && gy >= 0 && gy < HEIGHT) {
    if (grid[gy][gx] === selectedColor) {
      painted[gy][gx] = selectedColor;
      saveProgress();
      draw();
    }
  }
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (confirm("Deseja recomeçar e apagar todo o progresso?")) {
    painted = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
    saveProgress();
    draw();
  }
});

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(painted));
}

function loadProgress() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}


