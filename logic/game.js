class SnakeGame {
  constructor() {
    // Configurable map size
    this.rows = 5; // 25
    this.columns = 15; // 35

    // Initialize empty map
    this.map = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null)
    );

    this.players = [];
    this.gameOver = false;
    this.winner = null;
    this.internalMoveCounter = 0; // Add move counter
  }

  addPlayer(playerId) {
    const startLength = 2;
    const isFirstPlayer = this.players.length === 0;

    // Calculate starting position
    const startX = Math.floor(this.rows / 2);
    const startY = isFirstPlayer ? 2 : this.columns - 3;

    // Create player with initial snake body
    const player = {
      id: playerId,
      body: [
        { x: startX, y: startY }, // Head
        { x: startX, y: isFirstPlayer ? startY - 1 : startY + 1 }, // Tail
      ],
    };

    this.players.push(player);
    this.updateMap();
  }

  playMove(playerId, direction) {
    if (this.gameOver) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    // Calculate new head position
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

    // Increment move counter
    this.internalMoveCounter++;

    // Move snake: add new head and remove tail
    player.body.unshift(head);
    player.body.pop();
  }

  processMoves(moves) {
    // Execute all moves first
    for (const move of moves) {
      this.playMove(move.playerId, move.direction);
    }

    // Check collisions
    const collidedPlayers = this.checkCollisionsForBothPlayers();
    if (collidedPlayers) {
      // Determine the winner
      if (collidedPlayers.length === 1) {
        this.winner = this.players.find((p) => p.id !== collidedPlayers[0]).id;

        console.log(`Game Over! Player ${this.winner} wins!`);
      } else {
        // Both players collided, no winner
        this.winner = null;
        console.log(`Game Over! Draw!`);
      }
      this.gameOver = true;

      return;
    }

    // Update the map
    this.updateMap();
  }

  checkCollisionsForBothPlayers() {
    let collidedPlayers = new Set();

    // Check wall and self collisions for each player
    for (const player of this.players) {
      const head = player.body[0];

      // Wall collision
      if (
        head.x < 0 ||
        head.x >= this.rows ||
        head.y < 0 ||
        head.y >= this.columns
      ) {
        collidedPlayers.add(player.id);
        continue;
      }

      // Self collision
      if (
        player.body
          .slice(1)
          .some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        collidedPlayers.add(player.id);
      }
    }

    // Check head-to-head collision
    const [player1, player2] = this.players;
    const head1 = player1.body[0];
    const head2 = player2.body[0];

    if (head1.x === head2.x && head1.y === head2.y) {
      collidedPlayers.add(player1.id);
      collidedPlayers.add(player2.id);
    }

    // Check if either player's head hits the other player's body
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
    // Clear map
    this.map = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null)
    );

    // Place players on map
    this.players.forEach((player) => {
      // Place head (capital letter)
      const head = player.body[0];
      this.map[head.x][head.y] = player.id.toUpperCase();

      // Place body segments (lowercase letters)
      for (let i = 1; i < player.body.length; i++) {
        const segment = player.body[i];
        this.map[segment.x][segment.y] = player.id.toLowerCase();
      }
    });
  }

  printState() {
    console.log("\nCurrent Game State:");
    console.log("Move:", this.internalMoveCounter); // Add move counter to output
    console.log("Game Over:", this.gameOver);
    if (this.winner) console.log("Winner:", this.winner);

    console.log("\nGame Map:");
    this.map.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });
    console.log("\n");
  }
}

// Remove all test code and add this export
module.exports = { SnakeGame };
