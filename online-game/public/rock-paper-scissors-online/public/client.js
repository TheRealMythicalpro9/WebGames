const socket = io();
let username;

function joinGame() {
    username = document.getElementById('username').value;
    if (username) {
        socket.emit('joinGame', username);
        document.getElementById('username').style.display = 'none';
        document.querySelector('button').style.display = 'none';
        document.getElementById('game').style.display = 'block';
    }
}

function makeChoice(choice) {
    socket.emit('playerChoice', choice);
    document.getElementById('result').textContent = `You chose ${choice}. Waiting for the other player...`;
}

socket.on('gameResult', ({ result, choices }) => {
    document.getElementById('result').textContent = `${result}`;
    for (const player in choices) {
        document.getElementById('result').textContent += ` ${player} chose ${choices[player]}.`;
    }
});

socket.on('playerUpdate', (players) => {
    document.getElementById('playerList').textContent = `Players: ${players.join(', ')}`;
});

socket.on('message', (msg) => {
    document.getElementById('result').textContent = msg;
});
