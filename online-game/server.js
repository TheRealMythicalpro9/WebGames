// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected users
let users = {};

app.use(express.static('public'));

// Serve the homepage as the default page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/homepage.html');
});

// Serve the chat page
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

// Serve the player list page
app.get('/player-list', (req, res) => {
    res.sendFile(__dirname + '/public/player-list.html');
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    
    socket.on('setUsername', (username) => {
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
    });

    socket.on('chatMessage', (data) => {
        io.emit('chatMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
