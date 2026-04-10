import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { restrictNonActivePlayer } from "../../src/middleware/game_validations.js";

describe("restrictNonActivePlayer", () => {
  it(" => should call next if player is active", async () => {
    let nextCalled = false;

    const context = {
      get: (key) => {
        if (key === "gameController") {
          return {
            getActivePlayer: () => ({
              getPlayerData: () => ({ id: 1 }),
            }),
          };
        }
      },
      json: () => {},
    };

    globalThis.getCookie = (_, key) => {
      if (key === "lobbyId") return "123";
      if (key === "playerId") return "1";
    };

    const next = () => {
      nextCalled = true;
    };

    await restrictNonActivePlayer(context, next);

    assertEquals(nextCalled, true);
  });

  it(" => should return error if player is NOT active", async () => {
    let jsonResponse;

    const context = {
      get: (key) => {
        if (key === "gameController") {
          return {
            getActivePlayer: () => ({
              getPlayerData: () => ({ id: 2 }),
            }),
          };
        }
      },
      json: (body, status) => {
        jsonResponse = { body, status };
        return jsonResponse;
      },
    };

    globalThis.getCookie = (_, key) => {
      if (key === "lobbyId") return "123";
      if (key === "playerId") return "1";
    };

    const result = await restrictNonActivePlayer(context, () => {});

    assertEquals(result, {
      body: {
        success: false,
        error: "Only Active Player Can Perform Action",
      },
      status: 400,
    });
  });

  it(" => should compare numeric playerId correctly", async () => {
    let nextCalled = false;

    const context = {
      get: () => ({
        getActivePlayer: () => ({
          getPlayerData: () => ({ id: 5 }),
        }),
      }),
      json: () => {},
    };

    globalThis.getCookie = (_, key) => {
      if (key === "lobbyId") return "123";
      if (key === "playerId") return "5";
    };

    const next = () => {
      nextCalled = true;
    };

    await restrictNonActivePlayer(context, next);

    assertEquals(nextCalled, true);
  });
});
