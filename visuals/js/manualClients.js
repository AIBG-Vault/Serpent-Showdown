let ws1, ws2;

// Move closeModal to global scope
function closeModal() {
  document.getElementById("connectionModal").style.display = "none";
}

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

function connectPlayer(playerNum) {
  const playerId = document.getElementById(`player${playerNum}Id`).value;
  const errorMsgElement = document.querySelector(".error-text");

  // Create WebSocket connection
  const ws = new WebSocket(`ws://localhost:3000?id=${playerId}`);

  if (playerNum === 1) {
    ws1 = ws;
  } else {
    ws2 = ws;
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.error || data.message?.includes("rejected")) {
      errorMsgElement.textContent =
        "Connection failed: " + (data.error || data.message);
      return;
    }

    // console.log(data);

    if (data.map) {
      window.boardUtils.updateGrid(data.map);

      // Check if game has started (2 players in the game)
      if (data.players && data.players.length === 2) {
        document.getElementById("connectionModal").style.display = "none";
        document.addEventListener("keydown", handleKeyPress);
      }
    }
  };

  ws.onerror = () => {
    errorMsgElement.textContent = `Connection failed`;
  };
}
