class Item {
  /**
   * Creates a new Item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - Row coordinate
   * @param {number} position.column - Column coordinate
   * @param {Object} config - Configuration for the item
   * @param {string} config.type - Type of the item
   * @param {string} config.affect - Who is affected by this item
   * @param {number} config.pickUpReward - Points awarded when picked up
   * @param {number} config.duration - How long the effect lasts
   * @param {number} config.spawnWeight - Probability weight for spawning
   * @param {string} config.symbol - Symbol representation of the item for visuals
   */
  constructor(position, config) {
    this.row = position.row;
    this.column = position.column;

    this.type = config.type || "unknown";
    this.affect = config.affect;
    this.pickUpReward = config.pickUpReward;
    this.duration = config.duration;
    this.spawnWeight = config.spawnWeight;

    this.symbol = config.symbol || "?";
  }

  /**
   * Virtual method to be implemented by child classes
   * @param {Player} player - The player that collided with the item
   */
  do(player) {
    throw new Error('Method "do" must be implemented by child classes');
  }
}

module.exports = Item;
