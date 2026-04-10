import { Hono } from "hono";
import { serveRollDice } from "../handlers/board_handler.js";
import {
  addSuspicion,
  handleAccusation,
  updateTurn,
} from "../handlers/game_handler.js";
import {
  isRollAllowed,
  restrictNonActivePlayer,
} from "../middleware/game_validations.js";

export const turnRouteCreator = (getRandom, roundUp) => {
  const turnRoutes = new Hono();

  turnRoutes.post("/suspect", addSuspicion);
  turnRoutes.post("/pass", restrictNonActivePlayer, updateTurn);
  turnRoutes.post("/accuse", handleAccusation);
  turnRoutes.post(
    "/roll",
    isRollAllowed,
    (c) => serveRollDice(c, getRandom, roundUp),
  );

  return turnRoutes;
};
