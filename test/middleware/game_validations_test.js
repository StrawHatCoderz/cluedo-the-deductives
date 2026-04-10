import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  isAllowedToDisprove,
  isAllowedToGetDisprovedCard,
  isRollAllowed,
  restrictNonActivePlayer,
} from "../../src/middleware/game_validations.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

describe("restrictNonActivePlayer", () => {
  it(" => should call next if player is active", async () => {
    let nextCalled = false;

    const context = {
      req: {
        raw: {
          headers: {
            get: () => "lobbyId=123; playerId=1",
          },
        },
      },
      get: () => ({
        getActivePlayer: () => ({
          getPlayerData: () => ({ id: 1 }),
        }),
      }),
      json: () => {},
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
      req: {
        raw: {
          headers: {
            get: () => "lobbyId=123; playerId=1",
          },
        },
      },
      get: () => ({
        getActivePlayer: () => ({
          getPlayerData: () => ({ id: 2 }),
        }),
      }),
      json: (body, status) => {
        jsonResponse = { body, status };
        return jsonResponse;
      },
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
      req: {
        raw: {
          headers: {
            get: () => "lobbyId=123; playerId=5",
          },
        },
      },
      get: () => ({
        getActivePlayer: () => ({
          getPlayerData: () => ({ id: 5 }),
        }),
      }),
      json: () => {},
    };

    const next = () => {
      nextCalled = true;
    };

    await restrictNonActivePlayer(context, next);

    assertEquals(nextCalled, true);
  });
});

describe("isAllowedToGetDisprovedCard", () => {
  it("should throw error on invalidPlayerId", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 2,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => {};
    assertThrows(
      () => isAllowedToGetDisprovedCard(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw error on before Disproving", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          disprovalData: { hasDisproved: false },
        }),
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => {};
    assertThrows(
      () => isAllowedToGetDisprovedCard(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw error on invalid lobby id", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          disprovalData: { hasDisproved: false },
        }),
        isValidLobby: () => false,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => {};
    assertThrows(
      () => isAllowedToGetDisprovedCard(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should call next function", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          disprovalData: { hasDisproved: true },
        }),
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertEquals(isAllowedToGetDisprovedCard(context, next, parseCookie), true);
  });
});

describe("isRollAllowed", () => {
  it("should throw error on invalid lobbyId", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        isValidLobby: () => false,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertThrows(
      () => isRollAllowed(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw error on invalid player", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        isRollAllowed: () => false,
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 2,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertThrows(
      () => isRollAllowed(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should call next", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        isRollAllowed: () => true,
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertEquals(isRollAllowed(context, next, parseCookie), true);
  });
});

describe("isAllowedToDisprove", () => {
  it("should throw if lobby id is invalid", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),

        isValidLobby: () => false,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertThrows(
      () => isAllowedToDisprove(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw if suspicion has not made", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        hasSuspected: () => false,
        isValidLobby: () => true,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertThrows(
      () => isAllowedToDisprove(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw if disprovable player is invalid", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        hasSuspected: () => true,
        isValidLobby: () => true,
        getDisprovablePlayer: () => 2,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertThrows(
      () => isAllowedToDisprove(context, next, parseCookie),
      ValidationError,
    );
  });
  it("should throw if disprovable player is invalid", () => {
    const KEYS = {
      gameController: {
        getGameState: () => ({
          activePlayer: { id: 1 },
          hasDisproved: true,
        }),
        hasSuspected: () => true,
        isValidLobby: () => true,
        getDisprovablePlayer: () => 1,
      },
    };
    const COOKIES = {
      lobbyId: 2,
      playerId: 1,
    };
    const context = {
      get: (key) => KEYS[key],
    };

    const parseCookie = (_, key) => COOKIES[key];
    const next = () => true;
    assertEquals(isAllowedToDisprove(context, next, parseCookie), true);
  });
});
