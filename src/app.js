import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { getGameState, startGame } from "./handlers/game.js";
import { addMockPlayer } from "./middleware/mock_player.js";
import { serveRollAndTurns } from "./handlers/board.js";

export const createApp = (game) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });

  app.get("/start-game", addMockPlayer, startGame);
  app.get("/game-state", getGameState);
  app.get("/roll-and-get-turns", (c) => serveRollAndTurns(c));
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
