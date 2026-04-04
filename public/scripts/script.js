import { accuseBtnListener } from "./board.js";
import { displayInitialMessage, polling } from "./utils.js";

const main = async () => {
  const accuseBtn = document.querySelector("#accuse-button");
  accuseBtnListener(accuseBtn);
  await displayInitialMessage();
  const playerCardsContainer = document.getElementById("players-cards-details");
  polling(playerCardsContainer);
};

globalThis.window.onload = main;
