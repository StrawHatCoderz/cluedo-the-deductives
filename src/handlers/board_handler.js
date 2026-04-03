import {
  getPosition,
  isValidTurn,
  parseNode,
  toggleIsOccupied,
} from "../utils/game.js";

export const serveRollDice = (c, randomFn, ceilFn) => {
  const game = c.get("game");
  const diceValue = game.getRolledNumber(randomFn, ceilFn);
  return c.json({ diceValue });
};

export const serveGetReachableNodes = (c) => {
  const game = c.get("game");
  const activePlayer = game.getState().activePlayer;
  const pawn = activePlayer?.pawn;

  const position = getPosition(pawn);

  const steps = game.getDiceValue();
  const reachableNodes = game.getReachableNodes(position, steps);
  toggleIsOccupied(position, game);
  return c.json({ reachableNodes });
};

export const movePawnHandler = async (c) => {
  const game = c.get("game");
  const { currentNodeId, turns } = await c.req.json();
  const [nodeId, pos] = parseNode(currentNodeId);
  const activePlayer = game.getState().activePlayer;
  const currentPawn = activePlayer?.pawn?.id;
  const pawn = game.getPawnInstance(currentPawn);

  if (isValidTurn(nodeId, turns)) {
    pawn.updatePosition(pos);
    toggleIsOccupied(currentNodeId, game);
    return c.json({ status: true });
  }

  return c.json({ status: false });
};
