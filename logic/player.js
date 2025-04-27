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
   * @param {boolean} isFirstPlayer - Whether this is the first player (determines starting position)
   * @param {number} numOfRows - Number of rows in the game board
   * @param {number} numOfColumns - Number of columns in the game board
   */
  constructor(playerData, isFirstPlayer, numOfRows, numOfColumns) {
    this.id = playerData.id;
    this.name = playerData.name;
    this.body = [];
    this.activeModifiers = [];
    this.score = config.PLAYERS_STARTING_SCORE;
    this.length = config.PLAYERS_STARTING_LENGTH;

    // Initialize player position
    const startRowIndex = Math.floor(numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? config.PLAYERS_STARTING_LENGTH
      : numOfColumns - (config.PLAYERS_STARTING_LENGTH + 1);

    // Add body segments
    for (let i = 0; i < config.PLAYERS_STARTING_LENGTH; i++) {
      this.body.push({
        row: startRowIndex,
        column: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }
  }

  /**
   * Gets the current head position of the snake
   * @returns {Object} The head segment with row and column coordinates
   */
  getHead() {
    return this.body[0];
  }

  /**
   * Adds a new segment to the front of the snake
   * @param {Object} position - The position to add the new segment
   * @param {number} position.row - Row coordinate
   * @param {number} position.column - Column coordinate
   */
  addSegment(position) {
    this.body.unshift(position);
    this.length += 1;
  }

  /**
   * Removes the last segment of the snake if no active modifiers prevent it
   */
  removeTail() {
    if (!this.shouldKeepTail()) {
      this.body.pop();
    }
  }

  /**
   * Checks if the snake's tail should be kept based on active modifiers
   * @returns {boolean} True if tail should be kept, false otherwise
   */
  shouldKeepTail() {
    return this.activeModifiers.some((activeModifier) => 
      activeModifier.type === "golden apple" || activeModifier.type === "tron"
    );
  }

  /**
   * Checks if the given move direction would result in a reverse movement
   * @param {string} incomingMoveDirection - The proposed movement direction ('up', 'down', 'left', 'right')
   * @returns {boolean} True if the move would reverse the snake's direction
   */
  isReverseDirection(incomingMoveDirection) {
    const head = this.body[0];
    const neck = this.body[1];

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

  /**
   * Updates all active modifiers, reducing their duration and handling expiration effects
   */
  updateModifiers() {
    this.activeModifiers = this.activeModifiers
      .map((activeModifier) => {
        const newDuration = activeModifier.duration - 1;

        if (activeModifier.type === "tron") {
          activeModifier.temporarySegments += 1;
        }

        // Handle Tron modifier expiration
        if (activeModifier.type === "tron" && newDuration === 0) {
          const segmentsToRemove = Math.max(0, activeModifier.temporarySegments);
          if (segmentsToRemove > 0) {
            this.body = this.body.slice(0, -segmentsToRemove);
            this.length -= segmentsToRemove;
          }
        }

        return { ...activeModifier, duration: newDuration };
      })
      .filter((modifier) => modifier.duration > 0);
  }

  /**
   * Adds points to the player's score, ensuring it doesn't go below 0
   * @param {number} points - The points to add (can be negative)
   */
  addScore(points) {
    this.score = Math.max(0, this.score + points);
  }

  /**
   * Adds or updates a modifier effect on the player
   * @param {Object} modifier - The modifier to add
   * @param {string} modifier.type - The type of modifier ('golden apple' or 'tron')
   * @param {number} modifier.duration - How long the modifier should last
   * @param {number} [modifier.temporarySegments] - For tron modifier, tracks temporary segments
   */
  addModifier(modifier) {
    const existingModifier = this.activeModifiers.find(
      (mod) => mod.type === modifier.type
    );
    if (existingModifier) {
      existingModifier.duration = modifier.duration;
    } else {
      this.activeModifiers.push({ ...modifier });
    }
  }
}

module.exports = Player;