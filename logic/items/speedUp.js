const Item = require("./item");

class SpeedUp extends Item {
  static config = {
    type: "speed-up",
    affect: "self",
    pickUpReward: 80,
    duration: 5,
    spawnWeight: 5,
    symbol: "S+",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, SpeedUp.config);
  }

  /**
   * Increases temporary segments to be removed when expires, and does so
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    player.playMove(player.lastMoveDirection);

    // if player has katana item, remove it
    player.activeItems = player.activeItems.filter(
      (item) => item.type !== "katana"
    );
  }
}

module.exports = SpeedUp;
