import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  getGameState,
  getTotalPlayers,
  startGame,
  updateGameState,
} from "./handlers/game.js";
import { addMockPlayer } from "./middleware/mock_player.js";
import {
  serveRollAndTurns,
  serveUpdatePawnPosition,
} from "./handlers/board.js";

export const createApp = (game) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });

  app.post("/start-game", addMockPlayer, startGame);
  app.get("/game-state", getGameState);
  app.get("/roll-and-get-turns", (c) => serveRollAndTurns(c));
  app.get("/total-players", getTotalPlayers);
  app.post("/update-state", updateGameState);
  app.get("*", serveStatic({ root: "./public" }));
  app.post("/update-pawn-position", serveUpdatePawnPosition);
  return app;
};
