const Item = require("./item");

class Nausea extends Item {
  static config = {
    type: "nausea",
    affect: "enemy",
    pickUpReward: 90,
    duration: 1,
    spawnWeight: 7,
    symbol: "N",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, Nausea.config);

    // pick a random direction
    const directions = ["up", "down", "left", "right"];
    const randomIndex = Math.floor(Math.random() * directions.length);
    this.randomDirection = directions[randomIndex];
  }

  /**
   * Increases temporary segments to be removed when expires, and does so
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    player.nextMoveDirection = this.randomDirection;
  }
}

module.exports = Nausea;
