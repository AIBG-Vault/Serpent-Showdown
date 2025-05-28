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

            // add img to cell
            const img = document.createElement("img");
            img.src = "./img/sprites/AIBG 6.0 Zagreb bear.png";
            img.alt = "snake head";
            cell.appendChild(img);
          } else if (value.type === "snake-body") {
            cell.classList.add("snake");
            cell.classList.add("snake-body");
            cell.classList.add(
              value.playerName === data.players[0].name
                ? "snake-player1-body"
                : "snake-player2-body"
            );

            // add img to cell
            const img = document.createElement("img");
            img.src = `./img/sprites/snake/tijelo_${
              value.playerName === data.players[0].name ? "n" : "p"
            }_25.png`;
            img.alt = "snake body";
            cell.appendChild(img);
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

  updateSnakesRotations(data.players);

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
      losingSnakeHeadCell.style.filter = "grayscale(100%)"; // bcs of border

      const losingSnakeBodyCells = document.querySelectorAll(
        `.snake-player${losingPlayerIndex + 1}-body`
      );
      losingSnakeBodyCells.forEach((cell) => {
        // get img from cell
        const losingSnakeBodyImg = cell.querySelector("img");
        losingSnakeBodyImg.style.filter = "grayscale(100%)";
      });
    }
  }
}

function updateSnakesRotations(players) {
  // rotate snake head, body and tail based on direction

  players.forEach((player, index) => {
    for (
      let bodySegmentIndex = 0;
      bodySegmentIndex < player.body.length;
      bodySegmentIndex++
    ) {
      const previousSegment = player.body[bodySegmentIndex - 1];
      const currentSegment = player.body[bodySegmentIndex];
      const followingSegment = player.body[bodySegmentIndex + 1];

      // console.log(
      //   `player ${player.name} segment ${bodySegmentIndex} previous`,
      //   previousSegment
      // );
      // console.log(
      //   `player ${player.name} segment ${bodySegmentIndex}`,
      //   currentSegment
      // );
      // console.log(
      //   `player ${player.name} segment ${bodySegmentIndex} following`,
      //   followingSegment
      // );

      // const previousSegmentElem = document.getElementById(`cell-${previousSegment.row}-${previousSegment.column}`)
      const currentSegmentElem = document.getElementById(
        `cell-${currentSegment.row}-${currentSegment.column}`
      );
      // const followingSegmentElem = document.getElementById(`cell-${followingSegment.row}-${followingSegment.column}`)

      if (!currentSegmentElem) {
        continue;
      }

      // get img from cell
      const snakeImgElem = currentSegmentElem.querySelector("img");

      if (!snakeImgElem) {
        continue;
      }

      if (!previousSegment && !followingSegment) {
        // just head = reset rotation
        snakeImgElem.style.transform = "rotate(0deg)";
        continue;
      }

      // head
      if (!previousSegment) {
        if (currentSegment.column > followingSegment.column) {
          // direction = "left";
          snakeImgElem.style.transform = "rotate(-90deg)";
        } else if (currentSegment.column < followingSegment.column) {
          // direction = "right";
          snakeImgElem.style.transform = "rotate(90deg)";
        } else if (currentSegment.row < followingSegment.row) {
          // direction = "down";
          snakeImgElem.style.transform = "rotate(180deg)";
        } else if (currentSegment.row > followingSegment.row) {
          // direction = "up";
          snakeImgElem.style.transform = "rotate(0deg)";
        }

        continue;
      }

      // tail
      if (!followingSegment) {
        snakeImgElem.alt = "snake tail";

        if (index === 0) {
          snakeImgElem.src = "./img/sprites/snake/rep_n_25.png";
        } else {
          snakeImgElem.src = "./img/sprites/snake/rep_p_25.png";
        }
        if (previousSegment.column > currentSegment.column) {
          // direction = "left";
          snakeImgElem.style.transform = "rotate(90deg)";
        } else if (previousSegment.column < currentSegment.column) {
          // direction = "right";
          snakeImgElem.style.transform = "rotate(-90deg)";
        } else if (previousSegment.row < currentSegment.row) {
          // direction = "down";
          snakeImgElem.style.transform = "rotate(0deg)";
        } else if (previousSegment.row > currentSegment.row) {
          // direction = "up";
          snakeImgElem.style.transform = "rotate(180deg)";
        }

        continue;
      }

      // body - rotate diagionally as well
      if (
        previousSegment.row < followingSegment.row &&
        previousSegment.column < followingSegment.column
      ) {
        // direction = "up-left";
        snakeImgElem.style.transform = "rotate(-45deg)";
      } else if (
        previousSegment.row < followingSegment.row &&
        previousSegment.column > followingSegment.column
      ) {
        // direction = "up-right";
        snakeImgElem.style.transform = "rotate(45deg)";
      } else if (
        previousSegment.row > followingSegment.row &&
        previousSegment.column < followingSegment.column
      ) {
        // direction = "down-left";
        snakeImgElem.style.transform = "rotate(-135deg)";
      } else if (
        previousSegment.row > followingSegment.row &&
        previousSegment.column > followingSegment.column
      ) {
        // direction = "down-right";
        snakeImgElem.style.transform = "rotate(135deg)";
      } else if (
        previousSegment.row === followingSegment.row &&
        previousSegment.column < followingSegment.column
      ) {
        // direction = "left";
        snakeImgElem.style.transform = "rotate(-90deg)";
      } else if (
        previousSegment.row === followingSegment.row &&
        previousSegment.column > followingSegment.column
      ) {
        // direction = "right";
        snakeImgElem.style.transform = "rotate(90deg)";
      } else if (
        previousSegment.row < followingSegment.row &&
        previousSegment.column === followingSegment.column
      ) {
        // direction = "up";
        snakeImgElem.style.transform = "rotate(0deg)";
      } else if (
        previousSegment.row > followingSegment.row &&
        previousSegment.column === followingSegment.column
      ) {
        // direction = "down";
        snakeImgElem.style.transform = "rotate(180deg)";
      }
    }
  });
}

// Export functions for use in other files
window.boardUtils = {
  updateGrid,
};
