import { Hono } from "hono";
import {
  createLobby,
  joinLobby,
  serveLobbyState,
} from "../handlers/lobby_handler.js";
import { parseBody } from "../middleware/parse_body.js";

export const lobbyRoutes = new Hono();

lobbyRoutes.get("/", serveLobbyState);

lobbyRoutes.post("/create", createLobby);
lobbyRoutes.post("/join", parseBody, joinLobby);
