export const serveRollAndTurns = (c, randomFn, ceilFn) => {
  const game = c.get("game");
  const diceValue = game.getRolledNumber(randomFn, ceilFn);
  const turns = getReachableTurns(game, diceValue);
  return c.json({ diceValue, turns });
};

const getReachableTurns = (game, steps) => {
  const currentPlayer = game.getCurrentState().currentPlayer;
  const currentPawn = currentPlayer?.pawn?.id;
  const pawn = game.getPawnInstance(currentPawn);

  const { x, y, room } = pawn.get().position;
  const position = room ? room : `tile-${x}-${y}`;

  const board = game.getBoard();
  return board.getReachableNodes(position, steps);
};

const isValidTurn = (tileId, possibleTurns) => {
  return possibleTurns.some((turn) => tileId === turn);
};

export const serveUpdatePawnPosition = async (c) => {
  const game = c.get("game");
  const { currentNodeId, turns } = await c.req.json();
  const [_, x, y] = currentNodeId.split("-");

  const [nodeId, pos] = currentNodeId.includes("-")
    ? [`tile-${x}-${y}`, { x, y, room: null }]
    : [currentNodeId, { x: null, y: null, room: currentNodeId }];
  const currentPlayer = game.getCurrentState().currentPlayer;
  const currentPawn = currentPlayer?.pawn?.id;
  const pawn = game.getPawnInstance(currentPawn);

  if (isValidTurn(nodeId, turns)) {
    pawn.updatePosition(pos);
    return c.json({ status: true });
  }
  return c.json({ status: false });
};
