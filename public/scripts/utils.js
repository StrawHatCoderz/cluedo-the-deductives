export const isCurrentPlayer = (playerId, currentPlayerId) =>
  playerId === currentPlayerId;

export const getCharacterColor = (char) => {
  const colors = {
    colonel_mustard: "#E1C05A",
    miss_scarlett: "#D42A2A",
    professor_plum: "#7D4CA1",
    mrs_peacock: "#2C75FF",
    reverend_green: "#2E7D32",
    mrs_white: "#FFFFFF",
  };

  return colors[char] || "white";
};

export const toId = (data) => data.toLowerCase().replace(" ", "_");

export const toSentenceCase = (data) =>
  data.charAt(0).toUpperCase() + data.slice(1);

const parsePlayersData = (players) => {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    pawn: toId(player.pawn.name),
  }));
};

const parsePawnsData = (pawns) => {
  return pawns.map(({ position, name, id }) => ({
    pos: {
      x: position?.x,
      y: position?.y,
      room: position?.room,
    },
    char: toId(name),
    name,
    id,
  }));
};

export const fetchGameConfig = async (url) => {
  const gameContext = await fetch(url).then((data) => data.json());

  return {
    state: gameContext.state,
    players: parsePlayersData(gameContext.players),
    pawns: parsePawnsData(gameContext.pawns),
    currentPlayer: {
      id: gameContext.activePlayer.id,
      hand: gameContext.hand,
      pawn: gameContext.activePlayer.pawn,
    },
    canRoll: gameContext.canRoll,
    canSuspect: gameContext.canSuspect,
    secretPassageId: gameContext.secretPassageId,
  };
};

export const displayPopup = (message) => {
  const messageContainer = document.querySelector(".popup");
  const p = messageContainer.querySelector("p");

  p.textContent = message;

  messageContainer.style.visibility = "visible";
  messageContainer.style.opacity = "1";

  setTimeout(() => {
    messageContainer.style.visibility = "hidden";
    messageContainer.style.opacity = "0";
    p.textContent = "";
  }, 2000);
};

export const sendRequest = async ({ method, body, url }) => {
  const requestConfig = method === "post"
    ? {
      method,
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    }
    : { method };
  return await fetch(url, requestConfig).then((data) => data.json());
};
