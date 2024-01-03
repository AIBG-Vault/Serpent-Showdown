class GameField {
    constructor() {
        this.field = Array.from({ length: 20 }, () => Array.from({ length: 30 }, () => null));
    }

    addCreature(creature, x, y) {
        this.field[x][y] = creature;
    }
}

module.exports = { GameField };
