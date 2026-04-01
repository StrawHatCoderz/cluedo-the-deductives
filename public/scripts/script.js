import { diceListener } from "./board.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { renderPlayerCards } from "./render_player_cards.js";
import { fetchGameConfig } from "./utils.js";

const main = async () => {
  const boardConfig = await fetchGameConfig("/game-state");

  const dice = document.querySelector("#dice-button");
  const p = document.querySelector(".popup > p");

  renderBoard(boardConfig);
  renderPlayers(boardConfig);
  renderPlayerCards(boardConfig.currentPlayer.hand);
  diceListener(dice, p);
};
globalThis.window.onload = main;
