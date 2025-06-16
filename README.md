# AIBG-Serpent Showdown

## Description

Serpent Showdown is a 1v1 versus snake game where two players battle it out on a dynamic grid. Each player starts with a snake of fixed length and a score of 1000 points. The goal is to outmaneuver your opponent by collecting items, avoiding hazards, and grabbing power-ups that either boost your score or disrupt your enemy.

The arena continuously changes throughout the match. After a set number of moves, the grid begins to shrink, forcing the snakes into closer quarters and raising the risk of collisions. The game ends when a snake crashes or when a player's score reaches zero. In a simultaneous loss, the winner is determined by the higher score or, if equal, by the longer snake.

## Visuals

## Docs

- [Topic Manual](docs/AIBG%20-%20Topic%20manual%20-%20Serpent%20Showdown.pdf)
- [Topic Presentation](docs/AIBG%20-%20Topic%20presentation%20-%20Serpent%20Showdown.pdf)

## Attribution

**Created by:**

- Jakov Jakovac (Topic responsible)
- Albert Maršić
- Martin Vrbovčan
- Ivan Androšević
- Barbara Jozić

## License [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

## Usage

This topic was used in the following events:

- **Zagreb 05/2025** (AIBG 9.0)

## How to run

Before you begin, make sure your environment is set up to run the game. The following prerequisites will help you configure your system to run the server, clients, and visuals correctly.

### Prerequisites

1. Install Node.js and npm (for server and JavaScript agent)
2. (Optional) Install Python 3.7+ (for Python agent)
3. Install an IDE with Live Server extension (for visuals)
4. Install required dependencies:

   - For server:

     ```bash
     cd server
     npm install
     ```

   - For JavaScript clients:

     ```bash
     cd clients
     npm install
     ```

   - For Python clients:

     ```bash
     pip install websockets
     ```

### Game flow

1. Start the server
2. Start the visuals (they connect automatically to the server on port 3000)
3. Connect two clients using valid IDs from `players.json` (game starts automatically when both agents connect)
4. Server shuts down automatically after the game ends

### Running the server

1. Create a `players.json` file in the server directory using the example:

   ```bash
   cp players.json.example players.json
   ```

   - Edit player IDs and names in the newly created `players.json` as needed

2. Start the server:

   ```bash
   cd server
   node server.js [port] [timeout]
   ```

   - The server runs on port defined on start or `3000` by default, with the set custom timeout in mmiliseconds (default: `150`ms, `0` to disable)
   - The server automatically creates the game object (logic) on start

### Running the visuals

1. Open the project in your IDE (we recommend VS Code)
2. Right-click on `visuals/index.html` → "Open with Live Server"
   - Live Server extension has to be installed
3. The game visualization will open in your default browser
4. The visuals auto-connect to the server on port 3000 once the server is running

To test the game manually, add `?mode=debug` query string to the end of the url, for example:

```text
http://127.0.0.1:5500/visuals/index.html?mode=debug
```

Manual gameplay connects to the server using IDs `"k"` and `"l"` so remember to add them to `players.json`.

### Running agents

#### JavaScript test agent

```bash
node agents/testAgent.js [playerID] [mode]
```

#### Python test agent

```bash
python agents/testAgent.py [playerID] [mode]
```

##### Modes

- `"up"`, `"down"`, `"left"`, `"right"`: Constant direction
- `"random"`: Random valid moves
- `"timeout"`: Delayed actions
- `"survive"`: Avoids death and collisions
- `"apple"`: Seeks the closest apple (most advanced)
