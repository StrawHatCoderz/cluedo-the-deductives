import { logger } from "hono/logger";
import { createApp } from "./src/app.js";
import {
  PAWNS,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "./src/constants/game_config.js";
import { GameController } from "./src/controllers/game_controller.js";
import { LobbyController } from "./src/controllers/lobby_controller.js";
import {
  createGameInstance,
  createLobbyInstance,
  createPawnInstances,
} from "./src/utils/game.js";

const createLobby = (id) => createLobbyInstance(id, PAWNS);
const createPawns = () => createPawnInstances(PAWNS);

const createGame = (id, pawnInstances) =>
  createGameInstance(id, pawnInstances, {
    suspects: SUSPECTS,
    weapons: WEAPONS,
    rooms: ROOMS,
  });

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;

  const lobbyController = LobbyController.create(createLobby);
  const gameController = GameController.create(createGame, createPawns);

  const app = createApp({
    getRandom: Math.random,
    roundUp: Math.ceil,
    logger,
    lobbyController,
    gameController,
  });

  Deno.serve({ port: PORT }, app.fetch);
};

main();
