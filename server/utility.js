function reformatGameState(game) {
  // Handle winner determination
  const winnerName = determineWinnerName(game.winner, game.players);

  // Construct game state object
  const gameState = {
    map: game.map,
    players: game.players,
    winner: winnerName,
    moveCounter: game.internalMoveCounter,
  };

  return gameState;
}

function determineWinnerName(winnerId, players) {
  if (!winnerId) return null;
  if (winnerId === -1) return -1;

  const winningPlayer = players.find((player) => player.id === winnerId);
  return winningPlayer?.name || `Player ${winnerId}`;
}

module.exports = {
  reformatGameState,
};
