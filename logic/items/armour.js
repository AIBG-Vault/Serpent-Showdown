const Item = require("./item");

class Armour extends Item {
  static config = {
    type: "armour",
    affect: "self",
    pickUpReward: 60,
    duration: 15,
    spawnWeight: 7,
    symbol: "A",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, Armour.config);
  }

  /**
   * Cuts off enemy tail segments and converts them to apples
   * @param {Player} player - The player that collided with the item
   */
  do(player) {}
}

module.exports = Armour;
