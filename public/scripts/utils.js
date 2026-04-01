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

const parsePlayersData = (config) => {
  const { players } = config;

  return players.map((player) => ({
    id: player.id,
    name: player.playerName,
    pawn: toId(player.pawn.name),
    hand: player.hand,
  }));
};

const toId = (data) => data.toLowerCase().replace(" ", "_");

const parsePawnsData = (config) => {
  const { pawns } = config;

  return pawns.map(({ position, name }) => ({
    pos: {
      x: position?.x,
      y: position?.y,
      room: position?.room,
    },
    char: toId(name),
  }));
};

const getCurrentPlayerHand = (currentPlayerId, players) => {
  const currentPlayer = players.filter(
    (player) => player.id === currentPlayerId,
  )[0];

  return currentPlayer?.hand;
};

export const fetchGameConfig = async (url) => {
  const gameContext = await fetch(url).then((data) => data.json());

  return {
    players: parsePlayersData(gameContext),
    pawns: parsePawnsData(gameContext),
    currentPlayer: {
      id: 1,
      hand: getCurrentPlayerHand(1, gameContext.players),
    },
  };
};
