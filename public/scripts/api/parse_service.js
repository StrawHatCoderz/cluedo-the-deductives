import { toId } from "../utils/common.js";

export const parsePlayersData = (players) => {
  return players.map((player) => ({
    id: player.id,
    name: player.name,
    pawn: toId(player.pawn.name),
    isEliminated: player.isEliminated,
    isWon: player.isWon,
  }));
};

export const parsePawnsData = (pawns) => {
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

export const parseFormData = (form) => {
  const formdata = new FormData(form);
  return Object.fromEntries(formdata.entries());
};
