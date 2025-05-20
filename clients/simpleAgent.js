const WebSocket = require("ws");

// Configuration
const CONFIG = {
  serverIP: "localhost",
  serverPort: 3000,
  defaultId: "k",
  validDirections: ["up", "down", "left", "right"],
};

// Game state
const gameState = {
  agentId: process.argv[2] || CONFIG.defaultId,
  playerName: null,
};

// Connect to WebSocket server
const ws = new WebSocket(
  `ws://${CONFIG.serverIP}:${CONFIG.serverPort}?id=${gameState.agentId}`
);

ws.on("open", () => console.log("Connected to WebSocket server"));
ws.on("error", (error) => console.error("WebSocket error:", error));
ws.on("close", () => console.log("Disconnected from WebSocket server"));

ws.on("message", (data) => {
  const receivedMsg = JSON.parse(data.toString("utf-8"));

  // Store player name when receiving the connection success message
  if (receivedMsg.message === "Player connected successfully.") {
    console.log(
      `Agent connected with name: '${receivedMsg.name}' and id: '${gameState.agentId}'.`
    );
    gameState.playerName = receivedMsg.name;
    return;
  }

  // Only make a move if the game isn't over
  if (receivedMsg.winner === null || receivedMsg.winner === undefined) {
    // Make a random move
    const move = {
      playerId: gameState.agentId,
      direction:
        CONFIG.validDirections[
          Math.floor(Math.random() * CONFIG.validDirections.length)
        ],
    };

    // Send the move
    ws.send(JSON.stringify(move));
    console.log("Sent move:", move);
  }
});
