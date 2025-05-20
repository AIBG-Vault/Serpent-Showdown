import asyncio
import websockets
import json
import sys
import random

# Configuration
CONFIG = {
    "serverIP": "localhost",
    "serverPort": 3000,
    "defaultId": "k",
    "defaultMode": "up",
    "validModes": [
        "up",
        "down",
        "left",
        "right",
        "random",
        "timeout",
        "apple",
        "survive",
    ],
    "validDirections": ["up", "down", "left", "right"],
    "baseDelay": 0,
}


# Game state
class GameState:
    def __init__(self):
        self.agentId = sys.argv[1] if len(sys.argv) > 1 else CONFIG["defaultId"]
        self.agentMode = sys.argv[2] if len(sys.argv) > 2 else None
        self.delayBetweenMoves = CONFIG["baseDelay"]
        self.playerName = None

        # Initialize agent mode
        if not self.agentMode or self.agentMode not in CONFIG["validModes"]:
            print(
                f"Mode not provided or invalid, using default: {CONFIG['defaultMode']}"
            )
            self.agentMode = CONFIG["defaultMode"]


# Movement helpers
class MovementHelpers:
    @staticmethod
    def get_next_position(current, direction):
        moves = {
            "up": {"x": -1, "y": 0},
            "down": {"x": 1, "y": 0},
            "left": {"x": 0, "y": -1},
            "right": {"x": 0, "y": 1},
        }
        return {
            "x": current["x"] + moves[direction]["x"],
            "y": current["y"] + moves[direction]["y"],
        }

    @staticmethod
    def find_player_head(map_data, player_name):
        if not map_data or not player_name:
            return {"x": 0, "y": 0}

        for i in range(len(map_data)):
            for j in range(len(map_data[i])):
                cell = map_data[i][j]
                if (
                    cell is not None
                    and cell.get("type") == "snake-head"
                    and cell.get("playerName") == player_name
                ):
                    return {"x": i, "y": j}
        return {"x": 0, "y": 0}

    @staticmethod
    def is_within_bounds(map_data, pos):
        return (
            pos["x"] >= 0
            and pos["x"] < len(map_data)
            and pos["y"] >= 0
            and pos["y"] < len(map_data[0])
        )

    @staticmethod
    def is_cell_safe(map_data, pos):
        if not MovementHelpers.is_within_bounds(map_data, pos):
            return False
        cell = map_data[pos["x"]][pos["y"]]
        return cell is None or (
            cell["type"] != "snake-head"
            and cell["type"] != "snake-body"
            and cell["type"] != "border"
        )

    @staticmethod
    def are_adjacent_cells_safe(map_data, pos, player_name):
        if not MovementHelpers.is_within_bounds(map_data, pos):
            return False

        # Check if position is at least 1 cell away from edges
        if (
            pos["x"] <= 0
            or pos["x"] >= len(map_data) - 1
            or pos["y"] <= 0
            or pos["y"] >= len(map_data[0]) - 1
        ):
            return False

        # Check all adjacent cells
        adjacent_offsets = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        for dx, dy in adjacent_offsets:
            cell = map_data[pos["x"] + dx][pos["y"] + dy]
            if cell is not None:
                if cell["type"] == "border" or (
                    cell["type"] == "snake-head"
                    and cell.get("playerName") != player_name
                ):
                    return False
        return True


# Strategy implementations
class Strategies:
    @staticmethod
    def find_safe_direction(map_data, player_head, player_name):
        if not map_data or not player_head:
            return random.choice(CONFIG["validDirections"])

        directions = [
            {
                "direction": dir,
                "position": MovementHelpers.get_next_position(player_head, dir),
            }
            for dir in CONFIG["validDirections"]
        ]

        # Shuffle directions for unpredictability
        random.shuffle(directions)

        # Find best move: first perfectly safe, then just safe, finally random
        for move in directions:
            pos = move["position"]
            if MovementHelpers.is_cell_safe(
                map_data, pos
            ) and MovementHelpers.are_adjacent_cells_safe(map_data, pos, player_name):
                return move["direction"]

        for move in directions:
            if MovementHelpers.is_cell_safe(map_data, move["position"]):
                return move["direction"]

        return directions[0]["direction"]

    @staticmethod
    def find_closest_apple(map_data, player_head, player_name):
        if not map_data or not player_head:
            return None

        queue = [(player_head["x"], player_head["y"], [])]
        visited = set()
        max_path_length = len(map_data) * len(map_data[0])

        while queue:
            x, y, path = queue.pop(0)
            key = f"{x},{y}"

            if key in visited or len(path) > max_path_length:
                continue
            visited.add(key)

            # Found apple
            if map_data[x][y] is not None and map_data[x][y]["type"] == "apple":
                # Validate path safety
                current_pos = {"x": player_head["x"], "y": player_head["y"]}
                path_safe = True
                for move in path:
                    next_pos = MovementHelpers.get_next_position(current_pos, move)
                    if not MovementHelpers.is_cell_safe(map_data, next_pos):
                        path_safe = False
                        break
                    current_pos = next_pos

                if path_safe:
                    # Check final position safety
                    final_pos = {"x": player_head["x"], "y": player_head["y"]}
                    for move in path:
                        final_pos = MovementHelpers.get_next_position(final_pos, move)
                    if MovementHelpers.are_adjacent_cells_safe(
                        map_data, final_pos, player_name
                    ):
                        return path
                continue

            # Add safe neighbors to queue
            directions = {
                "up": (-1, 0),
                "down": (1, 0),
                "left": (0, -1),
                "right": (0, 1),
            }
            for direction, (dx, dy) in directions.items():
                new_pos = {"x": x + dx, "y": y + dy}
                if MovementHelpers.is_cell_safe(map_data, new_pos):
                    queue.append((new_pos["x"], new_pos["y"], path + [direction]))

        return None


def decide_next_move(map_data, mode, game_state):
    player_head = MovementHelpers.find_player_head(map_data, game_state.playerName)

    if mode == "timeout" or mode == "survive":
        return Strategies.find_safe_direction(
            map_data, player_head, game_state.playerName
        )
    elif mode == "apple":
        path = Strategies.find_closest_apple(
            map_data, player_head, game_state.playerName
        )
        if path and len(path) > 0:
            next_move = path[0]
            next_pos = MovementHelpers.get_next_position(player_head, next_move)
            if MovementHelpers.is_cell_safe(
                map_data, next_pos
            ) and MovementHelpers.are_adjacent_cells_safe(
                map_data, next_pos, game_state.playerName
            ):
                return next_move
        return Strategies.find_safe_direction(
            map_data, player_head, game_state.playerName
        )
    elif mode == "random":
        return random.choice(CONFIG["validDirections"])
    else:
        return mode


async def main():
    game_state = GameState()
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
                    direction = decide_next_move(
                        received_msg["map"], game_state.agentMode, game_state
                    )

                    move = {"playerId": game_state.agentId, "direction": direction}

                    await asyncio.sleep(game_state.delayBetweenMoves / 1000)
                    await websocket.send(json.dumps(move))

                    if game_state.agentMode == "timeout":
                        game_state.delayBetweenMoves += 100

            except websockets.exceptions.ConnectionClosed:
                print("Disconnected from WebSocket server")
                break
            except Exception as e:
                print(f"Error: {e}")
                break


if __name__ == "__main__":
    asyncio.run(main())
