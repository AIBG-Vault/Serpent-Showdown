# AIBG-9.0

## Prerequisites

1. Install Node.js and npm (for server and JavaScript clients)
2. Install Python 3.7+ (for Python clients)
3. Install an IDE with Live Server extension (for visuals)
4. Install code formatters:
   - Prettier for JavaScript/Node.js development
   - Black for Python development
5. Install required dependencies:

For server:

```bash
cd server
npm install
```

For JavaScript client:

```bash
cd clients
npm install
```

For Python client:

```bash
pip install websockets
pip install black  # for code formatting
```

## Running the Server

1. Create a `players.json` file in the server directory using the example file:

   - Copy `players.json.example` to `players.json`
   - Modify player IDs and names as needed

2. Start the server (choose one):

```bash
cd server
npm run dev    # Runs with nodemon (auto-restart on changes)
```

OR

```bash
cd server
node server.js # Runs without auto-restart
```

The server will run on port 3000.

## Running the Visuals

1. Open the project in your IDE (VS Code or Trae)
2. Right-click on visuals/index.html and select "Open with Live Server"
   - If you don't see this option, install the "Live Server" extension first
3. The game visualization will open in your default browser
4. The visuals will automatically connect to the server when it's running

## Running Clients

### JavaScript Client

Run the JS client (agent.js):

```bash
cd clients
node agent.js [playerID] [mode]
```

- playerID: Your unique player ID (default: "k")
- mode: Game mode
  - Movement directions: "up", "down", "left", "right"
  - "random": Makes random moves
  - "timeout": Progressively increases delay between moves
  - "apple": Seeks and moves toward the nearest apple while avoiding obstacles
  - "survive": Focuses on avoiding collisions and staying alive

### Python Client

Run the Python client (agent.py):

```bash
cd clients
python agent.py [playerID] [mode]
```

- playerID: Your unique player ID (default: "k")
- mode: Supports same basic modes as agent.js
  - Movement directions: "up", "down", "left", "right"
  - "random": Makes random moves
  - "timeout": Increases delay progressively
  - "apple": Seeks and moves toward the nearest apple while avoiding obstacles
  - "survive": Focuses on avoiding collisions and staying alive

## Game Flow

1. Start the server first
2. Connect two clients using valid player IDs
3. The game starts automatically when both players are connected
4. Server will close automatically when the game ends

## Notes

- Maximum 2 players can connect simultaneously
- Invalid player IDs will be rejected (must be defined in players.json)
- The game state is continuously updated and sent to all connected clients
- The server automatically closes all connections when the game ends
- The game map is represented as a 2D array with:
  - Uppercase letters: Snake heads
  - Lowercase letters: Snake bodies
  - "A": Apples
  - null: Empty spaces
