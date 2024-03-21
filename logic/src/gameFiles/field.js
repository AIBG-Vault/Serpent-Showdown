const { IllegalMoveException} = require('./util/illegalMoveException');
const { Pikeman } = require('../gameFiles/creatures/pikeman');
const { Marksman } = require('../gameFiles/creatures/marksman');
const { Knight } = require('../gameFiles/creatures/knight');
const { Archer } = require('../gameFiles/creatures/archer');
const { Cavalry } = require('../gameFiles/creatures/cavalry');
const { ArmoredPeasant } = require('../gameFiles/creatures/armoredPeasant');
const { Phoenix } = require('../gameFiles/creatures/phoenix');

class GameField {
    constructor(players) {
        this.field = Array.from({ length: 13 }, () => Array.from({ length: 18 }, () => null));
        this.creatureNumber = [7, 7];
        this.winner = null;
        this.winnerHealth = 0;
        this.movesWithoutAttackCounter = 0;
        this.turn = 0;
        this.placeCounter = 0;
        this.player1Creatures = [
            new Pikeman(0),
            new Marksman(0),
            new Knight(0),
            new Archer(0),
            new Cavalry(0),
            new ArmoredPeasant(0),
            new Phoenix(0)
        ]
        this.player1Placed = [0,0,0,0,0,0,0]
        this.player2Creatures = [
            new Pikeman(1),
            new Marksman(1),
            new Knight(1),
            new Archer(1),
            new Cavalry(1),
            new ArmoredPeasant(1),
            new Phoenix(1)
        ]
        this.player2Placed = [0,0,0,0,0,0,0]
    }

    getGameField() {
        return {
            field: this.field,
            creatureNumber: this.creatureNumber,
            winner: this.winner
        };
    }

    addCreature(moveObject) {
        if (!('x' in moveObject && 'y' in moveObject && 'creatureId' in moveObject)) {
            throw new IllegalMoveException('Invalid move object', moveObject);
        }
        if (this.turn === 0){
            if (moveObject.x > 2) {
                throw new IllegalMoveException('Illegal placement', moveObject);
            } else if (this.field[moveObject.y][moveObject.x] !== null) {
                throw new IllegalMoveException('Square occupied', moveObject);
            } else if (this.player1Placed[moveObject.creatureId - 1] === 1) {
                throw new IllegalMoveException('You have already placed this creature', moveObject);
            } else {
                this.field[moveObject.y][moveObject.x] = this.player1Creatures[moveObject.creatureId - 1];
                this.player1Placed[moveObject.creatureId - 1] = 1;
                this.placeCounter++;
            }
        } else {
            if (moveObject.x < 10) {
                throw new IllegalMoveException('Illegal placement', moveObject);
            } else if (this.field[moveObject.y][moveObject.x] !== null) {
                throw new IllegalMoveException('Square occupied', moveObject);
            } else if (this.player2Placed[moveObject.creatureId - 1] === 1) {
                throw new IllegalMoveException('You have already placed this creature', moveObject);
            } else {
                this.field[moveObject.y][moveObject.x] = this.player2Creatures[moveObject.creatureId - 1];
                this.player2Placed[moveObject.creatureId - 1] = 1;
                this.placeCounter++;
            }
        }
    }

    playMove(moveObject) {
        // console.log('playMove', moveObject);
        if (this.placeCounter < 14) {
            this.addCreature(moveObject);
        } else {
            this.movesWithoutAttackCounter++;
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

            if (this.movesWithoutAttackCounter >= 50) {
                let player1remainingHealth = 0;
                let player2remainingHealth = 0;
                for (let i = 0; i < 13; i++) {
                    for (let j = 0; j < 18; j++) {
                        if (this.field[i][j] !== null) {
                            if (this.field[i][j].team === 0) {
                                player1remainingHealth += this.field[i][j].health;
                            } else {
                                player2remainingHealth += this.field[i][j].health;
                            }
                        }
                    }
                }
                if (player1remainingHealth > player2remainingHealth) {
                    this.winner = 0;
                    this.winnerHealth = player1remainingHealth;
                } else if (player1remainingHealth < player2remainingHealth) {
                    this.winner = 1;
                    this.winnerHealth = player2remainingHealth;
                } else {
                    this.winner = 2;
                }
            }
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
        this.movesWithoutAttackCounter = 0;
        attackedCreature.health -= creature.attackDamage;
        if (attackedCreature.health <= 0) {
            this.field[attackSquare.y][attackSquare.x] = null;
            //console.log("attackedCreature", attackedCreature)
            this.creatureNumber[attackedCreature.team]--;
        }

        this.checkForTheWinner();
    }

    checkForTheWinner() {
        if (this.creatureNumber[0] === 0) {
            this.winner = 1;
            for (let i = 0; i < 13; i++) {
                for (let j = 0; j < 18; j++) {
                    if (this.field[i][j] !== null) {
                        this.winnerHealth += this.field[i][j].health;
                    }
                }
            }
        }
        if (this.creatureNumber[1] === 0) {
            this.winner = 0;
            for (let i = 0; i < 13; i++) {
                for (let j = 0; j < 18; j++) {
                    if (this.field[i][j] !== null) {
                        this.winnerHealth += this.field[i][j].health;
                    }
                }
            }
        }
    }

    moveCreature(startSquare, targetSquare, creature) {
        // console.log('creature moved to: ', targetSquare)
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
        //console.log('creature', creature);
        return creature.team !== this.turn;
    }

    equalSquare(startSquare, targetSquare) {
        return startSquare.x === targetSquare.x && startSquare.y === targetSquare.y;
    }
}

module.exports = { GameField };
