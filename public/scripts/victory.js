import { displayCardsCombination } from "./accusation/accusation_result.js";
import { fetchGameState } from "./api/fetch_service.js";

export const handleRedirectBasedOnGameState = (boardConfig) => {
  if (boardConfig.state === "finished") {
    setTimeout(() => {
      globalThis.window.location.href = "/pages/victory.html";
    }, 3000);
  }
};

const displayWinner = (winner) => {
  const winnerNameElement = document.querySelector("#winner-name");

  winnerNameElement.textContent = winner.name;
};

globalThis.window.onload = async () => {
  const { gameConfig } = await fetchGameState("/game");

  const murderCombinationContainer = document.getElementById(
    "murder-combination",
  );
  const winner = gameConfig.players.find((player) => player.isWon);
  displayWinner(winner);

  displayCardsCombination(
    gameConfig.murderCombination,
    murderCombinationContainer,
  );
};
