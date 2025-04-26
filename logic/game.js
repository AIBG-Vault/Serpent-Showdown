// Game configuration constants
// Maximum number of moves before forcing game end. Will be increased to ~300 in production.
const GAME_MAX_MOVES = 300;
// Number of rows in the game grid. Will be increased to ~25 in production.
const BOARD_NUM_OF_ROWS = 11;
// Number of columns in the game grid. Will be increased to ~60 in production.
const BOARD_NUM_OF_COLUMNS = 25;
// Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production.
const PLAYERS_STARTING_LENGTH = 9;
// Initial score for each player. Will be increased to 100 in production.
const PLAYERS_STARTING_SCORE = 100;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 5; // number of points a player receives for picking up an apple
const MOVEMENT_CENTER_REWARD = 2; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 1; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 5; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 3; // penalty for making a move that reverses the current direction
const BODY_SEGMENT_LOSS_PENALTY = 3; // penalty per segment lost to border shrinkage

// Number of moves after which the map starts shrinking.
const START_SHRINKING_MAP_AFTER_MOVES = 0;
// Number of columns left after which the map stops shrinking. Will be increased to 9 (as in AIBG 9.0) in production.
const MINIMUM_BOARD_SIZE = 5;

// Spawn a modifier approximately 1 in 10 moves
const MODIFIER_SPAWN_CHANCE = 1 / 10;

const modifiers = [
  {
    type: "golden apple",
    affect: "self",
    pickUpReward: 10,
    duration: 3,
    weight: 6,
  },
  {
    type: "tron",
    affect: "random",
    pickUpReward: 5,
    duration: 10,
    weight: 3,
  },
];

class SnakeGame {
  constructor() {
    this.numOfRows = BOARD_NUM_OF_ROWS;
    this.numOfColumns = BOARD_NUM_OF_COLUMNS;
    this.playersStartingLength = PLAYERS_STARTING_LENGTH;

    this.players = [];
    this.winner = null;

    this.internalMoveCounter = 0;

    this.apples = [];
    this.modifiers = [];

    this.shrinkStartMove = START_SHRINKING_MAP_AFTER_MOVES;
    this.minBoardSize = MINIMUM_BOARD_SIZE;
    this.shrinkLevel = -1;

    // Add borders object
    this.borders = {
      left: this.shrinkLevel,
      right: this.numOfColumns - this.shrinkLevel - 1,
      top: this.shrinkLevel,
      bottom: this.numOfRows - this.shrinkLevel - 1,
    };

    this.updateMap();
  }

  addPlayer(player) {
    const isFirstPlayer = this.players.length === 0;

    const startRowIndex = Math.floor(this.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? this.playersStartingLength
      : this.numOfColumns - (this.playersStartingLength + 1);

    const gamePlayer = {
      id: player.id,
      name: player.name,
      body: [],
      activeModifiers: [],
      score: PLAYERS_STARTING_SCORE,
      length: this.playersStartingLength,
    };

    // Add body segments
    for (let i = 0; i < this.playersStartingLength; i++) {
      gamePlayer.body.push({
        row: startRowIndex,
        column: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }

    this.players.push(gamePlayer);

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
      this.spawnMirroredApples();
    }

    // Spawn modifiers based on a chance
    if (Math.random() < MODIFIER_SPAWN_CHANCE) {
      this.spawnMirroredModifiers();
    }

    this.updateMap();
  }

  // Modify playMove to use the new function
  playMove(playerId, direction) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Prevent reversing direction and penalize the attempt
    if (this.isReverseDirection(player, direction)) {
      player.score = Math.max(0, player.score - REVERSE_DIRECTION_PENALTY); // -5 points for reversing
      return;
    }

    // Penalize invalid moves (including timeout)
    if (!["up", "down", "left", "right"].includes(direction)) {
      player.score = Math.max(0, player.score - ILLEGAL_MOVE_PENALTY); // -5 points for invalid/timeout
      return;
    }

    const oldHead = { ...player.body[0] };
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

    this.calculateMovementScore(player, oldHead, newHead);

    if (
      !this.checkForAppleCollision(player, newHead) &&
      !this.checkForModifierCollision(player, newHead)
    ) {
      player.body.unshift(newHead);

      // Check for active modifiers that prevent tail removal
      const shouldKeepTail = player.activeModifiers.some((activeModifier) => {
        return (
          activeModifier.type === "golden apple" ||
          activeModifier.type === "tron"
        );
      });

      if (!shouldKeepTail) {
        player.body.pop();
      }
    }

    // Update modifier durations and handle expiring effects
    player.activeModifiers = player.activeModifiers
      .map((activeModifier) => {
        const newDuration = activeModifier.duration - 1;

        if (activeModifier.type === "tron") {
          activeModifier.temporarySegments += 1;
        }

        // Handle Tron modifier expiration
        if (activeModifier.type === "tron" && newDuration === 0) {
          // Remove temporary segments, but not less than 0
          const segmentsToRemove = Math.max(0, activeModifier.temporarySegments);
          if (segmentsToRemove > 0) {
            player.body = player.body.slice(0, -segmentsToRemove);
            player.length -= segmentsToRemove;
          }
        }

        return { ...activeModifier, duration: newDuration };
      })
      .filter((modifier) => modifier.duration > 0);
  }

  isReverseDirection(player, incomingMoveDirection) {
    const head = player.body[0];
    const neck = player.body[1];

    if (!neck) {
      return false;
    }

    let currentDirection;

    if (head.row === neck.row) {
      currentDirection = head.column > neck.column ? "right" : "left";
    } else {
      currentDirection = head.row > neck.row ? "down" : "up";
    }

    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[currentDirection] === incomingMoveDirection;
  }

  calculateMovementScore(player, oldHead, newHead) {
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
      player.score += MOVEMENT_CENTER_REWARD;
    } else {
      player.score += MOVEMENT_AWAY_FROM_CENTER_REWARD;
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
      player.body.unshift(head);
      player.score += APPLE_PICKUP_REWARD;
      player.length += 1;
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
      const modifier = modifiers.find((m) => m.type === modifierFromMap.type);

      // Add the new head position BEFORE handling the modifier effects
      player.body.unshift(head);
      player.score += modifier.pickUpReward;
      player.length += 1;

      // Create a new modifier object
      const newModifier = {
        type: modifier.type,
        duration: modifier.duration,
      };

      if (modifier.type === "tron") {
        newModifier.temporarySegments = 0;
      }

      // Handle modifier application based on affect type
      if (
        modifierFromMap.affect === "self" ||
        modifierFromMap.affect === "both"
      ) {
        const existingModifier = player.activeModifiers.find(
          (mod) => mod.type === modifier.type
        );
        if (existingModifier) {
          existingModifier.duration = modifier.duration;
        } else {
          player.activeModifiers.push({ ...newModifier });
        }
      }

      if (
        modifierFromMap.affect === "enemy" ||
        modifierFromMap.affect === "both"
      ) {
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        const existingModifier = otherPlayer.activeModifiers.find(
          (mod) => mod.type === modifier.type
        );
        if (existingModifier) {
          existingModifier.duration = modifier.duration;
        } else {
          otherPlayer.activeModifiers.push({ ...newModifier });
        }
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
    if (this.internalMoveCounter >= GAME_MAX_MOVES) {
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
      player.score - disconnectedSegments.length * BODY_SEGMENT_LOSS_PENALTY
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

  findValidSpawningPosition() {
    let attempts = 0;
    const maxAttempts = this.numOfColumns * this.numOfRows;
    const MIN_DISTANCE = 1.5; // This ensures at least 1 cell distance diagonally

    while (attempts < maxAttempts) {
      const originalRow = Math.floor(Math.random() * this.numOfRows);
      const originalColumn = Math.floor(
        Math.random() * Math.floor(this.numOfColumns / 2)
      );

      const mirroredRow = originalRow;
      const mirroredColumn = this.numOfColumns - 1 - originalColumn;

      // Check if position is within valid borders
      if (
        originalRow <= this.borders.top ||
        originalRow >= this.borders.bottom ||
        originalColumn <= this.borders.left ||
        originalColumn >= this.borders.right ||
        mirroredRow <= this.borders.top ||
        mirroredRow >= this.borders.bottom ||
        mirroredColumn <= this.borders.left ||
        mirroredColumn >= this.borders.right
      ) {
        attempts++;
        continue;
      }

      // Check if position is too close to any player's head using Euclidean distance
      const isTooCloseToHead = this.players.some((player) => {
        if (player.body.length === 0) return false;
        const head = player.body[0];

        // Calculate distances for both original and mirrored positions
        const distanceToOriginal = Math.sqrt(
          Math.pow(head.row - originalRow, 2) +
            Math.pow(head.column - originalColumn, 2)
        );

        const distanceToMirrored = Math.sqrt(
          Math.pow(head.row - mirroredRow, 2) +
            Math.pow(head.column - mirroredColumn, 2)
        );

        return (
          distanceToOriginal <= MIN_DISTANCE ||
          distanceToMirrored <= MIN_DISTANCE
        );
      });

      if (isTooCloseToHead) {
        attempts++;
        continue;
      }

      // Check collision with snake bodies
      const collidesWithSnake = this.players.some((player) =>
        player.body.some(
          (segment) =>
            (segment.row === originalRow &&
              segment.column === originalColumn) ||
            (segment.row === mirroredRow && segment.column === mirroredColumn)
        )
      );

      if (collidesWithSnake) {
        attempts++;
        continue;
      }

      // Check collision with apples
      const collidesWithApple = this.apples.some(
        (apple) =>
          (apple.row === originalRow && apple.column === originalColumn) ||
          (apple.row === mirroredRow && apple.column === mirroredColumn)
      );

      if (collidesWithApple) {
        attempts++;
        continue;
      }

      // Check collision with modifiers
      const collidesWithModifier = this.modifiers.some(
        (modifier) =>
          (modifier.row === originalRow &&
            modifier.column === originalColumn) ||
          (modifier.row === mirroredRow && modifier.column === mirroredColumn)
      );

      if (collidesWithModifier) {
        attempts++;
        continue;
      }

      return { originalRow, originalColumn, mirroredRow, mirroredColumn };
    }

    return null;
  }

  spawnMirroredApples() {
    const position = this.findValidSpawningPosition();

    if (position) {
      const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
        position;
      this.apples.push({ row: originalRow, column: originalColumn });
      this.apples.push({ row: mirroredRow, column: mirroredColumn });
      return;
    }

    console.log("Couldn't find valid mirrored positions to spawn apples");
  }

  spawnMirroredModifiers() {
    const position = this.findValidSpawningPosition();
    if (position) {
      const { originalRow, originalColumn, mirroredRow, mirroredColumn } =
        position;

      // Calculate total weight
      const totalWeight = modifiers.reduce((sum, type) => sum + type.weight, 0);

      // Random number between 0 and total weight
      const random = Math.random() * totalWeight;

      // Select modifier type based on weight
      let currentWeight = 0;
      const selectedModifier = modifiers.find((type) => {
        currentWeight += type.weight;
        return random <= currentWeight;
      });

      // Determine affect for Tron modifier with 40/40/20 split
      let affect = selectedModifier.affect;
      if (selectedModifier.affect === "random") {
        const affectRoll = Math.random();
        if (affectRoll < 0.4) {
          affect = "self";
        } else if (affectRoll < 0.8) {
          affect = "enemy";
        } else {
          affect = "both";
        }
      }

      // Add the selected modifier to both positions with the determined affect
      this.modifiers.push({
        type: selectedModifier.type,
        affect: affect,
        row: originalRow,
        column: originalColumn,
      });

      this.modifiers.push({
        type: selectedModifier.type,
        affect: affect,
        row: mirroredRow,
        column: mirroredColumn,
      });

      return;
    }

    console.log("Couldn't find valid mirrored positions to spawn modifiers");
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

module.exports = { SnakeGame };
