import { getCookie } from "hono/cookie";

export const isAllowedToDisprove = async (c, next) => {
  const lobbyId = getCookie(c, "lobbyId");
  const playerId = getCookie(c, "playerId");
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
