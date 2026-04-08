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

const setValues = (combo, cards, disprovableCards) =>
  Object.values(combo).forEach((card, i) => {
    cards[i].querySelector("input").value = card;
    cards[i].querySelector("label").textContent = card;
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

  const disproveTemp = document
    .querySelector("#disprove-model")
    .content.cloneNode(true);

  const disprovableCards = Object.values(suspicionCombo).filter((card) =>
    hand.includes(card)
  );
  const cards = disproveTemp.querySelectorAll(".dis-card");
  setValues(combo, cards, disprovableCards);
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

  const announceTemp = document
    .querySelector("#announce-suspicion")
    .content.cloneNode(true);
  const cards = announceTemp.querySelectorAll(".dis-card");
  setValues(combo, cards);

  announceTemp.querySelector("h2").textContent =
    `${state.activePlayer.name} suspects`;
  document.body.append(announceTemp);

  document.addEventListener("click", () => {
    document.querySelector("#announce-container").remove();
  });
};

export const disproveASuspicion = (state) => {
  if (state.hasDisproved && state.activePlayer?.id === state.currentPlayer.id) {
    return showDisproval(state);
  }
  if (!state.canDisproved) {
    showResult(state.suspicion, { disproved: false });
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
