import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import {
  movePawnHandler,
  serveGetReachableNodes,
  serveRollDice,
} from "./handlers/board_handler.js";
import {
  addSuspicion,
  getGameState,
  handleAccusation,
  startGame,
  updateGameState,
  updateTurn,
} from "./handlers/game_handler.js";
import { addMockPlayer } from "./middleware/mock_player.js";

export const createApp = ({ game, getRandom, roundUp, logger }) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });

  app.get("/game-state", getGameState);
  app.get("/get-reachable-nodes", serveGetReachableNodes);
  app.post("/update-state", updateGameState);
  app.post("/update-pawn-position", movePawnHandler);
  app.post("/pass", updateTurn);
  app.post("/add-suspicion", addSuspicion);
  app.get("*", serveStatic({ root: "./public" }));

  app.post("/roll", (c) => serveRollDice(c, getRandom, roundUp));
  app.post("/accuse", handleAccusation);
  app.post("/start-game", addMockPlayer, startGame);
  app.post("/update-state", updateGameState);
  app.post("/pass", updateTurn);

  app.put("/update-pawn-position/:pawnId", movePawnHandler);
  app.onError((e, c) => {
    console.log(e);
    return c.json({ error: e.message }, 400);
  });
  return app;
};
