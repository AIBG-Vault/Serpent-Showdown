let socket; // WebSocket instance
let socketConnectingInterval; // Interval for reconnection attempts
let moveCounter = -1;
let dataList = [];
let gameTicksPerSecond = 50; // Adjust as needed
let hasReceivedCreatureUpdates = false;
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
    // Assuming dataList is defined elsewhere and you want to keep adding data to it
    dataList.push(JSON.parse(message.data));
  });

  socket.addEventListener("close", (message) => {
    console.log("WebSocket connection closed:", message);
    // Check if a reconnection attempt isn't already scheduled before setting a new interval
    if (!socketConnectingInterval) {
      socketConnectingInterval = setInterval(connectWebSocket, 1000);
    }
  });

  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
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

// Function to hide the winner
function hideWinner() {
  const winnerContainer = $(".winner_container");
  if (winnerContainer.is(":visible")) {
    winnerContainer.animate({ opacity: 0 }, 500, function () {
      winnerContainer.css("display", "none");
    });
  }
}

function updateMoveCount(moveCounter) {
  document.querySelector(".move_number").textContent =
    "Move: " + (moveCounter || "####");
}

function updateCreatureStats(creatures, containerSelector) {
  const creatureMapping = {
    Arc: "Archer",
    ArP: "ArmoredPeasant",
    Cav: "Cavalry",
    Kni: "Knight",
    Mar: "Marksman",
    Phx: "Phoenix",
    Pik: "Pikeman",
  };

  // Update the flag if we have at least one creature in the array
  if (creatures.length > 0 && creatures.some((creature) => creature !== null)) {
    hasReceivedCreatureUpdates = true;
  }

  // Only apply dead if we have received creature updates
  if (hasReceivedCreatureUpdates) {
    document
      .querySelectorAll(containerSelector + " .creature")
      .forEach((creatureElement) => {
        creatureElement.classList.add("dead");

        // Update HP
        const hpElement = creatureElement.querySelector(".HP p");
        hpElement.textContent = "0";
      });
  }

  creatures.forEach((creature) => {
    if (creature) {
      // Ensure creature is not null
      const creatureName = creatureMapping[creature.name];
      if (creatureName) {
        const creatureElement = Array.from(
          document.querySelectorAll(containerSelector + " .creature img[alt]")
        ).find((img) => img.alt === creatureName)?.parentNode;

        if (creatureElement) {
          // Alive creature found, remove dead
          creatureElement.classList.remove("dead");

          // Update HP
          const hpElement = creatureElement.querySelector(".HP p");
          hpElement.textContent = creature.health;

          // Update Attack
          const attackElement = creatureElement.querySelector(".Attack p");
          attackElement.textContent = creature.attackDamage;

          // Update ROM
          const romElement = creatureElement.querySelector(".ROM p");
          romElement.textContent = creature.rangeOfMovement;
        }
      }
    }
  });

  // For creatures not in the current update, keep or apply dead based on the flag
  if (hasReceivedCreatureUpdates) {
    document
      .querySelectorAll(containerSelector + " .creature img[alt]")
      .forEach((img) => {
        const creatureName = Object.keys(creatureMapping).find(
          (key) => creatureMapping[key] === img.alt
        );
        const isDead = !creatures.some(
          (creature) => creature && creature.name === creatureName
        );
        if (isDead) {
          img.parentNode.classList.add("dead");
        }
      });
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

    if (dataList.length > 0) {
      parseData(dataList.shift());
    }

    // Additional game logic can be processed here
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);

function toggleWinner(data) {
  const winnerId = data.winner;
  const teamOneName = data.player1;
  const teamTwoName = data.player2;

  const winnerContainer = $(".winner_container");
  const winnerMessage = $(".winner_container h1");

  if (winnerContainer.is(":visible")) {
    winnerContainer.animate({ opacity: 0 }, 500, function () {
      winnerContainer.css("display", "none");
      winnerMessage.text(""); // Use jQuery for consistency
    });
  } else {
    let message; // Ensure the variable is declared
    if (winnerId == -1) {
      message = "Game draw";
    } else {
      let winningTeam = winnerId == 0 ? teamOneName : teamTwoName;
      message = winningTeam;
    }

    winnerMessage.text(message); // Moved inside else block
    winnerContainer.css("display", "grid").animate({ opacity: 1 }, 1500);
  }
}

toggleWinner({});

const abeceda = "abcdefghijkl";

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

  let teamOneCreatures = [];
  let teamTwoCreatures = [];

  for (let row = 0; row < field.length; row++) {
    for (let column = 0; column < field[row].length; column++) {
      let creature = field[row][column];
      if (creature !== null) {
        if (creature.team === 0) {
          teamOneCreatures.push(creature);
        } else if (creature.team === 1) {
          teamTwoCreatures.push(creature);
        } else {
          console.error("Unknown creature team: ", creature);
        }
      }

      // TODO: display creatures on board
    }
  }

  updateCreatureStats(teamOneCreatures, ".left_container .creatures");
  updateCreatureStats(teamTwoCreatures, ".right_container .creatures");

  if (data.winner !== null) {
    toggleWinner(data);
  }

  // for testing

  // var board1 = Chessboard("board", {
  //   position: {
  //     d6: "bK",
  //     d4: "wP",
  //     e4: "wK",
  //     h8: "wK",
  //     l9: "wK",
  //     i10: "wK",
  //     j10: "wK",
  //     k11: "wK",
  //     l12: "wK",
  //   },
  //   showNotation: true,
  //   orientation: "black",
  // });

  // setTimeout(() => {
  //   board1.position({
  //     e6: "bK",
  //     e4: "wP",
  //   });
  // }, 1000);

  // setTimeout(() => {
  //   board1.position({
  //     a1: "wK",
  //     a2: "bK",
  //     b2: "wD",
  //     b3: "bD",
  //     c3: "wP",
  //     c4: "bP",
  //     d4: "wC",
  //     d5: "bC",
  //     e5: "wJ",
  //     e6: "bJ",
  //     h7: "wN",
  //     h8: "bN",
  //     i8: "wL",
  //     i9: "bL",
  //     j9: "wT",
  //     j10: "bT",
  //     k10: "wV",
  //     k11: "bV",
  //     l11: "wS",
  //     l12: "bS",
  //   });
  // }, 2000);

  // setTimeout(() => {
  //   board1.position({
  //     a12: "wK",
  //     a11: "bK",
  //     b11: "wD",
  //     b10: "bD",
  //     c10: "wP",
  //     c9: "bP",
  //     d9: "wC",
  //     d8: "bC",
  //     e8: "wJ",
  //     e7: "bJ",
  //     h6: "wN",
  //     h5: "bN",
  //     i5: "wL",
  //     i4: "bL",
  //     j4: "wT",
  //     j3: "bT",
  //     k3: "wV",
  //     k2: "bV",
  //     l2: "wS",
  //     l1: "bS",
  //   });
  // }, 3000);

  // ========================================
  // set winner if game is over
}

// ========================================
// dynamic content loading
// ========================================

const board = Chessboard("board", {
  position: {
    d6: "bK",
    d4: "wP",
    e4: "wK",
    h8: "wK",
    l9: "wK",
    i10: "wK",
    j10: "wK",
    k11: "wK",
    l12: "wK",
  },
  showNotation: false,
  orientation: "black",
});
$(window).resize(board.resize);
