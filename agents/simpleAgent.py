import asyncio
import websockets
import json
import sys
import random

# Configuration
CONFIG = {
    "serverIP": "topic.aibg.best.hr",
    "serverPort": 3000,
    "defaultId": "k",
    "validDirections": ["up", "down", "left", "right"],
}

# Game state
class GameState:
    def __init__(self):
        self.agentId = sys.argv[1] if len(sys.argv) > 1 else CONFIG["defaultId"]
        self.playerName = None

async def connect_to_game_server(game_state):
    uri = f"ws://{CONFIG['serverIP']}:{CONFIG['serverPort']}?id={game_state.agentId}"

    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")

        while True:
            try:
                data = await websocket.recv()
                received_msg = json.loads(data)

                # Store player name when receiving the connection success message
                if received_msg.get("message") == "Player connected successfully.":
                    print(
                        f"Agent connected with name: '{received_msg['name']}' "
                        f"and id: '{game_state.agentId}'."
                    )
                    game_state.playerName = received_msg["name"]
                    continue

                game_is_over = received_msg.get("winner") is not None

                if not game_is_over and received_msg.get("map"):
                    # Make a random move
                    move = {
                        "playerId": game_state.agentId,
                        "direction": random.choice(CONFIG["validDirections"])
                    }

                    await websocket.send(json.dumps(move))
                    print(f"Sent move: {move}")

            except websockets.exceptions.ConnectionClosed:
                print("Disconnected from WebSocket server")
                break
            except Exception as e:
                print(f"Error: {e}")
                break

def main():
    game_state = GameState()
    print(f"Starting agent with ID: {game_state.agentId}")
    asyncio.run(connect_to_game_server(game_state))

if __name__ == "__main__":
    main()