let socket; // WebSocket instance
let socketConnectingInterval; // Interval for reconnection attempts
let moveCounter = -1;
let dataList = [];
let gameTicksPerSecond = 25; // Adjust as needed
// let hasReceivedCreatureUpdates = false;
let lastFrameTime = Date.now();

// ========================================
// websockets
// ========================================

function connectWebSocket() {
  // Initialize or reinitialize the WebSocket connection
  socket = new WebSocket("ws://localhost:3000?id=frontend");

  socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established");
    hideWinner(); // Hide the winner upon reconnection
    moveCounter = 0; // Reset move counter
    updateMoveCount(moveCounter); // Update UI with the reset move counter
    if (socketConnectingInterval) {
      clearInterval(socketConnectingInterval);
      socketConnectingInterval = null;
    }
  });

  socket.addEventListener("message", (message) => {
    // console.log("Message from server:", message.data);
    dataList.push(JSON.parse(message.data));
  });

  socket.addEventListener("close", (message) => {
    // console.log("WebSocket connection closed:", message);
    // Check if a reconnection attempt isn't already scheduled before setting a new interval
    if (!socketConnectingInterval) {
      socketConnectingInterval = setInterval(connectWebSocket, 1000);
    }
  });

  socket.addEventListener("error", (error) => {
    // console.error("WebSocket error:", error);
    // Close the socket if an error occurs to trigger the 'close' event listener
    // and thereby attempt reconnection
    socket.close();
  });
}

// Initial connection attempt
connectWebSocket();

// ========================================
// utility
// ========================================

function hideWinner() {
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

function showWinner(data) {
  const winnerId = data.winner;
  const winnerRemainingHP = data.winnerHealth;
  const teamOneName = data.player1;
  const teamTwoName = data.player2;

  const winnerContainer = $(".winner_container");
  const winnerMessage = $(".winner_container h1");
  const winnerHPElem = $(".winner_container h2").last();

  if (!winnerContainer.is(":visible")) {
    let message;
    if (winnerId == -1 || winnerId == 2) {
      message = "Game draw";
    } else {
      let winningTeam = winnerId == 0 ? teamOneName : teamTwoName;
      message = winningTeam;
    }

    winnerMessage.text(message);
    winnerHPElem.text("Remaining HP: " + winnerRemainingHP);
    winnerContainer.css("display", "grid").animate({ opacity: 1 }, 1500);
  }
}

function updateMoveCount(moveCounter) {
  document.querySelector(".move_number").textContent =
    "Move: " + (moveCounter || "####");
}

const creatureMapping = {
  Arc: "Archer",
  ArP: "Peasant",
  Cav: "Cavalry",
  Kni: "Knight",
  Mar: "Marksman",
  Phx: "Phoenix",
  Pik: "Pikeman",
};

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

function creatureImageURL(creature) {
  const teamColor = creature.team === 0 ? "blue" : "orange";

  const creatureName = creatureMapping[creature.name];
  const imageName = creatureName.toLowerCase();
  const imgPath = `../img/sprites/gifs-${teamColor}/${imageName}.gif`;

  console.log(imgPath);

  return imgPath;
}

function creatureCode(creature) {
  const teamColor = creature.team === 0 ? "blue" : "orange";

  const creatureName = creatureMapping[creature.name];
  const imageName = creatureName.toLowerCase();
  const imgPath = `../img/sprites/gifs-${teamColor}/${imageName}.gif`;

  // console.log(imgPath);

  return imgPath;
}

function parseData(data) {
  // console.log(data);
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
  // console.log(gameState);

  // Assume a mapping function or object is defined

  // Calculate board position, considering that the first index is for columns and the second is for rows
  function positionFromIndices(column, row) {
    // Adjust the row number for chessboard.js (which starts at the bottom for "white" orientation)
    const rowNum = row + 1; // Adjust if your board size changes
    const colLetter = String.fromCharCode("a".charCodeAt(0) + column); // Converts 0 -> "a", 1 -> "b", etc.
    return colLetter + rowNum;
  }

  // Main logic to build the position object for chessboard.js
  let position = {};

  for (let column = 0; column < field[0].length; column++) {
    for (let row = 0; row < field.length; row++) {
      let creature = field[row][column];
      if (creature !== null) {
        // Calculate the chessboard notation for the current cell
        const cellName = positionFromIndices(column, row);
        // Get the chess piece code for this creature
        position[cellName] = "wP";
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
  //   d4: "wP",
  //   l13: "bArcher",
  //   //   o13: "bArcher",
  // },

  pieceTheme: "img/pieces/{piece}.png",
  showNotation: true,
  orientation: "black",
});
$(window).resize(board.resize);
