import { accuseBtnListener } from "./board.js";
import { Shimmer } from "./shimmer.js";
import { displayInitialMessage, polling } from "./utils.js";

const main = async () => {
  const shimmerELement = document.querySelector(".shimmer-overlay");
  const shimmer = new Shimmer(shimmerELement);
  shimmer.init();
  const accuseBtn = document.querySelector("#accuse-button");
  accuseBtnListener(accuseBtn);
  await displayInitialMessage();
  const playerCardsContainer = document.getElementById("players-cards-details");
  polling(playerCardsContainer);
};

globalThis.window.onload = main;
