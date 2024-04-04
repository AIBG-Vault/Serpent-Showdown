const WebSocket = require("ws");

// Get the agentId and playAsPlayer from the command-line arguments
// node agent.js ID playAsPlayer
// process.argv[0] is node
// process.argv[1] is client1.js

let agentId = process.argv[2]; // each team has their secret unique ID

if (!agentId) {
  agentId = "12345";
  console.error("ID not provided as a parameter, using default: " + agentId);
}
// console.log(agentId);

const modeId = process.argv[3]; // 0 or 1 or 2
let mode; // normal or timeout or illegalMove

if (!modeId) {
  mode = "normal";
  console.error("modeId not provided as a parameter, using default: " + mode);
} else {
  switch (modeId) {
    case "0":
      mode = "normal";
      break;

    case "1":
      mode = "timeout";
      break;

    case "2":
      mode = "illegalMove";
      break;

    default:
      mode = "normal";
      console.error("Unknown modeId, using default: " + mode);
  }
}
// console.log(mode);

const ws = new WebSocket(`ws://localhost:3000?id=${agentId}`);

let delayBetweenMoves = 2;

ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

ws.on("message", (data) => {
  const receivedMsg = JSON.parse(data.toString("utf-8"));
  console.log("Received message:", receivedMsg);

  if (receivedMsg.placingIndexes?.includes(0)) {
    moveIndex = 0;
  } else if (receivedMsg.placingIndexes?.includes(17)) {
    moveIndex = 1;
  }

  let gameIsOver =
    receivedMsg.winner !== null && receivedMsg.winner !== undefined;

  // if (gameIsOver) {
  //   console.log("Game over");
  // }

  // Send a move to the server
  if (receivedMsg.currentTurn == agentId && !gameIsOver) {
    // console.log("Sending move:", movesToPlay[moveCounter]);
    setTimeout(() => {
      ws.send(JSON.stringify(movesToPlay[moveIndex]));
      moveIndex += 2;
      //console.log("moveCounter", moveCounter);
    }, delayBetweenMoves);

    if (mode === "timeout") {
      delayBetweenMoves += 300;
    }
  }
});

ws.on("close", () => {
  console.log("Disconnected from WebSocket by server");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

let moveIndex;
let movesToPlay;

if (mode === "illegalMove") {
  movesToPlay = [
    {
      creatureId: 1,
      x: 9,
      y: 7,
      playerId: agentId,
    },
  ];
} else {
  movesToPlay = [
    // {
    //     startSquare: { x: 0, y: 0 }, // suicid moguć, ovo prolazi
    //     attackSquare: { x: 0, y: 0 },
    // },
    // {
    //     startSquare: { x: 0, y: 2 }, // Ranged ne može napast nakon pomicanja
    //     targetSquare: { x: 1, y: 2 },
    //     attackSquare: { x: 17, y: 2 },
    // },
    // PLACING MOVES
    {
      creatureId: 1,
      x: 0,
      y: 0,
      playerId: agentId,
    },
    {
      creatureId: 1,
      x: 17,
      y: 0,
      playerId: agentId,
    },
    // {
    //     restart: {}
    // },
    // {},
    {
      creatureId: 2,
      x: 0,
      y: 2,
      playerId: agentId,
    },
    {
      creatureId: 2,
      x: 17,
      y: 2,
      playerId: agentId,
    },
    {
      creatureId: 3,
      x: 0,
      y: 4,
      playerId: agentId,
    },
    {
      creatureId: 3,
      x: 17,
      y: 4,
      playerId: agentId,
    },
    {
      creatureId: 4,
      x: 0,
      y: 6,
      playerId: agentId,
    },
    {
      creatureId: 4,
      x: 17,
      y: 6,
      playerId: agentId,
    },
    {
      creatureId: 5,
      x: 0,
      y: 8,
      playerId: agentId,
    },
    {
      creatureId: 5,
      x: 17,
      y: 8,
      playerId: agentId,
    },
    {
      creatureId: 6,
      x: 0,
      y: 10,
      playerId: agentId,
    },
    {
      creatureId: 6,
      x: 17,
      y: 10,
      playerId: agentId,
    },
    {
      creatureId: 7,
      x: 0,
      y: 12,
      playerId: agentId,
    },
    {
      creatureId: 7,
      x: 17,
      y: 12,
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 0 }, // Pikemeni se bijedu
      targetSquare: { x: 6, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 0 },
      targetSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 6, y: 0 },
      targetSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 10, y: 0 },
      attackSquare: { x: 11, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 }, // Marksmani se bijedu
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      targetSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 2 },
      targetSquare: null,
      attackSquare: { x: 17, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 2 },
      attackSquare: { x: 0, y: 2 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 4 }, // Knightsi se bijedu
      targetSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 4 },
      targetSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 4 },
      attackSquare: { x: 8, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 }, // Archeri se bijedu
      attackSquare: { x: 17, y: 2 }, // tu prvo puca na marksmena
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 6 },
      attackSquare: { x: 0, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 8 }, // Cavalry Attacks armored peasant
      targetSquare: { x: 9, y: 8 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 8 },
      targetSquare: { x: 8, y: 8 },
      playerId: agentId,
    },
    {
      startSquare: { x: 9, y: 8 },
      targetSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 8, y: 8 },
      targetSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 16, y: 10 },
      attackSquare: { x: 17, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 1, y: 10 },
      attackSquare: { x: 0, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 }, // Phoenixi napadaju Cavalry
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 },
      targetSquare: { x: 1, y: 11 },
      attackSquare: { x: 1, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 16, y: 11 },
      attackSquare: { x: 16, y: 10 },
      playerId: agentId,
    },
    {
      startSquare: { x: 0, y: 12 }, // phoenixi ideju zbiti ostale
      targetSquare: { x: 3, y: 8 },
      playerId: agentId,
    },
    {
      startSquare: { x: 17, y: 12 },
      targetSquare: { x: 15, y: 9 },
      playerId: agentId,
    },
    {
      startSquare: { x: 3, y: 8 },
      targetSquare: { x: 6, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 15, y: 9 },
      targetSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 6, y: 6 },
      targetSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 10, y: 4 },
      attackSquare: { x: 9, y: 4 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 16, y: 6 },
      attackSquare: { x: 17, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 11, y: 0 },
      attackSquare: { x: 10, y: 0 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 }, // phoenixi se bijedu
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
    {
      startSquare: { x: 12, y: 5 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 13, y: 6 },
      playerId: agentId,
    },
    {
      startSquare: { x: 13, y: 6 },
      targetSquare: { x: 12, y: 6 },
      attackSquare: { x: 12, y: 5 },
      playerId: agentId,
    },
  ];
}
