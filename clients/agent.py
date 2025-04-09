import asyncio
import websockets
import json
import sys
import random
import time

# Default values
DEFAULT_AGENT_ID = "k"
VALID_DIRECTIONS = ["up", "down", "left", "right"]
VALID_MODES = ["up", "down", "left", "right", "random", "timeout", "apple", "survive"]
BASE_DELAY = 0.5  # 500ms

# Add helper functions for apple and survive modes
def find_player_head(game_map, player_symbol):
    for i in range(len(game_map)):
        for j in range(len(game_map[i])):
            if game_map[i][j] == player_symbol:
                return {"x": i, "y": j}
    return {"x": 0, "y": 0}

def is_safe_move(game_map, pos):
    if (pos["x"] < 0 or pos["x"] >= len(game_map) or 
        pos["y"] < 0 or pos["y"] >= len(game_map[0])):
        return False
    cell = game_map[pos["x"]][pos["y"]]
    return cell is None or cell == "A"

def find_safe_direction(game_map, player_head):
    directions = [
        {"dx": -1, "dy": 0, "move": "up"},
        {"dx": 1, "dy": 0, "move": "down"},
        {"dx": 0, "dy": -1, "move": "left"},
        {"dx": 0, "dy": 1, "move": "right"}
    ]
    random.shuffle(directions)

    for direction in directions:
        new_pos = {
            "x": player_head["x"] + direction["dx"],
            "y": player_head["y"] + direction["dy"]
        }
        if is_safe_move(game_map, new_pos):
            return direction["move"]
    
    return random.choice(VALID_DIRECTIONS)

def find_closest_apple(game_map, player_head):
    rows, cols = len(game_map), len(game_map[0])
    queue = [(player_head["x"], player_head["y"], [])]
    visited = set()

    while queue:
        x, y, path = queue.pop(0)
        key = f"{x},{y}"

        if key in visited:
            continue
        visited.add(key)

        if game_map[x][y] == "A":
            return path

        directions = [
            {"dx": -1, "dy": 0, "move": "up"},
            {"dx": 1, "dy": 0, "move": "down"},
            {"dx": 0, "dy": -1, "move": "left"},
            {"dx": 0, "dy": 1, "move": "right"}
        ]

        for direction in directions:
            new_x = x + direction["dx"]
            new_y = y + direction["dy"]

            if new_x < 0 or new_x >= rows or new_y < 0 or new_y >= cols:
                continue

            cell = game_map[new_x][new_y]
            if (cell is not None and cell != "A" and 
                (cell.lower() == "k" or cell.lower() == "l")):
                continue

            queue.append((new_x, new_y, path + [direction["move"]]))
    
    return None

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

                # Enhanced move determination
                direction = mode
                if game_state.get('map'):
                    player_head = find_player_head(game_state['map'], agent_id.upper())
                    
                    if mode == "survive":
                        direction = find_safe_direction(game_state['map'], player_head)
                    elif mode == "apple":
                        path = find_closest_apple(game_state['map'], player_head)
                        if path and path[0]:
                            next_pos = {
                                "x": player_head["x"],
                                "y": player_head["y"]
                            }
                            if path[0] == "up": next_pos["x"] -= 1
                            elif path[0] == "down": next_pos["x"] += 1
                            elif path[0] == "left": next_pos["y"] -= 1
                            elif path[0] == "right": next_pos["y"] += 1
                            
                            direction = path[0] if is_safe_move(game_state['map'], next_pos) else find_safe_direction(game_state['map'], player_head)
                        else:
                            direction = find_safe_direction(game_state['map'], player_head)
                    elif mode == "random":
                        direction = random.choice(VALID_DIRECTIONS)

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