const Item = require("./item");

class GoldenApple extends Item {
  static config = {
    type: "golden apple",
    affect: "self",
    pickUpReward: 70,
    duration: 3,
    spawnWeight: 9,
    symbol: "G",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, GoldenApple.config);
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

module.exports = GoldenApple;
