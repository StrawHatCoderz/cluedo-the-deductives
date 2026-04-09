import { Hono } from "hono";
import {
  confirmDisprove,
  getDisprovedCard,
  getGameState,
  startGame,
} from "../handlers/game_handler.js";
import { getCookie } from "hono/cookie";

const isAllowedToDisprove = async (c, next) => {
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

export const gameRoutes = new Hono();

gameRoutes.get("/", getGameState);
gameRoutes.post("/start", startGame);
gameRoutes.get("/disprove-card", getDisprovedCard);
gameRoutes.post("/disprove", isAllowedToDisprove, confirmDisprove); // only disprovable player
