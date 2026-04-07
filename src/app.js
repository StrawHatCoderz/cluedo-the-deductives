import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { etag } from "hono/etag";
import {
  movePawnHandler,
  serveGetReachableNodes,
  serveRollDice,
} from "./handlers/board_handler.js";
import {
  addSuspicion,
  confirmDisprove,
  getDisprovedCard,
  getGameState,
  handleAccusation,
  startGame,
  updateTurn,
} from "./handlers/game_handler.js";

import {
  createLobby,
  joinLobby,
  serveLobbyState,
} from "./handlers/lobby_handler.js";
import { parseBody } from "./middleware/parse_body.js";

export const createApp = ({
  lobbyController,
  gameController,
  getRandom,
  roundUp,
  logger,
}) => {
  const app = new Hono();
  app.use(logger());
  app.use(etag());

  app.use(async (c, next) => {
    c.set("gameController", gameController);
    c.set("lobbyController", lobbyController);
    await next();
  });

  app.get("/get-disproved-card", getDisprovedCard);
  app.get("/game-state", getGameState);
  app.get("/get-reachable-nodes", serveGetReachableNodes);
  app.get("/lobby", serveLobbyState);
  app.get("*", serveStatic({ root: "./public" }));

  app.post("/pass", updateTurn);
  app.post("/suspect", addSuspicion);
  app.post("/roll", (c) => serveRollDice(c, getRandom, roundUp));
  app.post("/accuse", handleAccusation);
  app.post("/start-game", startGame);
  app.post("/lobby/create", createLobby);
  app.post("/lobby/join", parseBody, joinLobby);
  app.post("/disprove", confirmDisprove);

  app.put("/update-pawn-position/:pawnId", movePawnHandler);
  app.onError((e, c) => {
    return c.json({ error: e.message }, 400);
  });
  return app;
};
