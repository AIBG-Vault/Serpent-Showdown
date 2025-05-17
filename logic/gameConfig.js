// Game configuration constants
// Maximum number of moves before forcing game end. Will be set to ~1000 in production.
const GAME_MAX_MOVES = 900;
// Number of rows in the game grid (MUST BE AN ODD NUMBER). Will be set to ~25 in production.
const BOARD_NUM_OF_ROWS = 25;
// Number of columns in the game grid. Will be set to ~60 in production.
const BOARD_NUM_OF_COLUMNS = 60;
// Initial length of each player's snake. Will be set to 9 (as in AIBG 9.0) in production.
const PLAYERS_STARTING_LENGTH = 9;
// Initial score for each player. Will be set to 1000 in production.
const PLAYERS_STARTING_SCORE = 1000;

// Game rewards and penalties
const MOVEMENT_TOWARDS_CENTER_REWARD = 20; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 10; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 50; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 30; // penalty for making a move that reverses the current direction
const BODY_SEGMENT_LOSS_PENALTY = 30; // penalty per segment lost to border shrinkage

// Map shrinkage configuration
const START_SHRINKING_MAP_AFTER_MOVES = 100; // Number of moves after which the map starts shrinking. Will be set to ~100 in production.
const SHRINK_MAP_MOVE_INTERVAL = 10; // Number of moves between each shrinkage.  Will be set to 10 in production.
const MINIMUM_BOARD_SIZE = 20; // Number of columns left after which the map stops shrinking. Will be set to ~20 in production.

// Spawn a item approximately 1 in X moves. Will be set to X=~20 in production.
const MODIFIER_SPAWN_CHANCE = 1 / 10;

module.exports = {
  GAME_MAX_MOVES,
  BOARD_NUM_OF_ROWS,
  BOARD_NUM_OF_COLUMNS,
  PLAYERS_STARTING_LENGTH,
  PLAYERS_STARTING_SCORE,
  MOVEMENT_TOWARDS_CENTER_REWARD,
  MOVEMENT_AWAY_FROM_CENTER_REWARD,
  ILLEGAL_MOVE_PENALTY,
  REVERSE_DIRECTION_PENALTY,
  BODY_SEGMENT_LOSS_PENALTY,
  START_SHRINKING_MAP_AFTER_MOVES,
  SHRINK_MAP_MOVE_INTERVAL,
  MINIMUM_BOARD_SIZE,
  MODIFIER_SPAWN_CHANCE,
};
