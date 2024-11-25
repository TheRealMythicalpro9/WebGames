const COLS = 7;
const ROWS = 6;
const PLAYER = 'red';
const BOT = 'yellow';
let board = [];
let currentPlayer = PLAYER;
let botLevel = 'easy';
let gameOver = false;

const boardElement = document.getElementById('board');
const levelSelect = document.getElementById('level');

// Initialize the game board
function initBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    gameOver = false;
    currentPlayer = PLAYER;
    renderBoard();
}

// Render the game board
function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[row][col]) {
                cell.classList.add(board[row][col]);
            }
            // Bind click events only for the player's turn
            if (!gameOver && currentPlayer === PLAYER && !board[row][col]) {
                cell.addEventListener('click', () => playerMove(col));
            }
            boardElement.appendChild(cell);
        }
    }
}

// Handle the player's move
function playerMove(col) {
    if (gameOver || currentPlayer !== PLAYER) return; // Ensure it's the player's turn
    const row = getAvailableRow(col);
    if (row !== -1) {
        board[row][col] = PLAYER;
        renderBoard();
        if (checkWin(row, col, PLAYER)) {
            gameOver = true;
            setTimeout(() => alert('Player wins!'), 100);
            return;
        }
        currentPlayer = BOT; // Switch to bot's turn
        setTimeout(botMove, 500); // Delay for realism
    }
}

// Bot's move logic
function botMove() {
    if (gameOver || currentPlayer !== BOT) return; // Ensure it's the bot's turn
    const col = getBotMove();
    const row = getAvailableRow(col);
    if (row !== -1) {
        board[row][col] = BOT;
        renderBoard();
        if (checkWin(row, col, BOT)) {
            gameOver = true;
            setTimeout(() => alert('Bot wins!'), 100);
            return;
        }
        currentPlayer = PLAYER; // Switch to player's turn
        renderBoard(); // Update the board for the player's turn
    }
}

// Find the first available row in a column
function getAvailableRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return -1;
}

// Check for a win condition
function checkWin(row, col, player) {
    const directions = [
        { r: 0, c: 1 }, // Horizontal
        { r: 1, c: 0 }, // Vertical
        { r: 1, c: 1 }, // Diagonal (\)
        { r: -1, c: 1 }, // Diagonal (/)
    ];

    for (let { r, c } of directions) {
        let count = 1;

        // Check in one direction
        for (let i = 1; i < 4; i++) {
            const newRow = row + i * r;
            const newCol = col + i * c;
            if (
                newRow >= 0 &&
                newRow < ROWS &&
                newCol >= 0 &&
                newCol < COLS &&
                board[newRow][newCol] === player
            ) {
                count++;
            } else {
                break;
            }
        }

        // Check in the opposite direction
        for (let i = 1; i < 4; i++) {
            const newRow = row - i * r;
            const newCol = col - i * c;
            if (
                newRow >= 0 &&
                newRow < ROWS &&
                newCol >= 0 &&
                newCol < COLS &&
                board[newRow][newCol] === player
            ) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 4) return true;
    }

    return false;
}

// Bot's logic for selecting a move
function getBotMove() {
    if (botLevel === 'easy') {
        return getRandomColumn();
    } else if (botLevel === 'medium') {
        return mediumBotMove();
    } else if (botLevel === 'hard') {
        return hardBotMove();
    } else {
        return impossibleBotMove();
    }
}

// Easy bot: Random move
function getRandomColumn() {
    const availableCols = [];
    for (let col = 0; col < COLS; col++) {
        if (getAvailableRow(col) !== -1) {
            availableCols.push(col);
        }
    }
    return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Medium bot: Random move with basic logic
function mediumBotMove() {
    return getRandomColumn();
}

// Hard bot: Try to block the player or win
function hardBotMove() {
    // Check for a winning move
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = BOT;
            if (checkWin(row, col, BOT)) {
                board[row][col] = null; // Undo
                return col;
            }
            board[row][col] = null; // Undo
        }
    }

    // Check if the player can win in the next move and block it
    for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = PLAYER;
            if (checkWin(row, col, PLAYER)) {
                board[row][col] = null; // Undo
                return col;
            }
            board[row][col] = null; // Undo
        }
    }

    // Otherwise, pick a random column
    return getRandomColumn();
}

// Impossible bot: Minimax (simplified)
function impossibleBotMove() {
    return hardBotMove(); // Placeholder for a deeper strategy
}

// Set the bot level based on the dropdown
function setBotLevel() {
    botLevel = levelSelect.value;
}

// Reset the game
function resetGame() {
    initBoard();
}

// Initialize the board on page load
initBoard();
