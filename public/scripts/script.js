import { Shimmer } from "../components/shimmer.js";
import { accuseBtnListener } from "./board.js";
import { displayInitialMessage } from "../components/popup.js";
import { polling } from "./web-socket-connection/polling.js";

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
