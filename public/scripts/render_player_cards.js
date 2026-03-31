const createCard = (node, card) => {
  const cardName = node.querySelector(".card-name");
  cardName.textContent = card;
  cardName.classList.add("player-card");
};

export const renderPlayerCards = (playerHand) => {
  const playerCardsContainer = document.getElementById("players-cards-details");
  const cardTemplate = document.getElementById("card-template");
  if (!playerHand || playerHand.length <= 0) return;
  for (const card of playerHand) {
    const cardClone = cardTemplate.content.cloneNode(true);
    createCard(cardClone, card);
    playerCardsContainer.appendChild(cardClone);
  }
};
