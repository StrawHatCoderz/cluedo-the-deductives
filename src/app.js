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
import { createLobby, joinLobby } from "./handlers/lobby_handler.js";
import { parseBody } from "./middleware/parse_body.js";

export const createApp = (
  { game, lobbyController, getRandom, roundUp, logger },
) => {
  const app = new Hono();
  app.use(logger());

  app.use(async (c, next) => {
    c.set("game", game);
    c.set("lobbyController", lobbyController);
    await next();
  });

  app.get("/game-state", getGameState);
  app.get("/get-reachable-nodes", serveGetReachableNodes);
  app.get("*", serveStatic({ root: "./public" }));

  app.post("/update-state", updateGameState);
  app.post("/pass", updateTurn);
  app.post("/suspect", addSuspicion);
  app.post("/roll", (c) => serveRollDice(c, getRandom, roundUp));
  app.post("/accuse", handleAccusation);
  app.post("/start-game", addMockPlayer, startGame);
  app.post("/lobby/create", createLobby);
  app.post("/lobby/join", parseBody, joinLobby);

  app.put("/update-pawn-position/:pawnId", movePawnHandler);
  app.onError((e, c) => {
    return c.json({ error: e.message }, 400);
  });
  return app;
};
