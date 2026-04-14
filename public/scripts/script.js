import { displayInitialMessage } from "../components/popup.js";
import { Shimmer } from "../components/shimmer.js";
import { fetchGameState } from "./api/fetch_service.js";
import { accuseBtnListener } from "./board.js";
import { clearAllPawns, setupBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { polling } from "./web-socket-connection/polling.js";

const main = async () => {
  const shimmerELement = document.querySelector(".shimmer-overlay");
  const playerCardsContainer = document.getElementById("players-cards-details");

  const { gameConfig } = await fetchGameState("/game");

  setupBoard(gameConfig);
  clearAllPawns();
  renderPlayers(gameConfig);
  renderPlayerCards(gameConfig.currentPlayer.hand, playerCardsContainer);

  const shimmer = new Shimmer(shimmerELement);
  shimmer.init();

  const accuseBtn = document.querySelector("#accuse-button");
  accuseBtnListener(accuseBtn);
  await displayInitialMessage();
  polling();
};

globalThis.window.onload = main;
