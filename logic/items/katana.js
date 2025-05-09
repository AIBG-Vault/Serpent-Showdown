const Item = require("./item");
const Apple = require("./apple");

class Katana extends Item {
  static config = {
    type: "katana",
    affect: "self",
    pickUpReward: 100,
    duration: 10,
    spawnWeight: 25,
    symbol: "K",
  };

  /**
   * Creates a new item instance
   * @param {Object} position - The position of the item
   * @param {number} position.row - The row coordinate of the item
   * @param {number} position.col - The column coordinate of the item
   */
  constructor(position, affect) {
    super(position, Katana.config);
    this.affect = affect;
    this.equipped = true;
  }

  /**
   * Cuts off enemy tail segments and converts them to apples
   * @param {Player} player - The player that collided with the item
   * @param {Game} game - The game instance for spawning apples
   */
  do(player, game) {
    if (!this.equipped) return;

    const enemy = player.game.players.find(p => p !== player);
    if (!enemy || enemy.body.length <= 1) return;

    const head = player.body[0];
    if (!head || !head.row || !head.column) return;

    // Check if player's head collides with enemy's tail (excluding head)
    const collisionIndex = enemy.body.findIndex((segment, index) => 
      index > 0 && segment && segment.row === head.row && segment.column === head.column
    );

    if (collisionIndex > 0) {
      // Store cut segments before removing them
      const cutSegments = enemy.body.slice(collisionIndex);
      
      // Remove all segments from collision point to tail
      enemy.body = enemy.body.slice(0, collisionIndex);

      // Handle interaction with tron item if enemy has it
      const activeTronItem = enemy.activeItems.find(
        (item) => item.type === "tron"
      );

      if (activeTronItem) {
        activeTronItem.tempSegments = Math.max(
          0,
          activeTronItem.tempSegments - (enemy.body.length - collisionIndex)
        );
      }

      // Spawn apples at cut segment positions, except where player's head is
      cutSegments.forEach(segment => {
        if (segment && !(segment.row === head.row && segment.column === head.column)) {
          const applePosition = { row: segment.row, column: segment.column };
          game.items.push(new Apple(applePosition));
        }
      });

      // Unequip the katana after successful hit
      this.equipped = false;
      this.duration = 0;

      console.log(
        `Player ${player.name} used katana to cut ${enemy.name}'s tail at segment ${collisionIndex}`
      );
    }
  }
}

module.exports = Katana;