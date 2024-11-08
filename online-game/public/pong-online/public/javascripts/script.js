// Canvas Related 
const { body } = document;
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const socket = io('/pong');
let isReferee = false;
let paddleIndex = 0;

let width = 375;
let height = 660;

const gameOverEl = document.createElement('div');
let isGameOver = false;
let isNewGame = true;

// Player
const namePlayerTop = 'Player 1';
const namePlayerBottom = 'Player 2';

// Room name
let roomName;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [ 225, 225 ];
let trajectoryX = [ 0, 0 ];

// Ball
let ballX = width / 2;
let ballY = height / 2;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 0;
let speedX = 0;

// Score for Both Players
let score = [ 0, 0 ];
const winningScore = 5;

// 
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

/**
 * Rendering
 */

function renderInitScreen() {
  // Container
  const initGameEl = document.createElement('div');
  initGameEl.setAttribute('id','init-screen_container');

  // Title
  const title = document.createElement('h1');
  title.classList.add('init-screen_title');
  title.textContent = `Pong Multiplayer`;

  // buttonGroup
  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('init-screen_buttonGroup');

  // Button
  const startGameBtnEl = document.createElement('button');
  startGameBtnEl.classList.add('init-screen_button');
  startGameBtnEl.setAttribute('onclick', 'loadGame()');
  startGameBtnEl.textContent = 'Enter Game Room'; 

  buttonGroup.append(startGameBtnEl);

  // footerGroup
  const footerGroup = document.createElement('div');
  footerGroup.classList.add('init-screen_footerGroup');

  // Text
  const footerTextEl = document.createElement('p');
  footerTextEl.classList.add('init-screen_footerText');
  footerTextEl.textContent = `Screen designed by Julian`;

  footerGroup.append(footerTextEl);

  // Append
  initGameEl.append(title, buttonGroup, footerGroup);
  body.appendChild(initGameEl);
}

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('style',`margin-top: ${Math.floor((window.innerHeight - height)/2)}px`)
  body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderWaitForOpponents() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = 'white';
  context.font = "24px Courier New";
  context.fillText('Waiting for PLAYERS...', canvas.width/2, canvas.height/2); 
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, height / 2);
  context.lineTo(500, height / 2);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(score[0], 20, (canvas.height / 2) + 40);
  context.textBaseline = 'middle';
  context.fillText(score[1], 20, (canvas.height / 2) - 40);

  // Playground Text
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.fillText(namePlayerTop, canvas.width/2, canvas.height * 3/16); 
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.fillText(namePlayerBottom, canvas.width/2, canvas.height * 13/16); 

  // Room name
  context.font = "16px Courier New";
  context.textBaseline = 'bottom';
  context.fillText(roomName, canvas.width/2, canvas.height/2);
  context.fillStyle = 'rgba(255, 255, 255, 0.3)';
}

function renderGameOver(winner) {
  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');

  // Box
  const boxEl = document.createElement('div');
  boxEl.classList.add('game-over-box');

  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;

  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'restartGame()');
  playAgainBtn.textContent = 'Play Again';

  // Append
  boxEl.append(title, playAgainBtn);
  gameOverEl.append(boxEl);
  body.appendChild(gameOverEl);
}

/**
 * Playground logic
 */

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  ballX += speedX;
  socket.emit('ballMove', {
    ballX,
    ballY,
    score
  });
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;

  speedY = 3;
  speedX = 0;

  socket.emit('ballMove', {
    ballX,
    ballY,
    score
  });
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff+ballRadius) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      speedY += 1;
      // Max Speed
      if (speedY > 5) {
        speedY = 5;
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff-ballRadius) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      speedY += 1;
      // Max Speed
      if (speedY > 5) {
        speedY = 5;
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      ballReset();
      score[0]++;
    }
  }
}

/**
 * Game logic
 */

// Load Game
function loadGame() {
  const initGameEl = document.querySelector('#init-screen_container');
  if (body.contains(initGameEl)) {
    body.removeChild(initGameEl);
  } 
  createCanvas();
  renderWaitForOpponents();
  socket.emit('ready');
}

function startGame() {
  paddleIndex = isReferee ? 0 : 1;

  speedY = 2;
  speedX = 0;

  requestAnimationFrame(animate);
  canvas.addEventListener('mousemove', (e) => {
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > (width - paddleWidth)) {
      paddleX[paddleIndex] = width - paddleWidth;
    }
    socket.emit('paddleMove', {
      xPosition: paddleX[paddleIndex]
    });
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// Game loop, called every frame
function animate() {
  if (isReferee) {
    ballMove();
    ballBoundaries();
  }
  renderCanvas();
  if (!isGameOver) {
    requestAnimationFrame(animate);
  }
  gameOver();
}

// Restart a game 
function restartGame() {
  if (body.contains(gameOverEl)) {
    body.removeChild(gameOverEl);
  }
  canvas.hidden = false;
  isGameOver = false;
  isNewGame = true;
  score = [0,0];
  createCanvas();
  socket.emit('restartGame');
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (score[0] === winningScore || score[1] === winningScore) {
    isGameOver = true;
    // Set Winner
    const winner = score[0] === winningScore ? `${namePlayerBottom}` : `${namePlayerTop}`;
    renderGameOver(winner);
  }
}

/**
 * Socket connection
 */

socket.on('connect', () => {
  console.log('Connected as socket id:', socket.id);
});

socket.on('startGame', ((refereeId, room) => {
  console.log('Start refereeId @room', refereeId, room);
  roomName = room;
  isReferee = socket.id === refereeId ? true : false;
  startGame();
}));

socket.on('restartGameReady', ((refereeId, room) => {
  renderWaitForOpponents();
}));

socket.on('opponentDisconnected', (() => {
  location.reload();
}));

socket.on('paddleMove', (paddleData) => {
  // toggle 1 into o, or 0 into 1
  const opponentPaddleIndex = 1 - paddleIndex;
  paddleX[opponentPaddleIndex] = paddleData.xPosition;
});

socket.on('ballMove', (ballData) => {
  ({ ballX, ballY, score } = ballData);
});

// On Load render inital screen
renderInitScreen();