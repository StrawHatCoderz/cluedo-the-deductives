import { Hono } from "hono";
import {
  confirmDisprove,
  getDisprovedCard,
  getGameState,
  startGame,
} from "../handlers/game_handler.js";
import { isAllowedToDisprove } from "../middleware/game_validations.js";

export const gameRoutes = new Hono();

gameRoutes.get("/", getGameState);
gameRoutes.post("/start", startGame);
gameRoutes.get("/disprove-card", getDisprovedCard);
gameRoutes.post("/disprove", isAllowedToDisprove, confirmDisprove);
