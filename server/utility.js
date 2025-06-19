function serializeGameState(game) {
  return {
    map: game.board.map,
    players: game.players.map((player) => ({
      name: player.name,
      score: player.score,
      body: player.body,
      activeItems: player.activeItems,
      lastMoveDirection: player.lastMoveDirection,
      nextMoveDirection: player.nextMoveDirection,
    })),
    winner: game.winner,
    deathMessage: game.deathMessage,
    moveCount: game.moveCount,
  };
}

module.exports = { serializeGameState };
