import { boardConfig } from "../constants/board_config.js";
import { PAWNS, ROOMS, SUSPECTS, WEAPONS } from "../constants/game_config.js";
import { Board } from "../models/board.js";
import { DeckManager } from "../models/deck_manager.js";
import { Game } from "../models/game.js";
import { Pawn } from "../models/pawn.js";

const createPawns = () =>
  PAWNS.map(
    ({ name, position, color }, index) =>
      new Pawn(index + 1, name, position, color),
  );

export const createGameInstance = () => {
  const board = Board.create(boardConfig);
  const pawns = createPawns();
  const deck = new DeckManager({
    suspects: SUSPECTS,
    weapons: WEAPONS,
    rooms: ROOMS,
  });
  const game = new Game(1, board, pawns, deck);
  return game;
};

export const getPosition = (pawn) => {
  const { x, y, room } = pawn.position;
  const position = room ? room : `tile-${x}-${y}`;
  return position;
};

export const parseNode = (node) => {
  const [_, x, y] = node.split("-");

  return node.includes("-")
    ? [`tile-${x}-${y}`, { x, y, room: null }]
    : [node, { x: null, y: null, room: node }];
};
