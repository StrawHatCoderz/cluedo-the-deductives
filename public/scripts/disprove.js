import { showResult } from "./suspicion.js";
import { displayPopup } from "./utils.js";

const sendDisprovedCard = async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  await fetch("/game/disprove", {
    body: data,
    method: "post",
  });
  document.querySelector("#disproval-container").remove();
};

const registerListeners = (container, temp) => {
  const form = container.querySelector("form");
  form.addEventListener("submit", (e) => sendDisprovedCard(e, temp));
};

const createDisprovePopUp = ({ currentPlayer, suspicionCombo }) => {
  const hand = currentPlayer.hand;
  const combo = {
    suspect: suspicionCombo.suspect,
    weapon: suspicionCombo.weapon,
    room: suspicionCombo.room,
  };

  const disproveTemp = document
    .querySelector("#disprove-model")
    .content.cloneNode(true);

  const disprovableCards = Object.values(suspicionCombo).filter((card) =>
    hand.includes(card)
  );
  const cards = disproveTemp.querySelectorAll(".dis-card");
  Object.values(combo).forEach((card, i) => {
    console.log(cards[i], "==>");
    cards[i].querySelector("input").value = card;
    cards[i].querySelector("label").textContent = card;
    if (!disprovableCards.includes(card)) {
      cards[i].querySelector("input").setAttribute("disabled", true);
    }
  });
  registerListeners(disproveTemp);
  document.body.appendChild(disproveTemp);
};

const showDisproval = async (state) => {
  const res = await fetch("/game/disprove-card");
  const data = await res.json();
  const { name } = state.players.find(
    ({ id }) => id === state.disprovablePlayer,
  );
  data.by = name;

  const suspicion = state.suspicionCombo;
  showResult(suspicion, data);
};

export const disproveASuspicion = (state) => {
  if (state.hasDisproved && state.activePlayer?.id === state.currentPlayer.id) {
    showDisproval(state);
    return;
  }
  if (state.hasDisproved) {
    const { name } = state.players.find(
      ({ id }) => id === state.disprovablePlayer,
    );
    displayPopup(`${name} has disproved`);
    return;
  }
  if (state.currentPlayer.id === state.disprovablePlayer) {
    createDisprovePopUp(state);
    return;
  }
};
