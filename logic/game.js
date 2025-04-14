// Game configuration constants
/** Number of rows in the game grid. Will be increased to ~25 in production. */
const GAME_ROWS = 10;
/** Number of columns in the game grid. Will be increased to ~60 in production. */
const GAME_COLUMNS = 20;
/** Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production. */
const PLAYERS_STARTING_LENGTH = 2;
/** Initial score for each player. Will be increased to 100 in production. */
const PLAYERS_STARTING_SCORE = 15;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 5; // points for picking up an apple
const MOVEMENT_CENTER_REWARD = 2; // reward for moving towards center
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 1; // reward for moving away
const ILLEGAL_MOVE_PENALTY = 5; // penalty for illegal move or timeout
const REVERSE_DIRECTION_PENALTY = 5; // penalty for reversing direction

// Power-up configuration
const POWER_UP_BASE_SPAWN_CHANCE = 0.05; // 5% base chance per turn
const POWER_UP_CHANCE_GROWTH = 0.02; // exponential growth factor
const POWER_UP_TYPES = ["UBRZANJE", "GOLDEN_APPLE", "RESET_LENGTHS"];
const UBRZANJE_DURATION = 10; // moves to stay sped up
const UBRZANJE_SPEED_FACTOR = 0.5; // halve move delay
const GOLDEN_APPLE_LENGTH = 3; // length increase
const RESET_LENGTHS_MODES = ["self", "enemy", "both"];

class SnakeGame {
  constructor() {
    this.numOfRows = GAME_ROWS;
    this.numOfColumns = GAME_COLUMNS;
    this.playersStartingLength = PLAYERS_STARTING_LENGTH;
    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, () => null)
    );
    this.players = [];
    this.winner = null;
    this.internalMoveCounter = 0;
    this.apples = [];
    this.powerUps = []; // [{ x, y, type, mode? }, ...]
    this.playerEffects = new Map(); // Map<playerId, { speed: factor, duration: moves }>
  }

  addPlayer(playerId) {
    const isFirstPlayer = this.players.length === 0;
    const startRowIndex = Math.floor(this.numOfRows / 2);
    const startColumnIndex = isFirstPlayer
      ? this.playersStartingLength
      : this.numOfColumns - (this.playersStartingLength + 1);
    const player = {
      id: playerId,
      body: [],
      score: PLAYERS_STARTING_SCORE,
      length: this.playersStartingLength,
    };
    player.body.push({ x: startRowIndex, y: startColumnIndex });
    for (let i = 1; i < this.playersStartingLength; i++) {
      player.body.push({
        x: startRowIndex,
        y: isFirstPlayer ? startColumnIndex - i : startColumnIndex + i,
      });
    }
    this.players.push(player);
    this.updateMap();
  }

  processMoves(moves) {
    moves.forEach((move) => this.playMove(move.playerId, move.direction));
    if (this.checkGameOver()) {
      return;
    }
    this.internalMoveCounter++;
    const spawnChance = Math.min(
      1,
      POWER_UP_BASE_SPAWN_CHANCE * Math.exp(POWER_UP_CHANCE_GROWTH * this.internalMoveCounter)
    );
    if (Math.random() < spawnChance) {
      this.generateMirroredPowerUps();
    }
    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }
    this.playerEffects.forEach((effect, playerId) => {
      if (effect.duration > 0) {
        effect.duration--;
        if (effect.duration === 0) {
          this.playerEffects.delete(playerId);
        }
      }
    });
    this.updateMap();
  }

  playMove(playerId, direction) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;
    const currentDirection = this.getCurrentDirection(player);
    if (
      currentDirection &&
      this.isOppositeDirection(currentDirection, direction)
    ) {
      player.score = Math.max(0, player.score - REVERSE_DIRECTION_PENALTY);
      return;
    }
    if (!["up", "down", "left", "right"].includes(direction)) {
      player.score = Math.max(0, player.score - ILLEGAL_MOVE_PENALTY);
      return;
    }
    const head = { ...player.body[0] };
    switch (direction) {
      case "up":
        head.x -= 1;
        break;
      case "down":
        head.x += 1;
        break;
      case "left":
        head.y -= 1;
        break;
      case "right":
        head.y += 1;
        break;
      default:
        return;
    }
    if (
      head.x < 0 ||
      head.x >= this.numOfRows ||
      head.y < 0 ||
      head.y >= this.numOfColumns
    ) {
      player.score = Math.max(0, player.score - ILLEGAL_MOVE_PENALTY);
      return;
    }
    if (
      !this.handleAppleCollision(player, head) &&
      !this.handlePowerUpCollision(player, head)
    ) {
      player.body.unshift(head);
      player.body.pop();
    }
  }

  getCurrentDirection(player) {
    if (player.body.length < 2) return null;
    const head = player.body[0];
    const neck = player.body[1];
    if (head.x === neck.x) {
      return head.y > neck.y ? "right" : "left";
    } else {
      return head.x > neck.x ? "down" : "up";
    }
  }

  isOppositeDirection(current, newDirection) {
    const opposites = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };
    return opposites[current] === newDirection;
  }

  handleAppleCollision(player, head) {
    const appleIndex = this.apples.findIndex(
      (apple) => apple.x === head.x && apple.y === head.y
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

  handlePowerUpCollision(player, head) {
    const powerUpIndex = this.powerUps.findIndex(
      (pu) => pu.x === head.x && pu.y === head.y
    );
    if (powerUpIndex === -1) return false;
    const powerUp = this.powerUps[powerUpIndex];
    this.powerUps.splice(powerUpIndex, 1);
    switch (powerUp.type) {
      case "UBRZANJE":
        this.playerEffects.set(player.id, {
          speed: UBRZANJE_SPEED_FACTOR,
          duration: UBRZANJE_DURATION,
        });
        player.score += APPLE_PICKUP_REWARD;
        break;
      case "GOLDEN_APPLE":
        player.body.unshift(head);
        for (let i = 0; i < GOLDEN_APPLE_LENGTH - 1; i++) {
          player.body.push({ ...player.body[player.body.length - 1] });
        }
        player.length += GOLDEN_APPLE_LENGTH;
        player.score += APPLE_PICKUP_REWARD * 2;
        break;
      case "RESET_LENGTHS":
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        if (powerUp.mode === "self" || powerUp.mode === "both") {
          this.resetPlayerLength(player);
        }
        if (powerUp.mode === "enemy" || powerUp.mode === "both") {
          this.resetPlayerLength(otherPlayer);
        }
        player.score += APPLE_PICKUP_REWARD;
        break;
    }
    return true;
  }

  resetPlayerLength(player) {
    if (!player) return;
    const head = player.body[0];
    player.body = [head];
    for (let i = 1; i < this.playersStartingLength; i++) {
      player.body.push({
        x: head.x,
        y: head.y + (player.id === this.players[0].id ? -i : i),
      });
    }
    player.length = this.playersStartingLength;
  }

  checkGameOver() {
    const zeroScorePlayers = this.players.filter((p) => p.score <= 0);
    const collidedPlayers = this.checkPlayersCollisions();
    if (!zeroScorePlayers.length && !collidedPlayers) return false;
    if (collidedPlayers?.length === 1) {
      this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).id;
      console.log(`Game Over! Player ${this.winner} wins!`);
    } else {
      this.determineWinnerByScoreThenLength();
    }
    return true;
  }

  checkPlayersCollisions() {
    let collidedPlayers = new Set();
    for (const player of this.players) {
      const head = player.body[0];
      if (head.x < 0) {
        console.log(`Player ${player.id} died by hitting the top wall`);
        collidedPlayers.add(player.id);
      } else if (head.x >= this.numOfRows) {
        console.log(`Player ${player.id} died by hitting the bottom wall`);
        collidedPlayers.add(player.id);
      } else if (head.y < 0) {
        console.log(`Player ${player.id} died by hitting the left wall`);
        collidedPlayers.add(player.id);
      } else if (head.y >= this.numOfColumns) {
        console.log(`Player ${player.id} died by hitting the right wall`);
        collidedPlayers.add(player.id);
      } else if (
        player.body
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        console.log(`Player ${player.id} died by colliding with their own body`);
        collidedPlayers.add(player.id);
      }
    }
    const [player1, player2] = this.players;
    const head1 = player1.body[0];
    const head2 = player2.body[0];
    if (head1.x === head2.x && head1.y === head2.y) {
      console.log(`Players ${player1.id} and ${player2.id} died in head-on collision`);
      collidedPlayers.add(player1.id);
      collidedPlayers.add(player2.id);
    } else {
      for (const player of this.players) {
        const otherPlayer = this.players.find((p) => p.id !== player.id);
        const head = player.body[0];
        if (
          otherPlayer.body.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          console.log(
            `Player ${player.id} died by colliding with player ${otherPlayer.id}'s body`
          );
          collidedPlayers.add(player.id);
        }
      }
    }
    return collidedPlayers.size > 0 ? Array.from(collidedPlayers) : null;
  }

  determineWinnerByScoreThenLength() {
    const [player1, player2] = this.players;
    if (player1.score !== player2.score) {
      this.winner = player1.score > player2.score ? player1.id : player2.id;
      console.log(`Game Over! Player ${this.winner} wins by higher score!`);
    } else {
      if (player1.length !== player2.length) {
        this.winner = player1.length > player2.length ? player1.id : player2.id;
        console.log(`Game Over! Player ${this.winner} wins by longer length!`);
      } else {
        this.winner = -1;
        console.log(`Game Over! Draw! Equal scores and lengths`);
      }
    }
  }

  generateMirroredApples() {
    let attempts = 0;
    const maxAttempts = this.numOfRows * this.numOfColumns;
    while (attempts < maxAttempts) {
      const appleX = Math.floor(Math.random() * this.numOfRows);
      const appleY = Math.floor(Math.random() * Math.floor(this.numOfColumns / 2));
      const mirroredX = appleX;
      const mirroredY = this.numOfColumns - 1 - appleY;
      const isPositionFree =
        this.map[appleX][appleY] === null &&
        this.map[mirroredX][mirroredY] === null &&
        !this.players.some(
          (player) =>
            player.body.some(
              (segment) =>
                (segment.x === appleX && segment.y === appleY) ||
                (segment.x === mirroredX && segment.y === mirroredY)
            )
        );
      if (isPositionFree) {
        this.apples.push({ x: appleX, y: appleY });
        this.apples.push({ x: mirroredX, y: mirroredY });
        return;
      }
      attempts++;
    }
    console.log("Couldn't find valid mirrored apple positions");
  }

  generateMirroredPowerUps() {
    let attempts = 0;
    const maxAttempts = this.numOfRows * this.numOfColumns;
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * this.numOfRows);
      const y = Math.floor(Math.random() * Math.floor(this.numOfColumns / 2));
      const mirroredX = x;
      const mirroredY = this.numOfColumns - 1 - y;
      const isPositionFree =
        this.map[x][y] === null &&
        this.map[mirroredX][mirroredY] === null &&
        !this.players.some(
          (player) =>
            player.body.some(
              (segment) =>
                (segment.x === x && segment.y === y) ||
                (segment.x === mirroredX && segment.y === mirroredY)
            )
        ) &&
        !this.apples.some(
          (apple) =>
            (apple.x === x && apple.y === y) ||
            (apple.x === mirroredX && apple.y === mirroredY)
        );
      if (isPositionFree) {
        const type =
          POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
        const mode =
          type === "RESET_LENGTHS"
            ? RESET_LENGTHS_MODES[
                Math.floor(Math.random() * RESET_LENGTHS_MODES.length)
              ]
            : undefined;
        this.powerUps.push({ x, y, type, mode });
        this.powerUps.push({ x: mirroredX, y: mirroredY, type, mode });
        return;
      }
      attempts++;
    }
    console.log("Couldn't find valid mirrored power-up positions");
  }

  updateMap() {
    this.map = Array.from({ length: this.numOfRows }, () =>
      Array.from({ length: this.numOfColumns }, () => null)
    );
    this.players.forEach((player) => {
      const head = player.body[0];
      if (
        this.map[head.x][head.y] &&
        this.map[head.x][head.y] !== player.id.toUpperCase()
      ) {
        this.map[head.x][head.y] = "X";
      } else {
        this.map[head.x][head.y] = player.id.toUpperCase();
      }
      for (let i = 1; i < player.body.length; i++) {
        const segment = player.body[i];
        this.map[segment.x][segment.y] = player.id.toLowerCase();
      }
    });
    this.apples.forEach((apple) => {
      this.map[apple.x][apple.y] = "A";
    });
    this.powerUps.forEach((pu) => {
      this.map[pu.x][pu.y] =
        pu.type === "UBRZANJE" ? "U" :
        pu.type === "GOLDEN_APPLE" ? "G" :
        `R_${pu.mode[0].toUpperCase()}`;
    });
  }

  printState() {
    console.log("\nCurrent Game State:");
    console.log("Move:", this.internalMoveCounter);
    console.log("Winner:", this.winner);
    console.log("Power-Ups:", this.powerUps);
    console.log("\nGame Map:");
    this.map.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
    console.log("\n");
  }
}

module.exports = { SnakeGame };