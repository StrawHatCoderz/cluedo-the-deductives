import { assertEquals } from "@std/assert/equals";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { boardConfig } from "../../src/constants/board_config.js";
import { Board } from "../../src/models/board.js";

describe("BOARD", () => {
  const baseConfig = {
    size: { height: 4, width: 4 },

    rooms: {
      room1: {
        id: "room1",
        areas: [{ start: { x: 1, y: 1 }, end: { x: 2, y: 2 } }],
        doors: [{ x: 0, y: 1 }],
      },
    },

    walls: [{ start: { x: 0, y: 3 }, end: { x: 3, y: 3 } }],

    startingPositions: {
      p1: { x: 0, y: 0 },
    },

    secretPassages: {},
  };

  beforeEach(() => {
    Board.create(baseConfig);
  });

  describe("get reachable nodes", () => {
    it(" => should give all possible reachable positions: from a door", () => {
      const smallBoard = Board.create({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      assertEquals(smallBoard.getReachableNodes("tile-0-1", 2), ["room1"]);
    });

    it(" => should give all possible reachable positions: from a tile", () => {
      const smallBoard = Board.create({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      assertEquals(smallBoard.getReachableNodes("tile-0-1", 1), ["room1"]);
    });

    it(" => should give all possible reachable positions: from a occupied tile", () => {
      const smallBoard = Board.create({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      assertEquals(smallBoard.getReachableNodes("tile-0-0", 1), [
        "tile-1-0",
        "tile-0-1",
      ]);
    });

    it(" => should give all possible reachable positions: from a room(mock)", () => {
      const smallBoard = Board.create({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      assertEquals(smallBoard.getReachableNodes("room1", 1), ["tile-0-1"]);
    });

    it(" => should give all possible reachable positions: from a room(board config)", () => {
      const board = boardConfig;
      const smallBoard = Board.create({
        ...board,
      });
      assertEquals(smallBoard.getReachableNodes("kitchen", 1), ["tile-4-7"]);
    });
  });
});
