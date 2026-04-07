import { Hono } from "hono";
import {
  movePawnHandler,
  serveGetReachableNodes,
} from "../handlers/board_handler.js";

export const boardRoutes = new Hono();

boardRoutes.put("/update-pawn-position/:pawnId", movePawnHandler);
boardRoutes.get("/reachable-nodes", serveGetReachableNodes);
