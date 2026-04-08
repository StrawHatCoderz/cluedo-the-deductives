import { createClone } from "./utils/ui_service.js";

const createCard = (card) => {
  const el = document.createElement("div");
  el.className = "card";

  el.textContent = card.name ?? card;

  return el;
};

const renderAccusationCards = (
  accusationDetails,
  currentPlayer,
  activePlayer,
) => {
  const container = document.querySelector(
    "#accusation-result-combination",
  );

  container.innerHTML = "";

  const isSelf = currentPlayer.id === activePlayer.id;

  const combination = isSelf
    ? accusationDetails.murderCombination
    : accusationDetails.accusationCombo;

  if (!combination) return;

  combination.forEach((card) => {
    container.appendChild(createCard(card));
  });
};

const renderAccusationStatus = (
  isCorrect,
  currentPlayer,
  activePlayer,
) => {
  const el = document.querySelector("#accusation-status");

  const isSelf = currentPlayer.id === activePlayer.id;

  if (isSelf) {
    el.textContent = isCorrect ? "You won the game" : "You lost the game";
  } else {
    const name = activePlayer.name;

    el.textContent = isCorrect
      ? `Player ${name} won the game`
      : `Player ${name} lost the game`;
  }
};

export const renderAccusationResult = (
  { accusationDetails, currentPlayer, activePlayer },
) => {
  const accusationForm = createClone("accusation-info-template");

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(accusationForm);

  document.body.appendChild(overlay);
  overlay.open();

  renderAccusationStatus(
    accusationDetails.isCorrect,
    currentPlayer,
    activePlayer,
  );

  renderAccusationCards(accusationDetails, currentPlayer, activePlayer);
};
