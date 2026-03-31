export const serveRollAndTurns = (c, randomFn = Math.random) => {
  const game = c.get("game");
  const diceValue = game.getRolledNumber(randomFn);
  const turns = getReachableTurns(game, diceValue);
  return c.json({ diceValue, turns });
};

export const getReachableTurns = (game, steps) => {
  const pawnPosition = "tile-7-24";
  const board = game.getBoard();
  return board.getReachableNodes(pawnPosition, steps);
};
