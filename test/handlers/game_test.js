import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createGameInstance } from "../../src/utils/game.js";
import { createApp } from "../../src/app.js";

describe("game handler", () => {
  let app;
  let game;
  beforeEach(() => {
    game = createGameInstance();

    app = createApp(game, () => 1, (x) => x, () => (_, next) => next());
  });

  describe("POST /update-state", () => {
    it("=> should update current game state", async () => {
      await app.request("/start-game", { method: "post" });
      const res = await app.request("/update-state", { method: "post" });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body.state, "running");
    });
  });

  describe("POST /start-game", () => {
    it("=> should start the game by distribute cards , change the game state and set TurnOrder ", async () => {
      await app.request("/update-state", { method: "post" });
      const res = await app.request("/start-game", { method: "post" });
      assertEquals(res.status, 303);
      assertEquals(game.getCurrentState().state, "running");
    });
  });

  describe("GET /game-state", () => {
    it("=> should give current game state", async () => {
      const res = await app.request("/game-state");
      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body.state, "waiting");
      assertEquals(body.pawns.length, 6);
    });
  });

  describe("GET /total-players", () => {
    it("=> should give total players count", async () => {
      const res = await app.request("/total-players");
      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body.totalPlayers, 0);
    });
  });

  describe("POST /pass", () => {
    it("=> should update the player turn", async () => {
      await app.request("/start-game", { method: "post" });
      await app.request("/update-state", { method: "post" });
      const res = await app.request("/pass", { method: "post" });
      const body = await res.json();
      assertEquals(res.status, 200);
      assertEquals(body.currentPlayer.isEliminated, false);
    });
  });
});
