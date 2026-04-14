import { createCard } from "./utils/ui.js";

export const renderPlayerCards = (playerHand, handContainer) => {
  const cardTemplate = document.getElementById("card-template");
  if (!playerHand || playerHand.length <= 0) return;
  handContainer.replaceChildren();
  for (const card of playerHand) {
    const cardClone = cardTemplate.content.cloneNode(true);
    createCard(cardClone, card);
    handContainer.appendChild(cardClone);
  }
};
