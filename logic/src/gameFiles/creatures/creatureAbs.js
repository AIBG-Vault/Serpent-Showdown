class Creature {
    constructor(team, health, attackDamage, rangeOfMovement, attackType) {
        this.team = team;
        this.health = health;
        this.attackDamage = attackDamage;
        this.rangeOfMovement = rangeOfMovement;
        this.attackType = attackType;
    }
}

module.exports = { Creature };