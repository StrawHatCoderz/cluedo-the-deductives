import { fetchGameState } from "./api/fetch_service.js";
import { setupGame } from "./render_board.js";
import { polling } from "./web-socket-connection/polling.js";

const main = async () => {
  const { gameConfig } = await fetchGameState("/game");
  await setupGame(gameConfig);
  polling();
};

globalThis.window.onload = main;
