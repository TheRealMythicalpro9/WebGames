const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { spawn } = require('child_process'); // Import child_process

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from the 'public' directory for the main app
app.use(express.static(path.join(__dirname, 'public')));

// Main route for the app (e.g., homepage, chat)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Game routes for each game (e.g., Pong, Tic-Tac-Toe, etc.)
const pongApp = express();
const ticTacToeApp = express();
const connectFourApp = express();
const rpsApp = express();  // Rock Paper Scissors

// Serve static files for each game
pongApp.use(express.static(path.join(__dirname, 'public/pong-online')));
ticTacToeApp.use(express.static(path.join(__dirname, 'public/tic-tac-toe-online')));
connectFourApp.use(express.static(path.join(__dirname, 'public/connect-four-online')));
rpsApp.use(express.static(path.join(__dirname, 'public/rock-paper-scissors-online')));

// Mount each game app on a different route
app.use('/pong', pongApp);
app.use('/tic-tac-toe', ticTacToeApp);
app.use('/connect-four', connectFourApp);
app.use('/rock-paper-scissors', rpsApp);

// Initialize Socket.IO namespaces for each game
const pongIo = io.of('/pong');
const ticTacToeIo = io.of('/tic-tac-toe');
const connectFourIo = io.of('/connect-four');
const rpsIo = io.of('/rock-paper-scissors');

// Example: Set up events for each namespace
pongIo.on('connection', (socket) => {
    console.log('A user connected to Pong: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from Pong: ' + socket.id);
    });
});

ticTacToeIo.on('connection', (socket) => {
    console.log('A user connected to Tic-Tac-Toe: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from Tic-Tac-Toe: ' + socket.id);
    });
});

connectFourIo.on('connection', (socket) => {
    console.log('A user connected to Connect Four: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from Connect Four: ' + socket.id);
    });
});

rpsIo.on('connection', (socket) => {
    console.log('A user connected to Rock Paper Scissors: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected from Rock Paper Scissors: ' + socket.id);
    });
});

// Function to start game servers as separate processes (but on the same port)
const gameServers = [
    { path: './public/pong-online/server.js' },
    { path: './public/tic-tac-toe-online/server/index.js' },
    { path: './public/connect-four-online/server.js' },
    { path: './public/rock-paper-scissors-online/server.js' }
];

// Function to start each game server process
function startGameServer(serverPath) {
    const gameProcess = spawn('node', [serverPath], {
        stdio: 'inherit' // Inherit main process's output for logs
    });

    gameProcess.on('error', (err) => {
        console.error(`Failed to start game server at ${serverPath}:`, err);
    });

    gameProcess.on('exit', (code) => {
        console.log(`Game server at ${serverPath} exited with code ${code}`);
    });
}

// Start each game server process (this will allow independent game logic)
gameServers.forEach(({ path }) => {
    startGameServer(path);
});

// Start the main server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Main server running on port ${PORT}`);
});

// Additional Routes (Optional) for extended functionality
app.get('/pong/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pong-online', 'game.html'));
});

app.get('/tic-tac-toe/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tic-tac-toe-online', 'game.html'));
});

app.get('/connect-four/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'connect-four-online', 'game.html'));
});

app.get('/rock-paper-scissors/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rock-paper-scissors-online', 'game.html'));
});

// Additional API routes for each game (Example)
app.get('/pong/api/status', (req, res) => {
    res.json({ status: 'Pong server is running' });
});

app.get('/tic-tac-toe/api/status', (req, res) => {
    res.json({ status: 'Tic-Tac-Toe server is running' });
});

app.get('/connect-four/api/status', (req, res) => {
    res.json({ status: 'Connect Four server is running' });
});

app.get('/rock-paper-scissors/api/status', (req, res) => {
    res.json({ status: 'Rock Paper Scissors server is running' });
});

// Middleware for logging requests (Optional)
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});
