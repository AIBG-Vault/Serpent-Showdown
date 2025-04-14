// Game configuration constants
// Number of rows in the game grid. Will be increased to ~25 in production.
const BOARD_NUM_OF_ROWS = 11;
// Number of columns in the game grid. Will be increased to ~60 in production.
const BOARD_NUM_OF_COLUMNS = 15;
// Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production.
const PLAYERS_STARTING_LENGTH = 4;
// Initial score for each player. Will be increased to 100 in production.
const PLAYERS_STARTING_SCORE = 15;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 5; // number of points a player receives for picking up an apple
const MOVEMENT_CENTER_REWARD = 2; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 1; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 5; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 3; // penalty for making a move that reverses the current direction

// Number of moves after which the map starts shrinking.
const START_SHRINKING_MAP_AFTER_MOVES = 0;
// Number of columns left after which the map stops shrinking.
const MINIMUM_BOARD_SIZE = 5;

class SnakeGame {
  constructor() {
    this.numOfRows = BOARD_NUM_OF_ROWS;
    this.numOfColumns = BOARD_NUM_OF_COLUMNS;
    this.playersStartingLength = PLAYERS_STARTING_LENGTH;

    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, () => null)
    );

    this.players = [];
    this.winner = null;

    this.internalMoveCounter = 0;

    this.apples = [];

    this.shrinkStartMove = START_SHRINKING_MAP_AFTER_MOVES;
    this.minBoardSize = MINIMUM_BOARD_SIZE;
    this.shrinkLevel = -1;

    // Add borders object
    this.borders = {
      left: 0,
      right: this.numOfColumns - 1,
      top: 0,
      bottom: this.numOfRows - 1,
    };
  }

  addPlayer(player) {
    const isFirstPlayer = this.players.length === 0;

    const startRowIndex = Math.floor(this.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? this.playersStartingLength
      : this.numOfColumns - (this.playersStartingLength + 1);

    const gamePlayer = {
      id: player.id,
      name: player.name,
      body: [],
      score: PLAYERS_STARTING_SCORE,
      length: this.playersStartingLength,
    };

    // Add body segments
    for (let i = 0; i < this.playersStartingLength; i++) {
      gamePlayer.body.push({
        row: startRowIndex,
        column: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }

    this.players.push(gamePlayer);

    this.updateMap();
  }

  processMoves(moves) {
    this.internalMoveCounter++;

    // Process all moves
    moves.forEach((move) => this.playMove(move.playerId, move.direction));

    // Handle map shrinking
    const currentWidth = this.numOfColumns - this.shrinkLevel * 2;
    if (
      currentWidth > this.minBoardSize &&
      this.internalMoveCounter >= this.shrinkStartMove &&
      this.internalMoveCounter % 5 === 0
    ) {
      this.shrinkMap();
      this.updateMap();
    }

    // Check if game is over and determine winner
    if (this.checkGameOver()) {
      return;
    }

    this.updateMap();

    // Generate apples after shrinking
    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }
  }

  playMove(playerId, moveDirection) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Prevent reversing direction and penalize the attempt
    if (this.isOppositeDirection(player, moveDirection)) {
      player.score = Math.max(0, player.score - REVERSE_DIRECTION_PENALTY); // Prevent negative scores
      return; // Skip the move
    }

    // Penalize invalid moves
    if (!["up", "down", "left", "right"].includes(moveDirection)) {
      player.score = Math.max(0, player.score - ILLEGAL_MOVE_PENALTY);
      return; // Skip the move
    }

    const head = { ...player.body[0] };
    switch (moveDirection) {
      case "up":
        head.row -= 1;
        break;
      case "down":
        head.row += 1;
        break;
      case "left":
        head.column -= 1;
        break;
      case "right":
        head.column += 1;
        break;
      default:
        return;
    }

    if (!this.handleAppleCollision(player, head)) {
      player.body.unshift(head);
      player.body.pop();
    }
  }

  isOppositeDirection(player, incomingMoveDirection) {
    const head = player.body[0];
    const neck = player.body[1];

    if (!neck) {
      return false;
    }

    let currentDirection;

    if (head.row === neck.row) {
      currentDirection = head.column > neck.column ? "right" : "left";
    } else {
      currentDirection = head.row > neck.row ? "down" : "up";
    }

    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[currentDirection] === incomingMoveDirection;
  }

  handleAppleCollision(player, head) {
    const appleIndex = this.apples.findIndex(
      (apple) => apple.row === head.row && apple.column === head.column
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
    const collidedPlayers = this.checkForCollisions();

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
      this.winner = this.players.find((p) => p.score > 0).name;
      console.log(
        `Game Over! One player reached zero score. Player ${this.winner} wins!`
      );
    }
    return true;
  }

  checkCollisionWinner() {
    const collidedPlayers = this.checkForCollisions();
    if (!collidedPlayers) return false;

    if (collidedPlayers.length === 1) {
      this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).name;
    } else {
      this.determineWinnerByScoreThenLength();
    }
    return true;
  }

  checkForCollisions() {
    let collidedPlayers = new Set();

    for (const player of this.players) {
      const wallCollision = this.checkWallCollision(player);
      if (wallCollision) {
        collidedPlayers.add(player.id);
        continue;
      }

      const bodyCollision = this.checkPlayerCollision(player);
      if (bodyCollision) {
        collidedPlayers.add(player.id);
        continue;
      }
    }

    return collidedPlayers.size > 0 ? Array.from(collidedPlayers) : null;
  }

  checkWallCollision(player) {
    const head = player.body[0];

    // Border shrinkage
    if (!head) {
      console.log(`Player ${player.name} died by border shrinkage`);
      return true;
    }

    if (
      head.row <= this.borders.top ||
      head.row >= this.borders.bottom ||
      head.column <= this.borders.left ||
      head.column >= this.borders.right
    ) {
      console.log(`Player ${player.name} died by hitting a wall`);
      return true;
    }
  }

  checkPlayerCollision(player) {
    const head = player.body[0];

    // Self collision
    const playerCollidedWithSelf = player.body
      .slice(1)
      .some(
        (bodySegment) =>
          bodySegment.row === head.row && bodySegment.column === head.column
      );
    if (playerCollidedWithSelf) {
      console.log(`Player ${player.name} died by colliding with self`);
      return true;
    }

    // Other player collision (both head and body)
    const otherPlayer = this.players.find((p) => p.id !== player.id);
    const playerCollidedWithOtherPlayer = otherPlayer.body.some(
      (segment) => segment.row === head.row && segment.column === head.column
    );
    if (playerCollidedWithOtherPlayer) {
      console.log(`Player ${player.name} died by colliding with other player`);
      return true;
    }
  }

  determineWinnerByScoreThenLength() {
    const [player1, player2] = this.players;

    if (player1.score !== player2.score) {
      this.winner = player1.score > player2.score ? player1.name : player2.name;
      console.log(`Game Over! Player ${this.winner} wins by higher score!`);
    } else {
      this.determineWinnerByLength();
    }
  }

  determineWinnerByLength() {
    const [player1, player2] = this.players;

    if (player1.length !== player2.length) {
      this.winner =
        player1.length > player2.length ? player1.name : player2.name;
      console.log(`Game Over! Player ${this.winner} wins by longer length!`);
    } else {
      this.winner = -1;
      console.log(`Game Over! Draw! Equal scores and lengths`);
    }
  }

  shrinkMap() {
    this.shrinkLevel++;

    this.borders.left = this.shrinkLevel;
    this.borders.right = this.numOfColumns - 1 - this.shrinkLevel;

    // Calculate how much extra shrinking is needed after 1:1 ratio is reached
    const extraShrink = Math.max(
      this.shrinkLevel - Math.floor((this.numOfColumns - this.numOfRows) / 2),
      0
    );
    this.borders.top = extraShrink;
    this.borders.bottom = this.numOfRows - 1 - extraShrink;

    // Remove existing apples in wall positions
    this.apples = this.apples.filter(
      (apple) =>
        apple.column > this.borders.left &&
        apple.column < this.borders.right &&
        apple.row > this.borders.top &&
        apple.row < this.borders.bottom
    );

    // Check and handle snake segments in new wall positions
    // this.players.forEach((player) => {
    //   // Find segments that will be in walls
    //   const segmentsInWalls = player.body.filter(
    //     (segment) =>
    //       segment.column <= leftBorder || segment.column >= rightBorder
    //   );

    //   // Overwrite map cells with walls
    //   // segmentsInWalls.forEach((segment) => {
    //   //   this.map[segment.row][segment.column] = "#";
    //   // });

    //   // Find disconnected segments
    //   const disconnectedSegments = [];
    //   // for (let i = 1; i < player.body.length; i++) {
    //   //   const current = player.body[i];
    //   //   const previous = player.body[i - 1];

    //   //   // Check if segment is connected (adjacent in row or column)
    //   //   const isConnected =
    //   //     (Math.abs(current.row - previous.row) === 1 &&
    //   //       current.column === previous.column) ||
    //   //     (Math.abs(current.column - previous.column) === 1 && current.row === previous.row);

    //   //   if (!isConnected) {
    //   //     // Found a gap - add all remaining segments to disconnected array
    //   //     disconnectedSegments.push(...player.body.slice(i));
    //   //     // Remove disconnected segments from body
    //   //     player.body = player.body.slice(0, i);
    //   //     break;
    //   //   }
    //   // }

    //   // Apply penalties
    //   const totalLostSegments =
    //     segmentsInWalls.length + disconnectedSegments.length;
    //   player.score = Math.max(0, player.score - totalLostSegments * 3);
    //   player.length -= totalLostSegments;

    //   // Convert disconnected segments to apples
    //   // this.apples.push(
    //   //   ...disconnectedSegments.map((segment) => ({
    //   //     row: segment.row,
    //   //     column: segment.column,
    //   //   }))
    //   // );
    // });
  }

  findValidSpawningPosition() {
    let attempts = 0;
    const maxAttempts = this.numOfColumns * this.numOfRows;

    while (attempts < maxAttempts) {
      const originalRow = Math.floor(Math.random() * this.numOfRows);
      const originalColumn = Math.floor(
        Math.random() * Math.floor(this.numOfColumns / 2)
      );

      const mirroredRow = originalRow;
      const mirroredColumn = this.numOfColumns - 1 - originalColumn;

      // Only check if cells are available (not wall, not snake)
      if (
        this.map[originalRow][originalColumn] === null &&
        this.map[mirroredRow][mirroredColumn] === null
      ) {
        return { originalRow, originalColumn, mirroredRow, mirroredColumn };
      }

      attempts++;
    }

    return null;
  }

  generateMirroredApples() {
    const position = this.findValidSpawningPosition();

    if (position) {
      const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
        position;
      this.apples.push({ row: originalRow, column: originalColumn });
      this.apples.push({ row: mirroredRow, column: mirroredColumn });

      this.updateMap();

      return;
    }

    console.log("Couldn't find valid mirrored positions to spawn apples");
  }

  updateMap() {
    this.map = Array.from({ length: this.numOfRows }, (_, rowIndex) =>
      Array.from({ length: this.numOfColumns }, (_, colIndex) =>
        colIndex <= this.borders.left ||
        colIndex >= this.borders.right ||
        rowIndex <= this.borders.top ||
        rowIndex >= this.borders.bottom
          ? "#"
          : null
      )
    );

    this.players.forEach((player) => {
      if (player.body.length > 0) {
        const head = player.body[0];
        if (
          head &&
          head.row >= 0 &&
          head.row < this.numOfRows &&
          head.column >= 0 &&
          head.column < this.numOfColumns
        ) {
          this.map[head.row][head.column] = player.id[0].toUpperCase();

          for (let i = 1; i < player.body.length; i++) {
            const segment = player.body[i];

            this.map[segment.row][segment.column] = player.id[0];
          }
        }
      }
    });

    this.apples.forEach((apple) => {
      this.map[apple.row][apple.column] = "A";
    });
  }
}

module.exports = { SnakeGame };
