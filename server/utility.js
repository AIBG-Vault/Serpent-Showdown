function serializeGameState(game) {
  return {
    map: game.board.map,
    players: game.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      body: player.body,
      activeModifiers: player.activeModifiers,
    })),
    winner: game.winner,
    moveCount: game.moveCount,
  };
}

module.exports = { serializeGameState };
