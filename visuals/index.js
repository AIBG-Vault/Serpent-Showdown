const { GameField } = require('../logic/src/gameFiles/field');
const { Pikeman } = require('../logic/src/gameFiles/creatures/pikeman');
const { Marksman } = require('../logic/src/gameFiles/creatures/marksman');
const { Knight } = require('../logic/src/gameFiles/creatures/knight');
const { Archer } = require('../logic/src/gameFiles/creatures/archer');
const { Cavalry } = require('../logic/src/gameFiles/creatures/cavalry');
const { ArmoredPeasant } = require('../logic/src/gameFiles/creatures/armoredPeasant');
const { Phoenix } = require('../logic/src/gameFiles/creatures/phoenix');

// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const path = require('path');

// const app = express();
// const server = http.createServer(app);

// let gamefield = new GameField();

// function sendUpdateToClients() {
//     if (!wss) {
//         console.error('WebSocket server not set');
//         return;
//     }

//     const updatedGameField = gamefield.getGameField();
//     // console.log('Sending update to clients', updatedGameField)
//     const message = JSON.stringify({ type: 'update-game-field', data: updatedGameField });

//     // Broadcast the message to all connected clients
//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(message);
//         }
//     });
// }

// function addCreatureWithDelay(index, callback) {
//     if (index < creaturesToAdd.length) {
//         const { creature, x, y } = creaturesToAdd[index];

//         setTimeout(() => {
//             gamefield.addCreature(creature, x, y);
//             sendUpdateToClients();

//             // Add the next creature with a delay
//             addCreatureWithDelay(index + 1, callback);
//         }, 200); 
//     } else {
//         // All creatures are added, invoke the callback
//         callback();
//     }
// }

// function playMoveWithDelay(index) {
//     if (index < movesToPlay.length) {
//         // console.log('Creature moved', movesToPlay[index]);

//         setTimeout(() => {
//             gamefield.playMove(movesToPlay[index]);
//             console.log('sending update to clients')
//             sendUpdateToClients();

//             // Add the next creature with a delay
//             playMoveWithDelay(index + 1);
//         }, 200); // Delay of 1 second
//     }
// }

// WebSocket connection handling
// wss.on('connection', (ws) => {
//     console.log('Client connected to WebSocket');

//     // Send initial game field to the connected client
//     ws.send(JSON.stringify({ type: 'update-game-field', data: gamefield }));

//     // Handle messages from the client
//     ws.on('message', (message) => {
//         console.log(`Received message: ${message}`);
//         // Handle incoming messages from the client if needed
//     });

//     // Handle disconnection
//     ws.on('close', () => {
//         console.log('Client disconnected from WebSocket');
//     });
// });

// Serve your frontend app (HTML, CSS, JS, etc.)
// app.use(express.static(path.join(__dirname, 'public')));

// #######################################################################
// Simulated game flow
// #######################################################################

let pikeman1 = new Pikeman(0);
let pikeman2 = new Pikeman(1);
let marksman1 = new Marksman(0);
let marksman2 = new Marksman(1);
let knight1 = new Knight(0);
let knight2 = new Knight(1);
let archer1 = new Archer(0);
let archer2 = new Archer(1);
let cavalry1 = new Cavalry(0);
let cavalry2 = new Cavalry(1);
let armoredPeasant1 = new ArmoredPeasant(0);
let armoredPeasant2 = new ArmoredPeasant(1);
let phoenix1 = new Phoenix(0);
let phoenix2 = new Phoenix(1);

const creaturesToAdd = [
    { creature: pikeman1, x: 0, y: 0 },
    { creature: pikeman2, x: 17, y: 0 },
    { creature: marksman1, x: 0, y: 2 },
    { creature: marksman2, x: 17, y: 2 },
    { creature: knight1, x: 0, y: 4 },
    { creature: knight2, x: 17, y: 4 },
    { creature: archer1, x: 0, y: 6 },
    { creature: archer2, x: 17, y: 6 },
    { creature: cavalry1, x: 0, y: 8 },
    { creature: cavalry2, x: 17, y: 8 },
    { creature: armoredPeasant1, x: 0, y: 10 },
    { creature: armoredPeasant2, x: 17, y: 10 },
    { creature: phoenix1, x: 0, y: 12 },
    { creature: phoenix2, x: 17, y: 12 },
];

addCreatureWithDelay(0, () => {
    console.log('All creatures added');
    playMoveWithDelay(0);
});

const movesToPlay = [
    // {
    //     startSquare: { x: 0, y: 0 }, // suicid moguć, ovo prolazi
    //     attackSquare: { x: 0, y: 0 },
    // },
    // {
    //     startSquare: { x: 0, y: 2 }, // Ranged ne može napast nakon pomicanja
    //     targetSquare: { x: 1, y: 2 },
    //     attackSquare: { x: 17, y: 2 },
    // },
    // PLACING MOVES
    {
        id: 1,
        x: 0,
        y: 0,
    },
    {
        id: 1,
        x: 17,
        y: 0,
    },
    {
        id: 2,
        x: 0,
        y: 2,
    },
    {
        id: 2,
        x: 17,
        y: 2,
    },
    {
        id: 3,
        x: 0,
        y: 4,
    },
    {
        id: 3,
        x: 17,
        y: 4,
    },
    {
        id: 4,
        x: 0,
        y: 6,
    },
    {
        id: 4,
        x: 17,
        y: 6,
    },
    {
        id: 5,
        x: 0,
        y: 8,
    },
    {
        id: 5,
        x: 17,
        y: 8,
    },
    {
        id: 6,
        x: 0,
        y: 10,
    },
    {
        id: 6,
        x: 17,
        y: 10,
    },
    {
        id: 7,
        x: 0,
        y: 12,
    },
    {
        id: 7,
        x: 17,
        y: 12,
    },
    {
        startSquare: { x: 0, y: 0 }, // Pikemeni se bijedu
        targetSquare: { x: 6, y: 0 },
    },
    {
        startSquare: { x: 17, y: 0 },
        targetSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 6, y: 0 },
        targetSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 },
    },
    {
        startSquare: { x: 10, y: 0 },
        attackSquare: { x: 11, y: 0 },
    },
    {
        startSquare: { x: 17, y: 2 }, // Marksmani se bijedu
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        targetSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 2 },
        targetSquare: null,
        attackSquare: { x: 17, y: 2 },
    },
    {
        startSquare: { x: 17, y: 2 },
        attackSquare: { x: 0, y: 2 },
    },
    {
        startSquare: { x: 0, y: 4 }, // Knightsi se bijedu
        targetSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 17, y: 4 },
        targetSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 8, y: 4 },
        attackSquare: { x: 9, y: 4 },
    },
    {
        startSquare: { x: 9, y: 4 },
        attackSquare: { x: 8, y: 4 },
    },
    {
        startSquare: { x: 0, y: 6 }, // Archeri se bijedu
        attackSquare: { x: 17, y: 2 }, // tu prvo puca na marksmena
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 6 },
        attackSquare: { x: 17, y: 6 },
    },
    {
        startSquare: { x: 17, y: 6 },
        attackSquare: { x: 0, y: 6 },
    },
    {
        startSquare: { x: 0, y: 8 }, // Cavalry Attacks armored peasant
        targetSquare: { x: 9, y: 8 },
    },
    {
        startSquare: { x: 17, y: 8 },
        targetSquare: { x: 8, y: 8 },
    },
    {
        startSquare: { x: 9, y: 8 }, 
        targetSquare: { x: 16, y: 10 },
    },
    {
        startSquare: { x: 8, y: 8 },
        targetSquare: { x: 1, y: 10 },
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 16, y: 10 },
        attackSquare: { x: 17, y: 10 }
    },
    {
        startSquare: { x: 1, y: 10 },
        attackSquare: { x: 0, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 }, // Phoenixi napadaju Cavalry
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },
        targetSquare: { x: 1, y: 11 },
        attackSquare: { x: 1, y: 10 }
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 16, y: 11 },
        attackSquare: { x: 16, y: 10 }
    },
    {
        startSquare: { x: 0, y: 12 },// phoenixi ideju zbiti ostale
        targetSquare: { x: 3, y: 8 },
    },
    {
        startSquare: { x: 17, y: 12 },
        targetSquare: { x: 15, y: 9 },
    },
    {
        startSquare: { x: 3, y: 8 },
        targetSquare: { x: 6, y: 6 },
    },
    {
        startSquare: { x: 15, y: 9 },
        targetSquare: { x: 12, y: 5 },
    },
    {
        startSquare: { x: 6, y: 6 },
        targetSquare: { x: 13, y: 6 },
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 10, y: 4 },
        attackSquare: { x: 9, y: 4 }
    },
    {
        startSquare: { x: 13, y: 6 },
        targetSquare: { x: 16, y: 6 },
        attackSquare: { x: 17, y: 6 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 11, y: 0 },
        attackSquare: { x: 10, y: 0 }
    },
    {
        startSquare: { x: 13, y: 6 }, // phoenixi se bijedu
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
    {
        startSquare: { x: 12, y: 5 },
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 13, y: 6 }
    },
    {
        startSquare: { x: 13, y: 6 }, 
        targetSquare: { x: 12, y: 6 },
        attackSquare: { x: 12, y: 5 }
    },
]

// playMoveWithDelay(0);

// #######################################################################
// Simulated game flow
// #######################################################################

// server.listen(3000, () => {
//     console.log('Server is running on http://localhost:3000');
// });
