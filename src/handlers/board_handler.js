import {
  getPosition,
  isValidMove,
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

  return c.json({ reachableNodes });
};

export const movePawnHandler = async (c) => {
  const game = c.get("game");
  const { currentNodeId, tiles, isUsingSecretPassage } = await c.req.json();
  const [nodeId, pos] = parseNode(currentNodeId);
  const currentPawn = await c.req.param("pawnId");
  const pawn = game.getPawnInstance(+currentPawn);

  if (isUsingSecretPassage) game.setUsedSecretPassage();
  if (isValidMove(nodeId, tiles, game)) {
    const oldPosition = getPosition(pawn?.getPawnData());
    pawn.updatePosition(pos);
    toggleIsOccupied(oldPosition, game);
    toggleIsOccupied(currentNodeId, game);
    return c.json({ status: true });
  }

  return c.json({ status: false }, 400);
};
