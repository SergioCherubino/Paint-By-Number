const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const paletteDiv = document.getElementById("palette");

const TILE = 20;
let WIDTH, HEIGHT;
let grid = [];
let painted = [];
let palette = [];
let selectedColor = 1;

// Obter caminhos salvos ou usar padrão
const GRID_PATH = localStorage.getItem("gridPath") || "static/grid.json";
const PALETTE_PATH = localStorage.getItem("palettePath") || "static/paleta.json";
const STORAGE_KEY = localStorage.getItem("progressKey") || "paintbynumber_progress";

// Carregar os dados JSON
Promise.all([
  fetch(GRID_PATH).then(res => res.json()),
  fetch(PALETTE_PATH).then(res => res.json())
]).then(([gridData, paletteData]) => {
  grid = gridData;
  HEIGHT = grid.length;
  WIDTH = grid[0].length;

  painted = loadProgress() || Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  palette = paletteData;

  canvas.width = WIDTH * TILE;
  canvas.height = HEIGHT * TILE;
  document.getElementById("grid-size").innerText = `Tamanho do Grid: ${WIDTH} x ${HEIGHT}`;


  buildPalette();
  draw();
});

function buildPalette() {
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
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / TILE);
  const y = Math.floor((e.clientY - rect.top) / TILE);

  if (grid[y][x] === selectedColor) {
    floodFill(x, y, grid[y][x]);
    saveProgress();
    draw();
  }
});

// Algoritmo de preenchimento por inundação (flood fill)
function floodFill(x, y, targetNumber) {
  const visited = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false));
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();

    if (
      cx >= 0 && cx < WIDTH &&
      cy >= 0 && cy < HEIGHT &&
      !visited[cy][cx] &&
      grid[cy][cx] === targetNumber
    ) {
      visited[cy][cx] = true;
      painted[cy][cx] = selectedColor;

      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }
  }
}

document.getElementById("resetButton").addEventListener("click", () => {
  if (confirm("Deseja recomeçar e apagar todo o progresso?")) {
    painted = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
    saveProgress();
    draw();
  }
});

document.getElementById("backButton").addEventListener("click", () => {
  window.location.href = "index.html";
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const px = x * TILE;
      const py = y * TILE;

      if (painted[y][x] > 0) {
        const rgb = palette[painted[y][x] - 1];
        ctx.fillStyle = `rgb(${rgb.join(",")})`;
        ctx.fillRect(px, py, TILE, TILE);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = "#000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(grid[y][x], px + TILE / 2, py + TILE / 2);
      }

      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(px, py, TILE, TILE);
    }
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(painted));
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}
