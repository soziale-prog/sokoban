// --- ПОЛЯ И ЭЛЕМЕНТЫ ---
const field = document.getElementById("field");
const levelTitle = document.getElementById("levelTitle");
const winSound = document.getElementById("winSound");

// --- ПЕРЕМЕННЫЕ ИГРЫ ---
let map = [];
let px = 0;   // позиция игрока X
let py = 0;   // позиция игрока Y
let gameWon = false;

// --- ЧТЕНИЕ НОМЕРА УРОВНЯ ИЗ URL ---
const params = new URLSearchParams(location.search);
const levelNum = Number(params.get("level")) || 1;

levelTitle.textContent = "Уровень " + levelNum;

// --- ЗАГРУЗКА УРОВНЯ .LVL ---
fetch("levels/level" + levelNum + ".lvl")
  .then(r => r.json())
  .then(level => {
    map = level;
    findPlayerStart();
    setGridSize();
    draw();
  })
  .catch(err => {
    console.error("Ошибка загрузки уровня:", err);
    levelTitle.textContent = "Ошибка загрузки уровня!";
  });


// ----------------------------------------------------------------------
//  УСТАНОВКА РАЗМЕРА ПОЛЯ ПОД РАЗМЕРЫ КАРТЫ
// ----------------------------------------------------------------------
function setGridSize() {
  const rows = map.length;
  const cols = map[0].length;

  field.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
  field.style.gridTemplateRows = `repeat(${rows}, 50px)`;
}


// ----------------------------------------------------------------------
//  ПОИСК ИГРОКА В КАРТЕ (КОДЫ 5 и 6)
// ----------------------------------------------------------------------
function findPlayerStart() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {

      if (map[y][x] === 5 || map[y][x] === 6) {
        px = x;
        py = y;

        // игрок не должен оставаться в карте
        map[y][x] = (map[y][x] === 6) ? 3 : 0;
        return;
      }
    }
  }
}


// ----------------------------------------------------------------------
//  ФЛАГИ
// ----------------------------------------------------------------------
function isWall(v) { return v === 1; }
function hasStone(v) { return v === 2 || v === 4; }
function isTarget(v) { return v === 3 || v === 4; }


// ----------------------------------------------------------------------
//  ПРОРИСОВКА КАРТЫ
// ----------------------------------------------------------------------
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


// ----------------------------------------------------------------------
//  ПРОВЕРКА ПОБЕДЫ
// ----------------------------------------------------------------------
function checkWin() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === 3) return false;
    }
  }
  return true;
}


// ----------------------------------------------------------------------
//  УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДВИЖЕНИЯ
// ----------------------------------------------------------------------
function handleMove(direction) {
  if (gameWon) return;

  let dx = 0, dy = 0;

  if (direction === "ArrowLeft") dx = -1;
  if (direction === "ArrowRight") dx = 1;
  if (direction === "ArrowUp") dy = -1;
  if (direction === "ArrowDown") dy = 1;

  if (dx === 0 && dy === 0) return;

  const nx = px + dx;   // новая позиция игрока
  const ny = py + dy;

  // Столкновение со стеной
  if (isWall(map[ny][nx])) return;

  // Если там камень — пытаемся толкнуть
  if (hasStone(map[ny][nx])) {
    const sx = nx + dx;
    const sy = ny + dy;

    // Не можем толкнуть если впереди стена или камень
    if (isWall(map[sy][sx]) || hasStone(map[sy][sx])) return;

    // Убираем камень со старого места
    map[ny][nx] = (map[ny][nx] === 4) ? 3 : 0;

    // Ставим камень на новое место
    map[sy][sx] = (map[sy][sx] === 3) ? 4 : 2;
  }

  // Двигаем игрока
  px = nx;
  py = ny;

  draw();

  // Проверяем победу
  if (checkWin()) {
    gameWon = true;

    winSound.currentTime = 0;
    winSound.play().catch(() => { });

    setTimeout(() => alert("Победа!"), 200);
  }
}


// ----------------------------------------------------------------------
//  УПРАВЛЕНИЕ С КЛАВИАТУРЫ
// ----------------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  handleMove(e.key);
});


// ----------------------------------------------------------------------
//  УПРАВЛЕНИЕ С МОБИЛЬНЫХ КНОПОК
// ----------------------------------------------------------------------
function moveLeft() { handleMove("ArrowLeft"); }
function moveRight() { handleMove("ArrowRight"); }
function moveUp() { handleMove("ArrowUp"); }
function moveDown() { handleMove("ArrowDown"); }
