const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { GameField } = require("./gameFiles/field");
const { IllegalMoveException } = require("./gameFiles/util/illegalMoveException");

const app = express();
const port = 3000;

app.use(bodyParser.json());

let connectedPlayers = 0;
let waitingForOtherPlayer = false;
let currentTurn = 0;

const players = [
    {
        name: "Player 1",
        id: "1234567890",
    },
    {
        name: "Player 2",
        id: "0987654321",
    },
];

let gameObject = new GameField(players);

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connections
const connections = new Set();

wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "http://localhost:3000"); // Adjust the origin as needed
    const receivedId = url.searchParams.get("id");
    ws.id = receivedId;
    connections.add(ws);

    if (receivedId === "frontend") {
        console.log("Frontend connected");

        ws.send(JSON.stringify({

            field: gameObject.field,
            player1: players[0].name,
            player2: players[1].name,
            winner: gameObject.winner,
            player1Creatures: gameObject.player1Creatures,
            player2Creatures: gameObject.player2Creatures
        }));

    } else if (receivedId === players[0].id || receivedId === players[1].id) {

        connectedPlayers++;

        if (connectedPlayers === 2) {

            waitingForOtherPlayer = false;
            gameObject = new GameField(players)

            // Send the game state to the connected players
            connections.forEach((client) => {
                if (
                    client.readyState === WebSocket.OPEN &&
                    client.id === players[0].id
                ) {
                    const message = JSON.stringify({
                        field: gameObject.field,
                        currentTurn: players[gameObject.turn].name,
                        winner: gameObject.winner,
                    });

                    client.send(message, (error) => {
                        if (error) {
                            console.error("Error sending message:", error);
                        }
                    });
                }
            });
        } else {
            ws.send(
                JSON.stringify({
                    message: "Player registered successfully. Waiting for the other player.",
                })
            );
            waitingForOtherPlayer = true;
        }
    } else {
        ws.send(
            JSON.stringify({
                message: "Invalid ID. Connection rejected.",
                id: receivedId,
            })
        );
        ws.close();
        console.log("Connection rejected. Invalid ID:", receivedId);
    }

    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);

        if (waitingForOtherPlayer) {
            ws.send(
                JSON.stringify({ message: "Waiting for the other player to connect." })
            );
            return;
        } else {
            let move;

            try {
                move = JSON.parse(message);
            } catch (error) {
                console.error("Cannot parse message:", message);
                return;
            }

            if (move.playerId === players[currentTurn].id) {

                try {
                    gameObject.playMove(move);
                } catch (error) {
                    if (error instanceof IllegalMoveException) {
                        ws.send(JSON.stringify({
                            message: 'Illegal move. Please try another move or restart the game by disconnecting both agents and connecting them again.',
                            code: 100,
                            move: move
                        }));
                        return;
                    } else {
                        throw error;
                    }
                }

                // if (gameObject.winner === 0 || gameObject.winner === 1) {
                //     wss.close();
                // }

                currentTurn = gameObject.turn;

                connections.forEach((client) => {
                    if (
                        (client.readyState === WebSocket.OPEN &&
                            client.id === players[currentTurn].id) ||
                        (client.readyState === WebSocket.OPEN &&
                            (gameObject.winner === 0 || gameObject.winner === 1))
                    ) {
                        const message = JSON.stringify({
                            field: gameObject.field,
                            currentTurn: players[gameObject.turn].name,
                            winner: gameObject.winner,
                        });

                        client.send(message, (error) => {

                            if (error) {
                                console.error('Error sending message:', error);
                            }

                        });
                    } else if (client.readyState === WebSocket.OPEN && client.id === 'frontend') {

                        const message = JSON.stringify({

                            field: gameObject.field,
                            player1: players[0].name,
                            player2: players[1].name,
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
                connections.forEach((client) => {
                    const message = JSON.stringify({

                        message: 'It is not your turn. Please wait for the other player to make a move.'

                    });

                    client.send(message, (error) => {

                        if (error) {
                            console.error('Error sending message:', error);
                        }

                    });
                });
            }
        }

    });

    ws.on('close', () => {
        // Remove the closed connection from the set
        connections.delete(ws);
        //console.log('Connections:', connections.size);
        connectedPlayers--;

        gameObject = new GameField(players);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

