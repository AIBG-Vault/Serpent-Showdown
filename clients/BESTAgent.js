// Get the agentId and play mode from the command-line arguments
// node agent.js ID playAsPlayer
// process.argv[0] is node
// process.argv[1] is client1.js
// process.argv[2] is ID
// process.argv[3] is play mode

const WebSocket = require("ws");

// Configuration
const CONFIG = {
  serverIP: "localhost",
  serverPort: 3000,
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
  baseDelay: 0,
};

// Game state
const gameState = {
  agentId: process.argv[2] || CONFIG.defaultId,
  agentMode: process.argv[3],
  delayBetweenMoves: CONFIG.baseDelay,
  playerName: null, // Add this to store the player name
};

// Initialize agent mode
if (!gameState.agentMode || !CONFIG.validModes.includes(gameState.agentMode)) {
  console.error(
    "Mode not provided or invalid, using default:",
    CONFIG.defaultMode
  );
  gameState.agentMode = CONFIG.defaultMode;
}

// Movement helpers
const movementHelpers = {
  getNextPosition(current, direction) {
    const moves = {
      up: { x: -1, y: 0 },
      down: { x: 1, y: 0 },
      left: { x: 0, y: -1 },
      right: { x: 0, y: 1 },
    };
    return {
      x: current.x + moves[direction].x,
      y: current.y + moves[direction].y,
    };
  },

  findPlayerHead(map, playerName) {
    if (!map || !playerName) return { x: 0, y: 0 };

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (
          map[i][j]?.type === "snake-head" &&
          map[i][j]?.playerName === playerName
        ) {
          return { x: i, y: j };
        }
      }
    }
    return { x: 0, y: 0 };
  },

  isWithinBounds(map, pos) {
    return (
      pos.x >= 0 && pos.x < map.length && pos.y >= 0 && pos.y < map[0].length
    );
  },

  isCellSafe(map, pos) {
    if (!this.isWithinBounds(map, pos)) return false;
    const cell = map[pos.x][pos.y];
    return (
      !cell ||
      (cell.type !== "snake-head" &&
        cell.type !== "snake-body" &&
        cell.type !== "border")
    );
  },

  areAdjacentCellsSafe(map, pos) {
    if (!this.isWithinBounds(map, pos)) return false;

    // Check if position is at least 1 cell away from edges
    if (
      pos.x <= 0 ||
      pos.x >= map.length - 1 ||
      pos.y <= 0 ||
      pos.y >= map[0].length - 1
    ) {
      return false;
    }

    // Check all adjacent cells
    const adjacentOffsets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    return adjacentOffsets.every(([dx, dy]) => {
      const cell = map[pos.x + dx]?.[pos.y + dy];
      return (
        !cell ||
        (cell.type !== "border" &&
          !(
            cell.type === "snake-head" &&
            cell.playerName !== gameState.playerName
          ))
      );
    });
  },
};

// Strategy implementations
const strategies = {
  findSafeDirection(map, playerHead) {
    if (!map || !playerHead) {
      return CONFIG.validDirections[
        Math.floor(Math.random() * CONFIG.validDirections.length)
      ];
    }

    const directions = CONFIG.validDirections.map((dir) => ({
      direction: dir,
      position: movementHelpers.getNextPosition(playerHead, dir),
    }));

    // Shuffle directions for unpredictability
    directions.sort(() => Math.random() - 0.5);

    // Find best move: first perfectly safe, then just safe, finally random
    const perfectMove = directions.find(
      ({ position }) =>
        movementHelpers.isCellSafe(map, position) &&
        movementHelpers.areAdjacentCellsSafe(map, position)
    );

    if (perfectMove) return perfectMove.direction;

    const safeMove = directions.find(({ position }) =>
      movementHelpers.isCellSafe(map, position)
    );

    if (safeMove) return safeMove.direction;

    return directions[0].direction;
  },

  findClosestApple(map, playerHead) {
    if (!map || !playerHead) return null;

    const queue = [[playerHead.x, playerHead.y, []]];
    const visited = new Set();
    const maxPathLength = map.length * map[0].length; // Prevent infinite loops

    while (queue.length > 0) {
      const [x, y, path] = queue.shift();
      const key = `${x},${y}`;

      if (visited.has(key) || path.length > maxPathLength) continue;
      visited.add(key);

      // Found apple
      if (map[x]?.[y]?.type === "apple") {
        // Validate path safety
        let currentPos = { x: playerHead.x, y: playerHead.y };
        const isPathSafe = path.every((move) => {
          const nextPos = movementHelpers.getNextPosition(currentPos, move);
          // Only do full safety check for final path
          const isSafe = movementHelpers.isCellSafe(map, nextPos);
          currentPos = nextPos;
          return isSafe;
        });

        if (isPathSafe) {
          // Do one final check for adjacent cell safety of the last move
          const finalPos = path.reduce(
            (pos, move) => movementHelpers.getNextPosition(pos, move),
            { x: playerHead.x, y: playerHead.y }
          );
          if (movementHelpers.areAdjacentCellsSafe(map, finalPos)) {
            return path;
          }
        }
        continue;
      }

      // Add safe neighbors to queue
      const directions = {
        up: { x: -1, y: 0 },
        down: { x: 1, y: 0 },
        left: { x: 0, y: -1 },
        right: { x: 0, y: 1 },
      };

      for (const [direction, { x: dx, y: dy }] of Object.entries(directions)) {
        const newPos = { x: x + dx, y: y + dy };
        // Only check basic safety for path finding
        if (movementHelpers.isCellSafe(map, newPos)) {
          queue.push([newPos.x, newPos.y, [...path, direction]]);
        }
      }
    }
    return null;
  },
};

// Movement decision logic
function decideNextMove(map, mode) {
  const playerHead = movementHelpers.findPlayerHead(map, gameState.playerName);

  switch (mode) {
    case "timeout":
      return strategies.findSafeDirection(map, playerHead);

    case "survive":
      return strategies.findSafeDirection(map, playerHead);

    case "apple": {
      const path = strategies.findClosestApple(map, playerHead);
      if (path && path.length > 0) {
        const nextMove = path[0];
        const nextPos = movementHelpers.getNextPosition(playerHead, nextMove);

        if (
          movementHelpers.isCellSafe(map, nextPos) &&
          movementHelpers.areAdjacentCellsSafe(map, nextPos)
        ) {
          return nextMove;
        }
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
const ws = new WebSocket(
  `ws://${CONFIG.serverIP}:${CONFIG.serverPort}?id=${gameState.agentId}`
);

ws.on("open", () => console.log("Connected to WebSocket server"));
// Improve WebSocket error handling
ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});
ws.on("close", () => console.log("Disconnected from WebSocket by server"));

// Update WebSocket message handler
ws.on("message", (data) => {
  const receivedMsg = JSON.parse(data.toString("utf-8"));

  // Store player name when receiving the connection success message
  if (receivedMsg.message === "Player connected successfully.") {
    console.log(
      "Agent connected with name: '" +
        receivedMsg.name +
        "' and id: '" +
        gameState.agentId +
        "'."
    );
    gameState.playerName = receivedMsg.name;
    return;
  }

  const gameIsOver = receivedMsg.winner !== null;

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
