const WebSocket = require("ws");

// Configuration
const CONFIG = {
  defaultId: "k",
  validDirections: ["up", "down", "left", "right"],
  wsUrl: "ws://localhost:3000"
};

// Get the agentId from command line or use default
const agentId = process.argv[2] || CONFIG.defaultId;

// Connect to WebSocket server
const ws = new WebSocket(`${CONFIG.wsUrl}?id=${agentId}`);

ws.on("open", () => console.log("Connected to WebSocket server"));
ws.on("error", (error) => console.error("WebSocket error:", error));
ws.on("close", () => console.log("Disconnected from WebSocket server"));

ws.on("message", (data) => {
  const gameState = JSON.parse(data.toString("utf-8"));
  console.log("Received game state:", gameState);

  // Only make a move if the game isn't over
  if (gameState.winner === null || gameState.winner === undefined) {
    // Make a random move
    const move = {
      playerId: agentId,
      direction: CONFIG.validDirections[Math.floor(Math.random() * CONFIG.validDirections.length)]
    };

    // Send the move
    ws.send(JSON.stringify(move));
    console.log("Sent move:", move);
  }
});