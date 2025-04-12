let ws1, ws2;

function handleKeyPress(event) {
  const key = event.key.toLowerCase();
  let direction = "";
  let player = null;

  // WASD for player 1
  if (key === "w") (direction = "up"), (player = ws1);
  if (key === "s") (direction = "down"), (player = ws1);
  if (key === "a") (direction = "left"), (player = ws1);
  if (key === "d") (direction = "right"), (player = ws1);

  // Arrow keys for player 2
  if (key === "arrowup") (direction = "up"), (player = ws2);
  if (key === "arrowdown") (direction = "down"), (player = ws2);
  if (key === "arrowleft") (direction = "left"), (player = ws2);
  if (key === "arrowright") (direction = "right"), (player = ws2);

  if (direction && player && player.readyState === WebSocket.OPEN) {
    const move = {
      playerId:
        player === ws1
          ? document.getElementById("player1Id").value
          : document.getElementById("player2Id").value,
      direction: direction,
    };
    player.send(JSON.stringify(move));
    event.preventDefault();
  }
}

function connectPlayers() {
  const player1Id = document.getElementById("player1Id").value;
  const player2Id = document.getElementById("player2Id").value;
  const modal = document.querySelector(".modal");

  // Remove any existing error message
  const errorMsgElement = document.querySelector(".error-text");

  // Clear existing grid
  const gameBoard = document.getElementById("gameBoard");
  gameBoard.innerHTML = "";

  ws1 = new WebSocket(`ws://localhost:3000?id=${player1Id}`);
  ws2 = new WebSocket(`ws://localhost:3000?id=${player2Id}`);

  let connectedCount = 0;

  [ws1, ws2].forEach((ws) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error || data.message?.includes("rejected")) {
        errorText.textContent =
          "Connection failed: " + (data.error || data.message);
        modal.appendChild(errorText);
        return;
      }
      if (data.map) {
        connectedCount++;
        if (connectedCount === 1) {
          window.boardUtils.createGrid();
        }
        window.boardUtils.updateGrid(data.map);
        if (connectedCount === 2) {
          document.getElementById("connectionModal").style.display = "none";
          document.addEventListener("keydown", handleKeyPress);
        }
      }
    };

    ws.onerror = () => {
      errorMsgElement.textContent = "Connection failed";
    };
  });
}

// Export functions for use in HTML
window.clientUtils = {
  connectPlayers,
};
