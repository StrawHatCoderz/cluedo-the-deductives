const fetchBoardConfig = (_url) => {
  return {
    secretPassages: {
      kitchen: "study",
      study: "kitchen",
      lounge: "conservatory",
      conservatory: "lounge",
    },

    startingPositions: {
      mustard: { x: 0, y: 17 },
      scarlet: { x: 7, y: 24 },
      plum: { x: 23, y: 19 },
      peacock: { x: 23, y: 6 },
      green: { x: 14, y: 0 },
      white: { x: 9, y: 0 },
    },

    players: [
      {
        id: 1,
        name: "deadpool",
        pawn: "mustard",
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

const markCharacters = (boardConfig) => {
  for (const [char, pos] of Object.entries(boardConfig.startingPositions)) {
    const tileId = `tile-${pos.x}-${pos.y}`;
    const tile = document.getElementById(tileId);
    if (tile) {
      tile.style.fill = `url(#${char}-pawn)`;
    }
  }
};

const renderBoard = (boardConfig) => {
  const svg = document.getElementById("board-svg");

  const secretGroup = markSecretPassages(boardConfig);
  svg.appendChild(secretGroup);

  markCharacters(boardConfig);
};

const createPlayer = (node, player) => {
  const icon = node.querySelector(".player-icon");
  icon.setAttribute("id", `${player.pawn}-icon`);

  const playerName = node.querySelector(".player-name");
  playerName.textContent = player.name;

  const playerPawn = node.querySelector(".player-pawn");
  playerPawn.textContent = player.pawn;
};

const renderPlayers = (boardConfig) => {
  const allPlayerContainer = document.querySelector(
    "#players-details-container",
  );
  const playerTemplate = document.getElementById("player-template");

  allPlayerContainer.innerHTML = "";

  if (!boardConfig.players) return;

  for (const player of boardConfig.players) {
    const playerClone = playerTemplate.content.cloneNode(true);
    createPlayer(playerClone, player);
    allPlayerContainer.appendChild(playerClone);
  }
};

const main = async () => {
  const boardConfig = await fetchBoardConfig("example.url");

  renderBoard(boardConfig);
  renderPlayers(boardConfig);
};

main();

globalThis.window.onload = main;
