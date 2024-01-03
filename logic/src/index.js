const GameField = require('./gameFiles/field.js').GameField;
const Pikeman = require('./gameFiles/creatures/pikeman.js').Pikeman;
const Marksman = require('./gameFiles/creatures/marksman.js').Marksman;

let gamefield = new GameField();

let pikeman1blue = new Pikeman(1);
let pikeman2blue = new Pikeman(1);
let pikeman3blue = new Pikeman(1);
let pikeman4blue = new Pikeman(1);
let pikeman5blue = new Pikeman(1);
console.log('pikeman1blue.attackType', pikeman1blue.attackType);

let pikeman1red = new Pikeman(2);
let pikeman2red = new Pikeman(2);
let pikeman3red = new Pikeman(2);
let pikeman4red = new Pikeman(2);
let pikeman5red = new Pikeman(2);


let marksman1blue = new Marksman(1);
let marksman2blue = new Marksman(1);
let marksman3blue = new Marksman(1);
let marksman4blue = new Marksman(1);
let marksman5blue = new Marksman(1);

let marksman1red = new Marksman(2);
let marksman2red = new Marksman(2);
let marksman3red = new Marksman(2);
let marksman4red = new Marksman(2);
let marksman5red = new Marksman(2);


gamefield.addCreature(pikeman1blue, 0, 0);
gamefield.addCreature(pikeman2blue, 4, 0);
gamefield.addCreature(pikeman3blue, 8, 0);
gamefield.addCreature(pikeman4blue, 12, 0);
gamefield.addCreature(pikeman5blue, 16, 0);


gamefield.addCreature(pikeman1red, 0, 19);
gamefield.addCreature(pikeman2red, 4, 19);
gamefield.addCreature(pikeman3red, 8, 19);
gamefield.addCreature(pikeman4red, 12, 19);
gamefield.addCreature(pikeman5red, 16, 19);


gamefield.addCreature(marksman1blue, 2, 0);
gamefield.addCreature(marksman2blue, 6, 0);
gamefield.addCreature(marksman3blue, 10, 0);
gamefield.addCreature(marksman4blue, 14, 0);
gamefield.addCreature(marksman5blue, 18, 0);


gamefield.addCreature(marksman1red, 2, 19);
gamefield.addCreature(marksman2red, 6, 19);
gamefield.addCreature(marksman3red, 10, 19);
gamefield.addCreature(marksman4red, 14, 19);
gamefield.addCreature(marksman5red, 18, 19);

//console.log(gamefield.field);