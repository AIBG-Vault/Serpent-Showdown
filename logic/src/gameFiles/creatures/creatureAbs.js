class Creature {
    constructor(team, name, health, attackDamage, rangeOfMovement, type) {
        this.team = team;
        this.name = name;
        this.health = health;
        this.attackDamage = attackDamage;
        this.rangeOfMovement = rangeOfMovement;
        this.type = type;
    }
}

module.exports = { Creature };