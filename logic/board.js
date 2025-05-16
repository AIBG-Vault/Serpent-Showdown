const config = require("./gameConfig");

/**
 * Represents the game board for the snake game
 */
class Board {
  /**
   * Creates a new Board instance
   * @param {SnakeGame} game - Reference to the main game instance
   */
  constructor(game) {
    this.game = game;

    this.horizontalShrinkLevel = -1;

    this.borders = {
      left: this.horizontalShrinkLevel,
      right: this.game.numOfColumns - this.horizontalShrinkLevel - 1,
      top: this.horizontalShrinkLevel,
      bottom: this.game.numOfRows - this.horizontalShrinkLevel - 1,
    };

    this.map = null;
    this.updateMap();
  }

  /**
   * Gets the value of a cell at the specified coordinates
   * @param {number} row - Row coordinate
   * @param {number} column - Column coordinate
   * @returns {(Object|null)} The cell value, null for empty cells
   */
  getCell(row, column) {
    if (
      row >= 0 &&
      row < this.game.numOfRows &&
      column >= 0 &&
      column < this.game.numOfColumns
    ) {
      return this.map[row][column];
    }
    return null;
  }

  /**
   * Sets the value of a cell at the specified coordinates
   * @param {number} row - Row coordinate
   * @param {number} column - Column coordinate
   * @param {(Object|string|null)} value - The value to set in the cell
   */
  setCell(row, column, value) {
    if (
      row >= 0 &&
      row < this.game.numOfRows &&
      column >= 0 &&
      column < this.game.numOfColumns
    ) {
      this.map[row][column] = value;
    }
  }

  /**
   * Gets the current width of the playable board area
   * @returns {number} The current board width excluding walls
   */
  getCurrentBoardWidth() {
    return this.borders.right - this.borders.left - 1;
  }

  /**
   * Shrinks the game board by incrementing shrink level and updating borders
   */
  shrinkMap() {
    this.horizontalShrinkLevel++;

    // Update borders
    this.borders.left = this.horizontalShrinkLevel;
    this.borders.right =
      this.game.numOfColumns - 1 - this.horizontalShrinkLevel;

    // Calculate how much extra shrinking is needed after 1:1 ratio is reached
    const verticalShrink = Math.max(
      this.horizontalShrinkLevel -
        Math.floor((this.game.numOfColumns - this.game.numOfRows) / 2),
      -1
    );
    this.borders.top = verticalShrink;
    this.borders.bottom = this.game.numOfRows - 1 - verticalShrink;

    // Remove items outside borders
    this.game.items = this.game.items.filter((item) =>
      this.isWithinBorders(item)
    );
  }

  /**
   * Checks if a position is within the current board boundaries
   * @param {Object} position - The position to check
   * @param {number} position.row - Row coordinate
   * @param {number} position.column - Column coordinate
   * @returns {boolean} True if position is within bounds, false otherwise
   */
  isWithinBorders(position) {
    return (
      position.column > this.borders.left &&
      position.column < this.borders.right &&
      position.row > this.borders.top &&
      position.row < this.borders.bottom
    );
  }

  /**
   * Updates the entire game map with current game state
   */
  updateMap() {
    // Initialize the grid
    this.map = Array.from({ length: this.game.numOfRows }, (_, rowIndex) =>
      Array.from({ length: this.game.numOfColumns }, (_, colIndex) =>
        colIndex <= this.borders.left ||
        colIndex >= this.borders.right ||
        rowIndex <= this.borders.top ||
        rowIndex >= this.borders.bottom
          ? {
              type: "border",
              symbol: "#",
            }
          : null
      )
    );

    // Update items
    if (this.game.items) {
      this.game.items.forEach((item) => {
        // this.setCell(item.row, item.column, item);

        this.setCell(item.row, item.column, {
          row: item.row,
          column: item.column,
          type: item.type || "unknown",
          affect: item.affect,
          pickUpReward: item.pickUpReward,
          duration: item.duration,
          spawnWeight: item.spawnWeight,
          symbol: item.symbol || "?",
        });
      });
    }

    // Update players
    if (this.game.players) {
      this.game.players.forEach((player) => {
        // Draw snake segments from tail to head
        for (let i = player.body.length - 1; i >= 0; i--) {
          const snakeSegment = player.body[i];
          if (!this.isValidPosition(snakeSegment)) {
            break;
          }

          this.setCell(snakeSegment.row, snakeSegment.column, {
            type: i === 0 ? "snake-head" : "snake-body",
            playerName: player.name,
          });
        }
      });
    }
  }

  /**
   * Checks if a position is valid within the game board dimensions
   * @param {Object} position - The position to validate
   * @param {number} position.row - Row coordinate
   * @param {number} position.column - Column coordinate
   * @returns {boolean} True if position is valid, false otherwise
   */
  isValidPosition(position) {
    return (
      position &&
      position.row >= 0 &&
      position.row < this.game.numOfRows &&
      position.column >= 0 &&
      position.column < this.game.numOfColumns
    );
  }

  /**
   * Resets the shrinkage level and borders to their initial values
   */
  resetBorders() {
    this.horizontalShrinkLevel = -1;

    this.borders = {
      left: this.horizontalShrinkLevel,
      right: this.game.numOfColumns - this.horizontalShrinkLevel - 1,
      top: this.horizontalShrinkLevel,
      bottom: this.game.numOfRows - this.horizontalShrinkLevel - 1,
    };
  }
}

module.exports = Board;
