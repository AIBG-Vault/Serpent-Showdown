const { Creature } = require('./creatureAbs.js');

class Knight extends Creature {
    constructor(team) {
        super(team, 'Kni', 125, 8, 8, 'MELEE');
    }
}

module.exports = { Knight };