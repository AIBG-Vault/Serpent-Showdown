const modifiersList = require("./modifiers");

/**
 * Class responsible for spawning game elements (apples and modifiers) in mirrored positions
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

      // Check collision with apples
      const collidesWithApple = this.game.apples.some(
        (apple) =>
          (apple.row === originalRow && apple.column === originalColumn) ||
          (apple.row === mirroredRow && apple.column === mirroredColumn)
      );

      if (collidesWithApple) {
        attempts++;
        continue;
      }

      // Check collision with modifiers
      const collidesWithModifier = this.game.modifiers.some(
        (modifier) =>
          (modifier.row === originalRow &&
            modifier.column === originalColumn) ||
          (modifier.row === mirroredRow && modifier.column === mirroredColumn)
      );

      if (collidesWithModifier) {
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

    if (position) {
      const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
        position;
      this.game.apples.push({ row: originalRow, column: originalColumn });
      this.game.apples.push({ row: mirroredRow, column: mirroredColumn });
      return;
    }

    console.log("Couldn't find valid mirrored positions to spawn apples");
  }

  /**
   * Spawns two modifiers in mirrored positions on the game board
   * Selects modifier type based on weighted probability and determines affect type
   * For Tron modifiers, affect is randomly chosen with 40% self, 40% enemy, 20% both
   * If no valid positions are found, logs an error message
   */
  spawnMirroredModifiers() {
    const position = this.findValidSpawningPosition();
    if (position) {
      const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
        position;

      // Calculate total spawn weight
      const totalSpawnWeight = modifiersList.reduce(
        (sum, type) => sum + type.spawnWeight,
        0
      );

      // Random number between 0 and total weight
      const random = Math.random() * totalSpawnWeight;

      // Select modifier type based on weight
      let currentSpawnWeight = 0;
      const selectedModifier = modifiersList.find((type) => {
        currentSpawnWeight += type.spawnWeight;
        return random <= currentSpawnWeight;
      });

      // Determine affect for Tron modifier with 40/40/20 split
      let affect = selectedModifier.affect;
      if (selectedModifier.affect === "random") {
        const affectRoll = Math.random();
        if (affectRoll < 0.4) {
          affect = "self";
        } else if (affectRoll < 0.8) {
          affect = "enemy";
        } else {
          affect = "both";
        }
      }

      // Add the selected modifier to both positions with the determined affect
      this.game.modifiers.push({
        type: selectedModifier.type,
        affect: affect,
        row: originalRow,
        column: originalColumn,
      });

      this.game.modifiers.push({
        type: selectedModifier.type,
        affect: affect,
        row: mirroredRow,
        column: mirroredColumn,
      });

      return;
    }

    console.log("Couldn't find valid mirrored positions to spawn modifiers");
  }
}

module.exports = Spawner;
