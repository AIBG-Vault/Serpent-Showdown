import asyncio
import websockets
import json
import sys
import random

# Configuration
DEFAULT_AGENT_ID = "l"
VALID_DIRECTIONS = ["up", "down", "left", "right"]

async def connect_to_game_server(agent_id):
    uri = f"ws://localhost:3000?id={agent_id}"

    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")
        
        # Receive initial response
        response = await websocket.recv()
        print(f"Initial server response: {response}")

        try:
            while True:
                # Receive game state
                message = await websocket.recv()
                game_state = json.loads(message)
                print(f"Received game state: {game_state}")

                # Check if game is over
                if game_state.get('winner') is not None:
                    print("Game over!")
                    break

                # Make a random move
                move = {
                    "playerId": agent_id,
                    "direction": random.choice(VALID_DIRECTIONS)
                }

                # Send move
                await websocket.send(json.dumps(move))
                print(f"Sent move: {move}")

        except websockets.exceptions.ConnectionClosed:
            print("Disconnected from WebSocket server")
        except Exception as e:
            print(f"Error: {e}")

def main():
    # Get agent ID from command line or use default
    agent_id = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_AGENT_ID
    print(f"Starting agent with ID: {agent_id}")
    
    # Run the client
    asyncio.run(connect_to_game_server(agent_id))

if __name__ == "__main__":
    main()