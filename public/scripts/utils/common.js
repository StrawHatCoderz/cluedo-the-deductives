export const isActivePlayer = (playerId, activePlayer) =>
  playerId === activePlayer.id;

export const isCurrentPlayer = (playerId, currentPlayer) =>
  playerId === currentPlayer.id;

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
export const toNormalCase = (data) => data.replace("_", " ");

export const toSentenceCase = (data) =>
  data.charAt(0).toUpperCase() + data.slice(1);

export const getElement = (id) => document.getElementById(id);
