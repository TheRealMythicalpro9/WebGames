// server.js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

let gameData = {
    board: Array(6).fill().map(() => Array(7).fill(null)), // 6 rows x 7 columns
    currentPlayer: 'red',
    players: []
};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add the player if there are less than 2 players
    if (gameData.players.length < 2) {
        gameData.players.push({ id: socket.id, color: gameData.players.length === 0 ? 'red' : 'yellow' });
        socket.emit('player-assigned', gameData.players[gameData.players.length - 1]);
    } else {
        socket.emit('game-full');
        socket.disconnect();
        return;
    }

    io.emit('update-board', gameData.board);

    // Handle a move
    socket.on('make-move', (column) => {
        const color = gameData.currentPlayer;
        for (let row = 5; row >= 0; row--) {
            if (!gameData.board[row][column]) {
                gameData.board[row][column] = color;
                gameData.currentPlayer = gameData.currentPlayer === 'red' ? 'yellow' : 'red';
                io.emit('update-board', gameData.board);
                io.emit('switch-player', gameData.currentPlayer);
                break;
            }
        }

        // Check for a winner
        const winner = checkWinner(gameData.board);
        if (winner) {
            io.emit('game-over', winner);
            resetGame();
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        gameData.players = gameData.players.filter((player) => player.id !== socket.id);
        resetGame();
    });
});

function checkWinner(board) {
    // Define a function to check for a winner in rows, columns, or diagonals
    const directions = [
        { x: 1, y: 0 }, { x: 0, y: 1 },
        { x: 1, y: 1 }, { x: 1, y: -1 }
    ];
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 7; x++) {
            if (!board[y][x]) continue;
            const color = board[y][x];
            for (let { x: dx, y: dy } of directions) {
                if (checkLine(x, y, dx, dy, color, board)) return color;
            }
        }
    }
    return null;
}

function checkLine(x, y, dx, dy, color, board) {
    for (let i = 0; i < 4; i++) {
        if (x + dx * i >= 7 || y + dy * i >= 6 || x + dx * i < 0 || y + dy * i < 0) return false;
        if (board[y + dy * i][x + dx * i] !== color) return false;
    }
    return true;
}

function resetGame() {
    gameData.board = Array(6).fill().map(() => Array(7).fill(null));
    gameData.currentPlayer = 'red';
    io.emit('update-board', gameData.board);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
