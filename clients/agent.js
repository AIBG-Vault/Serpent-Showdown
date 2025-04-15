// Get the agentId and play mode from the command-line arguments
// node agent.js ID playAsPlayer
// process.argv[0] is node
// process.argv[1] is client1.js
// process.argv[2] is ID
// process.argv[3] is play mode

const WebSocket = require("ws");

// Configuration
const CONFIG = {
  defaultId: "k",
  defaultMode: "up",
  validModes: [
    "up",
    "down",
    "left",
    "right",
    "random",
    "timeout",
    "apple",
    "survive",
  ],
  validDirections: ["up", "down", "left", "right"],
  baseDelay: 100,
  wsUrl: "ws://localhost:3000",
};

// Game state
const gameState = {
  agentId: process.argv[2] || CONFIG.defaultId,
  agentMode: process.argv[3],
  delayBetweenMoves: CONFIG.baseDelay,
};

// Initialize agent mode
if (!gameState.agentMode || !CONFIG.validModes.includes(gameState.agentMode)) {
  console.error(
    "Direction not provided or invalid, using default:",
    CONFIG.defaultMode
  );
  gameState.agentMode = CONFIG.defaultMode;
}

// Movement helpers
const movementHelpers = {
  getNextPosition(current, direction) {
    const pos = { x: current.x, y: current.y };
    const moves = {
      up: () => (pos.x -= 1),
      down: () => (pos.x += 1),
      left: () => (pos.y -= 1),
      right: () => (pos.y += 1),
    };
    moves[direction]();
    return pos;
  },

  isSafeMove(map, pos) {
    if (
      pos.x < 0 ||
      pos.x >= map.length ||
      pos.y < 0 ||
      pos.y >= map[0].length
    ) {
      return false;
    }
    const cell = map[pos.x][pos.y];
    return cell === null || cell === "A";
  },

  findPlayerHead(map, playerSymbol) {
    const playerHead = { x: 0, y: 0 };
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (map[i][j] === playerSymbol) {
          playerHead.x = i;
          playerHead.y = j;
        }
      }
    }
    return playerHead;
  },
};

// Strategy implementations
const strategies = {
  findSafeDirection(map, playerHead) {
    const directions = [
      { dx: -1, dy: 0, move: "up" },
      { dx: 1, dy: 0, move: "down" },
      { dx: 0, dy: -1, move: "left" },
      { dx: 0, dy: 1, move: "right" },
    ].sort(() => Math.random() - 0.5);

    for (const { dx, dy, move } of directions) {
      const newX = playerHead.x + dx;
      const newY = playerHead.y + dy;

      if (newX < 0 || newX >= map.length || newY < 0 || newY >= map[0].length) {
        continue;
      }

      const cell = map[newX][newY];
      if (cell === null || cell === "A") {
        return move;
      }
    }

    return CONFIG.validDirections[
      Math.floor(Math.random() * CONFIG.validDirections.length)
    ];
  },

  findClosestApple(map, playerHead) {
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

        if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) continue;

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
  },
};

// Movement decision logic
function decideNextMove(map, mode) {
  const playerHead = movementHelpers.findPlayerHead(
    map,
    gameState.agentId.toUpperCase()
  );

  switch (mode) {
    case "survive":
      return strategies.findSafeDirection(map, playerHead);

    case "apple": {
      const path = strategies.findClosestApple(map, playerHead);
      if (path && path.length > 0) {
        const nextMove = path[0];
        const nextPos = movementHelpers.getNextPosition(playerHead, nextMove);
        return movementHelpers.isSafeMove(map, nextPos)
          ? nextMove
          : strategies.findSafeDirection(map, playerHead);
      }
      return strategies.findSafeDirection(map, playerHead);
    }

    case "random":
      return CONFIG.validDirections[
        Math.floor(Math.random() * CONFIG.validDirections.length)
      ];

    default:
      return mode;
  }
}

// WebSocket setup and event handlers
const ws = new WebSocket(`${CONFIG.wsUrl}?id=${gameState.agentId}`);

ws.on("open", () => console.log("Connected to WebSocket server"));
ws.on("error", (error) => console.error("WebSocket error:", error));
ws.on("close", () => console.log("Disconnected from WebSocket by server"));

ws.on("message", (data) => {
  const receivedMsg = JSON.parse(data.toString("utf-8"));
  // console.log("Received message:", receivedMsg);

  const gameIsOver =
    receivedMsg.winner !== null && receivedMsg.winner !== undefined;

  if (!gameIsOver && receivedMsg.map) {
    const direction = decideNextMove(receivedMsg.map, gameState.agentMode);

    const move = { playerId: gameState.agentId, direction };

    setTimeout(() => {
      ws.send(JSON.stringify(move));
      if (gameState.agentMode === "timeout") {
        gameState.delayBetweenMoves += 100;
      }
    }, gameState.delayBetweenMoves);
  }
});
