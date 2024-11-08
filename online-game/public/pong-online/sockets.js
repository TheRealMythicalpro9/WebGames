let readyPlayerCount = 0;

function listen(io) {
    const pongNamespace = io.of('/pong');
    pongNamespace.on('connection', (socket) => {
        let room;

        console.log('A user is connected id:', socket.id);

        socket.on('ready', () => {
            room = 'GameRoom_' + Math.floor(readyPlayerCount / 2);

            socket.join(room);

            console.log('Player ready [namespace/id/room]:', socket.nsp.name, socket.id, room);

            readyPlayerCount++;

            if (pongNamespace.adapter.rooms.get(room).size % 2 === 0) {
                //brodcast game
                pongNamespace.in(room).emit('startGame', socket.id, room);
                console.log('Start game [namespace/room]:', socket.nsp.name, room);
            }
        });

        socket.on('restartGame', () => {
            if (!pongNamespace.adapter.rooms.get(room)) {
                console.log(`Client ${socket.id} disconnected.`);
                socket.to(room).emit('opponentDisconnected');
                socket.leave(room);
            } else {
                const clientIds = pongNamespace.adapter.rooms.get(room);

                if (clientIds.has(socket.id)) {
                    pongNamespace.adapter.rooms.get(room).restartPlayerCount = pongNamespace.adapter.rooms.get(room).restartPlayerCount+1 || 1;
                    pongNamespace.to(socket.id).emit('restartGameReady', socket.id, room);
                    console.log('restartGameReady [namespace/id/room]:', socket.nsp.name, socket.id, room);
                }

                if (pongNamespace.adapter.rooms.get(room).restartPlayerCount === 2) {
                    pongNamespace.in(room).emit('startGame', socket.id, room);
                    pongNamespace.adapter.rooms.get(room).restartPlayerCount = 0;
                    console.log('Restart game [namespace/room]:', socket.nsp.name, room);
                }
            }
        });

        socket.on('paddleMove', (paddleData) => {
            socket.to(room).emit('paddleMove', paddleData);
        });

        socket.on('ballMove', (ballData) => {
            socket.to(room).emit('ballMove', ballData);      
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client ${socket.id} disconnected: ${reason}`);
            socket.to(room).emit('opponentDisconnected'); 
            socket.leave(room);
        });
    });
};

module.exports = {
    listen
};