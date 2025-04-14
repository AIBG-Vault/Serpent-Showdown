// Game configuration constants
/** Number of rows in the game grid. Will be increased to ~25 in production. */
const GAME_ROWS = 15;
/** Number of columns in the game grid. Will be increased to ~60 in production. */
const GAME_COLUMNS = 25;
/** Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production. */
const PLAYERS_STARTING_LENGTH = 4;
/** Initial score for each player. Will be increased to 100 in production. */
const PLAYERS_STARTING_SCORE = 15;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 5; // number of points a player receives for picking up an apple
const MOVEMENT_CENTER_REWARD = 2; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 1; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 5; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 3; // penalty for making a move that reverses the current direction

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
    this.shrinkStartMove = 5; // Move number when shrinking starts
    this.minColumns = 5; // Minimum columns before stopping shrink
    this.shrinkLevel = 0; // Track map shrinkage
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

    // Add body segments
    for (let i = 0; i < this.playersStartingLength; i++) {
      player.body.push({
        x: startRowIndex,
        y: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }

    this.players.push(player);
    this.updateMap();
  }

  processMoves(moves) {
    // Process all moves first
    moves.forEach((move) => this.playMove(move.playerId, move.direction));

    // Check if game is over and determine winner
    if (this.checkGameOver()) {
      return;
    }

    this.internalMoveCounter++;

    this.updateMap();

    // Handle map shrinking
    if (
      this.internalMoveCounter >= this.shrinkStartMove &&
      this.internalMoveCounter % 5 === 0
    ) {
      this.shrinkMap();
    }

    // Generate apples after shrinking
    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }
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
      player.score = Math.max(0, player.score - REVERSE_DIRECTION_PENALTY); // Prevent negative scores
      return; // Skip the move
    }

    // Penalize invalid moves
    if (!["up", "down", "left", "right"].includes(direction)) {
      player.score = Math.max(0, player.score - ILLEGAL_MOVE_PENALTY);
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

  handleAppleCollision(player, head) {
    const appleIndex = this.apples.findIndex(
      (apple) => apple.x === head.x && apple.y === head.y
    );

    if (appleIndex !== -1) {
      player.body.unshift(head);
      player.score += APPLE_PICKUP_REWARD;
      player.length += 1;
      this.apples.splice(appleIndex, 1);
      return true;
    }
    return false;
  }

  checkGameOver() {
    const zeroScorePlayers = this.players.filter((p) => p.score <= 0);
    const collidedPlayers = this.checkPlayersCollisions();

    if (!zeroScorePlayers.length && !collidedPlayers) return false;

    // If only one condition occurred, handle it normally
    if (zeroScorePlayers.length && !collidedPlayers) {
      return this.checkZeroScoreWinner();
    }
    if (!zeroScorePlayers.length && collidedPlayers) {
      return this.checkCollisionWinner();
    }

    // Both conditions occurred - determine winner by score then length
    console.log(
      "Game Over! Multiple loss conditions - determining winner by score and length"
    );
    this.determineWinnerByScoreThenLength();
    return true;
  }

  checkZeroScoreWinner() {
    const zeroScorePlayers = this.players.filter((p) => p.score <= 0);
    if (zeroScorePlayers.length === 0) return false;

    if (zeroScorePlayers.length === 2) {
      this.determineWinnerByLength();
      console.log(
        this.winner === -1
          ? "Game Over! Draw! Both players reached zero score with equal lengths!"
          : `Game Over! Both players reached zero score. Player ${this.winner} wins with longer length!`
      );
    } else {
      this.winner = this.players.find((p) => p.score > 0).id;
      console.log(
        `Game Over! One player reached zero score. Player ${this.winner} wins!`
      );
    }
    return true;
  }

  checkCollisionWinner() {
    const collidedPlayers = this.checkPlayersCollisions();
    if (!collidedPlayers) return false;

    if (collidedPlayers.length === 1) {
      this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).id;
      console.log(`Game Over! Player ${this.winner} wins!`);
    } else {
      this.determineWinnerByScoreThenLength();
    }
    return true;
  }

  checkPlayersCollisions() {
    let collidedPlayers = new Set();

    for (const player of this.players) {
      const head = player.body[0];

      // Wall and border collision checks
      if (
        head.x < 0 ||
        head.x >= this.numOfRows ||
        head.y <= this.shrinkLevel ||
        head.y >= this.numOfColumns - 1 - this.shrinkLevel ||
        this.map[head.x][head.y] === "#"
      ) {
        console.log(`Player ${player.id} died by hitting a wall`);
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

  determineWinnerByScoreThenLength() {
    const [player1, player2] = this.players;

    if (player1.score !== player2.score) {
      this.winner = player1.score > player2.score ? player1.id : player2.id;
      console.log(`Game Over! Player ${this.winner} wins by higher score!`);
    } else {
      this.determineWinnerByLength();
    }
  }

  determineWinnerByLength() {
    const [player1, player2] = this.players;

    if (player1.length !== player2.length) {
      this.winner = player1.length > player2.length ? player1.id : player2.id;
      console.log(`Game Over! Player ${this.winner} wins by longer length!`);
    } else {
      this.winner = -1;
      console.log(`Game Over! Draw! Equal scores and lengths`);
    }
  }

  shrinkMap() {
    const currentWidth = this.numOfColumns - this.shrinkLevel * 2;
    if (currentWidth <= this.minColumns) return;

    this.shrinkLevel++;

    // Remove apples after increasing shrink level but before next map update
    this.apples = this.apples.filter(
      (apple) =>
        apple.y > this.shrinkLevel &&
        apple.y < this.numOfColumns - 1 - this.shrinkLevel
    );

    this.updateMap();
  }

  findValidSpawningPosition() {
    const originalX = Math.floor(Math.random() * this.numOfRows);
    const originalY = Math.floor(
      Math.random() * Math.floor(this.numOfColumns / 2)
    );

    const mirroredX = originalX;
    const mirroredY = this.numOfColumns - 1 - originalY;

    // Only check if cells are available (not wall, not snake)
    const isValidPosition =
      this.map[originalX][originalY] === null &&
      this.map[mirroredX][mirroredY] === null;

    return isValidPosition
      ? { originalX, originalY, mirroredX, mirroredY }
      : null;
  }

  generateMirroredApples() {
    let attempts = 0;
    const maxAttempts = this.numOfColumns * this.numOfRows;

    while (attempts < maxAttempts) {
      const position = this.findValidSpawningPosition();

      if (position) {
        const { originalX, originalY, mirroredX, mirroredY } = position;
        this.apples.push({ x: originalX, y: originalY });
        this.apples.push({ x: mirroredX, y: mirroredY });

        this.updateMap();

        return;
      }

      attempts++;
    }

    console.log("Couldn't find valid mirrored apple positions");
  }

  updateMap() {
    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, (_, colIndex) =>
        colIndex <= this.shrinkLevel ||
        colIndex >= this.numOfColumns - 1 - this.shrinkLevel
          ? "#"
          : null
      )
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
