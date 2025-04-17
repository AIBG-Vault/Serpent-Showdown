import asyncio
import websockets
import json
import sys
import random

# Configuration
DEFAULT_AGENT_ID = "l"
VALID_DIRECTIONS = ["up", "down", "left", "right"]

# Add after the existing configuration
# Configuration section
previous_opponent_head = None
previous_opponent_body = None
last_opponent_move = "right"  # Set default first move

async def connect_to_game_server(agent_id):
    uri = f"ws://localhost:3000?id={agent_id}"
    global last_opponent_move, previous_opponent_head, previous_opponent_body

    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket server")
        
        # Receive initial response
        response = await websocket.recv()
        print(f"Initial server response: {response}")

        try:
            while True:
                message = await websocket.recv()
                game_state = json.loads(message)
                
                # Track opponent's move by analyzing map changes
                if game_state.get('map'):
                    opponent_id = 'k' if agent_id.lower() == 'l' else 'l'
                    current_head_pos = None
                    
                    for i in range(len(game_state['map'])):
                        for j in range(len(game_state['map'][i])):
                            if game_state['map'][i][j] == opponent_id.upper():
                                current_head_pos = (i, j)
                                break
                        if current_head_pos:
                            break
                    
                    if current_head_pos and previous_opponent_head:
                        # Determine direction based on head movement
                        dx = current_head_pos[0] - previous_opponent_head[0]
                        dy = current_head_pos[1] - previous_opponent_head[1]
                        
                        if dx == 1: last_opponent_move = "down"
                        elif dx == -1: last_opponent_move = "up"
                        elif dy == 1: last_opponent_move = "right"
                        elif dy == -1: last_opponent_move = "left"
                    
                    previous_opponent_head = current_head_pos

                # Make move based on opponent's last move
                move = {
                    "playerId": agent_id,
                    "direction": last_opponent_move or random.choice(VALID_DIRECTIONS)
                }

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