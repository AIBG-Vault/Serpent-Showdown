const { Creature } = require('./creatureAbs.js');

class ArmoredPeasant extends Creature {
    constructor(team) {
        super(team, 'ArP', 250, 4, 5, 'MELEE');
    }
}

module.exports = { ArmoredPeasant };