import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/equals";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Board } from "../../src/models/board.js";

describe("BOARD buildBoard", () => {
  let board;

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
    board = new Board(baseConfig);
  });

  describe("tile creation", () => {
    it(" => should create tiles only in valid areas", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assertEquals(graph["room1"].type, "room");
      assertEquals(graph["tile-0-0"].type, "tile");
    });
  });

  describe("adjacency", () => {
    it(" => should assign correct adjacent tiles", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      const tile = graph["tile-0-0"];

      assertEquals(
        tile.adj.filter((a) => a.startsWith("tile")).sort(),
        ["tile-0-1", "tile-1-0"].sort(),
      );
    });

    it(" => should not include out-of-bound coordinates", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      const tile = graph["tile-0-0"];

      const hasInvalid = tile.adj.some((id) => id.includes("--1"));

      assertEquals(hasInvalid, false);
    });
  });

  describe("occupancy", () => {
    it(" => should mark starting positions as occupied", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assertEquals(graph["tile-0-0"].isOccupied, true);
    });

    it(" => should mark non-starting tiles as not occupied", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assertEquals(graph["tile-0-1"].isOccupied, false);
    });
  });

  describe("room graph", () => {
    it(" => should create room nodes in graph", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assert(graph["room1"]);
      assertEquals(graph["room1"].type, "room");
    });

    it(" => should link room to its door tiles", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assertEquals(graph["room1"].adj, ["tile-0-1"]);
    });

    it(" => should link door tile back to room", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      const tile = graph["tile-0-1"];

      assert(tile.adj.includes("room1"));
    });

    it(" => should preserve tile adjacency when adding room links", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      const tile = graph["tile-0-1"];

      assert(tile.adj.includes("tile-0-0"));
      assert(tile.adj.includes("room1"));
    });

    it(" => should not crash if door is inside invalid area", () => {
      const badConfig = {
        ...baseConfig,
        rooms: {
          room1: {
            id: "room1",
            areas: [[{ start: { x: 1, y: 1 }, end: { x: 2, y: 2 } }]],
            doors: [{ x: 1, y: 1 }],
          },
        },
      };

      const badBoard = new Board(badConfig);

      badBoard.buildBoard();

      const graph = badBoard.getBoardState();

      assert(graph["room1"]);
      assertEquals(graph["room1"].adj, ["tile-1-1"]);
    });
  });

  describe("edge cases", () => {
    it(" => should handle empty board", () => {
      const emptyBoard = new Board({
        ...baseConfig,
        size: { height: 0, width: 0 },
      });

      emptyBoard.buildBoard();
      const graph = emptyBoard.getBoardState();

      assertEquals(Object.keys(graph).length, 1);
    });

    it(" => should not create tiles outside bounds", () => {
      const smallBoard = new Board({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });

      smallBoard.buildBoard();
      const graph = smallBoard.getBoardState();

      assertEquals(graph["tile-2-2"], undefined);
    });

    it(" => should have bidirectional edges between tile and room", () => {
      board.buildBoard();
      const graph = board.getBoardState();

      assert(graph["tile-0-1"].adj.includes("room1"));
      assert(graph["room1"].adj.includes("tile-0-1"));
    });
  });
  describe("get reachable nodes", () => {
    it(" => should give all possible reachable positions: from a door", () => {
      const smallBoard = new Board({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      smallBoard.buildBoard();
      assertEquals(smallBoard.getReachableNodes("tile-0-1", 2), ["room1"]);
    });

    it(" => should give all possible reachable positions: from a tile", () => {
      const smallBoard = new Board({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      smallBoard.buildBoard();
      const board = smallBoard.getBoardState();
      console.log({ board });

      assertEquals(smallBoard.getReachableNodes("tile-0-1", 1), ["room1"]);
    });

    it(" => should give all possible reachable positions: from a occupied tile", () => {
      const smallBoard = new Board({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      smallBoard.buildBoard();
      const board = smallBoard.getBoardState();
      console.log({ board });

      assertEquals(smallBoard.getReachableNodes("tile-0-0", 1), []);
    });

    it(" => should give all possible reachable positions: from a room", () => {
      const smallBoard = new Board({
        ...baseConfig,
        size: { height: 2, width: 2 },
      });
      smallBoard.buildBoard();
      const board = smallBoard.getBoardState();
      console.log({ board });

      assertEquals(smallBoard.getReachableNodes("room1", 1), ["tile-0-1"]);
    });
  });
});
