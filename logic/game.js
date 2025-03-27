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
    this.apples = []; // Čuvamo sve jabuke
    this.generateMirroredApples(); // Generiraj mirrorane jabuke
  }

  // Generiraj mirrorane jabuke
  generateMirroredApples() {
    // Generiraj samo na lijevoj polovici
    let appleX, appleY;
    do {
      appleX = Math.floor(Math.random() * this.rows);
      appleY = Math.floor(Math.random() * Math.floor(this.columns / 2));
    } while (this.map[appleX][appleY] !== null);

    // Dodaj originalnu jabuku
    this.apples.push({ x: appleX, y: appleY });
    
    // Dodaj mirroranu jabuku (desna strana)
    const mirroredY = this.columns - 1 - appleY;
    this.apples.push({ x: appleX, y: mirroredY });
  }

  playMove(playerId, direction) {
    if (this.gameOver) return;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const head = { ...player.body[0] };
    switch (direction) {
      case "up": head.x -= 1; break;
      case "down": head.x += 1; break;
      case "left": head.y -= 1; break;
      case "right": head.y += 1; break;
      default: return;
    }

    this.internalMoveCounter++;

    // Provjeri je li glava na jabuci
    const appleIndex = this.apples.findIndex(
      apple => apple.x === head.x && apple.y === head.y
    );

    if (appleIndex !== -1) {
      // Povećaj zmiju (ne brišemo rep)
      player.body.unshift(head);
      player.score += 1;
      
      // Ukloni samo tu jabuku (ne brišemo mirror)
      this.apples.splice(appleIndex, 1);
    } else {
      // Normalan potez
      player.body.unshift(head);
      player.body.pop();
    }

    // Generiraj nove jabuke svakih 5 poteza
    if (this.internalMoveCounter % 5 === 0) {
      this.generateMirroredApples();
    }

    this.updateMap();
  }

  updateMap() {
    // Očisti mapu
    this.map = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.columns }, () => null)
    );

    // Postavi igrače
    this.players.forEach(player => {
      this.map[player.body[0].x][player.body[0].y] = player.id.toUpperCase();
      for (let i = 1; i < player.body.length; i++) {
        const segment = player.body[i];
        this.map[segment.x][segment.y] = player.id.toLowerCase();
      }
    });

    // Postavi jabuke
    this.apples.forEach(apple => {
      this.map[apple.x][apple.y] = "A";
    });
  }

  // Ostale metode ostaju iste...
}