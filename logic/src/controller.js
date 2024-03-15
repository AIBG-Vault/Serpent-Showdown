const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const { GameField } = require('./gameFiles/field');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let connectedPlayers = 0;
let waitingForOtherPlayer = false;

const players = [
    
    {
        name: "Player 1",
        id: "1234567890"
    },
    {
        name: "Player 2",
        id: "0987654321"
    }
];

const gameObject = new GameField(players);

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connections
const connections = new Set();

wss.on('connection', (ws, req) => {

    const url = new URL(req.url, 'http://localhost:3000'); // Adjust the origin as needed
    const receivedId = url.searchParams.get('id');

    if (receivedId === 'frontend') {
        console.log('Frontend connected');

        ws.send(JSON.stringify({

            field: gameObject.field,
            player1: players[0].name,
            player2: players[1].name,
            winner: gameObject.winner

        }));

    } else if (receivedId === players[0].id || receivedId === players[1].id) {

        connectedPlayers++;
        ws.id = receivedId;
        connections.add(ws);

        console.log('Connections:', wss.clients);

        if (connectedPlayers === 2) {

            waitingForOtherPlayer = false;

            // Send the game state to the connected players
            connections.forEach((client) => {

                if (client.readyState === WebSocket.OPEN && client.id === players[0].id) {

                    const message = JSON.stringify({

                        field: gameObject.field,
                        currentTurn: players[gameObject.turn].name,
                        winner: gameObject.winner

                    });

                    client.send(message, (error) => {

                        if (error) {
                            console.error('Error sending message:', error);
                        }
                        
                    });
                }
            });

        } else {

            ws.send(JSON.stringify({ message: 'Player registered successfully. Waiting for the other player.' }))
            waitingForOtherPlayer = true;

        }
    } else {
        ws.send(JSON.stringify({
            message: 'Invalid ID. Connection rejected.',
            id: receivedId
        }));
        ws.close();
        console.log('Connection rejected. Invalid ID:', receivedId);
    }

    ws.on('message', (message) => {

        console.log(`Received message: ${message}`);

        if (waitingForOtherPlayer) {

            ws.send(JSON.stringify({ message: 'Waiting for the other player to connect.' }));
            return;

        } else {

            let move = JSON.parse(message);
            console.log(`Received move: ${move}`);

            gameObject.playMove(move);

            currentTurn = gameObject.turn;

            connections.forEach((client) => {

                if (client.readyState === WebSocket.OPEN && client.id === players[currentTurn].id) {

                    const message = JSON.stringify({

                        field: gameObject.field,
                        currentTurn: players[gameObject.turn].name,
                        winner: gameObject.winner

                    });

                    client.send(message, (error) => {

                        if (error) {
                            console.error('Error sending message:', error);
                        }

                    });
                }
            });
        }

    });

    ws.on('close', () => {
        // Remove the closed connection from the set
        connections.delete(ws);
    });

});

// Endpoint for user registration and starting the game
// app.post('/register', (req, res) => {
//     // Implement user registration logic here
//     const id1 = "1234567890";
//     const id2 = "0987654321";

//     if (connections.size === 2) {
//         // Start the game and send the initial game state to both players
//         gameLogic.startGame();
//         const initialGameState = gameLogic.gameState;
//         connections.forEach((ws) => {
//             ws.send(JSON.stringify({ type: 'initialGameState', gameState: initialGameState }));
//         });

//         // Reset the count for the next game
//         connections.clear();
//     } else {
//         // Player is registered, but the game hasn't started yet
//         ws.send(JSON.stringify({ message: 'Player registered successfully. Waiting for the other player.' }));
//     }
// });

// // Endpoint for making a move
// app.post('/make_move', (req, res) => {
//     const { player, move } = req.body;

//     // Validate player and move data
//     if (!player || !move) {
//         return res.status(400).json({ error: 'Player and move are required' });
//     }

//     // Ensure it's the correct player's turn
//     if (player !== gameLogic.currentPlayer) {
//         return res.status(400).json({ error: 'It is not your turn' });
//     }

//     // Make the move and update the game state
//     gameLogic.makeMove(player, move);

//     // Switch to the next player's turn
//     gameLogic.currentPlayer = 3 - player; // Alternates between 1 and 2

//     // Send the updated game state to all connected players
//     const updatedGameState = gameLogic.gameState;
//     connections.forEach((ws) => {
//         ws.send(JSON.stringify({ type: 'moveMade', gameState: updatedGameState, currentPlayer: gameLogic.currentPlayer }));
//     });

//     res.status(200).json({ message: 'Move made successfully', gameState: updatedGameState });
// });

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
