const GameField = require('./gameFiles/field.js').GameField;
const Pikeman = require('./gameFiles/creatures/pikeman.js').Pikeman;
const Marksman = require('./gameFiles/creatures/marksman.js').Marksman;

const { app, BrowserWindow, ipcMain } = require('electron');

// methods for visuals
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
  
    mainWindow.loadFile('index.html');
  
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
  
app.whenReady().then(() => {
    createWindow();
  
    ipcMain.on('get-game-field', (event) => {
        const gameField = getGameField();
        event.reply('update-game-field', gameField);
    });
});
  
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
  
app.on('activate', function () {
    if (mainWindow === null) createWindow();
});
  
function getGameField() {
    let gamefield = new GameField();

    let pikeman1blue = new Pikeman(1);
    let pikeman2blue = new Pikeman(1);
    let pikeman3blue = new Pikeman(1);
    let pikeman4blue = new Pikeman(1);
    let pikeman5blue = new Pikeman(1);
  
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
  
  
    gamefield.addCreature(pikeman1red, 0, 29);
    gamefield.addCreature(pikeman2red, 4, 29);
    gamefield.addCreature(pikeman3red, 8, 29);
    gamefield.addCreature(pikeman4red, 12, 29);
    gamefield.addCreature(pikeman5red, 16, 29);
  
  
    gamefield.addCreature(marksman1blue, 2, 0);
    gamefield.addCreature(marksman2blue, 6, 0);
    gamefield.addCreature(marksman3blue, 10, 0);
    gamefield.addCreature(marksman4blue, 14, 0);
    gamefield.addCreature(marksman5blue, 18, 0);
  
  
    gamefield.addCreature(marksman1red, 2, 29);
    gamefield.addCreature(marksman2red, 6, 29);
    gamefield.addCreature(marksman3red, 10, 29);
    gamefield.addCreature(marksman4red, 14, 29);
    gamefield.addCreature(marksman5red, 18, 29);

    return gamefield.field;
}
  
exports.getGameField = getGameField;
