# AIBG-Serpent Showdown

## Description

Serpent Showdown is a 1v1 versus snake game where two players battle it out on a dynamic grid. Each player starts with a snake of fixed length and a score of 1000 points. The goal is to outmaneuver your opponent by collecting items, avoiding hazards, and grabbing power-ups that either boost your score or disrupt your enemy.

The arena continuously changes throughout the match. After a set number of moves, the grid begins to shrink, forcing the snakes into closer quarters and raising the risk of collisions. The game ends when a snake crashes or when a player's score reaches zero, with the winner determined by who has the higher score or longer snake if both players lose at the same time.

## Visuals

## Docs

- [Topic Manual](docs/AIBG%20-%20Topic%20manual%20-%20Serpent%20Showdown.pdf)
- [Topic Presentation](docs/AIBG%20-%20Topic%20presentation%20-%20Serpent%20Showdown.pdf)

## Attribution

Created by:

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

- Zagreb 05/2025

## How to run

1. Install Node.js and npm (for server and JavaScript clients)
2. Install Python 3.7+ (for Python clients)
3. Install an IDE with Live Server extension (for visuals)
4. (Optional) Install code formatters:
   - Prettier for JavaScript/Node.js development
   - Black for Python development
5. Install required dependencies:

### For server:

```bash
cd server
npm install
```

### For JavaScript client:

```bash
cd clients
npm install
```

### For Python client:

```bash
pip install websockets
pip install black  # optional formatter
```

## Running the Server

1. Create a `players.json` file in the server directory using the example:

   ```bash
   cp players.json.example players.json
   ```

   - Edit player IDs and names as needed

2. Start the server:

```bash
cd server
node server.js [port] [timeout]
```

- The server runs on port defined on start or `3000` by default, with the set custom timeout in mmiliseconds (default: 150ms, 0 to disable)

## Running the Visuals

1. Open the project in your IDE (we recommend VS Code or Trae AI)
2. Right-click on `visuals/index.html` → "Open with Live Server"
   - Install the Live Server extension if not available
3. The game visualization will open in your default browser
4. The visuals auto-connect to the server

To test the game manually in **debug mode** (ideal for development):

```text
http://127.0.0.1:5500/visuals/index.html?mode=debug
```

Use player IDs `"k"` and `"l"` for manual testing.

## Running Clients

### JavaScript Client

```bash
cd clients
node BESTAgent.js [playerID] [mode]
```

### Python Client

```bash
cd clients
python BESTAgent.py [playerID] [mode]
```

#### Modes

- `"up"`, `"down"`, `"left"`, `"right"`: Constant direction
- `"random"`: Random valid moves
- `"timeout"`: Delayed actions
- `"survive"`: Avoids death and collisions
- `"apple"`: Seeks the closest apple (most advanced)

## Connecting Your Own Agents

Templates are available in the `clients` folder:

- `simpleAgent.js` and `simpleAgent.py` – starter templates
- Advanced agents included for AI training and testing

## Game Flow

1. Start the server
2. Connect two clients using valid IDs from `players.json`
3. Game starts automatically when both connect
4. Server shuts down automatically after the game

## Game Overview

- 2-player turn-based snake battle
- Board size: 25 rows × 60 columns
- Initial snake length: 9
- Starting score: 1000 points
- After 100 moves, horizontal borders shrink every 10 moves; vertical shrink begins when board becomes square. Minimum board size: 20×20
- Snakes outside border: body parts turn into apples

### Win Conditions

1. **Instant Win**:

   - Opponent collides with wall, self, or other snake

2. **Score Loss**:

   - A player’s score drops to 0

3. **Tie-breaking**:

   - If both players lose simultaneously:
     1. Higher score wins
     2. If scores equal → longer snake
     3. Still tied → draw

4. **Timeout**:
   - Max 900 moves
   - Winner decided by:
     1. Higher score
     2. Then snake length
     3. Else, draw

## Scoring System

### Rewards

- Move toward center: +20 points
- Move away from center: +10 points
- Apple: +50 points, +1 length
- Golden Apple: +70 points, +1 length per move over 5 moves
- Katana: +60 points, active 10 moves
- Armour: +60 points, protects 15 moves
- Shorten: +30 points
- Tron: +50 points, leaves 15-move trail
- Freeze: +30 points, freezes enemy 8 moves
- Leap: +80 points, repeats last move for 5 moves
- Nausea: +90 points, randomizes enemy move
- Reset Borders: +30 points, resets board size

### Penalties

- Invalid move or timeout (>150ms): -50 points
- Reverse direction: -30 points
- Body segment lost (from border or item): -30 points per segment

### Notes

- Items spawn every 5 moves (apples), others with 10% chance per move
- All items spawn symmetrically for fairness
- Items can stack or reset their effect duration if picked up again

## Game State Format

Game state sent to clients after each move:

```json
{
  "map": [[null, ...], ...],
  "players": [
    {
      "name": "Team K",
      "score": 1030,
      "body": [{"row": 5, "column": 3}, ...],
      "activeItems": [...],
      "lastMoveDirection": "up",
      "nextMoveDirection": "frozen"
    },
    {
      "name": "Team L",
      "score": 1050,
      "body": [{"row": 7, "column": 3}, ...],
      "activeItems": [...],
      "lastMoveDirection": "left",
      "nextMoveDirection": null
    }
  ],
  "moveCount": 420,
  "winner": null
}
```

## Sending Moves

Each client must send a valid move every turn in this format:

```json
{
  "playerId": "k",
  "direction": "up"
}
```

- Valid directions: `"up"`, `"down"`, `"left"`, `"right"`
- Must respond within 150 ms
