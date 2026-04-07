import { showResult } from "./suspicion.js";
import { displayPopup } from "./utils.js";

const mockedState = {
  players: [],
  currentPlayer: {
    id: 1,
    name: "Javed",
    pawn: {
      id: 2,
      name: "ms scarlet",
    },
    hand: ["longue", "dagger", "scarlet"],
  },
  activePlayer: {
    id: 1,
    name: "Hem",
  },
  canDisprove: true,

  suspectCombination: {
    suspect: "mrs white",
    weapon: "dagger",
    room: "longue",
  },
  disprovablePlayer: 1,
};

const createDisprovePopUp = ({ currentPlayer, suspectCombination }) => {
  const hand = currentPlayer.hand;
  const disproveTemp = document
    .querySelector("#disprove-model")
    .content.cloneNode(true);

  const disprovableCards = Object.values(suspectCombination).filter((card) =>
    hand.includes(card)
  );
  const cards = disproveTemp.querySelectorAll(".card");

  Object.values(suspectCombination).forEach((card, i) => {
    cards[i].querySelector("input").value = card;
    cards[i].querySelector("label").textContent = card;
    if (!disprovableCards.includes(card)) {
      cards[i].querySelector("input").setAttribute("disabled", true);
    }
  });
  document.body.appendChild(disproveTemp);
};

const showDisproval = async (state) => {
  const res = await fetch("/get-disproved-card");
  const { data } = await res.json();
  const suspicion = state.suspicionCombo;
  showResult(suspicion, data);
};

export const disproveASuspicion = (state = mockedState) => {
  if (state.hasDisproved && state.activePlayer?.id === state.currentPlayer.id) {
    showDisproval(state);
  }
  if (state.hasDisproved) {
    displayPopup(`${state.disprovablePlayer} is disproved`);
  }
  if (state.currentPlayer.id === state.disprovablePlayer) {
    createDisprovePopUp(state);
  }
};
