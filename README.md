# AIBG-9.0

## Prerequisites

1. Install Node.js and npm (for server and JavaScript clients)
2. Install Python 3.7+ (for Python clients)
3. Install required dependencies:

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
```

## Running the Server

1. Create a `players.json` file in the server directory using the example file:

   - Copy `players.json copy.example` to `players.json`
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

## Running Clients

### JavaScript Client

Run the JS client (agent.js):

```bash
cd clients
node agent.js [playerID] [mode]
```

- playerID : Your unique player ID (default: "A")
- mode : Game mode
  - Movement directions: "up", "down", "left", "right"
  - "random": Makes random moves
  - "timeout": Progressively increases delay between moves

### Python Client

Run the Python client (agent.py):

```bash
cd clients
python agent.py [playerID] [mode]
```

- playerID : Your unique player ID (default: "A")
- mode : Supports same modes as agent.js
  - Movement directions: "up", "down", "left", "right"
  - "random": Makes random moves
  - "timeout": Increases delay progressively

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
