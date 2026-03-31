const getElement = (id) => document.getElementById(id);

const createDeck = (deckId, count) => {
  const deck = getElement(deckId);
  deck.innerHTML = "";
  Array.from({ length: count }).forEach((_, i) => {
    const card = document.createElement("div");
    card.className = "deck-card";
    card.style.transform = `translate(${i * 1.5}px, ${-i * 1.5}px)`;
    deck.appendChild(card);
  });
};

const getCenter = (el) => {
  const r = el.getBoundingClientRect();
  const t = getElement("table").getBoundingClientRect();
  return { x: r.left - t.left + r.width / 2, y: r.top - t.top + r.height / 2 };
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createPlayers = (num = 6) => {
  const table = getElement("table");
  document.querySelectorAll(".player").forEach((p) => p.remove());

  const r = 200, cx = 300, cy = 250;
  Array.from({ length: num }).forEach((_, i) => {
    const a = (i / num) * 2 * Math.PI;
    const p = document.createElement("div");
    p.className = "player";
    p.style.left = `${cx + r * Math.cos(a)}px`;
    p.style.top = `${cy + r * Math.sin(a)}px`;
    table.appendChild(p);
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
  el.style.top = `${pos.y}px`;
  getElement("table").appendChild(el);
  return el;
};

const animateTo = (el, pos, i, extra = "") =>
  setTimeout(() => {
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
    el.style.transform = `translate(-50%,-50%) ${extra}`;
  }, i * 400);

const placeInEnvelope = (flying, top, i, envelope, total, cb) => {
  setTimeout(() => {
    flying.remove();
    top.remove();

    const c = document.createElement("div");
    c.className = "deck-card";
    Object.assign(c.style, {
      left: `${i * 10 + 20}px`,
      bottom: `${i * 5}px`,
      transform: `rotate(${i * 5}deg)`,
    });

    envelope.appendChild(c);
    if (i === total - 1) cb?.();
  }, i * 400 + 700);
};

const moveToPlayer = (card, player, ox, oy, delay) =>
  setTimeout(() => {
    card.style.left = player.style.left;
    card.style.top = player.style.top;
    card.style.transform =
      `translate(-50%,-50%) rotate(${Math.random() * 360}deg)` +
      ` translate(${ox}px,${oy}px)`;
    card.classList.add("dealt");
  }, delay);

const distributeCards = (cards, table, players, startPos) => {
  setTimeout(() => {
    shuffle(cards).forEach((card, i) => {
      card.className = "card";
      table.appendChild(card);

      const p = players[i % players.length];
      const offset = (i / players.length) * 2;

      Object.assign(card.style, {
        left: `${startPos.x}px`,
        top: `${startPos.y}px`,
      });

      moveToPlayer(card, p, offset, offset, i * 200);
    });
  }, 1000);
};

const dealToEnvelope = (cb) => {
  const decks = ["deck1", "deck2", "deck3"].map(getElement);
  const env = getElement("slot");
  const envPos = getCenter(getElement("envelope"));

  decks.forEach((deck, i) => {
    const cards = deck.querySelectorAll(".deck-card");
    if (!cards.length) return;

    const top = cards[cards.length - 1];
    const flying = createFlyingCard(getCenter(top));

    animateTo(flying, envPos, i, `rotate(${Math.random() * 20 - 10}deg)`);
    placeInEnvelope(flying, top, i, env, decks.length, cb);
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
  const res = await fetch("./board.html");
  if (res.status === 200) globalThis.location.href = "../pages/board.html";
};

const init = async () => {
  ["deck1", "deck2", "deck3"].forEach((id, i) => createDeck(id, [6, 6, 9][i]));

  const totalPlayers = await fetch("/game-state")
    .then((res) => res.json())
    .then((x) => x.players.length)
    .catch((e) => console.log(e));

  dealToEnvelope(() => collectAndDeal(totalPlayers));
  setTimeout(redirect, 6000);
};

globalThis.onload = init;
