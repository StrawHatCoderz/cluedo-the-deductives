import { accuseBtnListener, diceListener, passBtnListener } from "./board.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { suspicionBtnListener } from "./suspicion.js";
import { displayPopup, fetchGameConfig } from "./utils.js";

const main = async () => {
  const boardConfig = await fetchGameConfig("/game-state");
  const dice = document.querySelector("#dice-button");
  const passBtn = document.querySelector("#pass-button");
  const accuseBtn = document.querySelector("#accuse-button");

  renderBoard(boardConfig);
  renderPlayers(boardConfig);
  renderPlayerCards(boardConfig.currentPlayer.hand);
  diceListener(dice);
  passBtnListener(passBtn);
  suspicionBtnListener();
  accuseBtnListener(accuseBtn);

  const alreadyShown = sessionStorage.getItem("gameStartedPopup");

  if (boardConfig.state === "running" && !alreadyShown) {
    displayPopup("Game has started!");
    sessionStorage.setItem("gameStartedPopup", "true");
  }
};

globalThis.window.onload = main;
