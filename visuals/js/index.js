const gameTicksPerSecond = 20; // Adjust as needed

let socket; // WebSocket instance
let socketConnectingInterval; // Interval for reconnection attempts
let isConnectingOrConnected = false; // Connection state tracker

let moveCounter = -1;
let dataList = [];
let lastFrameTime = Date.now();

let teamOneName = null;
let teamTwoName = null;

// ========================================
// websockets
// ========================================

function connectWebSocket() {
  // Prevent multiple connections
  if (isConnectingOrConnected) return;

  // Mark as connecting
  isConnectingOrConnected = true;

  // Initialize or reinitialize the WebSocket connection
  socket = new WebSocket("ws://localhost:3000?id=frontend");

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established");

    // reset frontend
    moveCounter = -1; // Reset move counter
    dataList = [];
    lastFrameTime = Date.now();

    teamOneName = null;
    teamTwoName = null;

    updateMoveCount(moveCounter); // Update UI with the reset move counter
    toggleEndScreen(null); // Hide the winner upon reconnection

    if (socketConnectingInterval) {
      clearInterval(socketConnectingInterval);
      socketConnectingInterval = null;
    }
    // Mark as connected
    isConnectingOrConnected = true;
  });

  socket.addEventListener("message", (message) => {
    const data = JSON.parse(message.data);
    // console.log("Received from server:", data);
    dataList.push(data);
  });

  socket.addEventListener("close", (message) => {
    console.log("WebSocket connection closed:", message);
    // Reset connection state to allow reconnection attempts
    isConnectingOrConnected = false;
    // Check if a reconnection attempt isn't already scheduled before setting a new interval
    if (!socketConnectingInterval) {
      socketConnectingInterval = setInterval(connectWebSocket, 500);
    }
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    // Close the socket if an error occurs to trigger the 'close' event listener
    // and thereby attempt reconnection. This also implicitly handles the 'close' event.
    socket.close();
  });
}

// Initial connection attempt
connectWebSocket();

// ========================================
// utility
// ========================================

function toggleEndScreen(data) {
  const winnerContainer = document.querySelector(".winner_container");
  const winnerNameElem = document.querySelector(".winner_container h1");

  if (data !== null) {
    if (data.winner === -1) {
      winnerNameElem.textContent = "Game draw";
    } else {
      winnerNameElem.textContent = data.winner;
    }

    winnerContainer.style.display = "grid";
    winnerContainer.style.opacity = "0";
    setTimeout(() => {
      winnerContainer.style.opacity = "1";
      winnerContainer.style.transition = "opacity 1.5s";
    }, 0);
  } else {
    winnerContainer.style.opacity = "0";
    winnerContainer.style.transition = "opacity 0.5s";
    setTimeout(() => {
      winnerContainer.style.display = "none";
      winnerNameElem.textContent = "";
    }, 500);
  }
}

function updateMoveCount(moveCounter) {
  document.querySelector(".move_number").textContent =
    "Move: " + (moveCounter || "####");
}

// ========================================
// game logic
// ========================================

function positionFromIndices(column, row) {
  // Adjust the row number for chessboard.js (which starts at the bottom for "white" orientation)
  const rowNum = row + 1; // Adjust if your board size changes
  const colLetter = String.fromCharCode("a".charCodeAt(0) + column); // Converts 0 -> "a", 1 -> "b", etc.
  return colLetter + rowNum;
}

function gameLoop() {
  let now = Date.now();
  let elapsed = now - lastFrameTime;

  // Check if it's time for the next tick
  if (elapsed > 1000 / gameTicksPerSecond) {
    lastFrameTime = now - (elapsed % (1000 / gameTicksPerSecond));

    // console.log(dataList.length);
    if (dataList.length > 0) {
      parseData(dataList.shift());
      // console.log(dataList.length);
    }
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

function parseData(data) {
  console.log("Processing game state:", data);

  // Update move counter
  moveCounter = data.moveCounter || moveCounter;
  updateMoveCount(moveCounter);

  // Update player information
  if (data.players && data.players.length === 2) {
    const [player1, player2] = data.players;

    // Update player names
    const teamNameElems = document.querySelectorAll(".team_name");
    teamNameElems[0].textContent = player1.name || "Team name 1";
    teamNameElems[1].textContent = player2.name || "Team name 2";

    // Update scores
    document.querySelector(
      ".left_container .team_score"
    ).textContent = `Score: ${player1.score}`;
    document.querySelector(
      ".right_container .team_score"
    ).textContent = `Score: ${player2.score}`;

    // Update lengths
    document.querySelector(
      ".left_container .team_length"
    ).textContent = `Length: ${player1.body?.length}`;
    document.querySelector(
      ".right_container .team_length"
    ).textContent = `Length: ${player2.body?.length}`;
  }

  // Update board
  window.boardUtils.updateGrid(data.map);

  if (data.winner) {
    toggleEndScreen(data);
    return;
  }
}

// ========================================
// particles.js background
// ========================================

particlesJS.load(
  "particles-js",
  "./assets/particlesjs-config.json",
  function () {
    console.log("callback - particles.js config loaded");
  }
);
