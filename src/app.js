import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { movePawnHanlder, serveRollAndTurns } from "./handlers/board.js";
import {
  getGameState,
  startGame,
  updateGameState,
  updateTurn,
} from "./handlers/game.js";
import { addMockPlayer } from "./middleware/mock_player.js";

export const createApp = ({ game, randomFn, ceilFn, logger }) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });

  app.post("/start-game", addMockPlayer, startGame);
  app.get("/game-state", getGameState);

  app.get("/roll-and-get-turns", (c) => serveRollAndTurns(c, randomFn, ceilFn));
  app.post("/update-state", updateGameState);
  app.post("/update-pawn-position", movePawnHanlder);
  app.post("/pass", updateTurn);
  app.get("*", serveStatic({ root: "./public" }));

  app.onError((e, c) => {
    return c.json({ error: e.message }, 400);
  });
  return app;
};
