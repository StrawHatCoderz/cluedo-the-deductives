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

  return c.json({ success: true, data: reachableNodes });
};

export const movePawnHandler = async (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");
  const { newNodeId } = await c.req.json();
  const pos = parseNode(newNodeId);

  gameController.movePawn(lobbyId, +playerId, newNodeId, pos);

  return c.json({ success: true });
};

export const secretPassageHandler = (c) => {
  const gameController = c.get("gameController");
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");

  gameController.useSecretPassage(+lobbyId, +playerId);

  return c.json({ success: true });
};
