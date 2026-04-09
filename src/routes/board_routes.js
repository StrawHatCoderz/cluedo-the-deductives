import { Hono } from "hono";
import {
  movePawnHandler,
  secretPassageHandler,
  serveGetReachableNodes,
} from "../handlers/board_handler.js";

export const boardRoutes = new Hono();

boardRoutes.put("/update-pawn-position/:pawnId", movePawnHandler);
boardRoutes.put("/secret-passage", secretPassageHandler);
boardRoutes.get("/reachable-nodes", serveGetReachableNodes);
