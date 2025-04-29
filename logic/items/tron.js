const Item = require("./item");

class Tron extends Item {
  static config = {
    type: "tron",
    affect: "random",
    pickUpReward: 50,
    duration: 10,
    spawnWeight: 10,
    symbol: "T",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position, affect) {
    super(position, Tron.config);
    this.affect = affect;

    this.temporarySegments = 0;
  }

  /**
   * Increases temporary segments to be removed when expires, and does so
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    this.temporarySegments++;

    if (this.duration === 0) {
      const segmentsToRemove = Math.max(0, this.temporarySegments);

      if (segmentsToRemove > 0) {
        player.body = player.body.slice(0, -segmentsToRemove);
      }
    }
  }
}

module.exports = Tron;
