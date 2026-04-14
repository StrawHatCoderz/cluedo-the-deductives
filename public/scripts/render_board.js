import { toSentenceCase } from "./utils/common.js";

const initializeRoomState = (roomId) => {
  const slots = document.querySelectorAll(`#${roomId}-group .room-slot`);
  const available = Array.from({ length: slots.length }, (_, i) => i).reverse();
  return { occupied: {}, available };
};

const renderPawnInRoom = (pawnId, roomId, roomState) => {
  const { occupied, available } = roomState;
  if (available.length === 0) return;

  const freeIndex = available.pop();
  occupied[pawnId] = freeIndex;

  const slots = document.querySelectorAll(`#${roomId}-group .room-slot`);
  slots.forEach((slot) => slot.classList.remove("highlight-suspect"));
  const slot = slots[freeIndex];

  if (slot) {
    slot.setAttribute("fill", `url(#${pawnId}_pawn)`);
    slot.dataset.occupiedBy = pawnId;
  }
};

const renderPawnOnTile = (pawnId, x, y) => {
  const tile = document.getElementById(`tile-${x}-${y}`);
  if (tile) {
    tile.style.fill = `url(#${pawnId}_pawn)`;
    tile.dataset.occupiedBy = pawnId;
  }
};

const getPawnElement = (char) => {
  const tile = document.querySelector(`#${char}_pawn`);
  return tile.querySelector("circle");
};

const highlightActivePlayer = (char) => {
  const pawn = getPawnElement(char);
  pawn.classList.add("active-pawn");
};

const removeHighlight = (char) => {
  const pawn = getPawnElement(char);
  pawn.classList.remove("active-pawn");
};

export const placeCharacters = (boardConfig) => {
  const { activePlayer, pawns } = boardConfig;
  const roomRegistry = {};

  for (const { char, pos, id } of pawns) {
    removeHighlight(char);

    if (activePlayer.pawn.id === id) {
      highlightActivePlayer(char, pos);
    }

    if (pos.room) {
      roomRegistry[pos.room] = roomRegistry[pos.room] ||
        initializeRoomState(pos.room);
      renderPawnInRoom(char, pos.room, roomRegistry[pos.room]);
    } else {
      renderPawnOnTile(char, pos.x, pos.y);
    }
  }
};

const clearAllPawns = () => {
  document.querySelectorAll(".room-slot").forEach((slot) => {
    slot.setAttribute("fill", "transparent");
    delete slot.dataset.occupiedBy;
  });

  document.querySelectorAll("rect[data-occupied-by]").forEach((tile) => {
    tile.style.fill = "";
    delete tile.dataset.occupiedBy;
  });
};

const hideSecretPassage = (tooltip) => {
  tooltip.classList.add("hidden");
};

const previewSecretPassage = (p, tooltip) => {
  const to = p.dataset.to;
  const direction = p.dataset.tooltip;
  const formatted = toSentenceCase(to);
  tooltip.textContent = `Go to ${formatted}`;
  tooltip.className = `tooltip tooltip-${direction}`;
  const rect = p.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top + rect.height / 2}px`;
  tooltip.classList.remove("hidden");
};

const setupSecretPassageEvents = (tooltip) => {
  const passages = document.querySelectorAll(".secret-passage");
  passages.forEach((p) => {
    p.addEventListener("mouseenter", (_e) => previewSecretPassage(p, tooltip));
    p.addEventListener("mouseleave", () => hideSecretPassage(tooltip));
  });
};

const hideWeapon = (tooltip) => tooltip.classList.add("hidden");

const moveWeapon = (tooltip, e) => {
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
};

const previewWeapon = (e, tooltip) => {
  tooltip.textContent = toSentenceCase(e.target.dataset.name);
  tooltip.classList.remove("hidden");
};

const setupWeaponsEvents = (tooltip) => {
  const weapons = document.querySelectorAll(".weapon");
  weapons.forEach((weapon) => {
    weapon.addEventListener("mouseenter", (e) => previewWeapon(e, tooltip));
    weapon.addEventListener("mousemove", (e) => moveWeapon(tooltip, e));
    weapon.addEventListener("mouseleave", () => hideWeapon(tooltip));
  });
};

export const renderBoard = (boardConfig) => {
  const tooltip = document.getElementById("tooltip");

  setupSecretPassageEvents(tooltip);
  setupWeaponsEvents(tooltip);

  clearAllPawns();

  placeCharacters(boardConfig);
};
