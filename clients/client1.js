const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000?id=1234567890');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    const message = data.toString('utf-8');
    console.log('Received message:', message);

    // Send a message to the server
    ws.send('Hello, server!');
  });

ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
