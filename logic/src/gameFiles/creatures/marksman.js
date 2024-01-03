const { Creature } = require('./creatureAbs.js');

class Marksman extends Creature {
    constructor(team) {
        super(team, 50, 5, 8, 'RANGED');
    }
}

module.exports = { Marksman };