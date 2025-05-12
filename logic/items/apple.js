const Item = require("./item");

class Apple extends Item {
  static config = {
    type: "apple",
    affect: "self",
    pickUpReward: 50,
    duration: 1,
    symbol: "A",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, Apple.config);
  }

  /**
   * Implements the effect of picking up a golden apple
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    // add a segment to the player's body
    // but actually just disables the remove tail for its duration
    // player.addSegment();

    // handle interaction with tron
    const activeTronItem = player.activeItems.find(
      (item) => item.type === "tron"
    );

    if (activeTronItem) {
      activeTronItem.temporarySegments = Math.max(
        0,
        activeTronItem.temporarySegments - 1
      );
    }

    // handle interaction with golden apple
    const activeGoldenAppleItem = player.activeItems.find(
      (item) => item.type === "golden apple"
    );

    if (activeGoldenAppleItem) {
      activeGoldenAppleItem.duration += 1;
    }
  }
}

module.exports = Apple;
