import { beforeEach, describe, it } from "@std/testing/bdd";
import { createGameInstance } from "../../src/utils/game.js";
import { assertEquals } from "@std/assert/equals";
import { createApp } from "../../src/app.js";
import {
  serveUpdatePawnPosition,
  toggleTileOccupied,
} from "../../src/handlers/board.js";
import { boardConfig } from "../../src/constants/board_config.js";
import { Board } from "../../src/models/board.js";
import { Player } from "../../src/models/player.js";

const mockGameInstance = () => {
  const game = createGameInstance();
  const p1 = new Player(1, "thor", false);
  const p2 = new Player(2, "hulk", true);
  const p3 = new Player(3, "deadpool", false);
  game.addPlayer(p1);
  game.addPlayer(p2);
  game.addPlayer(p3);
  game.start();
  game.changeCurrentState();
  game.updateTurn();
  return game;
};

describe("BOARD", () => {
  let app;
  let game;
  beforeEach(() => {
    game = createGameInstance();
    app = createApp(game, () => 1, (x) => x, () => (_, next) => next());
  });

  describe("GET /roll-and-get-turns", () => {
    it(" => should get dice value and reachable positions", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      const res = await app.request("/roll-and-get-turns");
      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body.diceValue, 12);
    });
  });

  describe("POST /update-pawn-position", () => {
    it(" => should update pawn position", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      const res = await app.request("/update-pawn-position", {
        method: "post",
        body: JSON.stringify({
          currentNodeId: "tile-7-24",
          turns: ["tile-7-24"],
        }),
      });
      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body, { status: true });
    });
  });

  describe("update pawn position", () => {
    it(" => should update pawn position: from reachable nodes", async () => {
      const mockContext = {
        get: mockGameInstance,
        json(value) {
          return JSON.stringify(value);
        },
        req: {
          json() {
            return {
              currentNodeId: "tile-7-24",
              turns: ["tile-7-24", "tile-0-2"],
            };
          },
        },
      };
      const result = await serveUpdatePawnPosition(mockContext);
      assertEquals(JSON.parse(result), { status: true });
    });

    it(" => should update pawn position: from room", async () => {
      const mockContext = {
        get: mockGameInstance,
        json(value) {
          return JSON.stringify(value);
        },
        req: {
          json() {
            return {
              currentNodeId: "kitchen",
              turns: ["tile-4-6", "kitchen"],
            };
          },
        },
      };
      const result = await serveUpdatePawnPosition(mockContext);
      assertEquals(JSON.parse(result), { status: true });
    });
  });
  describe("catch error", () => {
    it(" => should catch error: from not reachable nodes", async () => {
      const mockContext = {
        get: mockGameInstance,
        json(value) {
          return JSON.stringify(value);
        },
        req: {
          json() {
            return {
              currentNodeId: "tile-1-1",
              turns: ["tile-0-1", "tile-0-2"],
            };
          },
        },
      };
      const result = await serveUpdatePawnPosition(mockContext);
      assertEquals(JSON.parse(result), { status: false });
    });
  });

  it(" => should give all possible reachable positions: from a room(board config)", () => {
    const board = boardConfig;
    const smallBoard = new Board({
      ...board,
    });
    assertEquals(smallBoard.getReachableNodes("kitchen", 1), ["tile-4-6"]);
  });
  it(" => should toggle tile:  moved to selected tile", () => {
    const game = mockGameInstance();
    assertEquals(toggleTileOccupied("tile-7-23", game), true);
  });

  it(" => should toggle tile:  moved from current tile", () => {
    const game = mockGameInstance();
    toggleTileOccupied("tile-7-23", game);
    assertEquals(toggleTileOccupied("tile-7-23", game), false);
  });
});
