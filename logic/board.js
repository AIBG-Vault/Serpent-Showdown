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
      return this.game.map[row][column];
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
      this.game.map[row][column] = value;
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
    this.game.apples = this.game.apples.filter((apple) =>
      this.isWithinBorders(apple)
    );

    this.game.modifiers = this.game.modifiers.filter((modifier) =>
      this.isWithinBorders(modifier)
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
    this.game.map = Array.from({ length: this.game.numOfRows }, (_, rowIndex) =>
      Array.from({ length: this.game.numOfColumns }, (_, colIndex) =>
        colIndex <= this.borders.left ||
        colIndex >= this.borders.right ||
        rowIndex <= this.borders.top ||
        rowIndex >= this.borders.bottom
          ? {
              type: "border",
            }
          : null
      )
    );

    // Update players
    if (this.game.players) {
      this.game.players.forEach((player) => {
        if (player.body.length > 0) {
          const head = player.body[0];
          if (this.isValidPosition(head)) {
            // set head
            this.setCell(head.row, head.column, {
              type: "snake-head",
              player: player.id[0].toLowerCase(),
            });

            // set body
            for (let i = 1; i < player.body.length; i++) {
              const segment = player.body[i];
              if (this.isValidPosition(segment)) {
                this.setCell(segment.row, segment.column, {
                  type: "snake-body",
                  player: player.id[0].toLowerCase(),
                });
              }
            }
          }
        }
      });
    }

    // Update apples
    if (this.game.apples) {
      this.game.apples.forEach((apple) => {
        this.setCell(apple.row, apple.column, {
          type: "apple",
        });
      });
    }

    // Update modifiers
    if (this.game.modifiers) {
      this.game.modifiers.forEach((modifier) => {
        switch (modifier.type) {
          case "golden apple":
            this.setCell(modifier.row, modifier.column, {
              type: "golden-apple",
              affect: modifier.affect,
            });
            break;
          case "tron":
            this.setCell(modifier.row, modifier.column, {
              type: "tron",
              affect: modifier.affect,
            });
            break;
          case "reset borders":
            this.setCell(modifier.row, modifier.column, {
              type: "reset-borders",
            });
            break;
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
  resetShrinkage() {
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
