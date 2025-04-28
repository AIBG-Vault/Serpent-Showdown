// Game configuration constants
// Maximum number of moves before forcing game end. Will be increased to ~500 in production.
const GAME_MAX_MOVES = 500;
// Number of rows in the game grid. Will be increased to ~25 in production.
const BOARD_NUM_OF_ROWS = 11;
// Number of columns in the game grid. Will be increased to ~60 in production.
const BOARD_NUM_OF_COLUMNS = 25;
// Initial length of each player's snake. Will be increased to 9 (as in AIBG 9.0) in production.
const PLAYERS_STARTING_LENGTH = 9;
// Initial score for each player. Will be increased to 100 in production.
const PLAYERS_STARTING_SCORE = 1000;

// Game rewards and penalties
const APPLE_PICKUP_REWARD = 50; // number of points a player receives for picking up an apple
const MOVEMENT_TOWARDS_CENTER_REWARD = 20; // reward for moving towards the center of the board
const MOVEMENT_AWAY_FROM_CENTER_REWARD = 10; // reward for moving away from the center
const ILLEGAL_MOVE_PENALTY = 50; // penalty for making an illegal move (direction), can also be used for timeout
const REVERSE_DIRECTION_PENALTY = 30; // penalty for making a move that reverses the current direction
const BODY_SEGMENT_LOSS_PENALTY = 30; // penalty per segment lost to border shrinkage

// Number of moves after which the map starts shrinking.
const START_SHRINKING_MAP_AFTER_MOVES = 50;
// Number of columns left after which the map stops shrinking. Will be increased to 9 (as in AIBG 9.0) in production.
const MINIMUM_BOARD_SIZE = 15;

// Spawn a modifier approximately 1 in 10 moves
const MODIFIER_SPAWN_CHANCE = 1 / 20;

module.exports = {
  GAME_MAX_MOVES,
  BOARD_NUM_OF_ROWS,
  BOARD_NUM_OF_COLUMNS,
  PLAYERS_STARTING_LENGTH,
  PLAYERS_STARTING_SCORE,
  APPLE_PICKUP_REWARD,
  MOVEMENT_TOWARDS_CENTER_REWARD,
  MOVEMENT_AWAY_FROM_CENTER_REWARD,
  ILLEGAL_MOVE_PENALTY,
  REVERSE_DIRECTION_PENALTY,
  BODY_SEGMENT_LOSS_PENALTY,
  START_SHRINKING_MAP_AFTER_MOVES,
  MINIMUM_BOARD_SIZE,
  MODIFIER_SPAWN_CHANCE,
};
