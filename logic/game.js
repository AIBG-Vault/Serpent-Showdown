const config = require("./gameConfig");
const Player = require("./player");
const Spawner = require("./spawner");
const Board = require("./board");
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

    this.apples = [];
    this.modifiers = [];

    this.spawner = new Spawner(this);

    this.board.updateMap();
    this.collisionHandler = new CollisionHandler(this);
  }

  /**
   * Adds a new player to the game
   * @param {Object} playerData - Data for the new player
   * @param {string} playerData.id - Unique identifier for the player
   * @param {string} playerData.name - Display name for the player
   */
  addPlayer(playerData) {
    const isFirstPlayer = this.players.length === 0;
    const player = new Player(
      playerData,
      isFirstPlayer,
      this.numOfRows,
      this.numOfColumns
    );
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
    moves.forEach((move) => this.playMove(move.playerId, move.direction));

    // Handle map shrinking
    const currentBoardWidth = this.board.getCurrentBoardWidth();
    if (
      currentBoardWidth > config.MINIMUM_BOARD_SIZE &&
      this.moveCount >= config.START_SHRINKING_MAP_AFTER_MOVES &&
      this.moveCount % 5 === 0
    ) {
      this.board.shrinkMap();
    }

    // Check if game is over and determine winner
    if (this.checkGameOver()) {
      return;
    }

    // Spawn apples every 5 moves
    if (this.moveCount % 5 === 0) {
      this.spawner.spawnMirroredApples();
    }

    // Spawn modifiers based on a chance
    if (Math.random() < config.MODIFIER_SPAWN_CHANCE) {
      this.spawner.spawnMirroredModifiers();
    }

    this.board.updateMap();
  }

  // Modify playMove to use the new function
  /**
   * Processes a single move for a specific player
   * @param {string} playerId - ID of the player making the move
   * @param {string} direction - Direction of movement ('up', 'down', 'left', 'right')
   */
  playMove(playerId, direction) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Use player's isReverseDirection method
    if (player.isReverseDirection(direction)) {
      player.addScore(-config.REVERSE_DIRECTION_PENALTY);
      return;
    }

    // Penalize invalid moves (including timeout)
    if (!["up", "down", "left", "right"].includes(direction)) {
      player.addScore(-config.ILLEGAL_MOVE_PENALTY);
      return;
    }

    const newHeadPos = { ...player.body[0] };
    if (direction === "up") {
      newHeadPos.row -= 1;
    } else if (direction === "down") {
      newHeadPos.row += 1;
    } else if (direction === "left") {
      newHeadPos.column -= 1;
    } else if (direction === "right") {
      newHeadPos.column += 1;
    }

    // calculcate before removing tail segment in case length is 1
    const boardCenterRow = Math.floor(this.numOfRows / 2);
    const boardCenterCol = Math.floor(this.numOfColumns / 2);
    const boardCenterPos = { row: boardCenterRow, column: boardCenterCol };
    player.updateScoreByMovementDirection(newHeadPos, boardCenterPos);

    // check for collisions
    const playerAteApple = this.collisionHandler.checkForAppleCollision(
      player,
      newHeadPos
    );
    this.collisionHandler.checkForModifierCollision(player, newHeadPos);

    // add new head segment
    player.addSegment(newHeadPos);

    // remove tail segment if needed
    const keepTailSegment =
      playerAteApple ||
      player.activeModifiers.some(
        (activeModifier) =>
          activeModifier.type === "golden apple" ||
          activeModifier.type === "tron"
      );

    if (!keepTailSegment) {
      player.body.pop();
    }

    // Use player's updateModifiers method
    player.updateModifiers();
  }

  /**
   * Checks if the game is over based on player deaths or move limit
   * @returns {boolean} True if game is over, false otherwise
   */
  checkGameOver() {
    const deadPlayers = this.players
      .filter(
        (player) =>
          player.score <= 0 ||
          this.collisionHandler.checkForWallCollision(player) ||
          this.collisionHandler.checkForPlayerCollision(player)
      )
      .map((player) => player.id);

    if (deadPlayers.length > 0) {
      if (deadPlayers.length === 1) {
        this.winner = this.players.find((p) => p.id !== deadPlayers[0]).name;
        console.log(`Game Over! Player ${this.winner} wins!`);
      } else {
        this.determineWinnerByScoreThenLength();
      }
      return true;
    }

    // Check for move limit only if no players died
    if (this.moveCount >= config.GAME_MAX_MOVES) {
      console.log("Maximum number of game moves exceeded.");
      this.determineWinnerByScoreThenLength();
      return true;
    }

    return false;
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
}

module.exports = {
  SnakeGame,
};
