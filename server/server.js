const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const bodyParser = require("body-parser");
const fs = require("fs");

const { SnakeGame } = require("../logic/game");

const util = require("./utility");

let pendingMoves = new Map(); // Store moves until both players have moved

const app = express();
const host = "0.0.0.0"; // Listen on all network interfaces
const port = process.argv[2] || 3000;

app.use(bodyParser.json());

let playersMap = new Map(); // This will store player data with ID as key
let game;
let currentPlayers = [];
let disconnectedPlayers = new Set(); // Track disconnected players

let timeoutId;

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
  const url = new URL(req.url, "http://localhost" + port);
  const receivedId = url.searchParams.get("id");

  // Add the new connection to the Set (connections)
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
server.listen(port, host, () => {
  console.log(`Server is running on ${host}:${port}`);
});

// Configuration
const MOVE_TIMEOUT = process.argv[3] || 150; // Timeout for each move in milliseconds (0 to run off)
if (MOVE_TIMEOUT > 0) {
  console.log("Move timeout set to " + MOVE_TIMEOUT + "ms");
} else {
  console.log("Move timeout DISABLED");
}

function handleFrontendConnection(ws) {
  console.log("Frontend connected");
  ws.send(JSON.stringify(util.serializeGameState(game)));
}

function handlePlayerConnection(ws, playerId) {
  const player = playersMap.get(playerId);
  console.log(`${player.name} connected with ID: ${playerId}`);

  // Check if this is a reconnection
  if (disconnectedPlayers.has(playerId)) {
    disconnectedPlayers.delete(playerId);
    ws.send(
      JSON.stringify({
        message: "Reconnected successfully.",
        id: playerId,
        name: player.name,
      })
    );
  } else if (!currentPlayers.some((p) => p.id === playerId)) {
    // Only add to currentPlayers if it's a new connection
    if (currentPlayers.length >= 2) {
      ws.send(
        JSON.stringify({
          message:
            "The game already has two players. Please wait for the next game.",
        })
      );
      ws.close();
      return;
    }
    currentPlayers.push(player);
    game.addPlayer(player);
  }

  // If not exceeding the player limit, acknowledge the connection
  ws.send(
    JSON.stringify({
      message: "Player connected successfully.",
      id: playerId,
      name: player.name,
    })
  );

  connections.forEach((client) => {
    if (client.id === "frontend" && client.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(util.serializeGameState(game));
      client.send(message, (error) => {
        if (error) {
          console.error("Error sending game state to frontend:", error);
        }
      });
    }
  });

  if (currentPlayers.length === 2) {
    // If there are already two player connections, start the game and send the initial game state
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message = JSON.stringify(util.serializeGameState(game));

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
    // Ignore unparseable messages
    return;
  }

  // 1. Check if playerId is missing or invalid
  if (!move.playerId || !currentPlayers.some((p) => p.id === move.playerId)) {
    console.log(`Ignoring move due to missing or invalid playerId: ${message}`);
    ws.send(
      JSON.stringify({ error: "Invalid or missing playerId. Move ignored." })
    );
    // Ignore the move completely
    return;
  }

  // 2. Check if direction is missing (but playerId is valid)
  if (!move.direction) {
    console.log(
      `Received move with missing direction from ${move.playerId}. Setting direction to 'invalid'.`
    );
    ws.send(
      JSON.stringify({
        warning: "Missing direction in move. Treating as invalid.",
      })
    );
    // Set direction to invalid so game logic can handle it (e.g., apply penalty)
    move.direction = "invalid";
  }

  // Store the move (it's either valid or has direction set to 'invalid')
  pendingMoves.set(move.playerId, move);

  // Clear existing timeout if any
  if (timeoutId) clearTimeout(timeoutId);

  // Process moves function
  const processPendingMoves = () => {
    game.processMoves(Array.from(pendingMoves.values()));
    pendingMoves.clear();

    // Send game state to all connections
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message = JSON.stringify(util.serializeGameState(game));

        client.send(message, (error) => {
          if (error) {
            console.error("Error sending message:", error);
          }
        });
      }
    });

    // Check for game over
    if (game.winner !== null) {
      console.log(
        game.winner === -1
          ? "Game Over! It's a draw."
          : `Game Over! Winner: ${game.winner}`
      );
      closeConnectionsAndServer();
    }
  };

  // Set new timeout only if enabled
  if (MOVE_TIMEOUT > 0) {
    timeoutId = setTimeout(() => {
      if (pendingMoves.size > 0) {
        // Add timeout moves for players who haven't moved
        currentPlayers.forEach((player) => {
          if (!pendingMoves.has(player.id)) {
            pendingMoves.set(player.id, {
              playerId: player.id,
              direction: "timeout",
            });
          }
        });
        processPendingMoves();
      }
    }, MOVE_TIMEOUT);
  }

  // Process moves immediately if all players sent their moves
  if (pendingMoves.size === 2) {
    if (timeoutId) clearTimeout(timeoutId);
    processPendingMoves();
  }
}

function handleDisconnection(ws) {
  connections.delete(ws);
  const connectionId = ws.id;

  // Add to disconnected players if it's a game player
  if (currentPlayers.some((p) => p.id === connectionId)) {
    disconnectedPlayers.add(connectionId);
  }

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
      console.error("Error while closing server:", err);
    } else {
      console.log("WebSocket server closed successfully.");
    }
  });
}
