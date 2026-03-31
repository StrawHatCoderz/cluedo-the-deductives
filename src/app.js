import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
import { serveDiceValue } from "./handlers/board.js";

export const createApp = (game) => {
  const app = new Hono();
  app.use(logger());
  app.use(async (c, next) => {
    c.set("game", game);
    await next();
  });
  app.get("/get-dice-value", (c) => serveDiceValue(c));
  app.get("*", serveStatic({ root: "./public" }));
  return app;
};
