import { isCurrentPlayer } from "./utils.js";

const createPlayer = (node, player, currentPlayerId) => {
  const playerNode = node.querySelector(".player");
  if (isCurrentPlayer(player.id, currentPlayerId)) {
    playerNode.setAttribute("id", "current-player");
  }

  if (player.isEliminated) {
    playerNode.classList.add("eliminated-player");
  }

  const icon = node.querySelector(".player-icon");
  icon.setAttribute("id", `${player.pawn}-icon`);

  const playerName = node.querySelector(".player-name");
  playerName.textContent = player.name;

  const playerPawn = node.querySelector(".player-pawn");
  playerPawn.textContent = player.pawn;
};

export const renderPlayers = (boardConfig) => {
  const allPlayerContainer = document.querySelector(
    "#players-details-container",
  );
  const playerTemplate = document.getElementById("player-template");

  allPlayerContainer.innerHTML = "";

  for (const player of boardConfig.players) {
    const playerClone = playerTemplate.content.cloneNode(true);

    createPlayer(playerClone, player, boardConfig.currentPlayer.id);
    allPlayerContainer.appendChild(playerClone);
  }
};
