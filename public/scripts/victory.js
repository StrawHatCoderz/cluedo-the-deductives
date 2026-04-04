import { fetchGameConfig } from "./utils.js";

export const handleRedirectBasedOnGameState = (boardConfig) => {
  if (boardConfig.state === "finished") {
    globalThis.window.location.href = "/pages/victory.html";
  }
};

const displayWinner = (winner) => {
  const winnerNameElement = document.querySelector("#winner-name");

  winnerNameElement.textContent = winner.name;
};

globalThis.window.onload = async () => {
  const { players } = await fetchGameConfig("/game-state");
  const winner = players.find((player) => player.isWon);
  displayWinner(winner);
};
