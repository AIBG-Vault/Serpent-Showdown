const WebSocket = require('ws');

const myId = '0987654321';

const ws = new WebSocket(`ws://localhost:3000?id=${myId}`);

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString('utf-8'));
    console.log('Received message:', message);

    // Send a move to the server
    console.log('currentTurn:', message.currentTurn);
    if (message.currentTurn === myId) {
        ws.send(JSON.stringify({
            id: 1,
            x: 17,
            y: 0,
        }));
    }
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
