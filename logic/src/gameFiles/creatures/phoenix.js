const { Creature } = require('./creatureAbs.js');

class Phoenix extends Creature {
    constructor(team) {
        super(team, 'Phx', 150, 11, 7, 'MELEE/RANGED');
    }
}

module.exports = { Phoenix };