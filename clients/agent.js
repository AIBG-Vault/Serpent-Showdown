const WebSocket = require("ws");

// Get the agentId and playAsPlayer from the command-line arguments
// node agent.js ID playAsPlayer
// process.argv[0] is node
// process.argv[1] is client1.js

let agentId = process.argv[2]; // each team has their secret unique ID

if (!agentId) {
  agentId = "A";
  console.error("ID not provided as a parameter, using default: " + agentId);
}

const agentMode = process.argv[3]; // up, down, left, right, random, timeout
const validDirections = ["up", "down", "left", "right"];
if (
  !agentMode ||
  !["up", "down", "left", "right", "random", "timeout"].includes(agentMode)
) {
  console.error("Direction not provided or invalid, using default: up");
  agentMode = "up";
}

let delayBetweenMoves = 500; // Base delay between moves

const ws = new WebSocket(`ws://localhost:3000?id=${agentId}`);

ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

ws.on("message", (data) => {
  const receivedMsg = JSON.parse(data.toString("utf-8"));
  console.log("Received message:", receivedMsg);

  let gameIsOver =
    receivedMsg.winner !== null && receivedMsg.winner !== undefined;

  // Send a move to the server
  if (!gameIsOver) {
    const move = {
      playerId: agentId,
      direction:
        agentMode === "random"
          ? validDirections[Math.floor(Math.random() * validDirections.length)]
          : agentMode,
    };

    setTimeout(() => {
      ws.send(JSON.stringify(move));
      if (agentMode === "timeout") {
        delayBetweenMoves += 300; // Increase delay for timeout testing
      }
    }, delayBetweenMoves);
  }
});

ws.on("close", () => {
  console.log("Disconnected from WebSocket by server");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
