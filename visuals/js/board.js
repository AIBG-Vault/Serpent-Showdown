// Initialize grid on page load
document.addEventListener("DOMContentLoaded", () => {
  createGrid();
});

function createGrid(rows = 25, cols = 60) {
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

function updateGrid(map) {
  if (!map) return;

  const rows = map.length;
  const cols = map[0].length;
  const board = document.getElementById("gameBoard");
  const currentCols =
    board.style.gridTemplateColumns.match(/repeat\((\d+)/)?.[1];

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
        if (typeof value === "object" && value !== null) {
          // Handle object values
          if (value.type === "snake-head") {
            cell.classList.add(
              value.player === "k" ? "snake-player1-head" : "snake-player2-head"
            );
          } else if (value.type === "snake-body") {
            cell.classList.add(
              value.player === "k" ? "snake-player1-body" : "snake-player2-body"
            );
          } else if (value.type === "apple") {
            cell.classList.add("apple");
          } else if (value.type === "reset-borders") {
            cell.classList.add("reset-borders");
          } else if (value.type === "golden-apple") {
            cell.classList.add("golden-apple");
            if (value.affect === "self") cell.classList.add("affect-self");
            else if (value.affect === "enemy")
              cell.classList.add("affect-enemy");
            else if (value.affect === "both") cell.classList.add("affect-both");
          } else if (value.type === "tron") {
            cell.classList.add("tron");
            if (value.affect === "self") cell.classList.add("affect-self");
            else if (value.affect === "enemy")
              cell.classList.add("affect-enemy");
            else if (value.affect === "both") cell.classList.add("affect-both");
          } else if (value.type === "border") {
            cell.classList.add("border");
            cell.textContent = "#";
          }
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
