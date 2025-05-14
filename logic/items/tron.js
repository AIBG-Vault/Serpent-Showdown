const Item = require("./item");

class Tron extends Item {
  static config = {
    type: "tron",
    affect: "random",
    pickUpReward: 50,
    duration: 15,
    spawnWeight: 3,
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
    // add a segment to player tail to be immediately removed by pop()
    player.body.push(player.body[player.body.length - 1]);

    this.temporarySegments++;

    if (this.duration === 0) {
      let segmentsToRemove = Math.max(0, this.temporarySegments); // dont remove negative number of segments

      player.removeSegments(segmentsToRemove);
    }
  }
}

module.exports = Tron;
