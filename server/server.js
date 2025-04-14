const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { SnakeGame } = require("../logic/game");
const fs = require("fs");
let pendingMoves = new Map();

const app = express();
const port = 3000;

app.use(bodyParser.json());

let playersMap = new Map();
let game;
let currentPlayers;
let timeoutId;

fs.readFile("./players.json", "utf8", (err, data) => {
  if (err || !data) {
    console.warn("Using default players");
    playersMap.set("A", { id: "A", name: "PlayerA" });
    playersMap.set("B", { id: "B", name: "PlayerB" });
  } else {
    try {
      const allPlayers = JSON.parse(data);
      allPlayers.forEach((player) => playersMap.set(player.id, player));
    } catch (error) {
      console.error("Error parsing JSON, using defaults");
      playersMap.set("A", { id: "A", name: "PlayerA" });
      playersMap.set("B", { id: "B", name: "PlayerB" });
    }
  }
  game = new SnakeGame();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const connections = new Set();

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
      powerUps: game.powerUps,
      playerEffects: Array.from(game.playerEffects.entries()),
    })
  );
}

function handlePlayerConnection(ws, playerId) {
  const player = playersMap.get(playerId);
  console.log(`${player.name} connected with ID: ${playerId}`);
  currentPlayers = Array.from(connections)
    .filter((conn) => conn.id !== "frontend")
    .map((conn) => {
      const player = playersMap.get(conn.id);
      return { id: conn.id, name: player.name };
    });
  if (currentPlayers.length > 2) {
    ws.send(
      JSON.stringify({
        message: "The game already has two players. Please wait for the next game.",
      })
    );
    ws.close();
    return;
  }
  game.addPlayer(playerId);
  ws.send(
    JSON.stringify({
      message: "Player connected successfully.",
      id: playerId,
      name: player.name,
    })
  );
  if (currentPlayers.length === 2) {
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          map: game.map,
          players: game.players,
          winner: game.winner,
          moveCounter: game.internalMoveCounter,
          powerUps: game.powerUps,
          playerEffects: Array.from(game.playerEffects.entries()),
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
  if (!move.playerId || !move.direction) {
    ws.send(JSON.stringify({ error: "Invalid move format" }));
    return;
  }
  pendingMoves.set(move.playerId, move);
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    if (pendingMoves.size > 0) {
      game.processMoves(Array.from(pendingMoves.values()));
      pendingMoves.clear();
      broadcastGameState();
    }
  }, 500);
  if (pendingMoves.size === 2) {
    clearTimeout(timeoutId);
    game.processMoves(Array.from(pendingMoves.values()));
    pendingMoves.clear();
    broadcastGameState();
  }
}

function broadcastGameState() {
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const playersWithNames = game.players.map((player) => ({
        ...player,
        name: playersMap.get(player.id).name,
      }));
      const gameState = {
        map: game.map,
        players: playersWithNames,
        winner: game.winner
          ? game.winner === -1
            ? -1
            : playersMap.get(game.winner).name
          : null,
        moveCounter: game.internalMoveCounter,
        powerUps: game.powerUps,
        playerEffects: Array.from(game.playerEffects.entries()),
      };
      client.send(JSON.stringify(gameState));
    }
  });
  if (game.winner) {
    console.log(
      `Game Over! Winner: ${
        game.winner === -1 ? "Draw" : playersMap.get(game.winner).name
      }`
    );
    closeConnectionsAndServer();
  }
}

function handleDisconnection(ws) {
  connections.delete(ws);
  if (currentPlayers.length < 2 && game.players.length === 2) {
    const remainingPlayer = game.players.find((p) => p.id !== ws.id);
    if (remainingPlayer) {
      game.winner = remainingPlayer.id;
      broadcastGameState();
      closeConnectionsAndServer();
    }
  }
  console.log(
    "Connection closed: " + (playersMap.get(ws.id)?.name || ws.id)
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