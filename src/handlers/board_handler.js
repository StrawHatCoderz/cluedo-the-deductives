import { getCookie } from "hono/cookie";
import { getPosition, parseNode } from "../utils/game.js";

export const serveRollDice = (c, randomFn, ceilFn) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");

  const diceValues = gameController.rollDice(lobbyId, randomFn, ceilFn);
  return c.json({ diceValues });
};

export const serveGetReachableNodes = (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  const activePlayer =
    gameController.getGameState(lobbyId, playerId).activePlayer;
  const pawn = activePlayer?.pawn;
  const position = getPosition(pawn);
  const steps = gameController.getDiceValue(lobbyId);
  const reachableNodes = gameController
    .getReachableNodes(lobbyId, position, steps[0] + steps[1]);

  return c.json({ reachableNodes });
};

export const movePawnHandler = async (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");

  const payload = await c.req.json();

  const [nodeId, pos] = parseNode(payload.newNodeId);
  const pawnId = await c.req.param("pawnId");

  const { status } = gameController.movePawn(
    lobbyId,
    +pawnId,
    payload,
    nodeId,
    pos,
  );

  return c.json({ status }, status ? 200 : 400);
};

export const secretPassageHandler = (c) => {
  try {
    const gameController = c.get("gameController");
    const lobbyId = getCookie(c, "lobbyId");
    const playerId = getCookie(c, "playerId");

    gameController.useSecretPassage(+lobbyId, +playerId);

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: error.message });
  }
};
