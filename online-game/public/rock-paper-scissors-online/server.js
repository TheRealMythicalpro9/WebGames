const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let choices = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinGame', (username) => {
        players[socket.id] = username;
        socket.emit('message', `Welcome, ${username}!`);
        io.emit('playerUpdate', Object.values(players));
    });

    socket.on('playerChoice', (choice) => {
        choices[socket.id] = choice;
        if (Object.keys(choices).length === 2) {
            determineWinner();
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete choices[socket.id];
        io.emit('playerUpdate', Object.values(players));
        console.log(`User disconnected: ${socket.id}`);
    });

    function determineWinner() {
        const [player1, player2] = Object.keys(choices);
        const choice1 = choices[player1];
        const choice2 = choices[player2];

        let result;
        if (choice1 === choice2) {
            result = "It's a tie!";
        } else if (
            (choice1 === 'rock' && choice2 === 'scissors') ||
            (choice1 === 'scissors' && choice2 === 'paper') ||
            (choice1 === 'paper' && choice2 === 'rock')
        ) {
            result = `${players[player1]} wins!`;
        } else {
            result = `${players[player2]} wins!`;
        }

        io.emit('gameResult', { result, choices: { [players[player1]]: choice1, [players[player2]]: choice2 } });
        choices = {};
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
