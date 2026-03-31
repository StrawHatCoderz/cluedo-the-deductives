const fetchBoardConfig = (_url) => {
  return {
    secretPassages: {
      kitchen: "study",
      study: "kitchen",
      lounge: "conservatory",
      conservatory: "lounge",
    },

    pawnPositions: {
      mustard: { x: 0, y: 17 },
      scarlet: { x: 7, y: 24 },
      plum: { x: 23, y: 19 },
      peacock: { x: 23, y: 6, room: "conservatory" },
      green: { x: 14, y: 0, room: "lounge" },
      white: { x: null, y: null, room: "lounge" },
    },

    players: [
      {
        id: 1,
        name: "deadpool",
        pawn: "mustard",
        pawnLocation: {
          x: 1,
          y: 2,
        },
      },
      {
        id: 2,
        name: "spiderman",
        pawn: "peacock",
      },
      {
        id: 3,
        name: "ironman",
        pawn: "scarlet",
      },
      {
        id: 2,
        name: "thor",
        pawn: "plum",
      },
      {
        id: 2,
        name: "captain",
        pawn: "white",
      },
      {
        id: 2,
        name: "groot",
        pawn: "green",
      },
    ],

    currentPlayerId: 1,

    rooms: [
      "kitchen",
      "dining_room",
      "lounge",
      "hall",
      "study",
      "library",
      "billiard_room",
      "conservatory",
      "ballroom",
    ],
  };
};

const markSecretPassages = (boardConfig) => {
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

const markCharacters = (boardConfig) => {
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

const displayPopup = (p, message) => {
  p.textContent = message;
  setTimeout(() => {
    p.textContent = "";
  }, 1000);
};

const diceListener = (dice, p) => {
  dice.addEventListener("click", async (event) => {
    event.preventDefault();
    const { diceValue } = await fetch("/get-dice-value").then((response) =>
      response.json()
    );
    const message = `dice value is ${diceValue}`;
    displayPopup(p, message);
  });
};
const getCharacterColor = (char) => {
  const colors = {
    mustard: "#E1C05A",
    scarlet: "#D42A2A",
    plum: "#7D4CA1",
    peacock: "#2C75FF",
    green: "#2E7D32",
    white: "#FFFFFF",
  };
  return colors[char] || "white";
};

const renderBoard = (boardConfig) => {
  const svg = document.getElementById("board-svg");

  const secretGroup = markSecretPassages(boardConfig);
  svg.appendChild(secretGroup);

  markCharacters(boardConfig);
};

const createPlayer = (node, player, currentPlayerId) => {
  if (isCurrentPlayer(player.id, currentPlayerId)) {
    node.querySelector(".player").setAttribute("id", "current-player");
  }

  const icon = node.querySelector(".player-icon");
  icon.setAttribute("id", `${player.pawn}-icon`);

  const playerName = node.querySelector(".player-name");
  playerName.textContent = player.name;

  const playerPawn = node.querySelector(".player-pawn");
  playerPawn.textContent = player.pawn;
};

const isCurrentPlayer = (playerId, currentPlayerId) =>
  playerId === currentPlayerId;

const renderPlayers = (boardConfig) => {
  const allPlayerContainer = document.querySelector(
    "#players-details-container",
  );

  const playerTemplate = document.getElementById("player-template");

  allPlayerContainer.innerHTML = "";

  for (const player of boardConfig.players) {
    const playerClone = playerTemplate.content.cloneNode(true);

    createPlayer(playerClone, player, boardConfig.currentPlayerId);
    allPlayerContainer.appendChild(playerClone);
  }
};

const main = async () => {
  const boardConfig = await fetchBoardConfig("example.url");
  const dice = document.querySelector("#dice-button");
  const p = document.querySelector(".popup > p");

  renderBoard(boardConfig);
  renderPlayers(boardConfig);
  diceListener(dice, p);
};

globalThis.window.onload = main;
