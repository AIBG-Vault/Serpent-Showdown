import asyncio
import websockets
import json
import sys
import random
import time

# Default values
DEFAULT_AGENT_ID = "k"
VALID_DIRECTIONS = ["up", "down", "left", "right"]
VALID_MODES = ["up", "down", "left", "right", "random", "timeout"]
BASE_DELAY = 0.5  # 500ms

async def connect_to_game_server(agent_id, mode):
    uri = f"ws://localhost:3000?id={agent_id}"
    delay = BASE_DELAY

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

                # Determine move direction
                if mode == "random":
                    direction = random.choice(VALID_DIRECTIONS)
                else:
                    direction = mode

                # Prepare move
                move = {
                    "playerId": agent_id,
                    "direction": direction
                }

                # Add delay and increase if in timeout mode
                await asyncio.sleep(delay)
                if mode == "timeout":
                    delay += 0.3  # Add 300ms each move

                # Send move
                await websocket.send(json.dumps(move))
                print(f"Sent move: {move}")

        except websockets.exceptions.ConnectionClosed:
            print("Disconnected from WebSocket server")
        except Exception as e:
            print(f"Error: {e}")

def main():
    # Get command line arguments
    agent_id = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_AGENT_ID
    mode = sys.argv[2] if len(sys.argv) > 2 else "up"

    # Validate mode
    if mode not in VALID_MODES:
        print(f"Invalid mode: {mode}. Using default: up")
        mode = "up"

    print(f"Starting agent with ID: {agent_id}, Mode: {mode}")
    
    # Run the client
    asyncio.run(connect_to_game_server(agent_id, mode))

if __name__ == "__main__":
    main()