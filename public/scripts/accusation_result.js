import { createCard } from "./render_player_cards.js";
import { createClone } from "./utils/ui_service.js";

const displayCardsCombination = (combination, container) => {
  const cards = Object.values(combination).map((card) => {
    const cardClone = createClone("card-template");
    createCard(cardClone, card);
    return cardClone;
  });

  container.append(...cards);
};

const displayMurderCombination = (combination, container) => {
  const cards = Object.values(combination).map((card) => {
    const cardClone = createClone("card-template");
    const matchingClass = card.isMatching ? "correct" : "incorrect";
    createCard(cardClone, card.name, ["card", matchingClass]);
    return cardClone;
  });

  container.append(...cards);
};

const matchCards = (accusingCombination, murderCombination) => {
  const accusedCards = Object.values(accusingCombination);
  const murderCards = Object.values(murderCombination);

  return murderCards.map((card) => ({
    name: card,
    isMatching: accusedCards.includes(card),
  }));
};

const renderAccusationCards = (accusationDetails, currentPlayer) => {
  const container = document.querySelector(
    "#accusation-result-combination",
  );

  container.innerHTML = "";

  const isSelf = currentPlayer.id === accusationDetails.accusedBy.id;

  if (isSelf) {
    const murderCombination = matchCards(
      accusationDetails.accusationCombo,
      accusationDetails.murderCombination,
    );
    displayMurderCombination(murderCombination, container);
  } else {
    displayCardsCombination(accusationDetails.accusationCombo, container);
  }
};

const renderAccusationStatus = ({ isCorrect, accusedBy }, currentPlayer) => {
  const el = document.querySelector("#accusation-status");

  const isSelf = currentPlayer.id === accusedBy.id;

  if (isSelf) {
    el.textContent = isCorrect ? "You won the game" : "You lost the game";
  } else {
    const name = accusedBy.name;

    el.textContent = isCorrect
      ? `Player ${name} won the game`
      : `Player ${name} lost the game`;
  }
};

export const renderAccusationResult = (
  { accusationDetails, currentPlayer },
) => {
  const accusationForm = createClone("accusation-info-template");

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(accusationForm);

  document.body.appendChild(overlay);
  overlay.open();

  renderAccusationStatus(accusationDetails, currentPlayer);
  renderAccusationCards(accusationDetails, currentPlayer);
};
