import { getCharacterColor } from "./utils.js";

const createSlots = (roomId) => {
  const room = document.getElementById(roomId);
  const { x, y, width, height } = room.getBBox();

  const paddingX = width * 0.2;
  const paddingY = height * 0.2;

  const left = x + paddingX;
  const right = x + width - paddingX;
  const top = y + paddingY;
  const bottom = y + height - paddingY;

  const midX = x + width / 2;
  const midY = y + height / 2;

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: left, y: bottom },
    { x: right, y: bottom },
    { x: midX, y: midY - height * 0.15 },
    { x: midX, y: midY + height * 0.15 },
  ];
};

const movePawnToRoom = (pawnId, room, existingPawnCount) => {
  const usedSlots = new Set(Object.values(room.occupied));
  const freeIndex = room.slots.findIndex((_, i) => !usedSlots.has(i));

  if (freeIndex === -1) return;

  room.occupied[pawnId] = freeIndex;
  const { x, y } = room.slots[freeIndex];

  const pawn = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pawn.setAttribute("cx", x + existingPawnCount + 12);
  pawn.setAttribute("cy", y);
  pawn.setAttribute("r", 5);
  pawn.setAttribute("id", `pawn-${pawnId}`);
  pawn.setAttribute("fill", getCharacterColor(pawnId));

  document.getElementById("board-svg").appendChild(pawn);
};

const placeCharacters = (boardConfig) => {
  for (const { char, pos } of boardConfig.pawns) {
    if (pos.room) {
      const room = {
        slots: createSlots(pos.room),
        occupied: {},
      };

      movePawnToRoom(char, room);
    } else {
      const tile = document.getElementById(`tile-${pos.x}-${pos.y}`);
      if (tile) tile.style.fill = `url(#${char}_pawn)`;
    }
  }
};

const hideSecretPassage = (tooltip) => {
  tooltip.classList.add("hidden");
};

const previewSecretPassage = (p, tooltip) => {
  const to = p.dataset.to;
  const direction = p.dataset.tooltip;

  const formatted = to.charAt(0).toUpperCase() + to.slice(1);
  tooltip.textContent = `Go to ${formatted}`;
  tooltip.className = `tooltip tooltip-${direction}`;

  const rect = p.getBoundingClientRect();

  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top + rect.height / 2}px`;

  tooltip.classList.remove("hidden");
};

const setupSecretPassageEvents = () => {
  const tooltip = document.getElementById("tooltip");
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

const tooltip = document.getElementById("tooltip");

const weaponHoverHandler = () => {
  const weapons = document.querySelectorAll(".weapon");

  weapons.forEach((weapon) => {
    weapon.addEventListener("mouseenter", (e) => {
      const name = e.target.dataset.name;
      tooltip.textContent = name;
      tooltip.classList.remove("hidden");
    });

    weapon.addEventListener("mousemove", (e) => {
      tooltip.style.left = e.pageX + 10 + "px";
      tooltip.style.top = e.pageY + 10 + "px";
    });

    weapon.addEventListener("mouseleave", () => {
      tooltip.classList.add("hidden");
    });
  });
};

export const renderBoard = (boardConfig) => {
  setupSecretPassageEvents();
  weaponHoverHandler();
  placeCharacters(boardConfig);
};
