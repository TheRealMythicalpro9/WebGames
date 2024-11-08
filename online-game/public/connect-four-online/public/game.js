const socket = io();

let player = null; // Will hold player information
let currentPlayer = 'red';

const statusDisplay = document.getElementById('status');
const gameBoard = document.getElementById('game-board');

function renderBoard(board) {
    gameBoard.innerHTML = ''; // Clear previous board
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell) cellElement.classList.add(cell);
            cellElement.dataset.column = x;
            cellElement.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cellElement);
        });
    });
}

function handleCellClick(event) {
    const column = event.target.dataset.column;
    if (player.color === currentPlayer) {
        socket.emit('make-move', parseInt(column));
    }
}

socket.on('player-assigned', (assignedPlayer) => {
    player = assignedPlayer;
    statusDisplay.innerText = `You are playing as ${player.color}`;
});

socket.on('update-board', (board) => {
    renderBoard(board);
});

socket.on('switch-player', (nextPlayer) => {
    currentPlayer = nextPlayer;
    statusDisplay.innerText = currentPlayer === player.color
        ? "Your turn!"
        : "Waiting for opponent...";
});

socket.on('game-over', (winner) => {
    statusDisplay.innerText = `${winner} wins!`;
});

socket.on('game-full', () => {
    statusDisplay.innerText = 'Game is full. Try again later.';
});
