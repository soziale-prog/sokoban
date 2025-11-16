const field = document.getElementById("field");
const title = document.getElementById("levelTitle");

let map = [];
let px = 0, py = 0;
let gameWon = false;

// --- читаем номер уровня из URL ---
const params = new URLSearchParams(location.search);
const levelNum = Number(params.get("level")) || 1;

title.textContent = "Уровень " + levelNum;

// загрузка файла .lvl
fetch("levels/level" + levelNum + ".lvl")
  .then(r => r.json())
  .then(level => {
    map = level;
    findPlayerStart();
    setGridSize();
    draw();
  });

// динамический размер поля
function setGridSize() {
  field.style.gridTemplateColumns = `repeat(${map[0].length}, 50px)`;
  field.style.gridTemplateRows = `repeat(${map.length}, 50px)`;
}

// поиск игрока (код 5 или 6)
function findPlayerStart() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {

      if (map[y][x] === 5 || map[y][x] === 6) {
        px = x;
        py = y;
        map[y][x] = (map[y][x] === 6) ? 3 : 0;
      }
    }
  }
}

function isWall(v) { return v === 1; }
function hasStone(v) { return v === 2 || v === 4; }
function isTarget(v) { return v === 3 || v === 4; }

// отрисовка карты
function draw() {
  field.innerHTML = "";

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {

      const cell = document.createElement("div");
      cell.classList.add("cell");

      const v = map[y][x];

      if (v === 1) cell.classList.add("wall");
      if (isTarget(v)) cell.classList.add("target");
      if (hasStone(v)) cell.classList.add("stone");
      if (x === px && y === py) cell.classList.add("player");

      field.appendChild(cell);
    }
  }
}

// победа
function checkWin() {
  return !map.some(row => row.includes(3));
}

// управление
document.addEventListener("keydown", e => {
  if (gameWon) return;

  let dx = 0, dy = 0;
  if (e.key === "ArrowLeft") dx = -1;
  if (e.key === "ArrowRight") dx = 1;
  if (e.key === "ArrowUp") dy = -1;
  if (e.key === "ArrowDown") dy = 1;

  if (!dx && !dy) return;

  const nx = px + dx;
  const ny = py + dy;

  if (isWall(map[ny][nx])) return;

  // толкаем камень
  if (hasStone(map[ny][nx])) {
    const sx = nx + dx, sy = ny + dy;

    if (isWall(map[sy][sx]) || hasStone(map[sy][sx])) return;

    map[ny][nx] = (map[ny][nx] === 4) ? 3 : 0;
    map[sy][sx] = (map[sy][sx] === 3) ? 4 : 2;
  }

  px = nx;
  py = ny;

  draw();

  if (checkWin()) {
    gameWon = true;

    // проигрываем звук победы
    const winSound = document.getElementById("winSound");
    winSound.currentTime = 0;
    winSound.play().catch(() => {
      // ВНИМАНИЕ:
      // браузер может запретить autoplay без клика,
      // но т.к. игрок уже нажал клавишу — звук разрешён
    });

    setTimeout(() => alert("Победа!"), 200);
  }

});
