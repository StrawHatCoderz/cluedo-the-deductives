import { collectAndDeal, createDeck, dealToEnvelope, redirect } from "./new.js";

const init = async () => {
  ["deck1", "deck2", "deck3"].forEach((id, i) => createDeck(id, [6, 6, 9][i]));

  const totalPlayers = await fetch("/game-state").then((res) =>
    res.json().players.length
  ).catch(() => 0);
  console.log(totalPlayers);

  dealToEnvelope(() => collectAndDeal());
  setTimeout(redirect, 6000);
};
exports.init = init;
