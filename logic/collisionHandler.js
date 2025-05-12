const config = require("./gameConfig");
const Apple = require("./items/apple");

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
      const apple = this.game.apples[appleIndex];

      player.addScore(apple.pickUpReward);

      // add "eaten" attribute to apple, so it can be removed after both moves are processed
      apple.eaten = true;

      return true;
    }

    return false;
  }

  /**
   * Checks if a player's head collides with a item
   * @param {Player} player - The player to check for collision
   * @param {Object} newHeadPosition - The position to check for item collision
   * @param {number} newHeadPosition.row - Row coordinate of the head
   * @param {number} newHeadPosition.column - Column coordinate of the head
   * @returns {boolean} True if collision with item occurred, false otherwise
   */
  checkForItemCollision(player, newHeadPosition) {
    const itemIndex = this.game.items.findIndex(
      (item) =>
        item.row === newHeadPosition.row &&
        item.column === newHeadPosition.column
    );

    // if player collides with a item, return true
    if (itemIndex !== -1) {
      const item = this.game.items[itemIndex];

      player.addScore(item.pickUpReward);

      if (
        item.affect === "self" ||
        item.affect === "both" ||
        item.affect === "map"
      ) {
        if (item.affect === "both") {
          item.affect = "self";
        }
        player.addOrExtendItem(item);
      }

      if (item.affect === "enemy" || item.affect === "both") {
        const otherPlayer = this.game.players.find((p) => p.id !== player.id);

        if (item.affect === "both") {
          item.affect = "self";
        }
        otherPlayer.addOrExtendItem(item);
      }

      this.game.items.splice(itemIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Checks if a player has collided with a wall
   * Handles wall collision effects including:
   * - Segment disconnection
   * - Score penalties
   * - Tron item adjustments
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

    const activeTronItem = player.activeItems.find(
      (activeItem) => activeItem.type === "tron"
    );
    if (activeTronItem) {
      activeTronItem.temporarySegments -= disconnectedSegments.length;
    }

    this.game.apples.push(
      ...disconnectedSegments
        .filter((segment) => this.game.board.isWithinBorders(segment))
        .map(
          (segment) =>
            new Apple({
              row: segment.row,
              column: segment.column,
            })
        )
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
