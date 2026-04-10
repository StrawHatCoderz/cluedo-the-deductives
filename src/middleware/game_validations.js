import { getCookie } from "hono/cookie";
import { ValidationError } from "../utils/custom_errors.js";

export const isRollAllowed = (c, next, parseCookie = getCookie) => {
  const lobbyId = parseCookie(c, "lobbyId");
  const playerId = +parseCookie(c, "playerId");
  const gameController = c.get("gameController");

  if (!gameController.isValidLobby(lobbyId)) {
    throw new ValidationError(`${lobbyId}: invalid lobby id`);
  }
  if (!gameController.isRollAllowed(lobbyId, playerId)) {
    throw new ValidationError(`${playerId}: invalid player id`);
  }
  return next();
};

export const isAllowedToDisprove = (c, next, parseCookie = getCookie) => {
  const lobbyId = parseCookie(c, "lobbyId");
  const playerId = +parseCookie(c, "playerId");
  const gameController = c.get("gameController");
  if (!gameController.isValidLobby(lobbyId)) {
    throw new ValidationError(`${lobbyId}: invalid lobby id`);
  }
  if (!gameController.hasSuspected(lobbyId)) {
    throw new ValidationError(`Invalid game state`);
  }
  if (gameController.getDisprovablePlayer(lobbyId) !== playerId) {
    throw new ValidationError(`${playerId}: Invalid player Id`);
  }
  return next();
};

export const restrictNonActivePlayer = (c, next) => {
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = +getCookie(c, "playerId");
  const gameController = c.get("gameController");
  const activePlayer = gameController.getActivePlayer(lobbyId);

  if (activePlayer.getPlayerData().id !== playerId) {
    return c.json(
      { success: false, error: "Only Active Player Can Perform Action" },
      400,
    );
  }

  return next();
};

export const isAllowedToGetDisprovedCard = (
  c,
  next,
  parseCookie = getCookie,
) => {
  const lobbyId = parseCookie(c, "lobbyId");
  const playerId = +parseCookie(c, "playerId");
  const controller = c.get("gameController");
  const { hasDisproved, activePlayer } = controller.getGameState(
    lobbyId,
    playerId,
  );
  if (!controller.isValidLobby(lobbyId)) {
    throw new ValidationError(`${lobbyId}: invalid lobby id`);
  }
  if (!(activePlayer.id === playerId && hasDisproved)) {
    throw new ValidationError(`${playerId}: invalid gameState or playerId`);
  }
  return next();
};
