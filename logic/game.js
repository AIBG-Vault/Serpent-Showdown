// Game configuration constants
// Maximum number of moves before forcing game end
const GAME_MAX_MOVES = 300;
// Number of rows in the game grid. Will be increased to ~25 in production.
const BOARD_NUM_OF_ROWS = 11;
// Number of columns in the game grid. Will be increased to ~60 in production.
const BOARD_NUM_OF_COLUMNS = 25;
// Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production.
const PLAYERS_STARTING_LENGTH = 9;
// Initial score for each player. Will be increased to 100 in production.
const PLAYERS_STARTING_SCORE = 100;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 5; // number of points a player receives for picking up an apple
const MOVEMENT_CENTER_REWARD = 2; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 1; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 5; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 3; // penalty for making a move that reverses the current direction
const BODY_SEGMENT_LOSS_PENALTY = 3; // penalty per segment lost to border shrinkage

// Number of moves after which the map starts shrinking.
const START_SHRINKING_MAP_AFTER_MOVES = 0;
// Number of columns left after which the map stops shrinking. Will be increased to 9 (as in AIBG 9.0) in production.
const MINIMUM_BOARD_SIZE = 5;

class SnakeGame {
  constructor() {
    this.numOfRows = BOARD_NUM_OF_ROWS;
    this.numOfColumns = BOARD_NUM_OF_COLUMNS;
    this.playersStartingLength = PLAYERS_STARTING_LENGTH;

    this.players = [];
    this.winner = null;

    this.internalMoveCounter = 0;

    this.apples = [];

    this.shrinkStartMove = START_SHRINKING_MAP_AFTER_MOVES;
    this.minBoardSize = MINIMUM_BOARD_SIZE;
    this.shrinkLevel = -1;

    // Add borders object
    this.borders = {
      left: this.shrinkLevel,
      right: this.numOfColumns - this.shrinkLevel - 1,
      top: this.shrinkLevel,
      bottom: this.numOfRows - this.shrinkLevel - 1,
    };

    this.updateMap();
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
    const currentBoardWidth = this.borders.right - this.borders.left - 1;
    if (
      currentBoardWidth > this.minBoardSize &&
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

    // Generate apples after shrinking
    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }

    this.updateMap();
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
    // Check for move limit
    if (this.internalMoveCounter >= GAME_MAX_MOVES) {
      console.log("Maximum number of game moves exceeded.");
      this.determineWinnerByScoreThenLength();
      return true;
    }

    const deadPlayers = this.players
      .filter(
        (player) =>
          player.score <= 0 ||
          this.checkWallCollision(player) ||
          this.checkPlayerCollision(player)
      )
      .map((player) => player.id);

    if (!deadPlayers.length) return false;

    if (deadPlayers.length === 1) {
      this.winner = this.players.find((p) => p.id !== deadPlayers[0]).name;
      console.log(`Game Over! Player ${this.winner} wins!`);
    } else {
      this.determineWinnerByScoreThenLength();
    }
    return true;
  }

  checkWallCollision(player) {
    const head = player.body[0];

    // Check head collision with walls
    if (
      head.row <= this.borders.top ||
      head.row >= this.borders.bottom ||
      head.column <= this.borders.left ||
      head.column >= this.borders.right
    ) {
      console.log(`Player ${player.name} died by hitting a wall`);
      return true;
    }

    // Find the first wall segment index
    const firstWallIndex = player.body.findIndex(
      (segment) =>
        segment.column <= this.borders.left ||
        segment.column >= this.borders.right ||
        segment.row <= this.borders.top ||
        segment.row >= this.borders.bottom
    );

    // If no wall segments, return false
    if (firstWallIndex === -1) return false;

    // Get disconnected segments and update body
    const disconnectedSegments = player.body.slice(firstWallIndex);
    player.body = player.body.slice(0, firstWallIndex);

    // Convert valid segments to apples
    this.apples.push(
      ...disconnectedSegments
        .filter(
          (segment) =>
            segment.column > this.borders.left &&
            segment.column < this.borders.right &&
            segment.row > this.borders.top &&
            segment.row < this.borders.bottom
        )
        .map((segment) => ({
          row: segment.row,
          column: segment.column,
        }))
    );

    // Apply penalties first
    player.score = Math.max(
      0,
      player.score - disconnectedSegments.length * BODY_SEGMENT_LOSS_PENALTY
    );
    player.length -= disconnectedSegments.length;

    // Check if player died from score loss
    if (player.score <= 0) {
      console.log(
        `Player ${player.name} died from score reaching zero due to wall penalties`
      );
      return true;
    }

    return false;
  }

  checkPlayerCollision(player) {
    const head = player.body[0];
    if (!head) return false; // Return false if player has no body

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
    if (!otherPlayer.body.length) return false; // Return false if other player has no body

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
    } else if (player1.length !== player2.length) {
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
      -1
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
