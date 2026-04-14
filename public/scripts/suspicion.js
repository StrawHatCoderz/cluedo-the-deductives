import { toId, toSentenceCase } from "./utils/common.js";
import { createCard, createClone } from "./utils/ui.js";

const WEAPONS = {
  dagger: "https://cdn-icons-png.flaticon.com/128/3863/3863317.png",
  rope: "https://cdn-icons-png.flaticon.com/128/3539/3539196.png",
  revolver: "https://cdn-icons-png.flaticon.com/128/1320/1320476.png",
  spanner: "https://cdn-icons-png.flaticon.com/128/5233/5233077.png",
  "lead piping": "https://cdn-icons-png.flaticon.com/128/5672/5672227.png",
  candlestick: "https://cdn-icons-png.flaticon.com/128/17080/17080905.png",
};

const createSuspicionState = () => ({
  selectedSuspect: null,
  selectedWeapon: null,
  selectedWeaponEl: null,
  currentRoom: null,
  suspectId: null,
  hasMadeSuspicion: false,
});

const state = createSuspicionState();

const getEl = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

const clearWeaponSelection = (selectedLabel) => {
  state.selectedWeaponEl?.classList.remove("weapon-selected");
  state.selectedWeaponEl = null;
  state.selectedWeapon = null;
  selectedLabel.textContent = "Select a weapon";
};

const applyWeaponSelection = (card, selectedLabel, weapon) => {
  card.classList.add("weapon-selected");
  state.selectedWeaponEl = card;
  state.selectedWeapon = weapon;
  selectedLabel.textContent = toSentenceCase(weapon);
};

const isSameCard = (card) => state.selectedWeaponEl === card;

const selectWeapon = (card, selectedLabel, weapon, suspectBtn) => {
  state.selectedWeaponEl?.classList.remove("weapon-selected");

  if (isSameCard(card)) {
    clearWeaponSelection(selectedLabel);
    suspectBtn.classList.remove("clickable");
    return;
  }

  applyWeaponSelection(card, selectedLabel, weapon);
  suspectBtn.classList.add("clickable");
};

const createWeaponCard = (weapon, selectedLabel, suspectBtn) => {
  const cardClone = document
    .querySelector("#weapon-card-temp")
    .content.cloneNode(true);
  const card = cardClone.querySelector(".weapon-item");

  cardClone.querySelector(".weapon-img").src = WEAPONS[weapon];
  cardClone.querySelector(".weapon-img").alt = weapon;
  cardClone.querySelector(".weapon-name").textContent = weapon;
  card.dataset.weapon = weapon;
  card.addEventListener(
    "click",
    () => selectWeapon(card, selectedLabel, weapon, suspectBtn),
  );

  return cardClone;
};

const populateWeaponRow = (row, selectedLabel, suspectBtn) => {
  Object.keys(WEAPONS).forEach((weapon) => {
    row.appendChild(createWeaponCard(weapon, selectedLabel, suspectBtn));
  });
};

const fillPopupInfo = () => {
  getEl("weapon-popup-room").textContent = state.currentRoom
    .split("_")
    .join(" ");
  getEl("weapon-popup-suspect").textContent = state.selectedSuspect;
};

const bindSuspectBtn = (suspectBtn) => {
  suspectBtn.onclick = () => {
    if (!state.selectedWeapon) return;
    hide(getEl("weapon-popup"));
    submitSuspicion();
  };
};

const bindCancelBtn = (cancelBtn) => {
  cancelBtn.onclick = () => {
    hide(getEl("weapon-popup"));
    state.selectedWeapon = null;
    state.selectedWeaponEl = null;
    state.selectedSuspect = null;
  };
};

const positionPopup = (popup, x, y) => {
  popup.style.left = Math.min(x, globalThis.window.innerWidth - 380) + "px";
  popup.style.top = Math.min(y, globalThis.window.innerHeight - 220) + "px";
};

const showWeaponPopup = (x, y) => {
  state.selectedWeaponEl = null;
  state.selectedWeapon = null;

  const popup = getEl("weapon-popup");
  const clone = document
    .querySelector("#weapon-popup-temp")
    .content.cloneNode(true);
  popup.innerHTML = "";
  popup.appendChild(clone);

  fillPopupInfo();
  populateWeaponRow(
    getEl("weapon-cards-row"),
    getEl("weapon-selected-label"),
    getEl("weapon-suspect-btn"),
  );
  bindSuspectBtn(getEl("weapon-suspect-btn"));
  bindCancelBtn(getEl("weapon-cancel-btn"));
  positionPopup(popup, x, y);
  show(popup);
};

export const showModal = ({ room, suspect, weapon }) => {
  const suspicionContainer = createClone("suspicion-container-template");
  const suspicionCardsContainer = suspicionContainer.querySelector(
    ".suspicion-cards",
  );

  const overlay = document.createElement("our-overlay");
  overlay.appendChild(suspicionContainer);

  document.body.appendChild(overlay);
  overlay.open();

  const cardTemplate = document.getElementById("card-template");
  suspicionCardsContainer.innerHTML = "";

  [
    ["suspect", suspect],
    ["weapon", weapon],
    ["room", room],
  ].forEach(([key, card]) => {
    const cardClone = cardTemplate.content.cloneNode(true);

    createCard(cardClone, toId(card), [`card-${key}`]);
    suspicionCardsContainer.appendChild(cardClone);
  });
};

const getHighlightId = (result, data) => {
  if (result.card === data.suspect) return "card-suspect";
  if (result.card === data.room) return "card-room";
  return "card-weapon";
};

export const showResult = (data, result) => {
  const container = document.querySelector("#suspicion-container");
  const statusEl = container?.querySelector("#suspicion-status");

  if (!result.disproved) {
    const ele = getEl("suspicion-status");
    if (ele !== null) {
      ele.innerText = "No One Could Disprove";
    }
    return;
  }

  const highlightedCard = getHighlightId(result, data);
  const cardElement = container.querySelector(`.${highlightedCard}`);
  cardElement?.classList.add("card-revealed");

  statusEl.textContent = `${result.by} revealed the card`;
};

const saveSuspicion = (suspicion) =>
  fetch("/turn/suspect", {
    method: "POST",
    body: JSON.stringify(suspicion),
    headers: { "content-type": "application/json" },
  });

const fetchSuspicion = async (suspicion) => {
  removePawnHighlight();
  return await saveSuspicion(suspicion);
};

const getSuspicion = () => ({
  suspect: state.selectedSuspect,
  weapon: state.selectedWeapon,
  room: state.currentRoom,
  suspectId: state.suspectId,
});

const submitSuspicion = async () => {
  const suspicion = getSuspicion();
  showModal(suspicion);
  const res = await fetchSuspicion(suspicion);
  const { success } = await res.json();
  if (success) {
    state.hasMadeSuspicion = true;
  }
};

export const removePawnHighlight = () => {
  document.querySelectorAll("[data-occupied-by]").forEach((p) => {
    p.classList.remove("highlight-suspect");
    p.removeEventListener("click", p.clickListener);
    delete p.clickListener;
  });
};

const onPawnSelect = (e, suspects) => {
  const pawnEl = e.target.closest("[data-occupied-by]");
  if (!pawnEl) return;

  const { id, name } = suspects.find(
    ({ char }) => char === pawnEl.dataset.occupiedBy,
  );
  state.selectedSuspect = name;
  state.suspectId = id;
  showWeaponPopup(e.pageX, e.pageY);
};

const attachPawnListener = (pawn, suspects) => {
  if (pawn.clickListener) pawn.removeEventListener("click", pawn.clickListener);
  pawn.classList.add("highlight-suspect");
  pawn.clickListener = (e) => onPawnSelect(e, suspects);
  pawn.addEventListener("click", pawn.clickListener);
};

const highlightPawns = (pawns, suspects) => {
  pawns.forEach((pawn) => {
    if (!pawn.dataset.occupiedBy) return;
    attachPawnListener(pawn, suspects);
  });
};

const startSuspicion = ({ position }, suspects) => {
  state.currentRoom = position.room;
  highlightPawns(document.querySelectorAll("[data-occupied-by]"), suspects);
};

export const suspicionBtnListener = (
  { canSuspect, activePlayer, pawns, currentPlayer },
) => {
  const isCurrentPlayer = activePlayer.id === currentPlayer.id;
  if (canSuspect && isCurrentPlayer) {
    startSuspicion(activePlayer.pawn, pawns);
    return;
  }
  removePawnHighlight();
};
