export const createCard = (node, card, cardStyles = ["player-card"]) => {
  const cardImg = node.querySelector(".player-card");
  const imgName = card.split(" ").join("_");
  cardImg.src = `/images/${imgName}.jpg`;
  cardImg.alt = card;
  cardImg.classList.add(...cardStyles);
};

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
