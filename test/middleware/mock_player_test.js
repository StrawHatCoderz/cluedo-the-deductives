import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { createGameInstance } from "../../src/utils/game.js";

describe("add mock player", () => {
  it("add mock player  should add the mock players to the game", async () => {
    const game = createGameInstance();
    const app = createApp(game);
    await app.request("/start-game", { method: "post" });
    const players = game.getAllPlayers();
    assertEquals(players.length, 3);
  });
});
