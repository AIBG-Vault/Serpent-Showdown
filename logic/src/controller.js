const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { GameField } = require("./gameFiles/field");
const {
  IllegalMoveException,
} = require("./gameFiles/util/illegalMoveException");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.json());

let playersMap = new Map(); // This will store player data with ID as key
let gameObject;
let currentPlayers;
let timeoutId;
let playerTimedOut = false;
let playerPlayedAnIllegalMove = false;

// Load players.json and initialize gameObject
fs.readFile("./src/gameFiles/players.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  try {
    const allPlayers = JSON.parse(data);
    allPlayers.forEach((player) => playersMap.set(player.id, player)); // Populate playersMap
    gameObject = new GameField();
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
      field: gameObject.field,
      player1Creatures: gameObject.player1Creatures,
      player2Creatures: gameObject.player2Creatures,
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

  // If not exceeding the player limit, acknowledge the connection
  ws.send(
    JSON.stringify({
      message: "Player connected successfully.",
      id: playerId,
      name: player.name,
    })
  );

  if (currentPlayers.length === 1) {
    ws.send(
      JSON.stringify({
        placingIndexes: [0, 1, 2],
      })
    );
  } else if (currentPlayers.length === 2) {
    ws.send(
      JSON.stringify({
        placingIndexes: [15, 16, 17],
      })
    );

    // If there are already two player connections, start the game
    // Send the game state to the first player
    connections.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.id === currentPlayers[0].id
      ) {
        const message = JSON.stringify({
          field: gameObject.field,
          currentTurn: currentPlayers[0].id,
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
  console.log(
    "Player who sent the message:",
    currentPlayers[gameObject.turn].name
  );

  if (currentPlayers.length < 2) {
    ws.send(JSON.stringify({ message: "Waiting for players to connect" }));
    return;
  } else {
    let move;

    try {
      move = JSON.parse(message);
    } catch (error) {
      console.error("Cannot parse message:", message);
      return;
    }

    if (move.playerId !== currentPlayers[gameObject.turn].id) {
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.id === move.playerId) {
          const message = JSON.stringify({
            message:
              "It is not your turn. Please wait for the other player to make a move.",
          });
  
          client.send(message, (error) => {
            if (error) {
              console.error("Error sending message:", error);
            }
          });
        }
      });
    } else {
      clearTimeout(timeoutId);

      try {
        gameObject.playMove(move); // this method automatically switches the turn
      } catch (error) {
        if (error instanceof IllegalMoveException) {
          playerPlayedAnIllegalMove = true;
          console.log(
            "Illegal move by: " + currentPlayers[gameObject.turn].name
          );
        } else {
          // unknown error
          throw error;
        }
      }

      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.id === "frontend") {
          const message = JSON.stringify({
            field: gameObject.field,
            player1: currentPlayers[0].name,
            player2: currentPlayers[1].name,
            player1Creatures: gameObject.player1Creatures,
            player2Creatures: gameObject.player2Creatures,
          });

          client.send(message, (error) => {
            if (error) {
              console.error("Error sending message:", error);
            }
          });
        } else if (
          client.readyState === WebSocket.OPEN &&
          client.id === currentPlayers[gameObject.turn].id
        ) {
          const message = JSON.stringify({
            field: gameObject.field,
            currentTurn: currentPlayers[gameObject.turn].id,
          });

          client.send(message, (error) => {
            if (error) {
              console.error("Error sending message:", error);
            }
          });

          timeoutId = setTimeout(() => {
            playerTimedOut = true;

            console.log(
              "Agent timed out: " + currentPlayers[gameObject.turn].name
            );
          }, 500);
        }
      });

      const winnerExists =
        gameObject.winner !== undefined && gameObject.winner !== null;
      const gameIsOver =
        winnerExists || playerTimedOut || playerPlayedAnIllegalMove;

      if (gameIsOver) {
        clearTimeout(timeoutId);

        // prepare winner info
        let winnerName;
        let msg;
        if (winnerExists) {
          winnerName = currentPlayers[gameObject.winner].name;
          msg = {
            winner: winnerName,
            winnerHealth: gameObject.winnerHealth,
          };
        } else if (playerTimedOut) {
          winnerName = currentPlayers[gameObject.turn].name;
          const loserName = currentPlayers[(gameObject.turn + 1) % 2].name;

          msg = {
            winner: winnerName,
            message: loserName + " timed out",
          };
        } else if (playerPlayedAnIllegalMove) {
          winnerName = currentPlayers[(gameObject.turn + 1) % 2].name;
          const loserName = currentPlayers[gameObject.turn].name;

          msg = {
            winner: winnerName,
            message: loserName + " played an illegal move",
          };
        }

        // send winner info to all
        connections.forEach((client) => {
          client.send(JSON.stringify(msg), (error) => {
            if (error) {
              console.error("Error sending message:", error);
            }
          });
        });

        console.log("\n\n --- WINNER: " + winnerName + " --- \n\n");

        closeConnectionsAndServer();
        return;
      }
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
