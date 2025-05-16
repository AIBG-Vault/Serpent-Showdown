const GoldenApple = require("./items/goldenApple");
const Tron = require("./items/tron");
const ResetBorders = require("./items/resetBorders");
const Shorten = require("./items/shorten");
const Katana = require("./items/katana");
const Armour = require("./items/armour");
const SpeedUp = require("./items/leap");
const Freeze = require("./items/freeze");
const Nausea = require("./items/nausea");

const Apple = require("./items/apple");

/**
 * Class responsible for spawning game elements (apples and items) in mirrored positions
 */
class Spawner {
  /**
   * Creates a new Spawner instance
   * @param {SnakeGame} game - Reference to the main game instance
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Finds valid positions for spawning mirrored elements while avoiding collisions
   * @returns {Object|null} Object containing original and mirrored positions, or null if no valid position found
   * @property {number} originalRow - Row index for the original position
   * @property {number} originalColumn - Column index for the original position
   * @property {number} mirroredRow - Row index for the mirrored position
   * @property {number} mirroredColumn - Column index for the mirrored position
   */
  findValidSpawningPosition() {
    let attempts = 0;
    const maxAttempts = this.game.numOfColumns * this.game.numOfRows;
    const MIN_DISTANCE = 1.5; // This ensures at least 1 cell distance diagonally

    while (attempts < maxAttempts) {
      const originalRow = Math.floor(Math.random() * this.game.numOfRows);
      const originalColumn = Math.floor(
        Math.random() * Math.floor(this.game.numOfColumns / 2)
      );

      const mirroredRow = originalRow;
      const mirroredColumn = this.game.numOfColumns - 1 - originalColumn;

      // Check if position is within valid borders
      if (
        !this.game.board.isWithinBorders({
          row: originalRow,
          column: originalColumn,
        }) ||
        !this.game.board.isWithinBorders({
          row: mirroredRow,
          column: mirroredColumn,
        })
      ) {
        attempts++;
        continue;
      }

      // Check if position is too close to any player's head using Euclidean distance
      const isTooCloseToHead = this.game.players.some((player) => {
        if (player.body.length === 0) return false;
        const head = player.body[0];

        // Calculate distances for both original and mirrored positions
        const distanceToOriginal = Math.sqrt(
          Math.pow(head.row - originalRow, 2) +
            Math.pow(head.column - originalColumn, 2)
        );

        const distanceToMirrored = Math.sqrt(
          Math.pow(head.row - mirroredRow, 2) +
            Math.pow(head.column - mirroredColumn, 2)
        );

        return (
          distanceToOriginal <= MIN_DISTANCE ||
          distanceToMirrored <= MIN_DISTANCE
        );
      });

      if (isTooCloseToHead) {
        attempts++;
        continue;
      }

      // Check collision with snake bodies
      const collidesWithSnake = this.game.players.some((player) =>
        player.body.some(
          (segment) =>
            (segment.row === originalRow &&
              segment.column === originalColumn) ||
            (segment.row === mirroredRow && segment.column === mirroredColumn)
        )
      );

      if (collidesWithSnake) {
        attempts++;
        continue;
      }

      // Check collision with items
      const collidesWithItem = this.game.items.some(
        (item) =>
          (item.row === originalRow && item.column === originalColumn) ||
          (item.row === mirroredRow && item.column === mirroredColumn)
      );

      if (collidesWithItem) {
        attempts++;
        continue;
      }

      return { originalRow, originalColumn, mirroredRow, mirroredColumn };
    }

    return null;
  }

  /**
   * Spawns two apples in mirrored positions on the game board
   * Uses findValidSpawningPosition to ensure apples are placed in valid locations
   * If no valid positions are found, logs an error message
   */
  spawnMirroredApples() {
    const position = this.findValidSpawningPosition();
    if (!position) {
      console.log("Couldn't find valid mirrored positions to spawn apples");
      return;
    }

    const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
      position;

    const originalApple = new Apple({
      row: originalRow,
      column: originalColumn,
    });

    const mirroredApple = new Apple({
      row: mirroredRow,
      column: mirroredColumn,
    });

    this.game.items.push(originalApple, mirroredApple);
  }

  /**
   * Spawns two items in mirrored positions on the game board
   * Selects item type based on weighted probability and determines affect type
   * For Tron items, affect is randomly chosen with 40% self, 40% enemy, 20% both
   * If no valid positions are found, logs an error message
   */
  spawnMirroredItems() {
    const position = this.findValidSpawningPosition();

    if (!position) {
      console.log("Couldn't find valid mirrored positions to spawn items");
      return;
    }

    const itemClasses = [
      GoldenApple,
      Tron,
      ResetBorders,
      Shorten,
      Katana,
      Armour,
      SpeedUp,
      Freeze,
      Nausea,
    ];

    const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
      position;

    // Calculate total spawn weight
    const totalSpawnWeight = itemClasses.reduce(
      (sum, ItemClass) => sum + ItemClass.config.spawnWeight,
      0
    );

    // Select item class based on weight
    const random = Math.random() * totalSpawnWeight;
    let currentSpawnWeight = 0;
    const SelectedItemClass = itemClasses.find((ItemClass) => {
      currentSpawnWeight += ItemClass.config.spawnWeight;
      return random <= currentSpawnWeight;
    });

    // Determine affect for "random" affect items with 40/40/20 split
    let affect = SelectedItemClass.config.affect;
    if (affect === "random") {
      const affectRoll = Math.random();
      if (affectRoll < 0.3) {
        affect = "self";
      } else if (affectRoll < 0.8) {
        affect = "enemy";
      } else {
        affect = "both";
      }
    }

    const originalItem = new SelectedItemClass(
      { row: originalRow, column: originalColumn },
      affect
    );
    const mirroredItem = new SelectedItemClass(
      { row: mirroredRow, column: mirroredColumn },
      affect
    );
    // Copy the type and symbol from the original item to the mirrored item (bcs shorten makes it random)
    mirroredItem.type = originalItem.type;
    mirroredItem.symbol = originalItem.symbol;
    mirroredItem.randomDirection = originalItem.randomDirection;

    // Add the selected item to both positions with the determined affect
    this.game.items.push(originalItem, mirroredItem);
  }
}

module.exports = Spawner;
