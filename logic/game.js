const config = require("./gameConfig");
const Player = require("./player");
const Board = require("./board");
const Spawner = require("./spawner");
const CollisionHandler = require("./collisionHandler");

/**
 * Main game class that handles the snake game logic
 */
class SnakeGame {
  /**
   * Creates a new SnakeGame instance and initializes game components
   */
  constructor() {
    this.numOfRows = config.BOARD_NUM_OF_ROWS;
    this.numOfColumns = config.BOARD_NUM_OF_COLUMNS;

    this.board = new Board(this);

    this.moveCount = 0;

    this.players = [];
    this.winner = null;

    this.items = [];

    this.spawner = new Spawner(this);
    this.collisionHandler = new CollisionHandler(this);

    this.board.updateMap();
  }

  /**
   * Adds a new player to the game
   * @param {Object} playerData - Data for the new player
   * @param {string} playerData.id - Unique identifier for the player
   * @param {string} playerData.name - Display name for the player
   */
  addPlayer(playerData) {
    const player = new Player(this, playerData);
    this.players.push(player);

    this.board.updateMap();
  }

  /**
   * Processes a batch of moves from all players
   * @param {Array<Object>} moves - Array of move objects
   * @param {string} moves[].playerId - ID of the player making the move
   * @param {string} moves[].direction - Direction of the move ('up', 'down', 'left', 'right')
   */
  processMoves(moves) {
    this.moveCount++;

    // Process all moves
    moves.forEach((move) => {
      const player = this.players.find((p) => p.id === move.playerId);
      player.playMove(move.direction);
    });

    // process players items
    this.processPlayersItems();

    // filter all items with "hasCollided" property set to true,
    // solves bug where only one player would get the reward (and length)
    this.items = this.items.filter((item) => item.hasCollided !== true);

    // Handle map shrinking
    const currentBoardWidth = this.board.getCurrentBoardWidth();
    if (
      currentBoardWidth > config.MINIMUM_BOARD_SIZE &&
      this.moveCount >= config.START_SHRINKING_MAP_AFTER_MOVES &&
      this.moveCount % config.SHRINK_MAP_MOVE_INTERVAL === 0
    ) {
      this.board.shrinkMap();
    }

    // Check if game is over and determine winner
    this.checkGameOver();
    if (this.winner !== null) {
      return;
    }

    // Spawn apples every 5 moves
    if (this.moveCount % 5 === 0) {
      this.spawner.spawnMirroredApples();
    }

    // Spawn items based on a chance
    if (Math.random() < config.MODIFIER_SPAWN_CHANCE) {
      this.spawner.spawnMirroredItems();
    }

    // update map game state
    this.board.updateMap();
  }

  /**
   * Checks if the game is over based on player deaths or move limit
   * @returns {boolean} True if game is over, false otherwise
   */
  checkGameOver() {
    const deadPlayers = this.players
      .filter(
        (player) =>
          this.collisionHandler.checkForWallCollision(player) ||
          this.collisionHandler.checkForPlayerCollision(player) ||
          player.score <= 0
      )
      .map((player) => player.id);

    if (deadPlayers.length > 0) {
      if (deadPlayers.length === 1) {
        this.winner = this.players.find((p) => p.id !== deadPlayers[0]).name;
        console.log(`Game Over! Player ${this.winner} wins!`);
      } else {
        this.determineWinnerByScoreThenLength();
      }
    }

    // Check for move limit only if no players died
    if (this.moveCount >= config.GAME_MAX_MOVES) {
      console.log("Maximum number of game moves exceeded.");
      this.determineWinnerByScoreThenLength();
    }
  }

  /**
   * Determines the winner based on score and snake length when game ends in a tie
   * Sets the winner property to the winning player's name or -1 for a draw
   */
  determineWinnerByScoreThenLength() {
    const [player1, player2] = this.players;

    if (player1.score !== player2.score) {
      this.winner = player1.score > player2.score ? player1.name : player2.name;
      console.log(`Game Over! Player ${this.winner} wins by higher score!`);
    } else if (player1.body.length !== player2.body.length) {
      this.winner =
        player1.body.length > player2.body.length ? player1.name : player2.name;
      console.log(`Game Over! Player ${this.winner} wins by longer length!`);
    } else {
      this.winner = -1;
      console.log(`Game Over! Draw! Equal scores and lengths`);
    }
  }

  /**
   * Processes all active items, reducing their duration and handling expiration effects
   */
  processPlayersItems() {
    this.players.forEach((player) => {
      player.activeItems.forEach((activeItem) => {
        activeItem.duration -= 1;

        activeItem.do(player, this);
      });

      // removes items with duration <= 0
      player.activeItems = player.activeItems.filter(
        (activeItem) => activeItem.duration > 0
      );
    });
  }
}

module.exports = {
  SnakeGame,
};
