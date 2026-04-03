import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { createGameInstance } from "../../src/utils/game.js";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";

describe("game handler", () => {
  let app;
  let game;
  let playerId;
  beforeEach(() => {
    game = createGameInstance();

    app = createApp({
      game,
      getRandom: () => 1,
      roundUp: (x) => x,
      logger: () => (_, next) => next(),
    });
    playerId = 1;
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
      assertEquals(game.getState(playerId).state, "running");
    });
  });

  describe("GET /game-state", () => {
    it("=> should give current game state", async () => {
      await app.request("/start-game", { method: "post" });
      const res = await app.request("/game-state");
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body.state, "setup");
      assertEquals(body.pawns.length, 6);
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

  describe("POST /accuse", () => {
    it("=> should update the player turn", async () => {
      const res = await app.request("/accuse", {
        method: "post",
        body: JSON.stringify({
          suspect: SUSPECTS[0],
          weapon: WEAPONS[0],
          room: ROOMS[0],
        }),
      });
      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body.isCorrect, false);
    });
  });
});
