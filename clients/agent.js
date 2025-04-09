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
  ![
    "up",
    "down",
    "left",
    "right",
    "random",
    "timeout",
    "apple",
    "survive",
  ].includes(agentMode)
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
  if (!gameIsOver && receivedMsg.map) {
    let direction = agentMode;

    if (agentMode === "survive") {
      const playerHead = { x: 0, y: 0 };
      const playerSymbol = agentId.toUpperCase();

      // Find player head position
      for (let i = 0; i < receivedMsg.map.length; i++) {
        for (let j = 0; j < receivedMsg.map[i].length; j++) {
          if (receivedMsg.map[i][j] === playerSymbol) {
            playerHead.x = i;
            playerHead.y = j;
          }
        }
      }

      // Get safe direction
      direction = findSafeDirection(receivedMsg.map, playerHead);
    } else if (agentMode === "apple") {
      // Find player head (uppercase letter matching player ID)
      const playerHead = { x: 0, y: 0 };
      const playerSymbol = agentId.toUpperCase();

      for (let i = 0; i < receivedMsg.map.length; i++) {
        for (let j = 0; j < receivedMsg.map[i].length; j++) {
          if (receivedMsg.map[i][j] === playerSymbol) {
            playerHead.x = i;
            playerHead.y = j;
          }
        }
      }

      const path = findClosestApple(receivedMsg.map, playerHead);
      direction =
        path && path.length > 0
          ? path[0]
          : validDirections[Math.floor(Math.random() * validDirections.length)];
    } else if (agentMode === "random") {
      direction =
        validDirections[Math.floor(Math.random() * validDirections.length)];
    }

    const move = {
      playerId: agentId,
      direction: direction,
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

// Add BFS helper functions
function findClosestApple(map, playerHead) {
  const rows = map.length;
  const cols = map[0].length;
  const queue = [[playerHead.x, playerHead.y, []]];
  const visited = new Set();

  while (queue.length > 0) {
    const [x, y, path] = queue.shift();
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (map[x][y] === "A") {
      return path;
    }

    const directions = [
      { dx: -1, dy: 0, move: "up" },
      { dx: 1, dy: 0, move: "down" },
      { dx: 0, dy: -1, move: "left" },
      { dx: 0, dy: 1, move: "right" },
    ];

    for (const { dx, dy, move } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      // Add boundary check first
      if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) continue;

      // Check for all snake body parts (both uppercase and lowercase)
      const cell = map[newX][newY];
      if (
        cell !== null &&
        cell !== "A" &&
        (cell.toLowerCase() === "k" || cell.toLowerCase() === "l")
      ) {
        continue;
      }

      queue.push([newX, newY, [...path, move]]);
    }
  }

  return null;
}

// Add new helper function for survive mode
function findSafeDirection(map, playerHead) {
  const directions = [
    { dx: -1, dy: 0, move: "up" },
    { dx: 1, dy: 0, move: "down" },
    { dx: 0, dy: -1, move: "left" },
    { dx: 0, dy: 1, move: "right" },
  ];

  // Shuffle directions for random choice among safe directions
  directions.sort(() => Math.random() - 0.5);

  for (const { dx, dy, move } of directions) {
    const newX = playerHead.x + dx;
    const newY = playerHead.y + dy;

    // Check boundaries
    if (newX < 0 || newX >= map.length || newY < 0 || newY >= map[0].length) {
      continue;
    }

    // Check if cell is safe (null or apple)
    const cell = map[newX][newY];
    if (cell === null || cell === "A") {
      return move;
    }
  }

  // If no safe direction found, return random direction as fallback
  return validDirections[Math.floor(Math.random() * validDirections.length)];
}
