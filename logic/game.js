const config = require("./gameConfig");
const Player = require("./player");
const Spawner = require("./spawner");
const modifiersList = require("./modifiers");
const Board = require("./board");

class SnakeGame {
  constructor() {
    this.numOfRows = config.BOARD_NUM_OF_ROWS;
    this.numOfColumns = config.BOARD_NUM_OF_COLUMNS;

    this.board = new Board(this);

    this.internalMoveCounter = 0;

    this.players = [];
    this.winner = null;

    this.apples = [];
    this.modifiers = [];

    this.spawner = new Spawner(this);

    this.board.updateMap();
  }

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

  processMoves(moves) {
    this.internalMoveCounter++;

    // Process all moves
    moves.forEach((move) => this.playMove(move.playerId, move.direction));

    // Handle map shrinking
    const currentBoardWidth = this.board.getCurrentBoardWidth();
    if (
      currentBoardWidth > config.MINIMUM_BOARD_SIZE &&
      this.internalMoveCounter >= config.START_SHRINKING_MAP_AFTER_MOVES &&
      this.internalMoveCounter % 5 === 0
    ) {
      this.board.shrinkMap();
    }

    // Check if game is over and determine winner
    if (this.checkGameOver()) {
      return;
    }

    // Spawn apples every 5 moves
    if (this.internalMoveCounter % 5 === 0) {
      this.spawner.spawnMirroredApples();
    }

    // Spawn modifiers based on a chance
    if (Math.random() < config.MODIFIER_SPAWN_CHANCE) {
      this.spawner.spawnMirroredModifiers();
    }

    this.board.updateMap();
  }

  // Modify playMove to use the new function
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

    const oldHead = { ...player.getHead() };
    const newHead = { ...oldHead };

    switch (direction) {
      case "up":
        newHead.row -= 1;
        break;
      case "down":
        newHead.row += 1;
        break;
      case "left":
        newHead.column -= 1;
        break;
      case "right":
        newHead.column += 1;
        break;
      default:
        return;
    }

    this.updateScoreByMovementDirection(player, oldHead, newHead);

    if (
      !this.checkForAppleCollision(player, newHead) &&
      !this.checkForModifierCollision(player, newHead)
    ) {
      player.addSegment(newHead);
      player.removeTail();
    }

    // Use player's updateModifiers method
    player.updateModifiers();
  }

  updateScoreByMovementDirection(player, oldHead, newHead) {
    const centerRow = Math.floor(this.numOfRows / 2);
    const centerCol = Math.floor(this.numOfColumns / 2);

    const oldDistanceToCenter =
      Math.abs(oldHead.row - centerRow) + Math.abs(oldHead.column - centerCol);
    const newDistanceToCenter =
      Math.abs(newHead.row - centerRow) + Math.abs(newHead.column - centerCol);

    // Store initial score for debugging
    const initialScore = player.score;

    // Award points based on movement relative to center
    if (newDistanceToCenter < oldDistanceToCenter) {
      player.addScore(config.MOVEMENT_TOWARDS_CENTER_REWARD);
    } else {
      player.addScore(config.MOVEMENT_AWAY_FROM_CENTER_REWARD);
    }

    // console.log(`Player ${player.name} movement:
    //   - Old distance to center: ${oldDistanceToCenter}
    //   - New distance to center: ${newDistanceToCenter}
    //   - Score: ${initialScore} -> ${player.score}`);
  }

  checkForAppleCollision(player, head) {
    const appleIndex = this.apples.findIndex(
      (apple) => apple.row === head.row && apple.column === head.column
    );

    if (appleIndex !== -1) {
      player.addSegment(head);
      player.addScore(config.APPLE_PICKUP_REWARD);
      this.apples.splice(appleIndex, 1);
      return true;
    }

    return false;
  }

  checkForModifierCollision(player, head) {
    const modifierIndex = this.modifiers.findIndex(
      (modifier) => modifier.row === head.row && modifier.column === head.column
    );

    if (modifierIndex !== -1) {
      const modifierFromMap = this.modifiers[modifierIndex];
      const modifierData = modifiersList.find(
        (m) => m.type === modifierFromMap.type
      );

      player.addSegment(head);
      player.addScore(modifierData.pickUpReward);

      // Create a new modifier object
      const newModifier = {
        type: modifierFromMap.type,
        duration: modifierData.duration,
      };

      if (modifierFromMap.type === "tron") {
        newModifier.temporarySegments = 0;
      }

      // Handle modifier application based on affect type
      if (
        modifierFromMap.affect === "self" ||
        modifierFromMap.affect === "both"
      ) {
        player.addModifier(newModifier);
      }

      if (
        modifierFromMap.affect === "enemy" ||
        modifierFromMap.affect === "both"
      ) {
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        otherPlayer.addModifier(newModifier);
      }

      this.modifiers.splice(modifierIndex, 1);
      return true;
    }

    return false;
  }

  checkGameOver() {
    const deadPlayers = this.players
      .filter(
        (player) =>
          player.score <= 0 ||
          this.checkForWallCollision(player) ||
          this.checkForPlayerCollision(player)
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
    if (this.internalMoveCounter >= config.GAME_MAX_MOVES) {
      console.log("Maximum number of game moves exceeded.");
      this.determineWinnerByScoreThenLength();
      return true;
    }

    return false;
  }

  checkForWallCollision(player) {
    // First check if player has a head
    if (!player.body.length || !player.body[0]) {
      return true; // Consider it a collision if there's no head
    }

    const head = player.body[0];

    // Check head collision with walls using board methods
    if (!this.board.isWithinBorders(head)) {
      console.log(`Player ${player.name} died by hitting a wall`);
      return true;
    }

    // Find the first wall segment index
    const firstWallIndex = player.body.findIndex(
      (segment) => !this.board.isWithinBorders(segment)
    );

    // If no wall segments, return false
    if (firstWallIndex === -1) return false;

    // Get disconnected segments and update body
    const disconnectedSegments = player.body.slice(firstWallIndex);
    player.body = player.body.slice(0, firstWallIndex);

    // Update tron modifier temporary segments if active
    const activeTronModifier = player.activeModifiers.find(
      (activeModifier) => activeModifier.type === "tron"
    );
    if (activeTronModifier) {
      activeTronModifier.temporarySegments -= disconnectedSegments.length;
    }

    // Convert valid segments to apples
    this.apples.push(
      ...disconnectedSegments
        .filter((segment) => this.board.isWithinBorders(segment))
        .map((segment) => ({
          row: segment.row,
          column: segment.column,
        }))
    );

    // Apply penalties
    player.score = Math.max(
      0,
      player.score -
        disconnectedSegments.length * config.BODY_SEGMENT_LOSS_PENALTY
    );
    player.length -= disconnectedSegments.length;

    // Check if player died from score loss
    if (player.score <= 0) {
      console.log(
        `Player ${player.name} died from score reaching zero due to wall penalties`
      );
      return true;
    }

    return false;
  }

  checkForPlayerCollision(player) {
    const head = player.body[0];
    if (!head) return false; // Return false if player has no body

    // Self collision
    const playerCollidedWithSelf = player.body
      .slice(1)
      .some(
        (bodySegment) =>
          bodySegment.row === head.row && bodySegment.column === head.column
      );
    if (playerCollidedWithSelf) {
      console.log(`Player ${player.name} died by colliding with self`);
      return true;
    }

    // Other player collision (both head and body)
    const otherPlayer = this.players.find((p) => p.id !== player.id);
    if (!otherPlayer.body.length) return false; // Return false if other player has no body

    const playerCollidedWithOtherPlayer = otherPlayer.body.some(
      (segment) => segment.row === head.row && segment.column === head.column
    );
    if (playerCollidedWithOtherPlayer) {
      console.log(`Player ${player.name} died by colliding with other player`);
      return true;
    }
  }

  determineWinnerByScoreThenLength() {
    const [player1, player2] = this.players;

    if (player1.score !== player2.score) {
      this.winner = player1.score > player2.score ? player1.name : player2.name;
      console.log(`Game Over! Player ${this.winner} wins by higher score!`);
    } else if (player1.length !== player2.length) {
      this.winner =
        player1.length > player2.length ? player1.name : player2.name;
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
