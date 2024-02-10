const { Creature } = require('./creatureAbs.js');

class Cavalry extends Creature {
    constructor(team) {
        super(team, 'Cav', 175, 9, 9, 'MELEE');
    }
}

module.exports = { Cavalry };