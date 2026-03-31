export const isCurrentPlayer = (playerId, currentPlayerId) =>
  playerId === currentPlayerId;

export const getCharacterColor = (char) => {
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

export const fetchBoardConfig = (_url) => {
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

    currentPlayer: {
      id: 1,
      hand: ["mustard", "rope", "scarlet", "hall", "dining_room", "dagger"],
    },
  };
};
