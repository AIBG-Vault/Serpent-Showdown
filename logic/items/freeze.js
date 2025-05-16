const Item = require("./item");

class Freeze extends Item {
  static config = {
    type: "freeze",
    affect: "enemy",
    pickUpReward: 30,
    duration: 8,
    spawnWeight: 4,
    symbol: "F",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, Freeze.config);
  }

  /**
   * Increases temporary segments to be removed when expires, and does so
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    player.nextMoveDirection = "frozen";
  }
}

module.exports = Freeze;
