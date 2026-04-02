import { toSentenceCase } from "./utils.js";

const initializeRoomState = (roomId) => {
  const slots = document.querySelectorAll(`#${roomId}-group .room-slot`);
  const available = Array.from({ length: slots.length }, (_, i) => i).reverse();

  return {
    occupied: {},
    available,
  };
};

const renderPawnInRoom = (pawnId, roomId, roomState) => {
  const { occupied, available } = roomState;

  if (available.length === 0) return;

  const freeIndex = available.pop();
  occupied[pawnId] = freeIndex;

  const slots = document.querySelectorAll(`#${roomId}-group .room-slot`);
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
export const placeCharacters = (boardConfig) => {
  const roomRegistry = {};

  for (const { char, pos } of boardConfig.pawns) {
    if (pos.room) {
      roomRegistry[pos.room] = roomRegistry[pos.room] ||
        initializeRoomState(pos.room);
      renderPawnInRoom(char, pos.room, roomRegistry[pos.room]);
    } else {
      renderPawnOnTile(char, pos.x, pos.y);
    }
  }
};

const setupRoomSlots = () => {
  const allSlots = document.querySelectorAll(".room-slot");
  allSlots.forEach((slot) => {
    slot.setAttribute("fill", "transparent");
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
    p.addEventListener("mouseenter", (_e) => {
      previewSecretPassage(p, tooltip);
    });
    p.addEventListener("mouseleave", () => {
      hideSecretPassage(tooltip);
    });
  });
};

const hideWeapon = (tooltip) => {
  tooltip.classList.add("hidden");
};

const moveWeapon = (tooltip, e) => {
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
};

const previewWeapon = (e, tooltip) => {
  const name = e.target.dataset.name;
  tooltip.textContent = name;
  tooltip.classList.remove("hidden");
};

const setupWeaponsEvents = (tooltip) => {
  const weapons = document.querySelectorAll(".weapon");

  weapons.forEach((weapon) => {
    weapon.addEventListener("mouseenter", (e) => {
      previewWeapon(e, tooltip);
    });

    weapon.addEventListener("mousemove", (e) => {
      moveWeapon(tooltip, e);
    });

    weapon.addEventListener("mouseleave", () => {
      hideWeapon(tooltip);
    });
  });
};

export const renderBoard = (boardConfig) => {
  const tooltip = document.getElementById("tooltip");

  setupSecretPassageEvents(tooltip);
  setupWeaponsEvents(tooltip);
  setupRoomSlots();

  placeCharacters(boardConfig);
};
