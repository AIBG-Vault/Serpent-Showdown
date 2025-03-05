# AIBG-9.0

## Prerequisites

1. Install Node.js and npm (for server and JavaScript clients)
2. Install required dependencies:

For server:

```bash
cd server
npm install
```

For JavaScript clients:

```bash
cd clients
npm install
```

## Running the Server

1. Create a `players.json` file in the server directory using the example file:

   - Copy `players.json copy.example` to `players.json`
   - Modify player IDs and names as needed

2. Start the server:

```bash
cd server
node server.js
```

The server will run on port 3000.

## Running Clients

### JavaScript Clients

Basic Agent (agent_2.js):

```bash
cd clients
node agent_2.js [playerID] [direction]
```

- `playerID`: Your unique player ID (default: "A")
- `direction`: Movement direction ("up", "down", "left", "right", "random")

## Game Flow

1. Start the server first
2. Connect two clients using valid player IDs
3. The game starts automatically when both players are connected
4. Server will close automatically when the game ends

## Notes

- Maximum 2 players can connect simultaneously
- Invalid player IDs will be rejected (add in players.json)
- The game state is continuously updated and sent to all connected clients
- The server automatically closes all connections when the game ends
