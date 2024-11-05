const cells = document.querySelectorAll('.cell');
const difficultySelect = document.getElementById('difficulty');
let gameBoard = Array(9).fill(null);
let currentPlayer = 'X'; // Player is 'X', bot is 'O'
let botDifficulty = 'xxeasy'; // Default difficulty

difficultySelect.addEventListener('change', () => {
    botDifficulty = difficultySelect.value;
    resetGame();
});

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    const cellIndex = event.target.getAttribute('data-cell-index');

    // Prevent clicking on already filled cells or if game is over
    if (gameBoard[cellIndex] || checkWinner()) return;

    // Update the game board and UI
    gameBoard[cellIndex] = currentPlayer;
    event.target.innerText = currentPlayer;

    // Check for a winner after player move
    if (checkWinner()) {
        document.getElementById('gameStatus').innerText = `${currentPlayer} wins!`;
        return;
    }

    // Change turn to bot
    currentPlayer = 'O';
    botMove();
}

function botMove() {
    let botCellIndex;

    switch (botDifficulty) {
        case 'xxeasy':
            botCellIndex = getXXEasyMove();
            break;
        case 'easy':
            botCellIndex = getEasyMove();
            break;
        case 'medium':
            botCellIndex = getMediumMove();
            break;
        case 'hard':
            botCellIndex = getHardMove();
            break;
        case 'impossible':
            botCellIndex = getBestMove();
            break;
    }

    // Update the game board and UI
    if (botCellIndex !== null) {
        gameBoard[botCellIndex] = currentPlayer;
        cells[botCellIndex].innerText = currentPlayer;

        // Check for a winner after bot move
        if (checkWinner()) {
            document.getElementById('gameStatus').innerText = `${currentPlayer} wins!`;
            return;
        }

        // Change turn back to player
        currentPlayer = 'X';
        document.getElementById('gameStatus').innerText = "Your move...";
    }
}

function getXXEasyMove() {
    // Random move with no blocking
    return getRandomMove();
}

function getEasyMove() {
    // Random move with basic blocking
    const winningMove = findWinningMove('O');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Otherwise, random move
}

function getMediumMove() {
    // Tries to win, then blocks player, otherwise random
    const winningMove = findWinningMove('O');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Random move
}

function getHardMove() {
    // Smart blocking and winning
    const winningMove = findWinningMove('O');
    if (winningMove !== null) return winningMove; // Bot wins

    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) return blockingMove; // Block player

    return getRandomMove(); // Otherwise, random move
}

// Minimax for 'Impossible' bot remains the same
function getBestMove() {
    let bestValue = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = 'O'; // Assume the bot plays this move
            const moveValue = minimax(gameBoard, 0, false); // Get the minimax value
            gameBoard[i] = null; // Undo the move

            if (moveValue > bestValue) {
                bestMove = i;
                bestValue = moveValue;
            }
        }
    }
    return bestMove;
}

// Minimax algorithm implementation
function minimax(board, depth, isMaximizing) {
    const score = evaluateBoard(board);
    if (score === 10) return score - depth; // O wins
    if (score === -10) return score + depth; // X wins
    if (board.every(cell => cell !== null)) return 0; // Draw

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = null;
            }
        }
        return best;
    }
}

function evaluateBoard(board) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] === 'O' && board[b] === 'O' && board[c] === 'O') return 10; // O wins
        if (board[a] === 'X' && board[b] === 'X' && board[c] === 'X') return -10; // X wins
    }
    return 0; // No winner
}

// Random move helper
function getRandomMove() {
    const emptyCells = gameBoard.map((val, index) => (val === null ? index : null)).filter(v => v !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)]; // Randomly choose from empty cells
}

function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = player;
            if (checkWinner()) {
                gameBoard[i] = null; // Reset the cell
                return i; // Winning move found
            }
            gameBoard[i] = null; // Reset the cell
        }
    }
    return null; // No winning move
}

// Reset the game state
function resetGame() {
    gameBoard = Array(9).fill(null);
    currentPlayer = 'X'; // Reset player to 'X'
    cells.forEach(cell => {
        cell.innerText = '';
    });
    document.getElementById('gameStatus').innerText = "Your move...";
}

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === 'O' && gameBoard[b] === 'O' && gameBoard[c] === 'O') return true; // O wins
        if (gameBoard[a] === 'X' && gameBoard[b] === 'X' && gameBoard[c] === 'X') return true; // X wins
    }
    return false; // No winner
}
