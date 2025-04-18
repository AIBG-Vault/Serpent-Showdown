// Initialize grid on page load
document.addEventListener('DOMContentLoaded', () => {
  createGrid();
});

function createGrid(rows = 25, cols = 60) {
  const board = document.getElementById("gameBoard");
  board.style.gridTemplateColumns = `repeat(${cols}, 1.75rem)`;
  board.innerHTML = ''; // Clear existing grid

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `cell-${i}-${j}`;
      board.appendChild(cell);
    }
  }
}

function updateGrid(map, players) {
  if (!map) return;

  const rows = map.length;
  const cols = map[0].length;
  const board = document.getElementById("gameBoard");
  const currentCols = board.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];

  // Only recreate grid if dimensions changed
  if (currentCols != cols) {
    createGrid(rows, cols);
  }

  const player1Id = players?.length > 0 ? players[0].id : "undefined";
  const player2Id = players?.length > 1 ? players[1].id : "undefined";

  // Update cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.className = "cell";
      cell.textContent = ""; // Clear any previous content

      if (map) {
        const value = map[i][j];
        if (value === player1Id.toUpperCase()) {
          cell.classList.add("snake-player1-head");
        } else if (value === player1Id) {
          cell.classList.add("snake-player1-body");
        } else if (value === player2Id.toUpperCase()) {
          cell.classList.add("snake-player2-head");
        } else if (value === player2Id) {
          cell.classList.add("snake-player2-body");
        } else if (value === "A") {
          cell.classList.add("apple");
        } else if (value === "#") {
          cell.classList.add("wall");
          cell.textContent = "#";
        } else if (value && value.length > 0) {
          cell.classList.add("undefined-cell");
          cell.textContent = "?";
        }
      }
    }
  }
}

// Export functions for use in other files
window.boardUtils = {
  createGrid,
  updateGrid,
};
