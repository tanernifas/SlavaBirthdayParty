// Настройки игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravity = 0.5;
const jumpStrength = -12;
const obstacleSpeed = 6;
const spawnInterval = 1000; // Интервал появления препятствий (в миллисекундах)

// Игрок
const player = {
  x: 100,
  y: canvas.height - 150,
  width: 50,
  height: 50,
  color: 'red',
  dy: 0,
  isJumping: false,
};

// Препятствия
const obstacles = [];

// Счётчик очков
let score = 0;

// Кнопка прыжка
const jumpButton = document.getElementById('jumpButton');

// Меню
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const settingsButton = document.getElementById('settingsButton');
const exitButton = document.getElementById('exitButton');

let isGameRunning = false;

// Обработка нажатий клавиш и кнопки
function handleJump() {
  if (!player.isJumping) {
    player.dy = jumpStrength;
    player.isJumping = true;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') handleJump();
});

jumpButton.addEventListener('touchstart', handleJump); // Для сенсорных устройств
jumpButton.addEventListener('mousedown', handleJump); // Для мыши

// Отрисовка прямоугольника
function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

// Обновление состояния игрока
function updatePlayer() {
  // Гравитация
  player.dy += gravity;
  player.y += player.dy;

  // Проверка столкновения с землёй
  if (player.y + player.height >= canvas.height) {
    player.y = canvas.height - player.height;
    player.isJumping = false;
  }

  // Ограничение по вертикали
  if (player.y < 0) {
    player.y = 0;
    player.dy = 0;
  }
}

// Создание нового препятствия
function spawnObstacle() {
  const width = Math.random() * 50 + 20; // Случайная ширина
  const height = Math.random() * 50 + 20; // Случайная высота
  const x = canvas.width;
  const y = canvas.height - height;

  obstacles.push({ x, y, width, height, color: 'brown' });
}

// Обновление препятствий
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

    // Движение препятствия
    obstacle.x -= obstacleSpeed;

    // Удаление препятствия, если оно вышло за экран
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
      score++; // Увеличиваем счётчик за преодолённое препятствие
    }

    // Проверка столкновения с игроком
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y + player.height > obstacle.y
    ) {
      gameOver();
    }
  }
}

// Конец игры
function gameOver() {
  alert(`Игра окончена! Ваш счёт: ${score}`);
  document.location.reload(); // Перезагрузка страницы
}

// Отрисовка счёта
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Счёт: ${score}`, 20, 30);
}

// Основной игровой цикл
function gameLoop() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Отрисовка и обновление игрока
  drawRect(player);
  updatePlayer();

  // Отрисовка и обновление препятствий
  obstacles.forEach(drawRect);
  updateObstacles();

  // Отрисовка счёта
  drawScore();

  requestAnimationFrame(gameLoop);
}

// Запуск игры
function startGame() {
  isGameRunning = true;
  menu.style.display = 'none'; // Скрываем меню
  setInterval(spawnObstacle, spawnInterval); // Генерация препятствий
  gameLoop();
}

// Логика кнопок меню
startButton.addEventListener('click', startGame);

settingsButton.addEventListener('click', () => {
  alert('Здесь скоро будут рекорды.');
});

exitButton.addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    window.close(); // Закрывает вкладку
  }
});