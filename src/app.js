import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { etag } from "hono/etag";

import { boardRoutes } from "./routes/board_routes.js";
import { gameRoutes } from "./routes/game_routes.js";
import { lobbyRoutes } from "./routes/lobby_routes.js";
import { turnRouteCreator } from "./routes/turn_routes.js";
import { ValidationError } from "./utils/custom_errors.js";

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
  app.route("/lobby", lobbyRoutes);
  app.route("/game", gameRoutes);
  app.route("/turn", turnRouteCreator(getRandom, roundUp));
  app.route("/board", boardRoutes);

  app.get("*", serveStatic({ root: "./public" }));
  app.onError((e, c) => {
    if (e instanceof ValidationError) {
      return c.json({ success: false, error: e.message }, 400);
    }
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  });

  return app;
};
