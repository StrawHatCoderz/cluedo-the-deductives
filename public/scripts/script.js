import { diceListener } from "./board.js";
import { renderBoard } from "./render_board.js";
import { renderPlayers } from "./render_player.js";
import { fetchBoardConfig } from "./utils.js";

const main = async () => {
  const boardConfig = await fetchBoardConfig("example.url");
  const dice = document.querySelector("#dice-button");
  const p = document.querySelector(".popup > p");

  renderBoard(boardConfig);
  renderPlayers(boardConfig);
  diceListener(dice, p);
};

globalThis.window.onload = main;
