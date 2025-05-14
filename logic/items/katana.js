const Item = require("./item");
const Apple = require("./apple");
const config = require("../gameConfig");

class Katana extends Item {
  static config = {
    type: "katana",
    affect: "self",
    pickUpReward: 60,
    duration: 10,
    spawnWeight: 7,
    symbol: "K",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, Katana.config);
  }

  /**
   * Cuts off enemy tail segments and converts them to apples
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    const playerHead = player.body[0];

    const otherPlayer = player.game.players.find((p) => p !== player);

    // Check if player's head collides with enemy's body (excluding head)
    const collisionIndex = otherPlayer.body.findIndex(
      (segment) =>
        segment.row === playerHead.row && segment.column === playerHead.column
    );

    // If no collision or collision with head, return false
    if (collisionIndex === -1 || collisionIndex === 0) return false;

    // Check if the other player has active armour
    const hasArmour = otherPlayer.activeItems.some(
      (item) => item.type === "armour"
    );

    if (hasArmour) {
      // Katana is negated, do nothing special, let normal collision kill the player
      return false;
    }

    // Store disconnecte segments before removing them
    const disconnectedSegments = otherPlayer.body.slice(collisionIndex);

    // Remove all segments from collision point to tail
    otherPlayer.body = otherPlayer.body.slice(0, collisionIndex);

    // Spawn apples at cut segment positions, except where player's head is
    disconnectedSegments.forEach((segment) => {
      if (
        !(
          segment.row === playerHead.row && segment.column === playerHead.column
        )
      ) {
        player.game.items.push(
          new Apple({ row: segment.row, column: segment.column })
        );
      }
    });

    otherPlayer.score -=
      disconnectedSegments.length * config.BODY_SEGMENT_LOSS_PENALTY;

    // remove the katana item after successful hit
    this.duration = 0;
  }
}

module.exports = Katana;
