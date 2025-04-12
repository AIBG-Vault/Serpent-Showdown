const GRID_ROWS = 5;
const GRID_COLS = 15;

function createGrid() {
  const board = document.getElementById("gameBoard");
  board.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1.75rem)`;

  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${i}-${j}`;
      board.appendChild(cell);
    }
  }
}

function updateGrid(map) {
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.className = "cell";

      const value = map[i][j];
      if (value === "K") {
        cell.classList.add("snake-player1-head");
      } else if (value === "k") {
        cell.classList.add("snake-player1-body");
      } else if (value === "L") {
        cell.classList.add("snake-player2-head");
      } else if (value === "l") {
        cell.classList.add("snake-player2-body");
      } else if (value === "A") {
        cell.classList.add("apple");
      }
    }
  }
}

// Create initial grid
createGrid();

// Export functions for use in other files
window.boardUtils = {
  updateGrid,
};
