import { assertEquals } from "@std/assert/equals";
import { beforeEach, describe, it } from "@std/testing/bdd";

import { createApp } from "../src/app.js";
import {
  PAWNS,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "../src/constants/game_config.js";

import { GameController } from "../src/controllers/game_controller.js";
import { LobbyController } from "../src/controllers/lobby_controller.js";

import { Lobby } from "../src/models/lobby.js";
import { Pawn } from "../src/models/pawn.js";

import { createGameInstance } from "../src/utils/game.js";

const silentLogger = () => (_, next) => next();

describe.ignore("APP TEST", () => {
  let app;
  let lobbyController;

  const setupApp = () => {
    const pawns = PAWNS.map(({ name, color }) => ({ name, color }));

    const createLobby = (id) => new Lobby(id, 6, 3, pawns);
    lobbyController = LobbyController.create(createLobby);

    const createGame = (id, pawnInstances) =>
      createGameInstance(id, pawnInstances, {
        suspects: SUSPECTS,
        weapons: WEAPONS,
        rooms: ROOMS,
      });

    const createPawns = () =>
      PAWNS.map(
        ({ name, position, color }, i) =>
          new Pawn(i + 1, name, position, color),
      );

    const gameController = GameController.create(createGame, createPawns);

    app = createApp({
      gameController,
      lobbyController,
      getRandom: () => 1,
      roundUp: (x) => x,
      logger: silentLogger,
    });
  };

  const setupLobby = () => {
    const host = lobbyController.hostLobby("tony");

    lobbyController.joinLobby("banner", host.lobbyId);
    lobbyController.joinLobby("steve", host.lobbyId);

    return {
      lobbyId: host.lobbyId,
      playerId: host.playerId,
      cookie: `lobbyId=${host.lobbyId}; playerId=${host.playerId}`,
    };
  };

  beforeEach(() => {
    setupApp();
  });

  describe("BOARD", () => {
    describe("POST /roll", () => {
      it.only("should return dice values", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.diceValues, [6, 6]);
      });
    });

    describe("GET /get-reachable-nodes", () => {
      it("should return reachable nodes", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        await app.request("/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/get-reachable-nodes", {
          headers: { Cookie: cookie },
        });

        assertEquals(res.status, 200);
      });
    });

    describe("POST /update-pawn-position", () => {
      it("should update pawn position", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        await app.request("/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request(`/update-pawn-position/1`, {
          method: "PUT",
          headers: {
            Cookie: cookie,
            "content-type": "application/json",
          },
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

      it("should fail if dice not rolled", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request(`/update-pawn-position/1`, {
          method: "PUT",
          headers: {
            Cookie: cookie,
            "content-type": "application/json",
          },
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
  });

  describe("GAME HANDLER", () => {
    describe("POST /start-game", () => {
      it("should start the game", async () => {
        const { cookie } = setupLobby();

        const res = await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        assertEquals(res.status, 303);
      });
    });

    describe("GET /game-state", () => {
      it("should return game state", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/game-state", {
          headers: { Cookie: cookie },
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.success, true);
        assertEquals(body.data.pawns.length, 6);
      });
    });

    describe("POST /accuse", () => {
      it("should fail for invalid accusation", async () => {
        const { cookie } = setupLobby();

        await app.request("/start-game", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/accuse", {
          method: "POST",
          headers: {
            Cookie: cookie,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            weapon: WEAPONS[0],
            room: ROOMS[0],
          }),
        });

        const body = await res.json();

        assertEquals(res.status, 400);
        assertEquals(body.error, "Invalid Accusation Combination");
      });
    });
  });

  describe("LOBBY", () => {
    describe("POST /lobby/create", () => {
      it("should fail if name missing", async () => {
        const res = await app.request("/lobby/create", { method: "POST" });
        const body = await res.json();

        assertEquals(res.status, 400);
        assertEquals(body.success, false);
      });

      it("should create lobby", async () => {
        const formData = new FormData();
        formData.append("name", "loki");

        const res = await app.request("/lobby/create", {
          method: "POST",
          body: formData,
        });

        const body = await res.json();
        const cookies = res.headers.getSetCookie();

        assertEquals(res.status, 201);
        assertEquals(body.success, true);
        assertEquals(cookies.length, 2);
      });
    });

    describe("POST /lobby/join", () => {
      it("should join lobby", async () => {
        lobbyController.hostLobby("loki");

        const res = await app.request("/lobby/join", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "thor", roomId: "1" }),
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.success, true);
      });
    });

    describe("GET /lobby", () => {
      it("should return lobby state", async () => {
        const { lobbyId, playerId } = lobbyController.hostLobby("tony");

        const res = await app.request("/lobby", {
          headers: {
            Cookie: `lobbyId=${lobbyId}; playerId=${playerId}`,
          },
        });

        const body = await res.json();

        assertEquals(body.success, true);
        assertEquals(body.data.players.length, 1);
      });
    });
  });
});
