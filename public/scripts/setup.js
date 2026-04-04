const getElement = (id) => document.getElementById(id);

const createDeck = (deckId, count) => {
  const deck = getElement(deckId);
  deck.innerHTML = "";
  Array.from({ length: count }).forEach((_, i) => {
    const card = document.createElement("div");
    card.className = "deck-card";
    card.style.transform = `translate(${i * 1.5}px, ${-i * 1.5}px)`;
    card.textContent = "Cluedo";
    deck.appendChild(card);
  });
};

const getCenter = (el) => {
  const elPosition = el.getBoundingClientRect();
  const tablePosition = getElement("table").getBoundingClientRect();
  return {
    x: elPosition.left - tablePosition.left + elPosition.width / 2,
    y: elPosition.top - tablePosition.top + elPosition.height / 2,
  };
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const createPlayers = (num = 6) => {
  const table = getElement("table");
  document.querySelectorAll(".player").forEach((p) => p.remove());

  const radius = 300,
    cx = 300,
    cy = 250;
  Array.from({ length: num }).forEach((_, i) => {
    const angle = (i / num) * 2 * Math.PI;
    const playerElement = document.createElement("div");
    playerElement.className = "player";
    playerElement.style.left = `${cx + radius * Math.cos(angle)}px`;
    playerElement.style.top = `${cy + radius * Math.sin(angle)}px`;
    table.appendChild(playerElement);
  });
};

const getPlayersCenter = () => {
  const players = [...document.querySelectorAll(".player")];
  const { x, y } = players.reduce(
    (acc, p) => ({
      x: acc.x + parseFloat(p.style.left),
      y: acc.y + parseFloat(p.style.top),
    }),
    { x: 0, y: 0 },
  );
  return { x: x / players.length, y: y / players.length };
};

const createFlyingCard = (pos) => {
  const el = document.createElement("div");
  el.className = "card";
  el.style.left = `${pos.x}px`;
  el.textContent = "Cluedo";
  el.style.top = `${pos.y}px`;
  el.style.transform = "translate(-50%, -50%) scale(0.9)";
  getElement("table").appendChild(el);
  return el;
};

const animateTo = (el, pos, deckIndex, extra = "") =>
  setTimeout(() => {
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
    el.style.transform = `translate(-50%,-50%) scale(1) ${extra}`;
  }, deckIndex * 400);

const placeInEnvelope = (flying, top, deckIndex, envelope, total, cb) => {
  setTimeout(
    () => {
      flying.remove();
      top.remove();

      const card = document.createElement("div");
      card.className = "deck-card";
      card.textContent = "Cluedo";
      Object.assign(card.style, {
        left: `${deckIndex * 10 + 20}px`,
        bottom: `${deckIndex * 5}px`,
        transform: `rotate(${deckIndex * 5}deg)`,
      });

      envelope.appendChild(card);
      if (deckIndex === total - 1) cb?.();
    },
    deckIndex * 400 + 700,
  );
};

const moveToPlayer = (card, player, ox, oy, delay) =>
  setTimeout(() => {
    const rot = Math.random() * 40 - 20;

    card.style.setProperty("--rot", `${rot}deg`);

    card.style.left = player.style.left;
    card.style.top = player.style.top;

    card.style.transform =
      `translate(-50%,-50%) rotate(${rot}deg) translate(${ox}px,${oy}px)`;

    card.classList.add("dealt");
  }, delay);

const distributeCards = (cards, table, players, startPos) => {
  setTimeout(() => {
    shuffle(cards).forEach((card, i) => {
      card.className = "card";
      table.appendChild(card);

      const player = players[i % players.length];
      const offset = (i / players.length) * 2;

      Object.assign(card.style, {
        left: `${startPos.x}px`,
        top: `${startPos.y}px`,
      });

      moveToPlayer(card, player, offset, offset, i * 200);
    });
  }, 1000);
};

const dealToEnvelope = (cb) => {
  const decks = ["deck1", "deck2", "deck3"].map(getElement);
  const env = getElement("slot");
  const envPos = getCenter(getElement("envelope"));

  decks.forEach((deck, index) => {
    const cards = deck.querySelectorAll(".deck-card");
    if (!cards.length) return;

    const top = cards[cards.length - 1];
    const flying = createFlyingCard(getCenter(top));

    animateTo(flying, envPos, index, `rotate(${Math.random() * 20 - 10}deg)`);
    placeInEnvelope(flying, top, index, env, decks.length, cb);
  });
};

const collectCards = (decks) =>
  decks.flatMap((d) => {
    const cards = [...d.querySelectorAll(".deck-card")];
    cards.forEach((c) => c.remove());
    return cards;
  });

const collectAndDeal = (totalPlayers) => {
  const decks = ["deck1", "deck2", "deck3"].map(getElement);
  const table = getElement("table");
  const env = getElement("envelope");

  const cards = collectCards(decks);
  createPlayers(totalPlayers);

  const players = [...document.querySelectorAll(".player")];
  const start = getPlayersCenter();

  env.style.transition = "all 1s ease";
  env.style.bottom = "-200px";

  distributeCards(cards, table, players, start);
};

const redirect = async () => {
  const { state } = await fetch("/update-state", { method: "post" })
    .then((res) => res.json())
    .catch(() => {});
  if (state === "running") {
    globalThis.location.href = "../pages/board.html";
  }
};

const init = async () => {
  ["deck1", "deck2", "deck3"].forEach((id, i) => createDeck(id, [6, 6, 9][i]));

  const totalPlayers = await fetch("/game-state")
    .then((res) => res.json())
    .then((x) => x.players.length);

  dealToEnvelope(() => collectAndDeal(totalPlayers));
  setTimeout(redirect, 7000);
};

globalThis.onload = init;
