// Get the agentId and play mode from the command-line arguments
// node agent.js ID playAsPlayer
// process.argv[0] is node
// process.argv[1] is client1.js
// process.argv[2] is ID
// process.argv[3] is play mode

// Get the agentId and play mode from the command-line arguments
// node agent.js ID playAsPlayer
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
  speedFactor: 1, // Default speed
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
    return (
      cell === null ||
      cell === "A" ||
      ["U", "G", "R_S", "R_E", "R_B"].includes(cell)
    );
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
      if (
        cell === null ||
        cell === "A" ||
        ["U", "G", "R_S", "R_E", "R_B"].includes(cell)
      ) {
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
          !["U", "G", "R_S", "R_E", "R_B"].includes(cell) &&
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
function decideNextMove(map, mode, powerUps = []) {
  const playerHead = movementHelpers.findPlayerHead(
    map,
    gameState.agentId.toUpperCase()
  );
  if (mode === "apple" && powerUps.length > 0) {
    const targetPowerUp = powerUps.find(
      (pu) => pu.type === "GOLDEN_APPLE" || pu.type === "UBRZANJE"
    );
    if (targetPowerUp) {
      const path = findPathTo(map, playerHead, targetPowerUp.x, targetPowerUp.y);
      if (path && path.length > 0) {
        const nextMove = path[0];
        const nextPos = movementHelpers.getNextPosition(playerHead, nextMove);
        if (movementHelpers.isSafeMove(map, nextPos)) {
          return nextMove;
        }
      }
    }
    const path = strategies.findClosestApple(map, playerHead);
    if (path && path.length > 0) {
      const nextMove = path[0];
      const nextPos = movementHelpers.getNextPosition(playerHead, nextMove);
      if (movementHelpers.isSafeMove(map, nextPos)) {
        return nextMove;
      }
    }
  }
  if (mode === "survive") {
    return strategies.findSafeDirection(map, playerHead);
  }
  if (mode === "random") {
    return CONFIG.validDirections[
      Math.floor(Math.random() * CONFIG.validDirections.length)
    ];
  }
  return mode;
}

function findPathTo(map, start, targetX, targetY) {
  const rows = map.length;
  const cols = map[0].length;
  const queue = [[start.x, start.y, []]];
  const visited = new Set();
  while (queue.length > 0) {
    const [x, y, path] = queue.shift();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (x === targetX && y === targetY) {
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
        cell &&
        cell !== "A" &&
        !["U", "G", "R_S", "R_E", "R_B"].includes(cell)
      ) {
        continue;
      }
      queue.push([newX, newY, [...path, move]]);
    }
  }
  return null;
}

// WebSocket setup and event handlers
const ws = new WebSocket(`${CONFIG.wsUrl}?id=${gameState.agentId}`);

ws.on("open", () => console.log("Connected to WebSocket server"));
ws.on("error", (error) => console.error("WebSocket error:", error));
ws.on("close", () => console.log("Disconnected from WebSocket by server"));

ws.on("message", (data) => {
  let receivedMsg;
  try {
    receivedMsg = JSON.parse(data.toString("utf-8"));
  } catch (e) {
    console.error("Invalid message format:", data);
    return;
  }
  console.log("Received message:", receivedMsg);
  if (!receivedMsg.map) return;
  const gameIsOver =
    receivedMsg.winner !== null && receivedMsg.winner !== undefined;
  if (gameIsOver) return;
  if (receivedMsg.playerEffects) {
    const effect = receivedMsg.playerEffects.find(
      ([id]) => id === gameState.agentId
    );
    gameState.speedFactor = effect ? effect[1].speed : 1;
  } else {
    gameState.speedFactor = 1;
  }
  const direction = decideNextMove(
    receivedMsg.map,
    gameState.agentMode,
    receivedMsg.powerUps || []
  );
  const move = { playerId: gameState.agentId, direction };
  setTimeout(() => {
    ws.send(JSON.stringify(move));
    if (gameState.agentMode === "timeout") {
      gameState.delayBetweenMoves = Math.min(
        gameState.delayBetweenMoves + 100,
        1000
      );
    }
  }, Math.max(20, gameState.delayBetweenMoves * gameState.speedFactor));
});