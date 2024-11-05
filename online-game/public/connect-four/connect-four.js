const boardElement = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const gameStatusElement = document.getElementById('gameStatus');

let board = Array.from({ length: 6 }, () => Array(7).fill(null));
let currentPlayer = 'red'; // Player is 'red', bot is 'yellow'
let botDifficulty = 'xxeasy'; // Default difficulty

difficultySelect.addEventListener('change', () => {
    botDifficulty = difficultySelect.value;
    resetGame();
});

// Initialize the board
function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.col = col; // Column index
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Handle player's move
function handleCellClick(event) {
    const col = parseInt(event.target.dataset.col);
    const row = getNextAvailableRow(col);

    if (row !== -1) {
        board[row][col] = currentPlayer;
        updateCell(row, col, currentPlayer);
        if (checkWinner(row, col)) {
            gameStatusElement.innerText = `${currentPlayer} wins!`;
            return;
        }
        currentPlayer = 'yellow'; // Change to bot
        gameStatusElement.innerText = "Bot's turn...";
        botMove();
    }
}

// Update cell visual
function updateCell(row, col, player) {
    const cellIndex = row * 7 + col;
    const cell = boardElement.children[cellIndex];
    cell.classList.add(player);
}

// Get next available row in the selected column
function getNextAvailableRow(col) {
    for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
            return row; // Return the first available row from the bottom
        }
    }
    return -1; // Column is full
}

// Bot's move based on difficulty
function botMove() {
    let botCol;

    switch (botDifficulty) {
        case 'xxeasy':
            botCol = getRandomMove();
            break;
        case 'easy':
            botCol = getEasyMove();
            break;
        case 'medium':
            botCol = getMediumMove();
            break;
        case 'hard':
            botCol = getHardMove();
            break;
        case 'impossible':
            botCol = getBestMove();
            break;
    }

    const row = getNextAvailableRow(botCol);
    if (row !== -1) {
        board[row][botCol] = currentPlayer;
        updateCell(row, botCol, currentPlayer);
        if (checkWinner(row, botCol)) {
            gameStatusElement.innerText = `${currentPlayer} wins!`;
            return;
        }
        currentPlayer = 'red'; // Change to player
        gameStatusElement.innerText = "Your turn...";
    }
}

// Reset the game state
function resetGame() {
    board = Array.from({ length: 6 }, () => Array(7).fill(null));
    currentPlayer = 'red'; // Reset player to 'red'
    gameStatusElement.innerText = "Your turn...";
    createBoard();
}

// Create a random move for the bot
function getRandomMove() {
    const availableCols = [];
    for (let col = 0; col < 7; col++) {
        if (board[0][col] === null) availableCols.push(col); // Check if top cell is empty
    }
    return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Easy bot logic - random move with basic blocking
function getEasyMove() {
    const winningMove = findWinningMove('yellow');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('red');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Otherwise, random move
}

// Medium bot logic - tries to win, then blocks player, otherwise random
function getMediumMove() {
    const winningMove = findWinningMove('yellow');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('red');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Random move
}

// Hard bot logic - smart blocking and winning
function getHardMove() {
    const winningMove = findWinningMove('yellow');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('red');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Random move
}

// Impossible bot logic using Minimax algorithm
function getBestMove() {
    let bestValue = -Infinity;
    let bestMove = null;

    for (let col = 0; col < 7; col++) {
        const row = getNextAvailableRow(col);
        if (row !== -1) {
            board[row][col] = 'yellow'; // Assume the bot plays this move
            const moveValue = minimax(board, 0, false);
            board[row][col] = null; // Undo the move

            if (moveValue > bestValue) {
                bestMove = col;
                bestValue = moveValue;
            }
        }
    }
    return bestMove;
}

// Minimax algorithm implementation
function minimax(board, depth, isMaximizing) {
    const score = evaluateBoard(board);
    if (score === 10) return score - depth; // Bot wins
    if (score === -10) return score + depth; // Player wins
    if (board.every(row => row.every(cell => cell !== null))) return 0; // Draw

    if (isMaximizing) {
        let best = -Infinity;
        for (let col = 0; col < 7; col++) {
            const row = getNextAvailableRow(col);
            if (row !== -1) {
                board[row][col] = 'yellow';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[row][col] = null; // Undo the move
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let col = 0; col < 7; col++) {
            const row = getNextAvailableRow(col);
            if (row !== -1) {
                board[row][col] = 'red';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[row][col] = null; // Undo the move
            }
        }
        return best;
    }
}

// Evaluate the board for scoring
function evaluateBoard(board) {
    const directions = [
        { r: 1, c: 0 },  // Vertical
        { r: 0, c: 1 },  // Horizontal
        { r: 1, c: 1 },  // Diagonal \
        { r: 1, c: -1 }  // Diagonal /
    ];

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            for (const { r, c } of directions) {
                let count = 0;
                for (let i = 0; i < 4; i++) {
                    const rPos = row + i * r;
                    const cPos = col + i * c;
                    if (rPos >= 0 && rPos < 6 && cPos >= 0 && cPos < 7) {
                        if (board[rPos][cPos] === 'yellow') count++;
                        else if (board[rPos][cPos] === 'red') count--;
                    }
                }
                if (count === 4) return 10; // Bot wins
                if (count === -4) return -10; // Player wins
            }
        }
    }
    return 0; // No winner yet
}

// Check if there's a winner
function checkWinner(row, col) {
    const directions = [
        { r: 1, c: 0 },  // Vertical
        { r: 0, c: 1 },  // Horizontal
        { r: 1, c: 1 },  // Diagonal \
        { r: 1, c: -1 }  // Diagonal /
    ];

    for (const { r, c } of directions) {
        let count = 1;
        // Check in one direction
        for (let i = 1; i < 4; i++) {
            const rPos = row + i * r;
            const cPos = col + i * c;
            if (rPos >= 0 && rPos < 6 && cPos >= 0 && cPos < 7 && board[rPos][cPos] === currentPlayer) {
                count++;
            } else break;
        }
        // Check in the opposite direction
        for (let i = 1; i < 4; i++) {
            const rPos = row - i * r;
            const cPos = col - i * c;
            if (rPos >= 0 && rPos < 6 && cPos >= 0 && cPos < 7 && board[rPos][cPos] === currentPlayer) {
                count++;
            } else break;
        }
        if (count >= 4) return true; // Winner found
    }
    return false; // No winner
}

// Start the game
createBoard();
