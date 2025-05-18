const config = require("./gameConfig");

/**
 * Represents a player in the snake game
 */
class Player {
  /**
   * Creates a new Player instance
   * @param {Object} playerData - The player's initial data
   * @param {string} playerData.id - The player's unique identifier
   * @param {string} playerData.name - The player's name
   * @param {SnakeGame} game - The game instance
   */
  constructor(game, playerData) {
    this.game = game;

    this.id = playerData.id;
    this.name = playerData.name;

    this.score = config.PLAYERS_STARTING_SCORE;

    this.body = [];
    this.initBodySegments();

    this.activeItems = [];

    this.lastMoveDirection = null;
    this.nextMoveDirection = null;
  }

  /**
   * Initializes the player's starting position and body segments
   */
  initBodySegments() {
    const isFirstPlayer = this.game.players.length === 0;

    // Initialize player position
    const startRowIndex = Math.floor(this.game.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? config.PLAYERS_STARTING_LENGTH
      : this.game.numOfColumns - (config.PLAYERS_STARTING_LENGTH + 1);

    // Add body segments using addSegment method starting from the head
    for (let i = config.PLAYERS_STARTING_LENGTH - 1; i >= 0; i--) {
      this.body.unshift({
        row: startRowIndex,
        column: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }
  }

  /**
   * Shortens the player's body length by a specified amount
   * @param {number} numOfSegments - The number of segments to remove from the end of the body up to body.length = 1
   */
  removeSegments(numOfSegments) {
    // final length must be a minimum of 1
    const finalLength = Math.max(1, this.body.length - numOfSegments);
    this.body = this.body.slice(0, finalLength);
  }

  /**
   * Adds points to the player's score, ensuring it doesn't go below 0
   * @param {number} points - The points to add (can be negative)
   */
  addScore(points) {
    this.score = Math.max(0, this.score + points);
  }

  /**
   * Processes a single move for a specific player
   * @param {string} direction - Direction of movement ('up', 'down', 'left', 'right')
   */
  playMove(direction) {
    // use preset direction if exists
    if (this.nextMoveDirection !== null) {
      direction = this.nextMoveDirection;
      this.nextMoveDirection = null;
    }

    if (direction === "frozen") {
      return; // ignore move
    }

    this.lastMoveDirection = direction;

    // Use player's isReverseDirection method
    if (this.isReverseDirection(direction)) {
      this.addScore(-config.REVERSE_DIRECTION_PENALTY);
      return;
    }

    // Penalize invalid moves (including timeout)
    if (!["up", "down", "left", "right"].includes(direction)) {
      this.addScore(-config.ILLEGAL_MOVE_PENALTY);
      return;
    }

    const newHeadPos = { ...this.body[0] };
    if (direction === "up") {
      newHeadPos.row -= 1;
    } else if (direction === "down") {
      newHeadPos.row += 1;
    } else if (direction === "left") {
      newHeadPos.column -= 1;
    } else if (direction === "right") {
      newHeadPos.column += 1;
    }

    // add new head segment
    this.body.unshift(newHeadPos);

    // calculcate before removing tail segment in case length is 1
    this.updateScoreByMovementDirection();

    // check for item collisions
    this.game.collisionHandler.checkForItemCollision(this);

    // remove tail segment
    this.removeSegments(1);
  }

  /**
   * Updates player score based on movement relative to board center
   */
  updateScoreByMovementDirection() {
    let boardCenterRow = (this.game.numOfRows - 1) / 2;
    let boardCenterCol = (this.game.numOfColumns - 1) / 2;

    const newHeadPos = this.body[0];
    const oldHeadPos = this.body[1]; // new neck position

    const oldDistanceToCenter =
      Math.abs(oldHeadPos.row - boardCenterRow) +
      Math.abs(oldHeadPos.column - boardCenterCol);
    const newDistanceToCenter =
      Math.abs(newHeadPos.row - boardCenterRow) +
      Math.abs(newHeadPos.column - boardCenterCol);

    // Award points based on movement relative to center
    if (newDistanceToCenter < oldDistanceToCenter) {
      this.addScore(config.MOVEMENT_TOWARDS_CENTER_REWARD);
    } else {
      this.addScore(config.MOVEMENT_AWAY_FROM_CENTER_REWARD);
    }
  }

  /**
   * Checks if the given move direction would result in a reverse movement
   * @param {string} incomingMoveDirection - The proposed movement direction ('up', 'down', 'left', 'right')
   * @returns {boolean} True if the move would reverse the snake's direction
   */
  isReverseDirection(incomingMoveDirection) {
    const head = this.body[0];

    // find the first segment that column and row is not same as head
    const neck = this.body.find(
      (segment) => segment.column !== head.column || segment.row !== head.row
    );

    // if neck is not found, return false
    if (!neck) {
      return false;
    }

    let currentDirection;
    if (head.row === neck.row) {
      currentDirection = head.column > neck.column ? "right" : "left";
    } else if (head.row !== neck.row) {
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

  /**
   * Adds or updates a item effect on the player
   * @param {Object} item - The item to add
   * @param {string} item.type - The type of item ('golden apple' or 'tron')
   * @param {number} item.duration - How long the item should last
   * @param {number} [item.temporarySegments] - For tron item, tracks temporary segments
   */
  addOrExtendItem(item) {
    const existingItem = this.activeItems.find(
      (activeItem) => item.type === activeItem.type
    );

    if (existingItem) {
      // reset item duration
      existingItem.duration = item.duration;
    } else {
      this.activeItems.push(item);
    }
  }
}

module.exports = Player;
