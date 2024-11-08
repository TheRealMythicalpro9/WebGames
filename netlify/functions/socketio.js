const serverless = require('serverless-http');
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer, { 
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Setup Socket.IO connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Use serverless-http to export as a serverless function
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    return handler(event, context);
};
