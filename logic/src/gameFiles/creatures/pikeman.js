const { Creature } = require('./creatureAbs.js');

class Pikeman extends Creature {
    constructor(team) {
        super(team, 'Pik', 50, 6, 6, 'MELEE');
    }
}

module.exports = { Pikeman }