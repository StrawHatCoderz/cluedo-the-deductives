import { accuseBtnListener } from "./board.js";
import { renderActions } from "./board.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { suspicionBtnListener } from "./suspicion.js";
import { displayPopup, fetchGameConfig } from "./utils.js";

const main = async () => {
  const boardConfig = await fetchGameConfig("/game-state");
  const accuseBtn = document.querySelector("#accuse-button");

  accuseBtnListener(accuseBtn);

  const alreadyShown = sessionStorage.getItem("gameStartedPopup");

  if (boardConfig.state === "running" && !alreadyShown) {
    displayPopup("Game has started!");
    sessionStorage.setItem("gameStartedPopup", "true");
  }

  const playerCardsContainer = document.getElementById("players-cards-details");

  setInterval(() => {
    fetchGameConfig("/game-state")
      .then((boardConfig) => {
        renderBoard(boardConfig);
        renderPlayers(boardConfig);
        renderPlayerCards(boardConfig.currentPlayer.hand, playerCardsContainer);
        renderActions(boardConfig);
        suspicionBtnListener(boardConfig);
      });
  }, 1000);
};

globalThis.window.onload = main;
