const gameTicksPerSecond = 10; // Adjust as needed

let socket; // WebSocket instance
let socketConnectingInterval; // Interval for reconnection attempts
let isConnectingOrConnected = false; // Connection state tracker

let moveCounter = -1;
const dataList = [];
let lastFrameTime = Date.now();

let teamOneName;
let teamTwoName;

const creatureMapping = {
  Arc: "Archer",
  ArP: "Peasant",
  Cav: "Cavalry",
  Kni: "Knight",
  Mar: "Marksman",
  Phx: "Phoenix",
  Pik: "Pikeman",
};

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
    hideEndScreen(); // Hide the winner upon reconnection
    moveCounter = 0; // Reset move counter
    updateMoveCount(moveCounter); // Update UI with the reset move counter
    if (socketConnectingInterval) {
      clearInterval(socketConnectingInterval);
      socketConnectingInterval = null;
    }
    // Mark as connected
    isConnectingOrConnected = true;
  });

  socket.addEventListener("message", (message) => {
    dataList.push(JSON.parse(message.data));
  });

  socket.addEventListener("close", (message) => {
    console.log("WebSocket connection closed:", message);
    // Reset connection state to allow reconnection attempts
    isConnectingOrConnected = false;
    // Check if a reconnection attempt isn't already scheduled before setting a new interval
    if (!socketConnectingInterval) {
      socketConnectingInterval = setInterval(connectWebSocket, 1000);
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

function showWinner(data) {
  const winnerId = data.winner;
  const winnerRemainingHP = data.winnerHealth;

  const winnerContainer = $(".winner_container");
  const winnerMessage = $(".winner_container h1");
  const extraInfoElem = $(".winner_container h2").last();

  if (!winnerContainer.is(":visible")) {
    if (winnerId == -1 || winnerId == 2) {
      winnerMessage.text("Game draw");
      extraInfoElem.text("");
    } else {
      let winningTeam = winnerId == 0 ? teamOneName : teamTwoName;
      winnerMessage.text(winningTeam);
      extraInfoElem.text("Remaining HP: " + winnerRemainingHP);
    }

    winnerContainer.css("display", "grid").animate({ opacity: 1 }, 1500);
  }
}

function showMessage(data) {
  const msg = data.message;

  // console.log(data);

  const winnerTeamName =
    data.currentTurn == teamOneName ? teamTwoName : teamOneName;

  const winnerContainer = $(".winner_container");
  const winnerMessage = $(".winner_container h1");
  const extraInfoElem = $(".winner_container h2").last();

  if (!winnerContainer.is(":visible")) {
    winnerMessage.text(winnerTeamName);
    if (msg === "Agent timed out") {
      extraInfoElem.text(data.currentTurn + " timed out");
    } else {
      extraInfoElem.text(data.currentTurn + " played an illegal move");
    }

    winnerContainer.css("display", "grid").animate({ opacity: 1 }, 1500);
  }
}

function hideEndScreen() {
  const winnerContainer = $(".winner_container");
  const winnerMessage = $(".winner_container h1");
  const winnerHPElem = $(".winner_container h2").last();

  if (winnerContainer.is(":visible")) {
    winnerContainer.animate({ opacity: 0 }, 500, function () {
      winnerContainer.css("display", "none");
      winnerMessage.text("");
      winnerHPElem.text("Remaining HP: " + "###");
    });
  }
}

function updateMoveCount(moveCounter) {
  document.querySelector(".move_number").textContent =
    "Move: " + (moveCounter || "####");
}

function updateCreatureStats(creatures, containerSelector) {
  creatures.forEach((creature) => {
    if (creature) {
      // Ensure creature is not null
      const creatureName = creatureMapping[creature.name];
      if (creatureName) {
        const creatureElement = Array.from(
          document.querySelectorAll(containerSelector + " .creature img[alt]")
        ).find((img) => img.alt === creatureName)?.parentNode;

        // Update HP
        const hpElement = creatureElement.querySelector(".HP p");

        if (creature.health > 0) {
          hpElement.textContent = creature.health;
          creatureElement.classList.remove("dead");
        } else {
          hpElement.textContent = 0;
          creatureElement.classList.add("dead");
        }

        // Update Attack
        const attackElement = creatureElement.querySelector(".Attack p");
        attackElement.textContent = creature.attackDamage;

        // Update ROM
        const romElement = creatureElement.querySelector(".ROM p");
        romElement.textContent = creature.rangeOfMovement;
      }
    }
  });
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

    if (dataList.length > 0) {
      parseData(dataList.shift());
      // console.log(dataList.length);
    }

    // Additional game logic can be processed here
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

function parseData(data) {
  console.log(data);

  if (data.message) {
    showMessage(data);
  }

  teamOneName = data.player1;
  teamTwoName = data.player2;

  moveCounter++;
  updateMoveCount(moveCounter);

  // ========================================
  // set players

  const teamNameElems = document.querySelectorAll(".team_name");
  teamNameElems[0].textContent = data.player1 || "Tema name 1";
  teamNameElems[1].textContent = data.player2 || "Team name 2";

  // ========================================
  // set board
  let field = data.field;

  // Calculate board position, considering that the first index is for columns and the second is for rows

  // Main logic to build the position object for chessboard.js
  let position = {};

  for (let column = 0; column < field[0].length; column++) {
    for (let row = 0; row < field.length; row++) {
      let creature = field[row][column];
      if (creature !== null) {
        // Calculate the chessboard notation for the current cell
        const cellName = positionFromIndices(column, row);
        // Get the chess piece code for this creature
        // console.log(creature);

        position[cellName] =
          creature.team == 0
            ? "b" + creatureMapping[creature.name]
            : "o" + creatureMapping[creature.name];
        // console.log(position);
      }
    }
  }

  // Update the board with the new position
  board.position(position);

  // ========================================
  // set creatures

  let teamOneCreatures = data.player1Creatures;
  let teamTwoCreatures = data.player2Creatures;

  updateCreatureStats(teamOneCreatures, ".left_container .creatures");
  updateCreatureStats(teamTwoCreatures, ".right_container .creatures");

  if (data.winner !== null) {
    showWinner(data);
  }
}

// ========================================
// dynamic content loading
// ========================================

const board = Chessboard("board", {
  // position: {
  //   d4: "bArcher",
  //   e5: "bCavalry",
  //   f6: "bPeasant",
  //   g7: "bKnight",
  //   h8: "bMarksman",
  //   i9: "bPhoenix",
  //   j10: "bPikeman",
  //   d5: "oArcher",
  //   e6: "oCavalry",
  //   f7: "oPeasant",
  //   g8: "oKnight",
  //   h9: "oMarksman",
  //   i10: "oPhoenix",
  //   j11: "oPikeman",
  // },

  pieceTheme: "img/pieces/{piece}.gif",
  showNotation: true,
  orientation: "black",
});
$(window).resize(board.resize);

// ========================================
// particles.js background
// ========================================

particlesJS.load(
  "particles-js",
  "../assets/particlesjs-config.json",
  function () {
    console.log("callback - particles.js config loaded");
  }
);
