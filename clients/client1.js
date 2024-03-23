const WebSocket = require("ws");
const myId = "1234567890";

const ws = new WebSocket(`ws://localhost:3000?id=${myId}`);

ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString("utf-8"));
  console.log("Received message:", message);

  if (message.winner !== null && message.winner !== undefined) {
    console.log("Game over. Disconnecting from WebSocket server");
    ws.close();
  }

  // Send a move to the server
  if (message.currentTurn && message.winner === null) {
    console.log("Sending move:", movesToPlay[moveCounter]);
    setTimeout(() => {
      ws.send(JSON.stringify(movesToPlay[moveCounter]));
      moveCounter += 2;
      //console.log("moveCounter", moveCounter);
    }, 2);
  }
});

ws.on("close", () => {
  ws.close();
  console.log("Disconnected from WebSocket server");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

let moveCounter = 0;

const movesToPlay = [
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
    playerId: myId,
  },
  {
    creatureId: 1,
    x: 17,
    y: 0,
    playerId: myId,
  },
  // {
  //     restart: {}
  // },
  // {},
  {
    creatureId: 2,
    x: 0,
    y: 2,
    playerId: myId,
  },
  {
    creatureId: 2,
    x: 17,
    y: 2,
    playerId: myId,
  },
  {
    creatureId: 3,
    x: 0,
    y: 4,
    playerId: myId,
  },
  {
    creatureId: 3,
    x: 17,
    y: 4,
    playerId: myId,
  },
  {
    creatureId: 4,
    x: 0,
    y: 6,
    playerId: myId,
  },
  {
    creatureId: 4,
    x: 17,
    y: 6,
    playerId: myId,
  },
  {
    creatureId: 5,
    x: 0,
    y: 8,
    playerId: myId,
  },
  {
    creatureId: 5,
    x: 17,
    y: 8,
    playerId: myId,
  },
  {
    creatureId: 6,
    x: 0,
    y: 10,
    playerId: myId,
  },
  {
    creatureId: 6,
    x: 17,
    y: 10,
    playerId: myId,
  },
  {
    creatureId: 7,
    x: 0,
    y: 12,
    playerId: myId,
  },
  {
    creatureId: 7,
    x: 17,
    y: 12,
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 0 }, // Pikemeni se bijedu
    targetSquare: { x: 6, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 0 },
    targetSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 6, y: 0 },
    targetSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 10, y: 0 },
    attackSquare: { x: 11, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 }, // Marksmani se bijedu
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    targetSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 2 },
    targetSquare: null,
    attackSquare: { x: 17, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 2 },
    attackSquare: { x: 0, y: 2 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 4 }, // Knightsi se bijedu
    targetSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 4 },
    targetSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 4 },
    attackSquare: { x: 8, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 }, // Archeri se bijedu
    attackSquare: { x: 17, y: 2 }, // tu prvo puca na marksmena
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 6 },
    attackSquare: { x: 0, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 8 }, // Cavalry Attacks armored peasant
    targetSquare: { x: 9, y: 8 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 8 },
    targetSquare: { x: 8, y: 8 },
    playerId: myId,
  },
  {
    startSquare: { x: 9, y: 8 },
    targetSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 8, y: 8 },
    targetSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 16, y: 10 },
    attackSquare: { x: 17, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 1, y: 10 },
    attackSquare: { x: 0, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 }, // Phoenixi napadaju Cavalry
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 },
    targetSquare: { x: 1, y: 11 },
    attackSquare: { x: 1, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 16, y: 11 },
    attackSquare: { x: 16, y: 10 },
    playerId: myId,
  },
  {
    startSquare: { x: 0, y: 12 }, // phoenixi ideju zbiti ostale
    targetSquare: { x: 3, y: 8 },
    playerId: myId,
  },
  {
    startSquare: { x: 17, y: 12 },
    targetSquare: { x: 15, y: 9 },
    playerId: myId,
  },
  {
    startSquare: { x: 3, y: 8 },
    targetSquare: { x: 6, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 15, y: 9 },
    targetSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 6, y: 6 },
    targetSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 10, y: 4 },
    attackSquare: { x: 9, y: 4 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 16, y: 6 },
    attackSquare: { x: 17, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 11, y: 0 },
    attackSquare: { x: 10, y: 0 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 }, // phoenixi se bijedu
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
  {
    startSquare: { x: 12, y: 5 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 13, y: 6 },
    playerId: myId,
  },
  {
    startSquare: { x: 13, y: 6 },
    targetSquare: { x: 12, y: 6 },
    attackSquare: { x: 12, y: 5 },
    playerId: myId,
  },
];
