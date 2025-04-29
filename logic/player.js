const config = require("./gameConfig");

/**
 * Represents a player in the snake game
 */
class Player {
  /**
   * Creates a new Player instance
   * @param {Object} playerData - The player's initial data
   * @param {string} playerData.id - The player's unique identifier
   * @param {string} playerData.name - The player's name
   * @param {SnakeGame} game - The game instance
   */
  constructor(game, playerData) {
    this.game = game;

    this.id = playerData.id;
    this.name = playerData.name;

    this.score = config.PLAYERS_STARTING_SCORE;

    this.body = [];
    this.initBodySegments();

    this.activeModifiers = [];
  }

  /**
   * Initializes the player's starting position and body segments
   */
  initBodySegments() {
    const isFirstPlayer = this.game.players.length === 0;

    // Initialize player position
    const startRowIndex = Math.floor(this.game.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? config.PLAYERS_STARTING_LENGTH
      : this.game.numOfColumns - (config.PLAYERS_STARTING_LENGTH + 1);

    // Add body segments using addSegment method starting from the head
    for (let i = config.PLAYERS_STARTING_LENGTH - 1; i >= 0; i--) {
      this.addSegment({
        row: startRowIndex,
        column: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }
  }

  /**
   * Adds a new segment to the front of the snake
   * @param {Object} position - The position to add the new segment
   * @param {number} position.row - Row coordinate
   * @param {number} position.column - Column coordinate
   */
  addSegment(position) {
    this.body.unshift(position);
  }

  /**
   * Shortens the player's body length by a specified amount
   * @param {number} numOfSegments - The number of segments to remove from the end of the body up to body.length = 1
   */
  removeSegments(numOfSegments) {
    // final length must be a minimum of 1
    const finalLength = Math.max(1, this.body.length - numOfSegments);
    this.body = this.body.slice(0, finalLength);
  }

  /**
   * Adds points to the player's score, ensuring it doesn't go below 0
   * @param {number} points - The points to add (can be negative)
   */
  addScore(points) {
    this.score = Math.max(0, this.score + points);
  }

  // Modify playMove to use the new function
  /**
   * Processes a single move for a specific player
   * @param {string} direction - Direction of movement ('up', 'down', 'left', 'right')
   */
  playMove(direction) {
    // Use player's isReverseDirection method
    if (this.isReverseDirection(direction)) {
      this.addScore(-config.REVERSE_DIRECTION_PENALTY);
      return;
    }

    // Penalize invalid moves (including timeout)
    if (!["up", "down", "left", "right"].includes(direction)) {
      this.addScore(-config.ILLEGAL_MOVE_PENALTY);
      return;
    }

    const newHeadPos = { ...this.body[0] };
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
    this.updateScoreByMovementDirection(newHeadPos);

    // check for collisions
    const playerAteApple = this.game.collisionHandler.checkForAppleCollision(
      this,
      newHeadPos
    );
    this.game.collisionHandler.checkForItemCollision(this, newHeadPos);

    // add new head segment
    this.addSegment(newHeadPos);

    // remove tail segment if needed
    const keepTailSegment =
      playerAteApple ||
      this.activeModifiers.some(
        (activeModifier) =>
          activeModifier.type === "golden apple" ||
          activeModifier.type === "tron"
      );

    if (!keepTailSegment) {
      this.body.pop();
    }

    // Use player's updateModifiers method
    this.processModifiers();
  }

  /**
   * Updates player score based on movement relative to board center
   * @param {Object} newHeadPos - The new head position
   */
  updateScoreByMovementDirection(newHeadPos) {
    const boardCenterRow = Math.floor(this.game.numOfRows / 2);
    const boardCenterCol = Math.floor(this.game.numOfColumns / 2);

    const oldHeadPos = { ...this.body[0] }; // new neck position

    const oldDistanceToCenter =
      Math.abs(oldHeadPos.row - boardCenterRow) +
      Math.abs(oldHeadPos.column - boardCenterCol);
    const newDistanceToCenter =
      Math.abs(newHeadPos.row - boardCenterRow) +
      Math.abs(newHeadPos.column - boardCenterCol);

    // Store initial score for debugging
    const initialScore = this.score;

    // Award points based on movement relative to center
    if (newDistanceToCenter < oldDistanceToCenter) {
      this.addScore(config.MOVEMENT_TOWARDS_CENTER_REWARD);
    } else {
      this.addScore(config.MOVEMENT_AWAY_FROM_CENTER_REWARD);
    }

    // console.log(`Player ${this.name} movement:
    //   - Old distance to center: ${oldDistanceToCenter}
    //   - New distance to center: ${newDistanceToCenter}
    //   - Score: ${initialScore} -> ${this.score}`);
  }

  /**
   * Checks if the given move direction would result in a reverse movement
   * @param {string} incomingMoveDirection - The proposed movement direction ('up', 'down', 'left', 'right')
   * @returns {boolean} True if the move would reverse the snake's direction
   */
  isReverseDirection(incomingMoveDirection) {
    const head = this.body[0];
    const neck = this.body[1];

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

  /**
   * Adds or updates a modifier effect on the player
   * @param {Object} modifier - The modifier to add
   * @param {string} modifier.type - The type of modifier ('golden apple' or 'tron')
   * @param {number} modifier.duration - How long the modifier should last
   * @param {number} [modifier.temporarySegments] - For tron modifier, tracks temporary segments
   */
  addOrExtendModifier(modifier) {
    const existingModifier = this.activeModifiers.find(
      (mod) => mod.type === modifier.type
    );

    if (existingModifier) {
      existingModifier.duration = modifier.duration;
    } else {
      this.activeModifiers.push(modifier);
    }
  }

  /**
   * Updates all active modifiers, reducing their duration and handling expiration effects
   */
  processModifiers() {
    this.activeModifiers = this.activeModifiers
      .map((activeModifier) => {
        // console.log("Active: " + activeModifier);
        // const newDuration = activeModifier.duration - 1;

        activeModifier.duration -= 1;

        activeModifier.do(this);

        // Handle reset map modifier
        // if (activeModifier.type === "reset borders") {
        //   this.game.board.resetShrinkage();
        // } else if (activeModifier.type.slice(0, 7) === "shorten") {
        //   const segmentsToRemove = parseInt(activeModifier.type.slice(7));
        //   this.removeSegments(segmentsToRemove);
        // } else if (activeModifier.type === "tron") {
        //   activeModifier.temporarySegments += 1;

        //   // handle modifier interactions
        //   const activeGoldenAppleModifier = this.activeModifiers.find(
        //     (mod) => mod.type === "golden apple"
        //   );
        //   const activeShortenModifier = this.activeModifiers.find(
        //     (mod) => mod.type.slice(0, 7) === "shorten"
        //   );
        //   if (activeGoldenAppleModifier) {
        //     activeModifier.temporarySegments -= 1;
        //   } else if (activeShortenModifier) {
        //     const segmentsToRemove = parseInt(activeModifier.type.slice(7));
        //     activeModifier.temporarySegments -= segmentsToRemove;
        //   }

        //   console.log(activeModifier);

        //   if (newDuration === 0) {
        //     const segmentsToRemove = Math.max(
        //       0,
        //       activeModifier.temporarySegments
        //     );
        //     if (segmentsToRemove > 0) {
        //       this.body = this.body.slice(0, -segmentsToRemove);
        //     }
        //   }
        // }

        return activeModifier;
      })
      .filter((activeModifier) => {
        // Remove modifiers with duration <= 0
        return activeModifier.duration > 0;
      });
  }
}

module.exports = Player;
