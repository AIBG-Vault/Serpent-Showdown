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
  // wsUrl: "ws://localhost:3000",
  wsUrl: "ws://topic.aibg.best.hr:3000",
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

  findPlayerHead(map, playerName) {
    if (!map || !playerName) return { x: 0, y: 0 };

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const cell = map[i][j];
        if (
          cell &&
          cell.type === "snake-head" &&
          cell.playerName === playerName
        ) {
          return { x: i, y: j };
        }
      }
    }

    console.error("Player not found in map");
    // Return default position if player not found
    return { x: 0, y: 0 };
  },

  isSafeMove(map, pos) {
    if (
      !map ||
      !map[0] ||
      pos.x < 0 ||
      pos.x >= map.length ||
      pos.y < 0 ||
      pos.y >= map[0].length
    ) {
      return false;
    }

    const cell = map[pos.x][pos.y];

    // If cell is null, it's safe
    if (cell === null) return true;

    // If it's a snake part or border, it's not safe
    if (
      cell.type === "snake-head" ||
      cell.type === "snake-body" ||
      cell.type === "border"
    ) {
      return false;
    }

    // check if any cell next to pos is border or enemy player head
    ["border", "snake-head"].forEach((cellType) => {
      if (
        (map[pos.x - 1] &&
          map[pos.x - 1][pos.y] &&
          map[pos.x - 1][pos.y].type === cellType) ||
        (map[pos.x + 1] &&
          map[pos.x + 1][pos.y] &&
          map[pos.x + 1][pos.y].type === cellType) ||
        (map[pos.x][pos.y - 1] && map[pos.x][pos.y - 1].type === cellType) ||
        (map[pos.x][pos.y + 1] && map[pos.x][pos.y + 1].type === cellType)
      ) {
        return false;
      }
    });

    // Check if it's a safe item type
    const safeTypes = [
      "apple",
      "armour",
      "freeze",
      "golden-apple",
      "katana",
      "nausea",
      "reset-borders",
      "shorten",
      "tron",
    ];

    return safeTypes.includes(cell.type);
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

    // Define all possible moves with their priorities
    const directions = [
      { dRow: -1, dColumn: 0, move: "up" },
      { dRow: 1, dColumn: 0, move: "down" },
      { dRow: 0, dColumn: -1, move: "left" },
      { dRow: 0, dColumn: 1, move: "right" },
    ];

    // Randomize direction order to avoid predictable patterns
    directions.sort(() => Math.random() - 0.5);

    // First pass: Check for immediate safe moves
    for (const dir of directions) {
      const nextPos = {
        x: playerHead.x + dir.dRow,
        y: playerHead.y + dir.dColumn,
      };

      if (movementHelpers.isSafeMove(map, nextPos)) {
        return dir.move;
      }
    }

    // If no safe moves found, pick a random direction
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

      const cell = map[x][y];
      if (cell && cell.type === "apple") {
        // Validate the entire path to make sure it's still safe
        let currentPos = { x: playerHead.x, y: playerHead.y };
        for (const move of path) {
          const nextPos = movementHelpers.getNextPosition(currentPos, move);
          if (!movementHelpers.isSafeMove(map, nextPos)) {
            return null; // Path is not safe anymore
          }
          currentPos = nextPos;
        }
        return path;
      }

      const directions = [
        { dRow: -1, dColumn: 0, move: "up" },
        { dRow: 1, dColumn: 0, move: "down" },
        { dRow: 0, dColumn: -1, move: "left" },
        { dRow: 0, dColumn: 1, move: "right" },
      ];

      for (const { dRow, dColumn, move } of directions) {
        const newX = x + dRow;
        const newY = y + dColumn;
        const nextPos = { x: newX, y: newY };

        if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) continue;

        // Use isSafeMove to check if the next position is safe
        if (!movementHelpers.isSafeMove(map, nextPos)) continue;

        queue.push([newX, newY, [...path, move]]);
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
