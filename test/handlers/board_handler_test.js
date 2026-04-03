import { assertEquals } from "@std/assert/equals";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { boardConfig } from "../../src/constants/board_config.js";
import { movePawnHandler } from "../../src/handlers/board_handler.js";
import { Board } from "../../src/models/board.js";
import { Player } from "../../src/models/player.js";
import { createGameInstance } from "../../src/utils/game.js";

describe("BOARD", () => {
  let app;
  let game;
  beforeEach(() => {
    game = createGameInstance();
    app = createApp({
      game,
      getRandom: () => 1,
      roundUp: (x) => x,
      logger: () => (_, next) => next(),
    });
  });

  describe("POST /roll", () => {
    it(" => should get dice value", async () => {
      await app.request("/start-game", { method: "POST" });

      await app.request("/update-state", { method: "POST" });
      const res = await app.request("/roll", { method: "POST" });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body.diceValue, 12);
    });
  });
  describe("GET /get-reachable-nodes", () => {
    it(" => should get dice value and reachable positions", async () => {
      await app.request("/start-game", { method: "post" });

      await app.request("/update-state", { method: "post" });
      await app.request("/roll", { method: "post" });
      const res = await app.request("/get-reachable-nodes");

      assertEquals(res.status, 200);
    });
  });

  describe("POST /update-pawn-position", () => {
    it(" => should update pawn position", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      await app.request("/roll", { method: "post" });
      const res = await app.request(`/update-pawn-position/1`, {
        method: "put",
        body: JSON.stringify({
          newNodeId: "tile-7-24",
          tiles: ["tile-7-24"],
          isUsingSecretPassage: false,
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body, { status: true });
    });

    it(" => should not update pawn position if did not roll dice", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      const res = await app.request(`/update-pawn-position/1`, {
        method: "put",
        body: JSON.stringify({
          newNodeId: "tile-7-24",
          tiles: ["tile-7-24"],
          isUsingSecretPassage: false,
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 400);
      assertEquals(body, { status: false });
    });
  });

  describe("catch error", () => {
    it(" => should catch error: from not reachable nodes", async () => {
      const mockContext = {
        get() {
          const game = createGameInstance();
          const p1 = new Player(1, "thor", false);
          const p2 = new Player(2, "hulk", true);
          const p3 = new Player(3, "deadpool", false);
          game.addPlayer(p1);
          game.addPlayer(p2);
          game.addPlayer(p3);
          game.changeCurrentState();
          game.start();
          return game;
        },
        json(value) {
          return JSON.stringify(value);
        },
        req: {
          json() {
            return {
              newNodeId: "tile-1-1",
              tiles: ["tile-0-1", "tile-0-2"],
            };
          },
          param() {
            return "1";
          },
        },
      };
      const result = await movePawnHandler(mockContext);
      assertEquals(JSON.parse(result), { status: false });
    });
  });
  it(" => should give all possible reachable positions: from a room(board config)", () => {
    const board = boardConfig;
    const smallBoard = Board.create({
      ...board,
    });
    assertEquals(smallBoard.getReachableNodes("kitchen", 1), ["tile-4-7"]);
  });

  describe("secret passage", () => {
    it(" => should set secret passage", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      await app.request("/roll", { method: "post" });
      const res = await app.request(`/update-pawn-position/1`, {
        method: "put",
        body: JSON.stringify({
          newNodeId: "tile-7-24",
          tiles: ["tile-7-24"],
          isUsingSecretPassage: true,
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body, { status: true });
    });
  });

  describe("movement", () => {
    it(" => shouldn't move: starting position", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      await app.request("/roll", { method: "post" });
      const res = await app.request(`/update-pawn-position/1`, {
        method: "put",
        body: JSON.stringify({
          newNodeId: "tile-4-16",
          tiles: ["tile-4-16"],
          isUsingSecretPassage: false,
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body, { status: true });
    });
    it(" => shouldn't move: starting position", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      await app.request("/roll", { method: "post" });
      const res = await app.request(`/update-pawn-position/1`, {
        method: "put",
        body: JSON.stringify({
          newNodeId: "tile-0-17",
          tiles: ["tile-0-17"],
          isUsingSecretPassage: false,
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body, { status: true });
    });
  });
});
