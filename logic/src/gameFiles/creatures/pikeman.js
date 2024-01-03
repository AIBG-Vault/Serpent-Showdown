const { Creature } = require('./creatureAbs.js');

class Pikeman extends Creature {
    constructor(team) {
        super(team, 50, 5, 8, 'MELEE');
    }
}

module.exports = { Pikeman };