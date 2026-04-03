const SUSPICION_STATE = {
  selectedSuspect: null,
  selectedWeapon: null,
  currentRoom: null,
  hasMadeSuspicion: false,
};

const WEAPONS = {
  "DAGGER": "https://cdn-icons-png.flaticon.com/128/3863/3863317.png",
  "ROPE": "https://cdn-icons-png.flaticon.com/128/3539/3539196.png",
  "REVOLVER": "https://cdn-icons-png.flaticon.com/128/1320/1320476.png",
  "SPANNER": "https://cdn-icons-png.flaticon.com/128/5233/5233077.png",
  "LEAD PIPING": "https://cdn-icons-png.flaticon.com/128/5672/5672227.png",
  "CANDLESTICK": "https://cdn-icons-png.flaticon.com/128/17080/17080905.png",
};

const weaponPopup = document.getElementById("weapon-popup");

const modal = document.getElementById("suspicion-modal");

const showModal = (data) => {
  const modalContent = modal.querySelector(".modal-content");
  const suspicionTemp = document.querySelector("#suspicion-model-temp");
  const suspicionClone = suspicionTemp.content.cloneNode(true);

  suspicionClone.querySelector("#card-suspect .card-value").textContent =
    data.suspect;
  suspicionClone.querySelector("#card-weapon .card-value").textContent =
    data.weapon;
  suspicionClone.querySelector("#card-room .card-value").textContent =
    data.room;
  modalContent.innerHTML =
    suspicionClone.querySelector("#suspicion-container").innerHTML;

  document.getElementById("close-modal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.classList.remove("hidden");
};

const showResult = (data, result) => { ///===========
  const statusEl = document.getElementById("suspicion-status");
  const closeBtn = document.getElementById("close-modal");

  if (result.disproved) {
    let highlightId = "card-weapon";
    if (result.card === data.suspect) highlightId = "card-suspect";
    else if (result.card === data.weapon) highlightId = "card-weapon";
    else if (result.card === data.room) highlightId = "card-room";

    document.getElementById(highlightId)?.classList.add("card-revealed");
    statusEl.textContent = `${result.by} revealed the card`;
  } else {
    statusEl.textContent = "No one could disprove!";
  }
  closeBtn.style.display = "inline-block";
};

const mockFetchSuspicion = async (suspicion) => {
  const body = JSON.stringify(suspicion);
  await fetch("/suspect", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });

  await fetch(`/update-pawn-position/${suspicion.suspectId}`, {
    method: "put",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      newNodeId: suspicion.room,
      tiles: [suspicion.room],
      isUsingSecretPassage: false,
    }),
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      const isDisproved = Math.random() > 0.5;

      resolve({
        disproved: isDisproved,
        by: "LOKI",
        card: isDisproved ? suspicion.weapon : null,
      });
    }, 2000);
    setTimeout(() => {
      globalThis.window.location.reload();
    }, 30000);
  });
};

const submitSuspicion = async () => {
  const suspicion = {
    suspect: SUSPICION_STATE.selectedSuspect,
    weapon: SUSPICION_STATE.selectedWeapon,
    room: SUSPICION_STATE.currentRoom,
    suspectId: SUSPICION_STATE.suspectId,
  };

  showModal(suspicion);

  const result = await mockFetchSuspicion(suspicion);

  showResult(suspicion, result);
  SUSPICION_STATE.hasMadeSuspicion = true;
};

const selectWeapon = (card, selectedLabel, weapon) => {
  if (selectedWeaponEl) {
    selectedWeaponEl.classList.remove("weapon-selected");
  }

  if (selectedWeaponEl === card) {
    selectedWeaponEl = null;
    SUSPICION_STATE.selectedWeapon = null;
    selectedLabel.textContent = "Select a weapon";
  } else {
    card.classList.add("weapon-selected");
    selectedWeaponEl = card;
    SUSPICION_STATE.selectedWeapon = weapon;
    selectedLabel.textContent = weapon;
  }
};

let selectedWeaponEl = null;

const showWeaponPopup = (x, y) => {
  selectedWeaponEl = null;
  SUSPICION_STATE.selectedWeapon = null;

  const temp = document.querySelector("#weapon-popup-temp");
  const cardTemp = document.querySelector("#weapon-card-temp");
  const clone = temp.content.cloneNode(true);

  weaponPopup.innerHTML = "";
  weaponPopup.appendChild(clone);

  document.getElementById("weapon-popup-room").textContent =
    SUSPICION_STATE.currentRoom;

  document.getElementById("weapon-popup-suspect").textContent =
    SUSPICION_STATE.selectedSuspect;

  const selectedLabel = document.getElementById("weapon-selected-label");
  const row = document.getElementById("weapon-cards-row");
  const weapons = Object.keys(WEAPONS);
  weapons.forEach((weapon) => {
    addWeaponEl(cardTemp, weapon, selectedLabel, row);
  });

  document.getElementById("weapon-suspect-btn").onclick = () => {
    if (!SUSPICION_STATE.selectedWeapon) return;
    weaponPopup.classList.add("hidden");
    submitSuspicion();
  };

  document.getElementById("weapon-cancel-btn").onclick = () => {
    weaponPopup.classList.add("hidden");
    selectedWeaponEl = null;
    SUSPICION_STATE.selectedWeapon = null;
    SUSPICION_STATE.selectedSuspect = null;
  };

  weaponPopup.style.left = Math.min(x, globalThis.window.innerWidth - 380) +
    "px";
  weaponPopup.style.top = Math.min(y, globalThis.window.innerHeight - 220) +
    "px";
  weaponPopup.classList.remove("hidden");
};

export const removePawnHighlight = () => {
  const pawns = document.querySelectorAll("[data-occupied-by]");

  pawns.forEach((p) => {
    p.classList.remove("highlight-suspect");
    p.removeEventListener("click", p.clickListener);
    delete p.clickListener;
  });
};

const onPawnSelect = (e, suspects) => {
  const pawnElement = e.target.closest("[data-occupied-by]");
  if (!pawnElement) return;

  const suspect = pawnElement.dataset.occupiedBy;
  removePawnHighlight();
  const { id, name } = suspects
    .find(({ char }) => char === suspect);

  SUSPICION_STATE.selectedSuspect = name;
  SUSPICION_STATE.suspectId = id;
  showWeaponPopup(e.pageX, e.pageY);
};

const highlightPawns = (pawns, suspects) => {
  pawns.forEach((pawn) => {
    if (!pawn.dataset.occupiedBy) return;

    pawn.classList.add("highlight-suspect");
    const handler = (e) => onPawnSelect(e, suspects);
    pawn.clickListener = handler;
    pawn.addEventListener("click", handler);
  });
};

const startSuspicion = ({ position }, suspects) => {
  SUSPICION_STATE.currentRoom = position.room;
  const pawns = document.querySelectorAll("[data-occupied-by]");
  highlightPawns(pawns, suspects);
};

document.getElementById("close-modal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

export const suspicionBtnListener = ({ canSuspect, currentPlayer, pawns }) => {
  if (canSuspect) {
    startSuspicion(currentPlayer.pawn, pawns);
  } else {
    removePawnHighlight();
  }
};

function addWeaponEl(cardTemp, weapon, selectedLabel, row) {
  const cardClone = cardTemp.content.cloneNode(true);
  const card = cardClone.querySelector(".weapon-item");
  const img = cardClone.querySelector(".weapon-img");
  const name = cardClone.querySelector(".weapon-name");

  card.dataset.weapon = weapon;
  img.src = WEAPONS[weapon];
  img.alt = weapon;
  name.textContent = weapon;

  card.addEventListener(
    "click",
    () => selectWeapon(card, selectedLabel, weapon),
  );
  row.appendChild(cardClone);
}
