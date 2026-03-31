const fetchBoardConfig = (_url) => {
  return {
    secretPassages: {
      kitchen: "study",
      study: "kitchen",
      lounge: "conservatory",
      conservatory: "lounge",
    },
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

const renderBoard = (boardConfig) => {
  const svg = document.getElementById("board-svg");

  const secretGroup = markSecretPassages(boardConfig);
  svg.appendChild(secretGroup);
};

const boardConfig = fetchBoardConfig("example.url");
globalThis.window.onload = () => renderBoard(boardConfig);
