// functionality related to debug version
// of frontend
// enabled with ?debug=1 in URL

let ws1, ws2;
const ID_MANUAL_1 = "k";
const ID_MANUAL_2 = "l";

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
      playerId: player === ws1 ? ID_MANUAL_1 : ID_MANUAL_2,
      direction: direction,
    };
    player.send(JSON.stringify(move));
    event.preventDefault();
  }
}

function connectPlayer(playerNum) {
  let playerId;
  if (playerNum == 1) playerId = ID_MANUAL_1;
  else if (playerNum == 2) playerId = ID_MANUAL_2;

  // Create a new player websocket connection
  const ws = new WebSocket(`ws://localhost:3000?id=${playerId}`);

  if (playerNum === 1) {
    ws1 = ws;
  } else {
    ws2 = ws;
  }

  let activated = false;
  ws.onmessage = (event) => {
    if (activated) return;
    const data = JSON.parse(event.data);

    if (!activated && data.map) {
      // Check if game has started (2 players in the game)
      if (data.players && data.players.length === 2) {
        activated = true;
        //document.getElementById("connectionModal").style.display = "none";
        document.addEventListener("keydown", handleKeyPress);
      }
    }
  };

  ws.onerror = () => {
    errorMsgElement.textContent = `Manual player connection failed`;
  };
}
