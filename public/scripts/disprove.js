import { showResult } from "./suspicion.js";
import { displayPopup, toId } from "./utils.js";
import { createClone } from "./utils/ui_service.js";

const sendDisprovedCard = async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  await fetch("/game/disprove", {
    body: data,
    method: "post",
  });
  document.querySelector("#disproval-container")?.remove();
};

const registerListeners = (container) => {
  const form = container.querySelector("form");
  form.addEventListener("submit", sendDisprovedCard);
};

const fillDisprovalCards = (combo, cards, disprovableCards) =>
  Object.values(combo).forEach((card, i) => {
    cards[i].querySelector("input").value = card;
    const img = cards[i].querySelector("img");
    img.src = `/images/${toId(card)}.jpg`;

    if (!disprovableCards?.includes(card)) {
      cards[i].setAttribute("class", "disabled-Card");
      cards[i].querySelector("input").setAttribute("disabled", true);
    }
  });

const createDisprovePopUp = ({ currentPlayer, suspicionCombo }) => {
  const hand = currentPlayer.hand;
  const combo = {
    suspect: suspicionCombo.suspect,
    weapon: suspicionCombo.weapon,
    room: suspicionCombo.room,
  };

  const disproveBroadcastContainer = createClone("disprove-model-template");
  const disprovalContainer = disproveBroadcastContainer.querySelector(
    "#disproval-container",
  );
  const suspicionCards = disprovalContainer.querySelector(
    "form .suspicion-cards",
  );

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(disproveBroadcastContainer);

  document.body.appendChild(overlay);
  overlay.open();

  const disprovableCards = Object.values(suspicionCombo).filter((card) =>
    hand.includes(card)
  );

  const cards = suspicionCards.querySelectorAll(".dis-card");
  fillDisprovalCards(combo, cards, disprovableCards);
  registerListeners(disprovalContainer);
};

const showDisproval = async (state) => {
  const res = await fetch("/game/disprove-card");
  const data = await res.json();
  const { name } = state.players.find(
    ({ id }) => id === state.disprovablePlayer,
  );
  data.by = name;
  data.disproved = true;
  const suspicion = state.suspicionCombo;
  showResult(suspicion, data);
};

const announceSuspicion = (state) => {
  if (state.activePlayer.id === state.currentPlayer.id) return;
  const combo = {
    suspect: state.suspicionCombo.suspect,
    weapon: state.suspicionCombo.weapon,
    room: state.suspicionCombo.room,
  };

  const suspicionBroadcastContainer = createClone(
    "announce-suspicion-template",
  );

  const announceContainer = suspicionBroadcastContainer.querySelector(
    "#announce-container",
  );

  const suspicionCards = suspicionBroadcastContainer.querySelector(
    "#announce-container .suspicion-cards",
  );

  const cards = suspicionCards.querySelectorAll(".dis-card");

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(suspicionBroadcastContainer);

  document.body.appendChild(overlay);
  overlay.open();

  fillDisprovalCards(combo, cards);

  announceContainer.querySelector("h2").textContent =
    `${state.activePlayer.name} suspects`;
};

export const disproveASuspicion = (state) => {
  if (state.hasDisproved && state.activePlayer?.id === state.currentPlayer.id) {
    return showDisproval(state);
  }

  if (!state.canDisproved) {
    showResult(state.suspicionCombo, { disproved: false });
    announceSuspicion(state);
    return displayPopup("No one could disprove");
  }

  if (state.hasDisproved) {
    const { name } = state.players.find(
      ({ id }) => id === state.disprovablePlayer,
    );
    return displayPopup(`${name} has disproved`);
  }

  if (
    state.currentPlayer.id === state.disprovablePlayer &&
    !state.hasDisproved
  ) {
    return createDisprovePopUp(state);
  }

  if (!state.hasDisproved && state.activePlayer.id !== state.currentPlayer.id) {
    announceSuspicion(state);
  }
};
