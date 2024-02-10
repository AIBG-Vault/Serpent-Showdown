const { IllegalMoveException} = require('./util/illegalMoveException');
class GameField {
    constructor() {
        this.field = Array.from({ length: 13 }, () => Array.from({ length: 18 }, () => null));
        this.creatureNumber = [7, 7];
        this.winner = null;
        this.turn = 0;
    }

    getGameField() {
        return {
            field: this.field,
            creatureNumber: this.creatureNumber,
            winner: this.winner
        };
    }

    addCreature(creature, x, y) {
        this.field[y][x] = creature;
    }

    playMove(moveObject) {
        console.log('playMove', moveObject);
        if (this.startSquareEmpty(moveObject.startSquare)) {
            throw new IllegalMoveException('Start square empty', moveObject);
        } else if (this.squareOccupiedByEnemyCreature(moveObject.startSquare)) {
            throw new IllegalMoveException('Start square occupied by enemy creature', moveObject);
        }

        const creature = this.field[moveObject.startSquare.y][moveObject.startSquare.x];
        const type = creature.type;

        switch (type) {
            case 'MELEE':
                this.playMeleeMove(moveObject, creature);
                break;
            case 'RANGED':
                this.playRangedMove(moveObject, creature);
                break;
            case 'MELEE/RANGED':
                this.playMeleeRangedMove(moveObject, creature);
                break;
        }

        this.turn = (this.turn + 1) % 2;
    }

    playMeleeMove(moveObject, creature) {
        // console.log('playMeleeMove', moveObject);
        let { startSquare, targetSquare, attackSquare } = moveObject;

        if (targetSquare === null || targetSquare === undefined || this.equalSquare(startSquare, targetSquare)) { // if creature doesn't move from startSquare
            targetSquare = startSquare;
        } else if (this.targetSquareOutOfReach(startSquare, targetSquare, creature)) {
            throw new IllegalMoveException('Target square out of reach', moveObject);
        } else if (this.targetSquareNotEmpty(targetSquare)) {
            throw new IllegalMoveException('Target square not empty', moveObject);
        }
        
        this.moveCreature(startSquare, targetSquare, creature);

        if (attackSquare === null || attackSquare === undefined) { // if creature doesn't attack
            // do nothing
        } else if (this.attackSquareOutOfRange(targetSquare, attackSquare)) {
            throw new IllegalMoveException('Attack square out of range', moveObject);
        } else if (this.attackSquareEmpty(attackSquare)) {
            throw new IllegalMoveException('Attack square empty', moveObject);
        } else {
            const attackedCreature = this.field[attackSquare.y][attackSquare.x];
            this.attackCreature(creature, attackedCreature, attackSquare);
        }
    }

    playRangedMove(moveObject, creature) {
        const { startSquare, targetSquare, attackSquare } = moveObject;
        let moved = false;

        if (targetSquare === null || targetSquare === undefined || this.equalSquare(startSquare, targetSquare)) { // if creature doesn't move from startSquare
            // do nothing
        } else if (this.targetSquareOutOfReach(startSquare, targetSquare, creature)) {
            throw new IllegalMoveException('Target square out of reach', moveObject);
        } else if (this.targetSquareNotEmpty(targetSquare)) {
            throw new IllegalMoveException('Target square not empty', moveObject);
        } else {
            this.moveCreature(startSquare, targetSquare, creature);
            moved = true;
        }

        if (moved && attackSquare) {
            throw new IllegalMoveException('Ranged creature cannot attack after moving', moveObject);
        } else if (this.attackSquareEmpty(attackSquare)) {
            throw new IllegalMoveException('Attack square empty', moveObject);
        } else {
            const attackedCreature = this.field[attackSquare.y][attackSquare.x];
            this.attackCreature(creature, attackedCreature, attackSquare);
        }
    }

    playMeleeRangedMove(moveObject, creature) {
        const { startSquare, targetSquare, attackSquare } = moveObject;

        if (this.targetSquareOutOfReach(startSquare, targetSquare, creature)) {
            throw new IllegalMoveException('Target square out of reach', moveObject);
        } else if (targetSquare === null || targetSquare === undefined) { // if creature doesn't move from startSquare
            // do nothing
        } else if (this.targetSquareNotEmpty(targetSquare)) {
            throw new IllegalMoveException('Target square not empty', moveObject);
        } else {
            this.moveCreature(startSquare, targetSquare, creature);
        }

        if (attackSquare === null || attackSquare === undefined){
            // do nothing
        } else if (this.attackSquareOutOfRange(targetSquare, attackSquare)) {
            throw new IllegalMoveException('Attack square out of range', moveObject);
        } else if (this.attackSquareEmpty(attackSquare)) {
            throw new IllegalMoveException('Attack square empty', moveObject);
        } else {
            const attackedCreature = this.field[attackSquare.y][attackSquare.x];
            this.attackCreature(creature, attackedCreature, attackSquare);
        }

        if (attackSquare) {
            this.moveCreature(targetSquare, startSquare, creature);
        }
    }

    attackCreature(creature, attackedCreature, attackSquare) {
        attackedCreature.health -= creature.attackDamage;
        if (attackedCreature.health <= 0) {
            this.field[attackSquare.y][attackSquare.x] = null;
            this.creatureNumber[attackedCreature.team]--;
        }

        if (this.creatureNumber[attackedCreature.team] === 0) {
            this.winner = creature.team;
        }
    }

    moveCreature(startSquare, targetSquare, creature) {
        console.log('creature moved to: ', targetSquare)
        const xDiff = Math.abs(startSquare.x - targetSquare.x);
        const yDiff = Math.abs(startSquare.y - targetSquare.y);

        if (xDiff + yDiff > creature.rangeOfMovement) {
            throw new IllegalMoveException(`Target square out of reach. \nxDiff: ${xDiff}\nyDiff: ${yDiff}\nrangeOfMovement: ${creature.rangeOfMovement}`, moveObject);
        }

        this.field[startSquare.y][startSquare.x] = null;
        this.field[targetSquare.y][targetSquare.x] = creature;
    }

    targetSquareOutOfReach(startSquare, targetSquare, creature) {
        const xDiff = Math.abs(startSquare.x - targetSquare.x);
        const yDiff = Math.abs(startSquare.y - targetSquare.y);

        return xDiff + yDiff > creature.rangeOfMovement;
    }

    targetSquareNotEmpty(targetSquare) {
        return this.field[targetSquare.y][targetSquare.x] !== null;
    }

    attackSquareEmpty(attackSquare) {
        return this.field[attackSquare.y][attackSquare.x] === null;
    }

    attackSquareOutOfRange(targetSquare, attackSquare) {
        const xDiff = Math.abs(targetSquare.x - attackSquare.x);
        const yDiff = Math.abs(targetSquare.y - attackSquare.y);

        return xDiff + yDiff > 1;
    }

    startSquareEmpty(startSquare) {
        return this.field[startSquare.y][startSquare.x] === null;
    }

    squareOccupiedByEnemyCreature(startSquare) {
        const creature = this.field[startSquare.y][startSquare.x];
        return creature.team !== this.turn;
    }

    equalSquare(startSquare, targetSquare) {
        return startSquare.x === targetSquare.x && startSquare.y === targetSquare.y;
    }
}

module.exports = { GameField };
