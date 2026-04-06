import { logger } from "hono/logger";
import { createApp } from "./src/app.js";
import { createGameInstance } from "./src/utils/game.js";
import { LobbyController } from "./src/controllers/lobby_controller.js";
import { Lobby } from "./src/models/lobby.js";
import { PAWNS } from "./src/constants/game_config.js";
import { shuffle } from "@std/random";

const sendPawn = () =>
  shuffle(PAWNS.map(({ name, color }) => ({
    name,
    color,
  })));

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;
  const game = createGameInstance();

  const createLobby = (id) => new Lobby(id, 6, 3, sendPawn());
  const lobbyController = LobbyController.createInstance(createLobby);
  const app = createApp({
    game,
    getRandom: Math.random,
    roundUp: Math.ceil,
    logger,
    lobbyController,
  });
  Deno.serve({ port: PORT }, app.fetch);
};

main();
