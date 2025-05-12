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
    // add a segment to player tail to be immediately removed by pop()
    player.body.push(player.body[player.body.length - 1]);
  }
}

module.exports = Apple;
