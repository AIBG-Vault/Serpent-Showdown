const gameId = 1;

// Create a new WebSocket instance
const socket = new WebSocket(
  `ws://localhost:8081/streaming?gameId=${gameId}&password=sifra`
);

// When the connection is established
socket.addEventListener("open", function (event) {
  console.log("WebSocket connection established");
});

let dataList = [];

// dataList.push({ board: "string" });

// setTimeout(() => {
//   dataList.push({ board: "string2" });

//   setTimeout(() => {
//     dataList.push({ board: "string3" });
//   }, 2000);
// }, 2000);

// When a message is received from the server
socket.addEventListener("message", function (event) {
  console.log("Message from server:", event.data);

  dataList.push(JSON.parse(event.data));
});

setInterval(() => {
  if (dataList.length > 0) {
    parseData(dataList.shift());
  }
}, 300);

// When the connection is closed
socket.addEventListener("close", function (event) {
  console.log("WebSocket connection closed:", event);
});

// When there is an error with the connection
socket.addEventListener("error", function (event) {
  console.error("WebSocket error:", event);
});

// fetch("../data/AIBG fetch 3.json")
//   .then((res) => res.json())
//   .then((data) => {
//     parseData(data);
//   });

// fetch("../data/AIBG fetch 2.json")
//   .then((res) => res.json())
//   .then((data) => {
//     parseData(data);
//   });

// setInterval(() => {
//   fetch("../data/AIBG fetch.json")
//     .then((res) => res.json())
//     .then((data) => {
//       parseData(data);
//     });
// }, 1000);

// ========================================
// winner msg logic
// ========================================

function toggleWinner(status, team1Name, team2Name) {
  const winnerContainer = $("body").find(".winner_container");
  const winnerMessage = document.querySelector(".winner_container > h2");

  if ($(winnerContainer).is(":visible")) {
    $(winnerContainer).animate(
      {
        opacity: 0,
      },
      500,
      () => {
        // Toggle the display property of the element once the opacity toggle is complete
        $(winnerContainer).css("display", "none");
        winnerMessage.textContent = "";
      }
    );
  } else {
    let message = "";
    if (status.includes("Game draw")) {
      message = "Game draw";
    } else {
      let winningTeam = status.includes("0") ? team1Name : team2Name;
      message = "Winner: " + winningTeam;
    }
    winnerMessage.textContent = message;
    $(winnerContainer).css("display", "grid");
    $(winnerContainer).animate(
      {
        opacity: 1,
      },
      1500
    );
  }
}

// ========================================
// game logic
// ========================================

const abeceda = "abcdefghijkl";

const board = Chessboard("board", {
  showNotation: true,
  orientation: "black",
});
$(window).resize(board.resize);

function parseData(data) {
  // console.log(data);

  // ========================================
  // set players

  const teamNameElems = document.querySelectorAll(".team_name");
  teamNameElems[0].textContent = data.player1 || "Naziv tima 1";
  teamNameElems[1].textContent = data.player2 || "Naziv tima 2";

  // ========================================
  // set boards
  let gameState = data.gameField;
  // console.log(gameState);

  const b1 = {};
  const b2 = {};

  for (let redak = 0; redak < gameState.length; redak++) {
    let row1 = gameState[redak];

    for (let stupac = 0; stupac < row1.length; stupac++) {
      const square1 = row1[stupac];

      if (square1) {
        // console.log(square1);

        let piece = "";

        if (square1.black) {
          piece += "b";
        } else {
          piece += "w";
        }

        piece += square1.oznaka;
        const pozicija = abeceda.charAt(stupac) + (redak + 1);
        // console.log(pozicija + ":" + piece);

        b1[pozicija] = piece;
        // console.log(obj);
      }

      const square2 = row2[stupac];

      if (square2) {
        // console.log(square2);

        let piece = "";

        if (square2.black) {
          piece += "b";
        } else {
          piece += "w";
        }

        piece += square2.oznaka;
        const pozicija = abeceda.charAt(stupac) + (redak + 1);
        // console.log(pozicija + ":" + piece);

        b2[pozicija] = piece;
        // console.log(obj);
      }
    }
  }

  // console.log(b1);
  // console.log(b2);

  board.position(b1);

  // for testing

  // var board1 = Chessboard("board1", {
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
  // set extra pieces
  let teamOneCreaturesList = gameState;
  let teamTwoCreaturesList = gameState;

  // console.log(extraWhitePieces1json);

  const teamOneCreaturesElem = document.querySelectorAll(
    ".creatures_container"
  )[0];
  const teamTwoCreaturesElem = document.querySelectorAll(
    ".creatures_container"
  )[1];

  teamOneCreaturesList.forEach((creature) => {
    if (creature) {
      // increase number on extra piece
      if (creature.oznaka === "D") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wD"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "C") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wC"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "J") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wJ"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "N") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wN"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "L") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wL"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "T") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wT"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "S") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wS"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      }
      // else if (piece.oznaka === "V") {
      //   let numOnPiece = board1extraPiecesW.querySelector(
      //     ".extra_piece_num_wV"
      //   );
      //   let num = numOnPiece.textContent;
      //   num++;
      //   numOnPiece.textContent = num;
      // }
    }
  });

  teamTwoCreaturesList.forEach((creature) => {
    if (creature) {
      // increase number on extra piece
      if (creature.oznaka === "D") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wD"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "C") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wC"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "J") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wJ"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "N") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wN"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "L") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wL"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "T") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wT"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      } else if (creature.oznaka === "S") {
        let numOnPiece = teamTwoCreaturesList.querySelector(
          ".extra_piece_num_wS"
        );
        let num = numOnPiece.textContent;
        num++;
        numOnPiece.textContent = num;
      }
      // else if (piece.oznaka === "V") {
      //   let numOnPiece = board1extraPiecesW.querySelector(
      //     ".extra_piece_num_wV"
      //   );
      //   let num = numOnPiece.textContent;
      //   num++;
      //   numOnPiece.textContent = num;
      // }
    }
  });

  // ========================================
  // set winner if game is over

  let winnerId = gameState.winner;
  // console.log(status);

  const winnerMessage = document.querySelector(".winner_container > h2");
  if (
    winnerId &&
    (winnerId.includes("winner") || winnerId.includes("Game draw")) &&
    winnerMessage.textContent === ""
  ) {
    toggleWinner(winnerId, data.player1, data.player2);
  } else if (
    (!winnerId || !winnerId.includes("winner")) &&
    winnerMessage.textContent !== ""
  ) {
    toggleWinner("");
  }
}
