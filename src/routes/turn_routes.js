import { Hono } from "hono";
import { serveRollDice } from "../handlers/board_handler.js";
import {
  addSuspicion,
  handleAccusation,
  updateTurn,
} from "../handlers/game_handler.js";

export const turnRouteCreator = (getRandom, roundUp) => {
  const turnRoutes = new Hono();

  turnRoutes.post("/suspect", addSuspicion);
  turnRoutes.post("/pass", updateTurn);
  turnRoutes.post("/accuse", handleAccusation);
  turnRoutes.post("/roll", (c) => serveRollDice(c, getRandom, roundUp));

  return turnRoutes;
};
