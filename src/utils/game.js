import { boardConfig } from "../constants/boardConfig.js";
import { PAWNS, ROOMS, SUSPECTS, WEAPONS } from "../constants/game_config.js";
import { Board } from "../models/board.js";
import { DeckManager } from "../models/deck_manager.js";
import { Game } from "../models/game.js";
import { Pawn } from "../models/pawn.js";

const createPawns = () =>
  PAWNS
    .map(({ name, position, color }, index) =>
      new Pawn(index + 1, name, position, color)
    );

export const createGameInstance = () => {
  const board = new Board(boardConfig);
  const pawns = createPawns();
  const deck = new DeckManager({
    suspects: SUSPECTS,
    weapons: WEAPONS,
    rooms: ROOMS,
  });
  return new Game(1, board, pawns, deck);
};
