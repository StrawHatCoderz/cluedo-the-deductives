const SUSPICION_STATE = {
  selectedSuspect: null,
  selectedWeapon: null,
  currentRoom: null,
  hasMadeSuspicion: false,
};

const WEAPONS = [
  "DAGGER",
  "ROPE",
  "REVOLVER",
  "SPANNER",
  "LEAD PIPING",
  "CANDLESTICK",
];

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

const showResult = (data, result) => {
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
  await fetch("/add-suspicion", {
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
    }, 3000);
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

const selectWeapon = (weapon) => {
  SUSPICION_STATE.selectedWeapon = weapon;

  weaponPopup.classList.add("hidden");

  submitSuspicion();
};

const showWeaponPopup = (x, y) => {
  weaponPopup.innerHTML = "";

  WEAPONS.forEach((weapon) => {
    const el = document.createElement("div");
    el.className = "weapon-item";
    el.textContent = weapon;

    el.onclick = () => selectWeapon(weapon);

    weaponPopup.appendChild(el);
  });

  weaponPopup.style.left = Math.min(x, globalThis.window.innerWidth - 200) +
    "px";
  weaponPopup.style.top = Math.min(y, globalThis.window.innerHeight - 100) +
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
