import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import {
  getGameState,
  getTotalPlayers,
  startGame,
  updateGameState,
  updateTurn,
} from "./handlers/game.js";
import { addMockPlayer } from "./middleware/mock_player.js";
import {
  serveRollAndTurns,
  serveUpdatePawnPosition,
} from "./handlers/board.js";

export const createApp = (game, randomFn, ceilFn, logFn = logger) => {
  const app = new Hono();
  app.use(logFn());

  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });

  app.post("/start-game", addMockPlayer, startGame);
  app.get("/game-state", getGameState);
  app.get("/roll-and-get-turns", (c) => serveRollAndTurns(c, randomFn, ceilFn));
  app.get("/total-players", getTotalPlayers);
  app.post("/update-state", updateGameState);
  app.post("/update-pawn-position", serveUpdatePawnPosition);
  app.post("/pass", updateTurn);
  app.get("*", serveStatic({ root: "./public" }));

  app.onError((e, c) => {
    return c.json({ error: e.message }, 400);
  });
  return app;
};
