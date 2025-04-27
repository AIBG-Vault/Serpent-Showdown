const config = require("./gameConfig");
const Player = require("./player");
const Spawner = require("./spawner");
const modifiersList = require("./modifiers");

class SnakeGame {
  constructor() {
    this.numOfRows = config.BOARD_NUM_OF_ROWS;
    this.numOfColumns = config.BOARD_NUM_OF_COLUMNS;
    this.playersStartingLength = config.PLAYERS_STARTING_LENGTH;

    this.players = [];
    this.winner = null;

    this.internalMoveCounter = 0;

    this.apples = [];
    this.modifiers = [];

    this.shrinkStartMove = config.START_SHRINKING_MAP_AFTER_MOVES;
    this.minBoardSize = config.MINIMUM_BOARD_SIZE;
    this.shrinkLevel = -1;

    // Add borders object
    this.borders = {
      left: this.shrinkLevel,
      right: this.numOfColumns - this.shrinkLevel - 1,
      top: this.shrinkLevel,
      bottom: this.numOfRows - this.shrinkLevel - 1,
    };

    this.updateMap();
    this.spawner = new Spawner(this);
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
    this.updateMap();
  }

  processMoves(moves) {
    this.internalMoveCounter++;

    // Process all moves
    moves.forEach((move) => this.playMove(move.playerId, move.direction));

    // Handle map shrinking
    const currentBoardWidth = this.borders.right - this.borders.left - 1;
    if (
      currentBoardWidth > this.minBoardSize &&
      this.internalMoveCounter >= this.shrinkStartMove &&
      this.internalMoveCounter % 5 === 0
    ) {
      this.shrinkMap();
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

    this.updateMap();
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
          this.checkWallCollision(player) ||
          this.checkPlayerCollision(player)
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

  checkWallCollision(player) {
    // First check if player has a head
    if (!player.body.length || !player.body[0]) {
      return true; // Consider it a collision if there's no head
    }

    const head = player.body[0];

    // Check head collision with walls
    if (
      head.row <= this.borders.top ||
      head.row >= this.borders.bottom ||
      head.column <= this.borders.left ||
      head.column >= this.borders.right
    ) {
      console.log(`Player ${player.name} died by hitting a wall`);
      return true;
    }

    // Find the first wall segment index
    const firstWallIndex = player.body.findIndex(
      (segment) =>
        segment.column <= this.borders.left ||
        segment.column >= this.borders.right ||
        segment.row <= this.borders.top ||
        segment.row >= this.borders.bottom
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
        .filter(
          (segment) =>
            segment.column > this.borders.left &&
            segment.column < this.borders.right &&
            segment.row > this.borders.top &&
            segment.row < this.borders.bottom
        )
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

  checkPlayerCollision(player) {
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

  shrinkMap() {
    this.shrinkLevel++;

    this.borders.left = this.shrinkLevel;
    this.borders.right = this.numOfColumns - 1 - this.shrinkLevel;

    // Calculate how much extra shrinking is needed after 1:1 ratio is reached
    const extraShrink = Math.max(
      this.shrinkLevel - Math.floor((this.numOfColumns - this.numOfRows) / 2),
      -1
    );
    this.borders.top = extraShrink;
    this.borders.bottom = this.numOfRows - 1 - extraShrink;

    // Remove existing apples in wall positions
    this.apples = this.apples.filter(
      (apple) =>
        apple.column > this.borders.left &&
        apple.column < this.borders.right &&
        apple.row > this.borders.top &&
        apple.row < this.borders.bottom
    );

    // Remove modifier in wall positions
    this.modifiers = this.modifiers.filter(
      (modifier) =>
        modifier.column > this.borders.left &&
        modifier.column < this.borders.right &&
        modifier.row > this.borders.top &&
        modifier.row < this.borders.bottom
    );
  }

  updateMap() {
    this.map = Array.from({ length: this.numOfRows }, (_, rowIndex) =>
      Array.from({ length: this.numOfColumns }, (_, colIndex) =>
        colIndex <= this.borders.left ||
        colIndex >= this.borders.right ||
        rowIndex <= this.borders.top ||
        rowIndex >= this.borders.bottom
          ? "#"
          : null
      )
    );

    this.players.forEach((player) => {
      if (player.body.length > 0) {
        const head = player.body[0];
        if (
          head &&
          head.row >= 0 &&
          head.row < this.numOfRows &&
          head.column >= 0 &&
          head.column < this.numOfColumns
        ) {
          this.map[head.row][head.column] = {
            type: "snake-head",
            player: player.id[0].toLowerCase(),
          };

          for (let i = 1; i < player.body.length; i++) {
            const segment = player.body[i];
            this.map[segment.row][segment.column] = {
              type: "snake-body",
              player: player.id[0].toLowerCase(),
            };
          }
        }
      }
    });

    this.apples.forEach((apple) => {
      this.map[apple.row][apple.column] = {
        type: "apple",
      };
    });

    this.modifiers.forEach((modifier) => {
      switch (modifier.type) {
        case "golden apple":
          this.map[modifier.row][modifier.column] = {
            type: "golden-apple",
            affect: modifier.affect,
          };
          break;
        case "tron":
          this.map[modifier.row][modifier.column] = {
            type: "tron",
            affect: modifier.affect,
          };
          break;
        default:
          break;
      }
    });
  }
}

module.exports = {
  SnakeGame,
};
