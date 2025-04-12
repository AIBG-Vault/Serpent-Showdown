const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { SnakeGame } = require("../logic/game");
const fs = require("fs");
let pendingMoves = new Map(); // Store moves until both players have moved

const app = express();
const port = 3000;

app.use(bodyParser.json());

let playersMap = new Map(); // This will store player data with ID as key
let game;
let currentPlayers;
let timeoutId;
let playerTimedOut = false;

// Load players.json and initialize gameObject
fs.readFile("./players.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  try {
    const allPlayers = JSON.parse(data);
    allPlayers.forEach((player) => playersMap.set(player.id, player));
    game = new SnakeGame(); // Initialize SnakeGame
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
});

// Create an HTTP server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const connections = new Set(); // Track WebSocket connections

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost:3000");
  const receivedId = url.searchParams.get("id");
  ws.id = receivedId;
  connections.add(ws);

  if (receivedId === "frontend") {
    handleFrontendConnection(ws);
  } else if (playersMap.has(receivedId)) {
    handlePlayerConnection(ws, receivedId);
  } else {
    rejectConnection(ws, receivedId);
  }

  ws.on("message", (message) => {
    handleMessage(ws, message);
  });

  ws.on("close", () => {
    handleDisconnection(ws);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function handleFrontendConnection(ws) {
  console.log("Frontend connected");
  ws.send(
    JSON.stringify({
      map: game.map,
      players: game.players,
      winner: game.winner,
      moveCounter: game.internalMoveCounter,
    })
  );
}

function handlePlayerConnection(ws, playerId) {
  const player = playersMap.get(playerId);
  console.log(`${player.name} connected with ID: ${playerId}`);

  // Filter connections to exclude the frontend and count only player connections
  currentPlayers = Array.from(connections)
    .filter((conn) => conn.id !== "frontend")
    .map((conn) => {
      const player = playersMap.get(conn.id);
      return { id: conn.id, name: player.name }; // Construct and return the player object
    });

  // console.log(playerConnections.length);

  if (currentPlayers.length > 2) {
    // If there are already two player connections, inform the new connection and close it
    ws.send(
      JSON.stringify({
        message:
          "The game already has two players. Please wait for the next game.",
      })
    );
    ws.close();
    return;
  }

  game.addPlayer(playerId);

  // If not exceeding the player limit, acknowledge the connection
  ws.send(
    JSON.stringify({
      message: "Player connected successfully.",
      id: playerId,
      name: player.name,
    })
  );

  if (currentPlayers.length === 2) {
    // If there are already two player connections, start the game
    // Send the game state to the first player
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          map: game.map,
        });

        client.send(message, (error) => {
          if (error) {
            console.error("Error sending message:", error);
          }
        });
      }
    });
  }
}

function rejectConnection(ws, receivedId) {
  console.log("Connection rejected - Invalid ID: " + receivedId);
  ws.send(
    JSON.stringify({
      message: "Connection rejected - Invalid ID: " + receivedId,
    })
  );
  ws.close();
}

function handleMessage(ws, message) {
  console.log(`Received message: ${message}`);

  if (currentPlayers.length < 2) {
    ws.send(JSON.stringify({ message: "Waiting for players to connect" }));
    return;
  }

  let move;
  try {
    move = JSON.parse(message);
  } catch (error) {
    console.error("Cannot parse message:", message);
    return;
  }

  // Validate move format
  if (!move.playerId || !move.direction) {
    ws.send(JSON.stringify({ error: "Invalid move format" }));
    return;
  }

  // Store the move
  pendingMoves.set(move.playerId, move);

  // Check if both players have moved
  if (pendingMoves.size === 2) {
    game.processMoves(Array.from(pendingMoves.values()));
    pendingMoves.clear();

    // Send updated game state to all clients
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Add player names to the game state
        const playersWithNames = game.players.map(player => ({
          ...player,
          name: playersMap.get(player.id).name
        }));

        const gameState = {
          map: game.map,
          players: playersWithNames,
          winner: game.winner ? (game.winner === -1 ? -1 : playersMap.get(game.winner).name) : null,
          moveCounter: game.internalMoveCounter,
        };
        client.send(JSON.stringify(gameState));
      }
    });

    // Handle game over
    if (game.winner) {
      console.log(`Game Over! Winner: ${game.winner === -1 ? "Draw" : playersMap.get(game.winner).name}`);
      closeConnectionsAndServer();
    }
  }
}

function handleDisconnection(ws) {
  connections.delete(ws);
  const connectionId = ws.id;
  console.log(
    "Connection closed: " + (playersMap.get(connectionId)?.name || connectionId)
  );
}

function closeConnectionsAndServer() {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN ||
      client.readyState === WebSocket.CONNECTING
    ) {
      client.close();
    }
  });

  server.close(function (err) {
    if (err) {
      console.log("Error while closing server:", err);
    } else {
      console.log("WebSocket server closed successfully.");
    }
  });
}
