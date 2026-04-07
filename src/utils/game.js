import { shuffle } from "@std/random";
import { boardConfig } from "../constants/board_config.js";
import { Board } from "../models/board.js";
import { DeckManager } from "../models/deck_manager.js";
import { Game } from "../models/game.js";
import { Pawn } from "../models/pawn.js";

export const createPawnInstances = (pawns) =>
  pawns.map(
    ({ name, position, color }, index) =>
      new Pawn(index + 1, name, position, color),
  );

const getShuffledPawns = (pawns) =>
  shuffle(pawns.map(({ name, color }) => ({
    name,
    color,
  })));

export const createLobbyInstance = (id, pawns) => {
  const playersLimit = { max: 6, min: 3 };
  return new Lobby(
    id,
    playersLimit.max,
    playersLimit.min,
    getShuffledPawns(pawns),
  );
};

export const createGameInstance = (
  id,
  pawns,
  gameConfig,
  shuffleFn = shuffle,
) => {
  const board = Board.create(boardConfig);
  const deck = new DeckManager(
    {
      suspects: gameConfig.suspects,
      weapons: gameConfig.weapons,
      rooms: gameConfig.rooms,
    },
    shuffleFn,
  );

  return new Game(id, board, pawns, deck);
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
