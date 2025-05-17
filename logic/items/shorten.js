const Item = require("./item");

class Shorten extends Item {
  static config = {
    type: "shorten",
    affect: "random",
    pickUpReward: 30,
    duration: 1, // instant effect
    spawnWeight: 4,
    symbol: "S",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position, affect) {
    super(position, Shorten.config);
    this.affect = affect;

    this.randomizeShorteningLength();
  }

  /**
   * Removes a specified number of segments from the player's body
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    const segmentsToRemove = parseInt(this.type.slice(8));
    player.removeSegments(segmentsToRemove);
  }

  /**
   * Randomizes the length of the item
   * @private
   */
  randomizeShorteningLength() {
    const possibleLengths = [10, 15, 25, 40];

    const typeName = `shorten-${
      possibleLengths[Math.floor(Math.random() * possibleLengths.length)]
    }`;

    this.type = typeName;

    this.symbol = typeName.slice(8);
  }
}

module.exports = Shorten;
