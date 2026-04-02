const suspicionState = {
  selectedSuspect: null,
  selectedWeapon: null,
  currentRoom: "KITCHEN",
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

const mockFetchSuspicion = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isDisproved = Math.random() > 0.5;

      resolve({
        disproved: isDisproved,
        by: "rahul",
        card: isDisproved ? data.weapon : null,
      });
    }, 2000);
  });
};

const submitSuspicion = async () => {
  const data = {
    suspect: suspicionState.selectedSuspect,
    weapon: suspicionState.selectedWeapon,
    room: suspicionState.currentRoom,
  };

  showModal(data);

  const result = await mockFetchSuspicion(data);

  showResult(data, result);

  suspicionState.hasMadeSuspicion = true;
};

const selectWeapon = (weapon) => {
  suspicionState.selectedWeapon = weapon;

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

const removePawnHighlight = () => {
  const pawns = document.querySelectorAll(".highlight-suspect");
  pawns.forEach((p) => p.classList.remove("highlight-suspect"));
};

const onPawnSelect = (e) => {
  const pawnElement = e.target.closest("[data-occupied-by]");

  if (!pawnElement) return;

  suspicionState.selectedSuspect = pawnElement.dataset.occupiedBy;

  removePawnHighlight();

  showWeaponPopup(e.pageX, e.pageY);
};

const highlightPawns = (pawns) => {
  pawns.forEach((pawn) => {
    if (!pawn.dataset.occupiedBy) return;

    pawn.classList.add("highlight-suspect");
    pawn.addEventListener("click", onPawnSelect, { once: true });
  });
};

const startSuspicion = () => {
  if (suspicionState.hasMadeSuspicion) {
    alert("You already made a suspicion this turn");
    return;
  }

  const pawns = document.querySelectorAll("[data-occupied-by]");

  highlightPawns(pawns);
};

document.getElementById("close-modal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

export const suspicionBtnListener = () => {
  const suspicionBtn = document.getElementById("suspicion-button");
  suspicionBtn.addEventListener("click", startSuspicion);
};
