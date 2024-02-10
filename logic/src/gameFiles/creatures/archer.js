const { Creature } = require('./creatureAbs.js');

class Archer extends Creature {
    constructor(team) {
        super(team, 'Arc', 100, 7, 5, 'RANGED');
    }
}

module.exports = { Archer };