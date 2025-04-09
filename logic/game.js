class SnakeGame {
  constructor() {
    this.rows = 5;
    this.columns = 15;
    this.map = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null)
    );

    this.players = [];
    this.gameOver = false;
    this.winner = null;
    this.internalMoveCounter = 0;
    this.apples = [];
    this.generateMirroredApples();
  }

  addPlayer(playerId) {
    const startLength = 2;
    const isFirstPlayer = this.players.length === 0;
    const startX = Math.floor(this.rows / 2);
    const startY = isFirstPlayer ? 2 : this.columns - 3;

    const player = {
      id: playerId,
      body: [
        { x: startX, y: startY },
        { x: startX, y: isFirstPlayer ? startY - 1 : startY + 1 },
      ],
      score: 0,
    };

    this.players.push(player);
    this.updateMap();
  }

  generateMirroredApples() {
    let appleX, appleY, mirroredY;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      appleX = Math.floor(Math.random() * this.rows);
      appleY = Math.floor(Math.random() * Math.floor(this.columns / 2));
      mirroredY = this.columns - 1 - appleY;

      // Check if both positions are free in the current map
      const isPositionFree =
        this.map[appleX][appleY] === null &&
        this.map[appleX][mirroredY] === null;

      if (isPositionFree) {
        this.apples.push({ x: appleX, y: appleY });
        this.apples.push({ x: appleX, y: mirroredY });
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        console.log("Couldn't find valid mirrored apple positions");
        return;
      }
    } while (true);
  }

  getCurrentDirection(player) {
    const head = player.body[0];
    const neck = player.body[1];

    if (!neck) return null;

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

  playMove(playerId, direction) {
    if (this.gameOver) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Prevent reversing direction
    const currentDirection = this.getCurrentDirection(player);
    if (
      currentDirection &&
      this.isOppositeDirection(currentDirection, direction)
    ) {
      direction = currentDirection;
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

    this.internalMoveCounter++;

    const appleIndex = this.apples.findIndex(
      (apple) => apple.x === head.x && apple.y === head.y
    );

    if (appleIndex !== -1) {
      player.body.unshift(head);
      player.score += 1;
      this.apples.splice(appleIndex, 1);
    } else {
      player.body.unshift(head);
      player.body.pop();
    }

    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }
  }

  processMoves(moves) {
    for (const move of moves) {
      this.playMove(move.playerId, move.direction);
    }

    const collidedPlayers = this.checkCollisionsForBothPlayers();
    if (collidedPlayers) {
      if (collidedPlayers.length === 1) {
        this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).id;
        console.log(`Game Over! Player ${this.winner} wins!`);
      } else {
        this.winner = null;
        console.log(`Game Over! Draw!`);
      }
      this.gameOver = true;
      return;
    }

    this.updateMap();
  }

  checkCollisionsForBothPlayers() {
    let collidedPlayers = new Set();

    for (const player of this.players) {
      const head = player.body[0];

      if (
        head.x < 0 ||
        head.x >= this.rows ||
        head.y < 0 ||
        head.y >= this.columns
      ) {
        collidedPlayers.add(player.id);
        continue;
      }

      if (
        player.body
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        collidedPlayers.add(player.id);
      }
    }

    const [player1, player2] = this.players;
    const head1 = player1.body[0];
    const head2 = player2.body[0];

    if (head1.x === head2.x && head1.y === head2.y) {
      collidedPlayers.add(player1.id);
      collidedPlayers.add(player2.id);
    }

    for (const player of this.players) {
      const otherPlayer = this.players.find((p) => p.id !== player.id);
      const head = player.body[0];

      if (
        otherPlayer.body.some(
          (segment) => segment.x === head.x && segment.y === head.y
        )
      ) {
        collidedPlayers.add(player.id);
      }
    }

    return collidedPlayers.size > 0 ? Array.from(collidedPlayers) : null;
  }

  updateMap() {
    this.map = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null)
    );

    this.players.forEach((player) => {
      this.map[player.body[0].x][player.body[0].y] = player.id.toUpperCase();
      for (let i = 1; i < player.body.length; i++) {
        const segment = player.body[i];
        this.map[segment.x][segment.y] = player.id.toLowerCase();
      }
    });

    this.apples.forEach((apple) => {
      this.map[apple.x][apple.y] = "A";
    });
  }

  printState() {
    console.log("\nCurrent Game State:");
    console.log("Move:", this.internalMoveCounter);
    console.log("Game Over:", this.gameOver);
    if (this.winner) console.log("Winner:", this.winner);

    console.log("\nGame Map:");
    this.map.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
    console.log("\n");
  }
}

module.exports = { SnakeGame };
