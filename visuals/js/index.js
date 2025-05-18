const gameTicksPerSecond = 20; // Adjust as needed

let socket; // WebSocket instance
let socketConnectingInterval; // Interval for reconnection attempts
let isConnectingOrConnected = false; // Connection state tracker

let moveCount = -1;
let dataList = [];
let lastFrameTime = Date.now();

// ========================================
// websockets
// ========================================

function connectWebSocket() {
  // Prevent multiple connections
  if (isConnectingOrConnected) return;

  // Mark as connecting
  isConnectingOrConnected = true;

  // Initialize or reinitialize the WebSocket connection
  socket = new WebSocket("ws://topic.aibg.best.hr:3000?id=frontend");
  setConnectionStatus("connecting");

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established");
    setConnectionStatus("connected");

    // reset frontend
    moveCount = -1; // Reset move counter
    dataList = [];
    lastFrameTime = Date.now();

    updateMoveCount(moveCount); // Update UI with the reset move counter
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
    setConnectionStatus("connection_fail");
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
    setConnectionStatus("connection_fail");
    // Close the socket if an error occurs to trigger the 'close' event listener
    // and thereby attempt reconnection. This also implicitly handles the 'close' event.
    socket.close();
  });
}

// Initially it is not connected
setConnectionStatus("connection_fail");

// Initial connection attempt
connectWebSocket();

// ========================================
// utility
// ========================================

function toggleEndScreen(data) {
  const winnerContainer = document.querySelector(".winner_container");
  const winnerNameElem = document.querySelector(".winner_container h1");
  const winnerTopTextElem = document.querySelector(".winner_container h2");

  if (data !== null) {
    if (data.winner === -1) {
      winnerTopTextElem.style.display = "none";
      winnerNameElem.textContent = "GAME DRAW";
    } else {
      winnerTopTextElem.style.display = "block";
      winnerNameElem.textContent = data.winner;
    }

    winnerContainer.style.opacity = "0";
    winnerContainer.style.display = "grid";
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

function updateMoveCount(moveCount) {
  document.querySelector(".move_number").textContent =
    "Move: " + (moveCount || "####");
}

function setConnectionStatus(status) {
  const connectionStatus = document.querySelector(".connection_status");
  if (!connectionStatus) return;
  const CONNECTION_FAIL = "connection_fail";
  const CONNECTION_SUCCESS = "connection_success";
  const CONNECTION_PING = "connection_pinging";
  connectionStatus.classList.remove(
    ...[CONNECTION_FAIL, CONNECTION_SUCCESS, CONNECTION_PING]
  );

  if (!status || status === "connection_fail") {
    connectionStatus.textContent = "Not connected to server";
    connectionStatus.classList.add(CONNECTION_FAIL);
  } else if (status === "connected") {
    connectionStatus.textContent = "Connected to server";
    connectionStatus.classList.add(CONNECTION_SUCCESS);
  } else if (status === "connecting") {
    connectionStatus.textContent = "Connecting...";
    connectionStatus.classList.add(CONNECTION_PING);
  }
}

// ========================================
// game logic
// ========================================

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
  moveCount = data.moveCount || moveCount;
  updateMoveCount(moveCount);

  // Update team info
  const teamInfoContainerElems = document.querySelectorAll(".team_info");
  if (data.players.length === 0) {
    // Reset team info if no players are present
    teamInfoContainerElems.forEach((elem) => {
      elem.querySelector(".team_name").textContent = "Team ####";
      elem.querySelector(".team_length").textContent = "Length: ####";
      elem.querySelector(".team_score").textContent = "Score: ####";

      elem.querySelectorAll(".item").forEach((itemElem) => {
        itemElem.style.filter = "grayscale(100%)";
      });
    });
  } else {
    data.players.forEach((player, index) => {
      teamInfoContainerElems[index].querySelector(".team_name").textContent =
        player.name;

      teamInfoContainerElems[index].querySelector(".team_length").textContent =
        "Length: " + player.body.length;

      teamInfoContainerElems[index].querySelector(".team_score").textContent =
        "Score: " + player.score;

      teamInfoContainerElems[index]
        .querySelectorAll(".item")
        .forEach((elem) => {
          elem.style.filter = "grayscale(100%)";
        });

      player.activeItems.forEach((item) => {
        // find element with data-value = item.type
        const itemElem = teamInfoContainerElems[index].querySelector(
          `[data-value="${item.type}"]`
        );

        // if itemElem is not present, skip
        if (!itemElem) return;

        itemElem.style.filter = "none";
      });
    });
  }

  // Update board
  window.boardUtils.updateGrid(data);

  // If winner is present, show the end screen
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

// ========================================
// URL params (?mode=debug or ?mode=finals)
// ========================================

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("mode") === "debug") {
  console.log("Debug mode is ON");

  // show all debug-only elements
  document
    .querySelectorAll(".debug-only")
    .forEach((elem) => elem.classList.remove("debug-only"));
} else if (urlParams.get("mode") === "finals") {
  console.log("Finals mode is ON");

  // show all finals-only elements
  document
    .querySelectorAll(".finals-only")
    .forEach((elem) => elem.classList.remove("finals-only"));
}
