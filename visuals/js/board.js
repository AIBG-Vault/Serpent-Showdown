// Initialize grid on page load
document.addEventListener("DOMContentLoaded", () => {
  createGrid();
});

function createGrid(rows = 15, cols = 30) {
  const board = document.getElementById("gameBoard");
  board.style.gridTemplateColumns = `repeat(${cols}, 1.75rem)`;
  board.innerHTML = ""; // Clear existing grid

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${i}-${j}`;
      board.appendChild(cell);
    }
  }
}

function updateGrid(data) {
  if (!data.map || !Array.isArray(data.map) || data.map.length === 0) {
    console.error("Invalid map data");
    return;
  }

  const rows = data.map.length;
  const cols = data.map[0].length;

  const board = document.getElementById("gameBoard");
  const currentRows = board.style.gridTemplateRows.match(/repeat\((\d+)/)?.[1];
  const currentCols =
    board.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];

  // Only recreate grid if dimensions changed
  if (currentRows != rows || currentCols != cols) {
    createGrid(rows, cols);
  }

  // Update cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.className = "cell";
      cell.textContent = ""; // Clear any previous content

      if (data.map) {
        const value = data.map[i][j];
        if (typeof value === "object" && value !== null) {
          cell.classList.add(value.type || "unknown");

          // Handle object values
          if (value.type === "snake-head") {
            cell.classList.add("snake");
            cell.classList.add("snake-head");
            cell.classList.add(
              value.playerName === data.players[0].name
                ? "snake-player1-head"
                : "snake-player2-head"
            );
          } else if (value.type === "snake-body") {
            cell.classList.add("snake");
            cell.classList.add("snake-body");
            cell.classList.add(
              value.playerName === data.players[0].name
                ? "snake-player1-body"
                : "snake-player2-body"
            );
          } else {
            cell.classList.add("item");
            // cell.textContent = value.symbol || "?";
          }

          // add borders (outlines) based on affect property
          if (value.affect === "self") {
            cell.classList.add("affect-self");
          } else if (value.affect === "enemy") {
            cell.classList.add("affect-enemy");
          } else if (value.affect === "both") {
            cell.classList.add("affect-both");
          }
        }
      }
    }
  }

  updatePlayersSnakes(data.players);

  if (data.winner) {
    if (data.winner === -1) {
      // draw - grayscale all snakes
      const allSnakesCells = document.querySelectorAll(".snake");
      allSnakesCells.forEach((cell) => {
        cell.style.filter = "grayscale(100%)";
      });
    } else {
      // grayscale the losing snake
      const losingPlayer = data.players.find(
        (player) => player.name !== data.winner
      );

      // find index of losing player
      const losingPlayerIndex = data.players.findIndex(
        (player) => player.name === losingPlayer.name
      );

      const losingSnakeHeadCell = document.querySelector(
        `.snake-player${losingPlayerIndex + 1}-head`
      );
      losingSnakeHeadCell.style.filter = "grayscale(100%)";

      const losingSnakeBodyCells = document.querySelectorAll(
        `.snake-player${losingPlayerIndex + 1}-body`
      );
      losingSnakeBodyCells.forEach((cell) => {
        cell.style.filter = "grayscale(100%)";
      });
    }
  }
}

function updatePlayersSnakes(players) {
  // rotate snake head based on direction
  players.forEach((player, index) => {
    let snakeHeadElem = document.querySelector(".snake-head");

    if (index === 0) {
      snakeHeadElem = document.querySelector(".snake-player1-head");
    } else {
      snakeHeadElem = document.querySelector(".snake-player2-head");
    }

    const playerHead = player.body[0];
    const playerNeck = player.body[1];

    if (!playerNeck || !playerHead) {
      // No neck or head found, reset rotation
      snakeHeadElem.style.transform = "rotate(0deg)";

      return;
    }

    if (playerHead.column > playerNeck.column) {
      // direction = "left";
      snakeHeadElem.style.transform = "rotate(-90deg)";
    } else if (playerHead.column < playerNeck.column) {
      // direction = "right";
      snakeHeadElem.style.transform = "rotate(90deg)";
    } else if (playerHead.row < playerNeck.row) {
      // direction = "down";
      snakeHeadElem.style.transform = "rotate(180deg)";
    } else if (playerHead.row > playerNeck.row) {
      // direction = "up";
      snakeHeadElem.style.transform = "rotate(0deg)";
    }
  });
}

// Export functions for use in other files
window.boardUtils = {
  updateGrid,
};
