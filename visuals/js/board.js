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

function updateGrid(map) {
  if (!map) return;

  const rows = map.length;
  const cols = map[0].length;
  const board = document.getElementById("gameBoard");
  const currentCols = board.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];

  // Only recreate grid if dimensions changed
  if (currentCols != cols) {
    createGrid(rows, cols);
  }

  // Update cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.className = "cell";
      cell.textContent = ""; // Clear any previous content

      if (map) {
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
        } else if (value === "#") {
          cell.classList.add("wall");
          cell.textContent = "#";
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
