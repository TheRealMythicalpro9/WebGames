const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 10, paddleHeight = 100;
const ballRadius = 10;
let ballSpeedX = 4, ballSpeedY = 4;

let playerY = canvas.height / 2 - paddleHeight / 2;
let botY = canvas.height / 2 - paddleHeight / 2;
let playerSpeed = 0;
let playerScore = 0;
let botScore = 0;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballDirection = Math.random() * 2 * Math.PI;
let botDifficulty = 'easy';
let isPaused = false;

// Initialize player paddle speed from slider value (1 to 25)
let playerPaddleSpeed = Number(document.getElementById("paddleSpeedSlider").value);

// Bot behavior for each difficulty
const paddleAI = {
    easy: { speed: 4, patternSpeed: 1 },
    medium: { speed: 6, missedRate: 0.3 },
    hard: { speed: 8, missedRate: 0 },
    impossible: { speed: 12, missedRate: 0, ballSpeedMultiplier: 1.1 }
};

// Draw paddles, ball, and UI
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player paddle
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, playerY, paddleWidth, paddleHeight);

    // Draw bot paddle
    ctx.fillRect(canvas.width - paddleWidth, botY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Display scores and settings
    document.getElementById("scoreboard").textContent = `Player: ${playerScore} | Bot: ${botScore}`;
    document.getElementById("difficulty").textContent = `Difficulty: ${botDifficulty.charAt(0).toUpperCase() + botDifficulty.slice(1)}`;
    document.getElementById("speedValue").textContent = document.getElementById("speedSlider").value;
    document.getElementById("paddleSpeedValue").textContent = document.getElementById("paddleSpeedSlider").value;
}

// Move paddles and apply AI logic
function movePaddles() {
    if (playerY + playerSpeed >= 0 && playerY + playerSpeed + paddleHeight <= canvas.height) {
        playerY += playerSpeed;
    }

    const bot = paddleAI[botDifficulty];
    let targetY = botY;

    switch (botDifficulty) {
        case 'easy':
            // Simple back-and-forth pattern
            if (botY <= 0 || botY + paddleHeight >= canvas.height) bot.patternSpeed *= -1;
            targetY = botY + bot.patternSpeed;
            break;

        case 'medium':
            // Follow the ball with occasional misses
            if (Math.random() > bot.missedRate) {
                targetY = ballY - paddleHeight / 2;
            }
            break;

        case 'hard':
            // Follow the ball exactly
            targetY = ballY - paddleHeight / 2;
            break;

        case 'impossible':
            // Perfect follow
            targetY = ballY - paddleHeight / 2;
            break;
    }

    // Smoothly move the bot paddle towards the target position
    const maxMove = bot.speed; // Maximum distance the paddle can move per frame
    botY += Math.sign(targetY - botY) * Math.min(maxMove, Math.abs(targetY - botY));

    // Ensure the paddle stays within the canvas bounds
    botY = Math.max(0, Math.min(canvas.height - paddleHeight, botY));
}

// Ball movement and collisions
function moveBall() {
    ballX += Math.cos(ballDirection) * ballSpeedX;
    ballY += Math.sin(ballDirection) * ballSpeedY;

    // Ball collision with top and bottom walls
    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballDirection = -ballDirection; // Reverse vertical direction
        ballY = Math.max(ballRadius, Math.min(canvas.height - ballRadius, ballY)); // Prevent clipping
    }

    // Player paddle collision
    if (
        ballX - ballRadius < paddleWidth &&
        ballY > playerY &&
        ballY < playerY + paddleHeight
    ) {
        ballDirection = Math.PI - ballDirection + (Math.random() - 0.5) * Math.PI / 4; // Add randomness
        ballSpeedX += 0.1; // Increment speed slightly
        ballX = paddleWidth + ballRadius; // Prevent clipping
    }

    // Bot paddle collision
    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > botY &&
        ballY < botY + paddleHeight
    ) {
        ballDirection = Math.PI - ballDirection + (Math.random() - 0.5) * Math.PI / 4; // Add randomness
        ballSpeedX += 0.1; // Increment speed slightly
        ballX = canvas.width - paddleWidth - ballRadius; // Prevent clipping
        if (botDifficulty === 'impossible') {
            ballSpeedX = Math.min(ballSpeedX * paddleAI.impossible.ballSpeedMultiplier, 25); // Limit speed
            ballSpeedY = Math.min(ballSpeedY * paddleAI.impossible.ballSpeedMultiplier, 12);
        }
    }

    // Scoring: Ball goes out of bounds
    if (ballX - ballRadius < 0) {
        botScore++;
        resetBall();
    } else if (ballX + ballRadius > canvas.width) {
        playerScore++;
        resetBall();
    }
}

// Reset ball after scoring
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDirection = Math.random() * 2 * Math.PI; // Random direction
    ballSpeedX = Number(document.getElementById("speedSlider").value); // Reset speed
    ballSpeedY = Number(document.getElementById("speedSlider").value); // Reset speed
}

// Update game state
function update() {
    if (isPaused) return;

    if (botDifficulty !== 'impossible') {
        ballSpeedX = document.getElementById("speedSlider").value;
        ballSpeedY = document.getElementById("speedSlider").value;
    }

    playerPaddleSpeed = Number(document.getElementById("paddleSpeedSlider").value);

    moveBall();
    movePaddles();
    draw();
}

// Game loop
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

// Event listeners for paddle control
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        playerSpeed = -playerPaddleSpeed;
    } else if (e.key === 'ArrowDown') {
        playerSpeed = playerPaddleSpeed;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        playerSpeed = 0;
    }
});

// Change difficulty dynamically
document.addEventListener('keydown', (e) => {
    if (e.key === '1') botDifficulty = 'easy';
    if (e.key === '2') botDifficulty = 'medium';
    if (e.key === '3') botDifficulty = 'hard';
    if (e.key === '4') botDifficulty = 'impossible';
});

// Start the game
gameLoop();
