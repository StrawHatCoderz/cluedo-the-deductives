import { getPlayerId } from "../utils/game.js";

export const serveRollAndTurns = (c, randomFn, ceilFn) => {
  const game = c.get("game");
  const playerId = getPlayerId(c);

  const diceValue = game.getRolledNumber(randomFn, ceilFn);
  const turns = getReachableTiles(game, playerId, diceValue);

  return c.json({ diceValue, turns });
};

const getReachableTiles = (game, playerId, steps) => {
  const activePlayer = game.getState(playerId).activePlayer;
  const pawn = activePlayer?.pawn;

  const { x, y, room } = pawn.position;
  const position = room ? room : `tile-${x}-${y}`;

  const board = game.getBoard();
  return board.getReachableNodes(position, steps);
};

const isValidTurn = (tileId, possibleTurns) => {
  return possibleTurns.some((turn) => tileId === turn);
};

export const movePawnHanlder = async (c) => {
  const game = c.get("game");
  const { currentNodeId, turns } = await c.req.json();
  const [_, x, y] = currentNodeId.split("-");

  const [nodeId, pos] = currentNodeId.includes("-")
    ? [`tile-${x}-${y}`, { x, y, room: null }]
    : [currentNodeId, { x: null, y: null, room: currentNodeId }];
  const playerId = getPlayerId(c);
  const activePlayer = game.getState(playerId).activePlayer;
  const currentPawn = activePlayer?.pawn?.id;
  const pawn = game.getPawnInstance(currentPawn);

  if (isValidTurn(nodeId, turns)) {
    pawn.updatePosition(pos);
    return c.json({ status: true });
  }
  return c.json({ status: false });
};
