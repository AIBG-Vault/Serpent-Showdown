const Item = require("./item");

class ResetBorders extends Item {
  static config = {
    type: "reset-borders",
    affect: "map",
    pickUpReward: 30,
    duration: 1, // instant effect
    spawnWeight: 1,
    symbol: "B",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position) {
    super(position, ResetBorders.config);
  }

  /**
   * Resets the borders on the board
   * @param {Player} player
   */
  do(player) {
    player.game.board.resetBorders();
  }
}

module.exports = ResetBorders;
