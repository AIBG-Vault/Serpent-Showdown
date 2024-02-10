const { Creature } = require('./creatureAbs.js');

class Marksman extends Creature {
    constructor(team) {
        super(team, 'Mar', 75, 5, 5, 'RANGED');
    }
}

module.exports = { Marksman };