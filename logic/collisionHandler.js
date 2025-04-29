const config = require("./gameConfig");

/**
 * Handles all collision-related logic in the snake game
 */
class CollisionHandler {
  /**
   * Creates a new CollisionHandler instance
   * @param {SnakeGame} game - Reference to the main game instance
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Checks if a player's head collides with an apple
   * @param {Player} player - The player to check for collision
   * @param {Object} newHeadPosition - The position to check for apple collision
   * @param {number} newHeadPosition.row - Row coordinate of the head
   * @param {number} newHeadPosition.column - Column coordinate of the head
   * @returns {boolean} True if collision with apple occurred, false otherwise
   */
  checkForAppleCollision(player, newHeadPosition) {
    const appleIndex = this.game.apples.findIndex(
      (apple) =>
        apple.row === newHeadPosition.row &&
        apple.column === newHeadPosition.column
    );

    // if player collides with an apple, return true
    if (appleIndex !== -1) {
      player.addScore(config.APPLE_PICKUP_REWARD);
      this.game.apples.splice(appleIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Checks if a player's head collides with a modifier
   * @param {Player} player - The player to check for collision
   * @param {Object} newHeadPosition - The position to check for modifier collision
   * @param {number} newHeadPosition.row - Row coordinate of the head
   * @param {number} newHeadPosition.column - Column coordinate of the head
   * @returns {boolean} True if collision with modifier occurred, false otherwise
   */
  checkForItemCollision(player, newHeadPosition) {
    const modifierIndex = this.game.modifiers.findIndex(
      (modifier) =>
        modifier.row === newHeadPosition.row &&
        modifier.column === newHeadPosition.column
    );

    // if player collides with a modifier, return true
    if (modifierIndex !== -1) {
      const modifier = this.game.modifiers[modifierIndex];

      player.addScore(modifier.pickUpReward);

      if (
        modifier.affect === "self" ||
        modifier.affect === "both" ||
        modifier.affect === "map"
      ) {
        player.addOrExtendModifier(modifier);
      }

      if (modifier.affect === "enemy" || modifier.affect === "both") {
        const otherPlayer = this.game.players.find((p) => p.id !== player.id);

        otherPlayer.addOrExtendModifier(modifier);
      }

      this.game.modifiers.splice(modifierIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Checks if a player has collided with a wall
   * Handles wall collision effects including:
   * - Segment disconnection
   * - Score penalties
   * - Tron modifier adjustments
   * - Converting disconnected segments to apples
   * @param {Player} player - The player to check for wall collision
   * @returns {boolean} True if fatal wall collision occurred, false otherwise
   */
  checkForWallCollision(player) {
    if (!player.body.length || !player.body[0]) {
      return true;
    }

    const head = player.body[0];

    if (!this.game.board.isWithinBorders(head)) {
      console.log(`Player ${player.name} died by hitting a wall`);
      return true;
    }

    const firstWallIndex = player.body.findIndex(
      (segment) => !this.game.board.isWithinBorders(segment)
    );

    if (firstWallIndex === -1) return false;

    const disconnectedSegments = player.body.slice(firstWallIndex);
    player.body = player.body.slice(0, firstWallIndex);

    const activeTronModifier = player.activeModifiers.find(
      (activeModifier) => activeModifier.type === "tron"
    );
    if (activeTronModifier) {
      activeTronModifier.temporarySegments -= disconnectedSegments.length;
    }

    this.game.apples.push(
      ...disconnectedSegments
        .filter((segment) => this.game.board.isWithinBorders(segment))
        .map((segment) => ({
          row: segment.row,
          column: segment.column,
        }))
    );

    player.score = Math.max(
      0,
      player.score -
        disconnectedSegments.length * config.BODY_SEGMENT_LOSS_PENALTY
    );

    if (player.score <= 0) {
      console.log(
        `Player ${player.name} died from score reaching zero due to wall penalties`
      );
      return true;
    }

    return false;
  }

  /**
   * Checks if a player has collided with itself or another player
   * @param {Player} player - The player to check for collision
   * @returns {boolean} True if collision with player occurred, false otherwise
   */
  checkForPlayerCollision(player) {
    const head = player.body[0];
    if (!head) return false;

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

    const otherPlayer = this.game.players.find((p) => p.id !== player.id);
    if (!otherPlayer.body.length) return false;

    const playerCollidedWithOtherPlayer = otherPlayer.body.some(
      (segment) => segment.row === head.row && segment.column === head.column
    );
    if (playerCollidedWithOtherPlayer) {
      console.log(`Player ${player.name} died by colliding with other player`);
      return true;
    }

    return false;
  }
}

module.exports = CollisionHandler;
