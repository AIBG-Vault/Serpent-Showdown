function serializeGameState(game) {
  return {
    map: game.board.map,
    players: game.players.map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      body: player.body,
      activeItems: player.activeItems,
    })),
    winner: game.winner,
    moveCount: game.moveCount,
  };
}

module.exports = { serializeGameState };
