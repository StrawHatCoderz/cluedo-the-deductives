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

const createRoomInfo = (roomIds) =>
  roomIds.reduce(
    (acc, roomId) => ({
      ...acc,
      [`${roomId}`]: { slots: createSlots(roomId), occupied: {} },
    }),
    {},
  );

const movePawnToRoom = (pawnId, room) => {
  const usedSlots = new Set(Object.values(room.occupied));
  const freeIndex = room.slots.findIndex((_, i) => !usedSlots.has(i));

  if (freeIndex === -1) return;

  room.occupied[pawnId] = freeIndex;
  const { x, y } = room.slots[freeIndex];

  const pawn = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pawn.setAttribute("cx", x);
  pawn.setAttribute("cy", y);
  pawn.setAttribute("r", 5);
  pawn.setAttribute("id", `pawn-${pawnId}`);
  pawn.setAttribute("fill", getCharacterColor(pawnId));

  document.getElementById("board-svg").appendChild(pawn);
};

const placeCharacters = (boardConfig) => {
  const roomsInfo = createRoomInfo(boardConfig.rooms);

  for (const [char, pos] of Object.entries(boardConfig.pawnPositions)) {
    if (pos.room && pos.room !== null) {
      const room = roomsInfo[pos.room];
      movePawnToRoom(char, room);
    } else {
      const tile = document.getElementById(`tile-${pos.x}-${pos.y}`);
      if (tile) tile.style.fill = `url(#${char}-pawn)`;
    }
  }
};

const highlightSecretPassages = (boardConfig) => {
  const secretGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  secretGroup.setAttribute("class", "secret-passages-group");

  const secretPositions = {
    kitchen: { x: 180, y: 50 },
    study: { x: 510, y: 375 },
    lounge: { x: 180, y: 375 },
    conservatory: { x: 510, y: 50 },
  };

  for (const [fromRoom, toRoom] of Object.entries(boardConfig.secretPassages)) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", secretPositions[fromRoom].x);
    rect.setAttribute("y", secretPositions[fromRoom].y);
    rect.setAttribute("class", "secret-passage");

    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "title",
    );
    title.textContent = toRoom.charAt(0).toUpperCase() + toRoom.slice(1);
    rect.appendChild(title);

    secretGroup.appendChild(rect);
  }
  return secretGroup;
};

export const renderBoard = (boardConfig) => {
  const svg = document.getElementById("board-svg");

  const secretGroup = highlightSecretPassages(boardConfig);
  svg.appendChild(secretGroup);

  placeCharacters(boardConfig);
};
