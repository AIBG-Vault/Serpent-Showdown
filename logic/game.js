// Game configuration constants
/** Number of rows in the game grid. Will be increased to 25 in production. */
const GAME_ROWS = 5;
/** Number of columns in the game grid. Will be increased to 35 in production. */
const GAME_COLUMNS = 15;
/** Initial length of each player's snake. Will be increased to 5 in production. */
const PLAYERS_STARTING_LENGTH = 2;
/** Initial score for each player. Will be increased to 100 in production. */
const PLAYERS_STARTING_SCORE = 100;

class SnakeGame {
  constructor() {
    this.numOfRows = GAME_ROWS;
    this.numOfColumns = GAME_COLUMNS;
    this.playersStartingLength = PLAYERS_STARTING_LENGTH;

    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, () => null)
    );

    this.players = [];
    this.winner = null;
    this.internalMoveCounter = 0;
    this.apples = [];
  }

  addPlayer(playerId) {
    const isFirstPlayer = this.players.length === 0;

    const startRowIndex = Math.floor(this.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? this.playersStartingLength
      : this.numOfColumns - (this.playersStartingLength + 1);

    const player = {
      id: playerId,
      body: [],
      score: PLAYERS_STARTING_SCORE,
      length: this.playersStartingLength,
    };

    // Add head first
    player.body.push({ x: startRowIndex, y: startColumnIndex });

    // Add body segments
    for (let i = 1; i < this.playersStartingLength; i++) {
      player.body.push({
        x: startRowIndex,
        y: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }

    this.players.push(player);
    this.updateMap();
  }

  processMoves(moves) {
    for (const move of moves) {
      this.playMove(move.playerId, move.direction);
    }

    // Check for zero scores
    const zeroScorePlayers = this.players.filter((p) => p.score <= 0);
    if (zeroScorePlayers.length > 0) {
      if (zeroScorePlayers.length === 2) {
        // Both players reached zero - compare lengths
        const [player1, player2] = this.players;
        if (player1.length > player2.length) {
          this.winner = player1.id;
        } else if (player2.length > player1.length) {
          this.winner = player2.id;
        } else {
          this.winner = -1; // Draw if lengths are equal
        }
        console.log(
          this.winner === -1
            ? "Game Over! Draw! Both players reached zero score with equal lengths!"
            : `Game Over! Both players reached zero score. Player ${this.winner} wins with longer length!`
        );
      } else {
        // Only one player reached zero
        this.winner = this.players.find((p) => p.score > 0).id;
        console.log(
          `Game Over! One player reached zero score. Player ${this.winner} wins!`
        );
      }
      return;
    }

    const collidedPlayers = this.checkPlayersCollisions();
    if (collidedPlayers) {
      if (collidedPlayers.length === 1) {
        this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).id;
        console.log(`Game Over! Player ${this.winner} wins!`);
      } else {
        // In case of collision, compare scores first, then lengths
        const [player1, player2] = this.players;
        if (player1.score > player2.score) {
          this.winner = player1.id;
        } else if (player2.score > player1.score) {
          this.winner = player2.id;
        } else if (player1.length > player2.length) {
          this.winner = player1.id;
        } else if (player2.length > player1.length) {
          this.winner = player2.id;
        } else {
          this.winner = -1; // Represent a draw when both score and length are equal
          console.log(`Game Over! Draw! Equal scores and lengths`);
        }
      }
      return;
    }

    this.internalMoveCounter++;

    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }

    this.updateMap();
  }

  playMove(playerId, direction) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Prevent reversing direction and penalize the attempt
    const currentDirection = this.getCurrentDirection(player);
    if (
      currentDirection &&
      this.isOppositeDirection(currentDirection, direction)
    ) {
      player.score = Math.max(0, player.score - 5); // Prevent negative scores
      return; // Skip the move
    }

    // Penalize invalid moves
    if (!["up", "down", "left", "right"].includes(direction)) {
      player.score = Math.max(0, player.score - 5);
      return; // Skip the move
    }

    const head = { ...player.body[0] };
    switch (direction) {
      case "up":
        head.x -= 1;
        break;
      case "down":
        head.x += 1;
        break;
      case "left":
        head.y -= 1;
        break;
      case "right":
        head.y += 1;
        break;
      default:
        return;
    }

    if (!this.handleAppleCollision(player, head)) {
      player.body.unshift(head);
      player.body.pop();
    }
  }

  getCurrentDirection(player) {
    const head = player.body[0];
    const neck = player.body[1];

    if (!neck) return null;

    if (head.x === neck.x) {
      return head.y > neck.y ? "right" : "left";
    } else {
      return head.x > neck.x ? "down" : "up";
    }
  }

  isOppositeDirection(current, newDirection) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[current] === newDirection;
  }

  generateMirroredApples() {
    let attempts = 0;
    const maxAttempts = this.numOfColumns * this.numOfRows;

    while (attempts < maxAttempts) {
      const appleX = Math.floor(Math.random() * this.numOfRows);
      const appleY = Math.floor(
        Math.random() * Math.floor(this.numOfColumns / 2)
      );

      const mirroredX = appleX;
      const mirroredY = this.numOfColumns - 1 - appleY;

      // Check if both positions are free in the current map
      const isPositionFree =
        this.map[appleX][appleY] === null &&
        this.map[mirroredX][mirroredY] === null;

      if (isPositionFree) {
        this.apples.push({ x: appleX, y: appleY });
        this.apples.push({ x: appleX, y: mirroredY });
        return;
      }

      attempts++;
    }

    // Only log if we couldn't find positions after max attempts
    console.log("Couldn't find valid mirrored apple positions");
  }

  checkPlayersCollisions() {
    let collidedPlayers = new Set();

    for (const player of this.players) {
      const head = player.body[0];

      // Wall collision checks
      if (head.x < 0) {
        console.log(`Player ${player.id} died by hitting the top wall`);
        collidedPlayers.add(player.id);
      } else if (head.x >= this.numOfRows) {
        console.log(`Player ${player.id} died by hitting the bottom wall`);
        collidedPlayers.add(player.id);
      } else if (head.y < 0) {
        console.log(`Player ${player.id} died by hitting the left wall`);
        collidedPlayers.add(player.id);
      } else if (head.y >= this.numOfColumns) {
        console.log(`Player ${player.id} died by hitting the right wall`);
        collidedPlayers.add(player.id);
      } else if (
        // Self collision
        player.body
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        console.log(
          `Player ${player.id} died by colliding with their own body`
        );
        collidedPlayers.add(player.id);
      }
    }

    const [player1, player2] = this.players;
    const head1 = player1.body[0];
    const head2 = player2.body[0];

    if (head1.x === head2.x && head1.y === head2.y) {
      // Head-to-head collision
      console.log(
        `Players ${player1.id} and ${player2.id} died in head-on collision`
      );
      collidedPlayers.add(player1.id);
      collidedPlayers.add(player2.id);
    } else {
      // Other player's body collision
      for (const player of this.players) {
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        const head = player.body[0];

        if (
          otherPlayer.body.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          console.log(
            `Player ${player.id} died by colliding with player ${otherPlayer.id}'s body`
          );
          collidedPlayers.add(player.id);
        }
      }
    }

    return collidedPlayers.size > 0 ? Array.from(collidedPlayers) : null;
  }

  handleAppleCollision(player, head) {
    const appleIndex = this.apples.findIndex(
      (apple) => apple.x === head.x && apple.y === head.y
    );

    if (appleIndex !== -1) {
      player.body.unshift(head);
      player.score += 5;
      player.length += 1;
      this.apples.splice(appleIndex, 1);
      return true;
    }
    return false;
  }

  updateMap() {
    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, () => null)
    );

    this.players.forEach((player) => {
      this.map[player.body[0].x][player.body[0].y] = player.id.toUpperCase();
      for (let i = 1; i < player.body.length; i++) {
        const segment = player.body[i];
        this.map[segment.x][segment.y] = player.id.toLowerCase();
      }
    });

    this.apples.forEach((apple) => {
      this.map[apple.x][apple.y] = "A";
    });
  }

  printState() {
    console.log("\nCurrent Game State:");
    console.log("Move:", this.internalMoveCounter);
    console.log("Winner:", this.winner);

    console.log("\nGame Map:");
    this.map.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
    console.log("\n");
  }
}

module.exports = { SnakeGame };
