const { IllegalMoveException } = require("./util/illegalMoveException");
const { Pikeman } = require("../gameFiles/creatures/pikeman");
const { Marksman } = require("../gameFiles/creatures/marksman");
const { Knight } = require("../gameFiles/creatures/knight");
const { Archer } = require("../gameFiles/creatures/archer");
const { Cavalry } = require("../gameFiles/creatures/cavalry");
const { ArmoredPeasant } = require("../gameFiles/creatures/armoredPeasant");
const { Phoenix } = require("../gameFiles/creatures/phoenix");

class GameField {
  constructor() {
    this.field = Array.from({ length: 13 }, () =>
      Array.from({ length: 18 }, () => null)
    );
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
      new Phoenix(0),
    ];
    this.player1Placed = [0, 0, 0, 0, 0, 0, 0];
    this.player2Creatures = [
      new Pikeman(1),
      new Marksman(1),
      new Knight(1),
      new Archer(1),
      new Cavalry(1),
      new ArmoredPeasant(1),
      new Phoenix(1),
    ];
    this.player2Placed = [0, 0, 0, 0, 0, 0, 0];
  }

  getGameField() {
    return {
      field: this.field,
      creatureNumber: this.creatureNumber,
      winner: this.winner,
    };
  }

  addCreature(moveObject) {
    if (
      !("x" in moveObject && "y" in moveObject && "creatureId" in moveObject)
    ) {
      throw new IllegalMoveException("Invalid move object", moveObject);
    }

    if (moveObject.creatureId < 1 || moveObject.creatureId > 7) {
      throw new IllegalMoveException(
        "Invalid creature id. Id can only be between 1 and 7.",
        moveObject
      );
    }

    if (this.turn === 0) {
      if (moveObject.x > 2) {
        throw new IllegalMoveException("Illegal placement", moveObject);
      } else if (this.field[moveObject.y][moveObject.x] !== null) {
        throw new IllegalMoveException("Square occupied", moveObject);
      } else if (this.player1Placed[moveObject.creatureId - 1] === 1) {
        throw new IllegalMoveException(
          "You have already placed this creature",
          moveObject
        );
      } else {
        this.field[moveObject.y][moveObject.x] =
          this.player1Creatures[moveObject.creatureId - 1];
        this.player1Placed[moveObject.creatureId - 1] = 1;
        this.placeCounter++;
      }
    } else {
      if (moveObject.x < 10) {
        throw new IllegalMoveException("Illegal placement", moveObject);
      } else if (this.field[moveObject.y][moveObject.x] !== null) {
        throw new IllegalMoveException("Square occupied", moveObject);
      } else if (this.player2Placed[moveObject.creatureId - 1] === 1) {
        throw new IllegalMoveException(
          "You have already placed this creature",
          moveObject
        );
      } else {
        this.field[moveObject.y][moveObject.x] =
          this.player2Creatures[moveObject.creatureId - 1];
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
      if (
        (moveObject.targetSquare === null ||
          moveObject.targetSquare === undefined) &&
        (moveObject.attackSquare === null ||
          moveObject.attackSquare === undefined)
      ) {
        throw new IllegalMoveException(
          "Invalid move object. You need to provide either tagretSquare or attackSquare alongside startSquare",
          moveObject
        );
      }
      if (this.startSquareEmpty(moveObject.startSquare)) {
        throw new IllegalMoveException("Start square empty", moveObject);
      } else if (this.squareOccupiedByEnemyCreature(moveObject.startSquare)) {
        throw new IllegalMoveException(
          "Start square occupied by enemy creature",
          moveObject
        );
      }

      const creature =
        this.field[moveObject.startSquare.y][moveObject.startSquare.x];
      const type = creature.type;

      switch (type) {
        case "MELEE":
          this.playMeleeMove(moveObject, creature);
          break;
        case "RANGED":
          this.playRangedMove(moveObject, creature);
          break;
        case "MELEE/RANGED":
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
