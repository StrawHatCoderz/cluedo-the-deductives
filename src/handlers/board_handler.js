import { getPosition, parseNode } from "../utils/game.js";

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
  const payload = await c.req.json();

  const [nodeId, pos] = parseNode(payload.newNodeId);
  const currentPawn = await c.req.param("pawnId");
  const pawn = game.getPawnInstance(+currentPawn);
  const oldPosition = getPosition(pawn?.getPawnData());
  const { status } = game.movePawn(
    currentPawn,
    payload,
    oldPosition,
    nodeId,
    pos,
  );

  return c.json({ status }, status ? 200 : 400);
};
