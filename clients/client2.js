const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000?id=0987654321');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
  console.log('Received message:', data);
});

ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
