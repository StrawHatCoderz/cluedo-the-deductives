let dealtOnce = false;

const createDeck = (deckId, count) => {
  const deck = document.getElementById(deckId);
  deck.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.classList.add("deck-card");
    card.style.transform = `translate(${i * 1.5}px, ${-i * 1.5}px)`;
    deck.appendChild(card);
  }
};

const getCenter = (el) => {
  const rect = el.getBoundingClientRect();
  const tableRect = document.getElementById("table").getBoundingClientRect();
  return {
    x: rect.left - tableRect.left + rect.width / 2,
    y: rect.top - tableRect.top + rect.height / 2,
  };
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createPlayers = (numPlayers = 6) => {
  const table = document.getElementById("table");
  document.querySelectorAll(".player").forEach((p) => p.remove());

  const radius = 200;
  const centerX = 300, centerY = 250;

  for (let i = 0; i < numPlayers; i++) {
    const angle = (i / numPlayers) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const player = document.createElement("div");
    player.classList.add("player");
    player.style.left = x + "px";
    player.style.top = y + "px";
    table.appendChild(player);
  }
};

const getPlayersCenter = () => {
  const players = document.querySelectorAll(".player");
  let sumX = 0, sumY = 0;
  players.forEach((p) => {
    sumX += parseFloat(p.style.left);
    sumY += parseFloat(p.style.top);
  });

  return { x: sumX / players.length, y: sumY / players.length };
};

const animateFlyingCardToEnvelop = (flying, envelopePos, i) => {
  setTimeout(() => {
    flying.style.left = envelopePos.x + "px";
    flying.style.top = envelopePos.y + "px";
    flying.style.transform = `translate(-50%,-50%) rotate(${
      Math.random() * 20 - 10
    }deg)`;
  }, i * 400);
};

const createFlyingCard = (deckPos) => {
  const flying = document.createElement("div");
  flying.classList.add("card");
  flying.style.left = deckPos.x + "px";
  flying.style.top = deckPos.y + "px";
  document.getElementById("table").appendChild(flying);
  return flying;
};

const placeCardInEnvelop = (flying, topCard, i, envelope, decks, callback) => {
  setTimeout(() => {
    flying.remove();
    topCard.remove();
    const inside = document.createElement("div");
    inside.classList.add("deck-card");
    inside.style.width = "40px";
    inside.style.height = "60px";
    inside.style.position = "absolute";
    inside.style.left = `${i * 10 + 20}px`;
    inside.style.bottom = `${i * 5}px`;
    inside.style.transform = `rotate(${i * 5}deg)`;
    envelope.appendChild(inside);
    if (i === decks.length - 1 && callback) callback();
  }, i * 400 + 700);
};

const distributeCards = (
  allCards,
  table,
  numPlayers,
  playerElements,
  startPos,
) => {
  setTimeout(() => {
    allCards = shuffle(allCards);

    let delay = 0;
    allCards.forEach((card, i) => {
      card.classList.remove("deck-card");
      card.classList.add("card");
      table.appendChild(card);

      const playerIndex = i % numPlayers;
      const player = playerElements[playerIndex];

      const offsetX = (i / numPlayers) * 2;
      const offsetY = (i / numPlayers) * 2;

      card.style.left = startPos.x + "px";
      card.style.top = startPos.y + "px";

      moveCardToPlayerHand(card, player, offsetX, offsetY, delay);

      delay += 200;
    });
  }, 1000);
  return allCards;
};

const moveCardToPlayerHand = (card, player, offsetX, offsetY, delay) => {
  setTimeout(() => {
    card.style.left = player.style.left;
    card.style.top = player.style.top;
    card.style.transform = `translate(-50%, -50%) rotate(${
      Math.random() * 360
    }deg) translate(${offsetX}px,${offsetY}px)`;
    card.classList.add("dealt");
  }, delay);
};

const dealToEnvelope = (callback) => {
  const decks = [
    document.getElementById("deck1"),
    document.getElementById("deck2"),
    document.getElementById("deck3"),
  ];

  const envelope = document.getElementById("slot");
  const envelopePos = getCenter(document.getElementById("envelope"));

  decks.forEach((deck, i) => {
    const cards = deck.querySelectorAll(".deck-card");
    if (!cards.length) return;
    const topCard = cards[cards.length - 1];
    const deckPos = getCenter(topCard);

    const flying = createFlyingCard(deckPos);

    animateFlyingCardToEnvelop(flying, envelopePos, i);

    placeCardInEnvelop(flying, topCard, i, envelope, decks, callback);
  });
};

const collectRemainingCards = (decks) => {
  const allCards = [];
  decks.forEach((deck) => {
    deck.querySelectorAll(".deck-card").forEach((c) => {
      allCards.push(c);
      c.remove();
    });
  });

  return allCards;
};
const collectRemainingAndDeal = () => {
  const envelope = document.getElementById("envelope");
  const decks = [
    document.getElementById("deck1"),
    document.getElementById("deck2"),
    document.getElementById("deck3"),
  ];

  const table = document.getElementById("table");

  let allCards = collectRemainingCards(decks);

  const numPlayers = 6;
  createPlayers(numPlayers);
  const playerElements = document.querySelectorAll(".player");
  const startPos = getPlayersCenter();

  envelope.style.transition = "all 1s ease";
  envelope.style.bottom = "-200px";

  allCards = distributeCards(
    allCards,
    table,
    numPlayers,
    playerElements,
    startPos,
  );
};

const start = () => {
  if (dealtOnce) return;
  dealtOnce = true;
  dealToEnvelope(() => collectRemainingAndDeal());
};

createDeck("deck1", 6);
createDeck("deck2", 6);
createDeck("deck3", 9);

const redirect = async () => {
  console.log("hello");
  const res = await fetch("./board.html").then((res) => res);
  if (res.status === 200) {
    globalThis.window.location.href = "../pages/board.html";
  }
};

await start();

setTimeout(() => {
  redirect();
}, 6000);
