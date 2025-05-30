const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteDiv = document.getElementById("palette");

const TILE = 20;
let WIDTH, HEIGHT;
let grid = [];
let painted = [];
let palette = [];
let selectedColor = 1;

// Carrega progresso salvo
function loadProgress() {
  const saved = localStorage.getItem("painted");
  if (saved) {
    painted = JSON.parse(saved);
  }
}

function saveProgress() {
  localStorage.setItem("painted", JSON.stringify(painted));
}

Promise.all([
  fetch("static/grid.json").then(res => res.json()),
  fetch("static/paleta.json").then(res => res.json())
]).then(([gridData, paletteData]) => {
  grid = gridData;
  HEIGHT = grid.length;
  WIDTH = grid[0].length;
  painted = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  palette = paletteData;

  loadProgress();

  canvas.width = WIDTH * TILE;
  canvas.height = HEIGHT * TILE;

  palette.forEach((rgb, i) => {
    const btn = document.createElement("div");
    btn.classList.add("color-button");
    btn.style.backgroundColor = `rgb(${rgb.join(",")})`;
    btn.textContent = i + 1;
    btn.dataset.color = i + 1;
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
  if (confirm("Deseja realmente recomeçar e apagar todo o progresso?")) {
    painted = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
    saveProgress();
    draw();
  }
});

