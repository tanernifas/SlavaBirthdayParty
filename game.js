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
  y: canvas.height - 300, // Переместили игрока выше
  width: 50,
  height: 50,
  dy: 0,
  isJumping: false,
};

// Изображение игрока
const playerImage = new Image();
playerImage.src = 'player.png'; // Замените на ссылку на ваше изображение

// Препятствия
const obstacles = [];

// Счётчик очков
let score = 0;

// Таблица лидеров
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
const MAX_LEADERBOARD_ENTRIES = 5; // Максимальное количество записей в таблице лидеров

// Кнопка прыжка
const jumpButton = document.getElementById('jumpButton');

// Меню
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const settingsButton = document.getElementById('settingsButton');
const exitButton = document.getElementById('exitButton');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const leaderboardList = document.getElementById('leaderboard');

let isGameRunning = false;

// Загрузка изображения фона
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Замените на ссылку на ваше изображение
let backgroundX = 0;

// Telegram Bot API настройки
const TELEGRAM_BOT_TOKEN = '7976307147:AAGc20uHZOJCnQ_0Mu-0-ZXuuvywdHeC9UE'; // Замените на ваш токен
const TELEGRAM_CHAT_ID = '-1002491968585'; // Замените на ID вашего канала или чата

// Функция для отправки сообщения в Telegram
function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Ошибка отправки в Telegram:', response.statusText);
      }
    })
    .catch((error) => {
      console.error('Ошибка сети:', error);
    });
}

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

// Отрисовка игрока
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Отрисовка прямоугольника (для препятствий)
function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

// Отрисовка фона
function drawBackground() {
  ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

  // Движение фона
  backgroundX -= 2; // Скорость движения фона
  if (backgroundX <= -canvas.width) {
    backgroundX = 0; // Возвращаем фон в начальную позицию
  }
}

// Обновление состояния игрока
function updatePlayer() {
  // Гравитация
  player.dy += gravity;
  player.y += player.dy;

  // Проверка столкновения с землёй
  const groundLevel = canvas.height - 215; // Уровень земли теперь выше
  if (player.y + player.height >= groundLevel) {
    player.y = groundLevel - player.height;
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
  const y = canvas.height - 215 - height; // Подняли препятствия выше

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
  isGameRunning = false; // Останавливаем игру
  clearInterval(obstacleSpawnTimer); // Останавливаем генерацию препятствий
  obstacles.length = 0; // Очищаем массив препятствий
  menu.style.display = 'block'; // Показываем меню
  alert(`Игра окончена! Ваш счёт: ${score}`); // Выводим сообщение о конце игры

  // Добавляем результат в таблицу лидеров
  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a); // Сортируем по убыванию
  leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES); // Ограничиваем количество записей
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Сохраняем в localStorage

  updateLeaderboardDisplay(); // Обновляем отображение таблицы лидеров

  // Отправляем рекорд в Telegram
  const message = `🎮 Новый рекорд: ${score}! 🎉\nТоп-5 лидеров:\n${leaderboard.join('\n')}`;
  sendToTelegram(message);

  resetGame(); // Сбрасываем состояние игры
}

// Сброс состояния игры
function resetGame() {
  player.x = 100;
  player.y = canvas.height - 365; // Переместили игрока выше
  player.dy = 0;
  player.isJumping = false;

  score = 0; // Сбрасываем счёт
}

// Отрисовка счёта
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '24px Arial';
  ctx.fillText(`Счёт: ${score}`, 20, 30);
}

// Обновление отображения таблицы лидеров
function updateLeaderboardDisplay() {
  leaderboardList.innerHTML = ''; // Очищаем список
  leaderboard.forEach((score, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${index + 1}. ${score}`;
    leaderboardList.appendChild(listItem);
  });
}

// Основной игровой цикл
function gameLoop() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Отрисовка и обновление фона
  drawBackground();

  // Отрисовка и обновление игрока
  drawPlayer();
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
  obstacleSpawnTimer = setInterval(spawnObstacle, spawnInterval); // Генерация препятствий
  gameLoop();
}

// Логика кнопок меню
startButton.addEventListener('click', startGame);

settingsButton.addEventListener('click', () => {
  alert('Здесь могли бы быть настройки игры.');
});

exitButton.addEventListener('click', () => {
  if (confirm('Вы уверены, что хотите выйти?')) {
    window.close(); // Закрывает вкладку
  }
});

// Инициализация таблицы лидеров при загрузке страницы
updateLeaderboardDisplay();