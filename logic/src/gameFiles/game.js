class SnakeGame {
  constructor() {
    const fieldSize = {
      rows: 5, // 25
      columns: 9, // 35
    };
    this.field = Array.from({ length: fieldSize.rows }, () =>
      Array.from({ length: fieldSize.columns }, () => null)
    );
    this.players = [];
    this.maxMoves = 100; // Maximum moves before game ends
    this.spawnInterval = 5; // Interval to spawn mice
    this.micePoints = 500; // Points for eating mice
    this.playerStartLength = 2; // Starting length of players
    this.playerPositions = [
      { x: 0, y: Math.floor(this.field[0].length / 2) },
      { x: this.field.length - 1, y: Math.floor(this.field[0].length / 2) },
    ];
    this.moveCount = 0;
    this.mice = [];
    this.gameOver = false;
  }

  addPlayer(playerId) {
    const player = {
      id: playerId,
      length: this.playerStartLength,
      points: 0,
      body: this.initializePlayerBody(playerId), // Initialize body as an array of objects
    };
    this.players.push(player);
    this.updateField();
  }

  initializePlayerBody(playerId) {
    const body = [];
    const startY = Math.floor(this.field[0].length / 2);
    if (playerId === "player1") {
      for (let i = 0; i < this.playerStartLength; i++) {
        body.push({ x: 0, y: startY + i }); // Player 1 starts from the left
      }
    } else {
      for (let i = 0; i < this.playerStartLength; i++) {
        body.push({ x: this.field.length - 1, y: startY - i }); // Player 2 starts from the right
      }
    }
    return body;
  }

  updateField() {
    this.field.forEach((row) => row.fill(null));
    this.players.forEach((player) => {
      player.body.forEach((segment) => {
        this.field[segment.x][segment.y] = player.id; // Place each segment of the player on the field
      });
    });
    this.mice.forEach((mouse) => {
      const { x, y } = mouse;
      this.field[x][y] = "m"; // Place mice on the field
    });

    // console.log(this.field);
  }

  movePlayer(playerId, direction) {
    if (this.gameOver) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const head = { ...player.body[0] }; // Get the current head position
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
    }

    // Check for collisions
    const collision = this.checkCollision(head, playerId);
    if (collision) {
      if (this.field[head.x][head.y] !== playerId) {
        this.endGame(playerId === this.players[0].id ? 1 : 0); // End game for wall or other player collision
        return;
      } else {
        // Deduct points for self-collision
        player.points -= 100;
        console.log(`Player ${playerId} lost 100 points for self-collision!`);
      }
    }

    // Move player: add new head and remove tail
    player.body.unshift(head); // Add new head
    player.points += 100; // Gain points for moving

    // Check for mice
    this.checkMiceCollision(player);

    // If the player hasn't eaten a mouse, remove the tail
    if (player.body.length > player.length) {
      player.body.pop(); // Remove the tail segment
    }

    this.moveCount++;

    // Spawn mice every 5 moves
    if (this.moveCount % this.spawnInterval === 0) {
      this.spawnMice();
    }

    this.updateField();

    // Check for game over conditions
    if (this.moveCount >= this.maxMoves) {
      this.endGame();
    }
  }

  checkCollision(head, playerId) {
    // Check for wall collision
    if (
      head.x < 0 ||
      head.x >= this.field.length ||
      head.y < 0 ||
      head.y >= this.field[0].length
    ) {
      console.log(`Player ${playerId} hit the wall!`);
      return true; // Wall collision
    }

    // Check for body collision with the other player
    const otherPlayer = this.players.find((p) => p.id !== playerId);
    if (this.field[head.x][head.y] === otherPlayer.id) {
      console.log(`Player ${playerId} collided with ${otherPlayer.id}!`);
      return true; // Collision with the other player
    }

    // Check for self-collision
    if (
      this.players
        .find((p) => p.id === playerId)
        .body.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      console.log(`Player ${playerId} collided with itself!`);
      return false; // Self-collision, do not end the game
    }

    return false; // No collision
  }

  checkMiceCollision(player) {
    const head = player.body[0];
    const mouseIndex = this.mice.findIndex(
      (mouse) => mouse.x === head.x && mouse.y === head.y
    );
    if (mouseIndex !== -1) {
      player.points += this.micePoints; // Gain points for eating mice
      player.length += 1; // Increase length
      this.mice.splice(mouseIndex, 1); // Remove eaten mouse
    }
  }

  spawnMice() {
    const miceToSpawn = 2; // Number of mice to spawn
    const validPositions = [];

    // Collect all valid empty positions on the field
    for (let x = 0; x < this.field.length; x++) {
      for (let y = 0; y < this.field[0].length; y++) {
        if (this.field[x][y] === null) {
          validPositions.push({ x, y });
        }
      }
    }

    // Randomly select positions for the mice
    for (let i = 0; i < miceToSpawn; i++) {
      if (validPositions.length === 0) break; // No valid positions left

      const randomIndex = Math.floor(Math.random() * validPositions.length);
      const { x, y } = validPositions[randomIndex];

      // Place the mouse on the field
      this.mice.push({ x, y });
      this.field[x][y] = "m"; // Mark the position as occupied by a mouse

      // Remove the position from validPositions to avoid duplicates
      validPositions.splice(randomIndex, 1);
    }
  }

  endGame(winnerIndex = null) {
    this.gameOver = true;
    if (winnerIndex !== null) {
      console.log(`Player ${this.players[winnerIndex].id} wins!`);
    } else {
      const scores = this.players.map((p) => p.points);
      const winner = scores[0] > scores[1] ? 0 : 1;
      console.log(`Game over! Player ${this.players[winner].id} wins!`);
    }
  }

  printGameState() {
    console.log("\n\nCurrent Game State:");
    console.log(`Move Number: ${this.moveCount}`);
    console.log(`Game Over: ${this.gameOver}`);

    // Print the field
    console.log("Game Field:");
    this.field.forEach((row) => {
      console.log(row.map((cell) => (cell === null ? "." : cell)).join(" "));
    });

    // Print player stats
    this.players.forEach((player) => {
      console.log(`Player ID: ${player.id}`);
      console.log(`  Length: ${player.length}`);
      console.log(`  Points: ${player.points}`);
      console.log(`  Body: ${JSON.stringify(player.body)}`);
    });
  }
}

// Example usage
const game = new SnakeGame();
game.addPlayer("W");
game.addPlayer("B");

function randomMove(game) {
  const directions = ["up", "down", "left", "right"];
  game.players.forEach((player) => {
    const randomDirection =
      directions[Math.floor(Math.random() * directions.length)];
    game.movePlayer(player.id, randomDirection);
  });
}

function playMove(game, playerId) {
  if (playerId === "W") {
    game.movePlayer(playerId, "right");
  } else {
    game.movePlayer(playerId, "left");
  }
}

function playGame(game) {
  while (!game.gameOver) {
    randomMove(game);

    // playMove(game, "W");
    // playMove(game, "B");

    game.printGameState(); // Print the game state after each move
  }
}

// Start the game
playGame(game);
