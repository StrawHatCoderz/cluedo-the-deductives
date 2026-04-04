const WEAPONS = {
  "DAGGER": "https://cdn-icons-png.flaticon.com/128/3863/3863317.png",
  "ROPE": "https://cdn-icons-png.flaticon.com/128/3539/3539196.png",
  "REVOLVER": "https://cdn-icons-png.flaticon.com/128/1320/1320476.png",
  "SPANNER": "https://cdn-icons-png.flaticon.com/128/5233/5233077.png",
  "LEAD PIPING": "https://cdn-icons-png.flaticon.com/128/5672/5672227.png",
  "CANDLESTICK": "https://cdn-icons-png.flaticon.com/128/17080/17080905.png",
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
  selectedLabel.textContent = weapon;
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
  const cardClone = document.querySelector("#weapon-card-temp").content
    .cloneNode(true);
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
  getEl("weapon-popup-room").textContent = state.currentRoom.split("_").join(
    " ",
  );
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
  const clone = document.querySelector("#weapon-popup-temp").content.cloneNode(
    true,
  );
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

const fillModalCards = (clone, data) => {
  clone.querySelector("#card-suspect .card-value").textContent = data.suspect;
  clone.querySelector("#card-weapon .card-value").textContent = data.weapon;
  clone.querySelector("#card-room .card-value").textContent = data.room;
};

const showModal = (data) => {
  const modal = getEl("suspicion-modal");
  const suspicionClone = document.querySelector("#suspicion-model-temp").content
    .cloneNode(true);

  fillModalCards(suspicionClone, data);
  modal.querySelector(".modal-content").innerHTML =
    suspicionClone.querySelector("#suspicion-container").innerHTML;

  modal.addEventListener("click", (e) => e.target === modal && hide(modal));
  show(modal);
};

const getHighlightId = (result, data) => {
  if (result.card === data.suspect) return "card-suspect";
  if (result.card === data.room) return "card-room";
  return "card-weapon";
};

const showResult = (data, result) => {
  const statusEl = getEl("suspicion-status");

  if (!result.disproved) {
    statusEl.textContent = "No one could disprove!";
    return;
  }

  getEl(getHighlightId(result, data))?.classList.add("card-revealed");
  statusEl.textContent = `${result.by} revealed the card`;
};

const postSuspicion = (suspicion) =>
  fetch("/suspect", {
    method: "POST",
    body: JSON.stringify(suspicion),
    headers: { "content-type": "application/json" },
  });

const moveSuspectPawn = (suspicion) =>
  fetch(`/update-pawn-position/${suspicion.suspectId}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      newNodeId: suspicion.room,
      tiles: [suspicion.room],
      isUsingSecretPassage: false,
    }),
  });

const waitForDisproval = (suspicion) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const isDisproved = Math.random() > 0.5;
      resolve({
        disproved: isDisproved,
        by: "LOKI",
        card: isDisproved ? suspicion.weapon : null,
      });
    }, 2000);
  });

const mockFetchSuspicion = async (suspicion) => {
  removePawnHighlight();
  await postSuspicion(suspicion);
  await moveSuspectPawn(suspicion);
  return waitForDisproval(suspicion);
};

const buildSuspicion = () => ({
  suspect: state.selectedSuspect,
  weapon: state.selectedWeapon,
  room: state.currentRoom,
  suspectId: state.suspectId,
});

const submitSuspicion = async () => {
  const suspicion = buildSuspicion();
  showModal(suspicion);
  const result = await mockFetchSuspicion(suspicion);
  showResult(suspicion, result);
  state.hasMadeSuspicion = true;
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

  const { id, name } = suspects.find(({ char }) =>
    char === pawnEl.dataset.occupiedBy
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

export const suspicionBtnListener = ({ canSuspect, currentPlayer, pawns }) => {
  if (canSuspect) {
    startSuspicion(currentPlayer.pawn, pawns);
    return;
  }
  removePawnHighlight();
};
