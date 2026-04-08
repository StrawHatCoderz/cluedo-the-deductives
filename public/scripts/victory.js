import { displayCardsCombination } from "./accusation_result.js";
import { fetchGameConfig } from "./utils.js";

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
  const { gameConfig } = await fetchGameConfig("/game");

  const murderCombinationContainer = document.getElementById(
    "murder-combination",
  );
  const winner = gameConfig.players.find((player) => player.isWon);
  displayWinner(winner);
  console.log(gameConfig);

  displayCardsCombination(
    gameConfig.murderCombination,
    murderCombinationContainer,
  );
};
