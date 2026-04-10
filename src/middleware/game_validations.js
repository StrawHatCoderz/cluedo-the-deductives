import { getCookie } from "hono/cookie";
import { ValidationError } from "../utils/custom_errors.js";

export const isRollAllowed = async (c, next) => {
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = +getCookie(c, "playerId");
  const gameController = c.get("gameController");

  if (!gameController.isValidLobby(lobbyId)) {
    throw new ValidationError(`${lobbyId}: invalid lobby id`);
  }
  if (!gameController.isRollAllowed(lobbyId, playerId)) {
    throw new ValidationError(`${playerId}: invalid player id`);
  }
  await next();
};

export const isAllowedToDisprove = async (c, next) => {
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = +getCookie(c, "playerId");
  const gameController = c.get("gameController");
  if (!gameController.hasSuspected(lobbyId)) {
    return c.json({ success: false, error: "Invalid game state" }, 400);
  }
  if (gameController.getDisprovablePlayer(lobbyId) !== playerId) {
    return c.json(
      { success: false, error: `${playerId}: Invalid player Id` },
      400,
    );
  }
  await next();
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
