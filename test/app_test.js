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

import { createGameInstance } from "../src/utils/game.js";

const silentLogger = () => (_, next) => next();

describe("APP TEST", () => {
  let app;
  let lobbyController;

  const setupApp = () => {
    const pawns = PAWNS.map(({ name, color }) => ({ name, color }));

    const createLobby = (id) => new Lobby(id, 6, 3, pawns);
    lobbyController = LobbyController.create(createLobby);

    const createGame = (id) =>
      createGameInstance(id, {
        suspects: SUSPECTS,
        weapons: WEAPONS,
        rooms: ROOMS,
      });

    const gameController = GameController.create(createGame);

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
    describe("POST /turn/roll", () => {
      it(" => should return dice values", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/turn/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.diceValues, [6, 6]);
      });
    });

    describe("GET /board/reachable-nodes", () => {
      it(" => should return reachable nodes", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        await app.request("/turn/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/board/reachable-nodes", {
          headers: { Cookie: cookie },
        });

        assertEquals(res.status, 200);
      });
    });

    describe("POST /board/update-pawn-position", () => {
      it(" => should update pawn position", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        await app.request("/turn/roll", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request(`/board/update-pawn-position/1`, {
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

      it(" => should fail if dice not rolled", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request(`/board/update-pawn-position/1`, {
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
    describe("POST /game/start", () => {
      it(" => should start the game", async () => {
        const { cookie } = setupLobby();

        const res = await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        assertEquals(res.status, 303);
      });
    });

    describe("GET /game", () => {
      it(" => should return game state", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/game", {
          headers: { Cookie: cookie },
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.success, true);
        assertEquals(body.data.pawns.length, 6);
      });
    });

    describe("POST /turn/accuse", () => {
      it(" => should fail for invalid accusation", async () => {
        const { cookie } = setupLobby();

        await app.request("/game/start", {
          method: "POST",
          headers: { Cookie: cookie },
        });

        const res = await app.request("/turn/accuse", {
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
        assertEquals(
          body.error.fieldErrors.suspect[0],
          `Invalid option: expected one of "miss scarlett"|"colonel mustard"|"mrs white"|"reverend green"|"mrs peacock"|"professor plum"`,
        );
      });
    });
  });

  describe("LOBBY", () => {
    describe("POST /lobby/create", () => {
      it(" => should fail if name missing", async () => {
        const res = await app.request("/lobby/create", {
          method: "POST",
          body: new FormData(),
          header: {
            "content-type": "multipart/formdata",
          },
        });
        const body = await res.json();
        assertEquals(res.status, 400);
        assertEquals(body.success, false);
        assertEquals(body.error, "Invalid player name");
      });

      it(" => should create lobby", async () => {
        const formData = new FormData();
        formData.append("name", "loki");

        const res = await app.request("/lobby/create", {
          method: "POST",
          body: formData,
          header: {
            "content-type": "multipart/formdata",
          },
        });

        const body = await res.json();
        const cookies = res.headers.getSetCookie();

        assertEquals(res.status, 201);
        assertEquals(body.success, true);
        assertEquals(cookies.length, 2);
      });
    });

    describe("POST /lobby/join", () => {
      it(" => should join lobby", async () => {
        lobbyController.hostLobby("loki");

        const res = await app.request("/lobby/join", {
          method: "POST",
          header: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "thor", roomId: "1" }),
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.success, true);
      });

      it(" => should not join lobby if username is undefined", async () => {
        lobbyController.hostLobby("loki");
        const res = await app.request("/lobby/join", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "", roomId: "1" }),
        });

        const body = await res.json();

        assertEquals(res.status, 400);
        assertEquals(body.success, false);
        assertEquals(body.error, "Invalid player name or room id");
      });

      it(" => should not join lobby if roomid is undefined", async () => {
        lobbyController.hostLobby("loki");

        const res = await app.request("/lobby/join", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "loki", roomId: "5" }),
        });

        const body = await res.json();

        assertEquals(res.status, 400);
        assertEquals(body.success, false);
        assertEquals(body.error, "Invalid room id");
      });
    });

    describe("GET /lobby", () => {
      it(" => should return lobby state", async () => {
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

  describe("POST /turn/secret-passage", () => {
    it(" => should fail if player cannot use secret passage", async () => {
      const { cookie } = setupLobby();

      await app.request("/game/start", {
        method: "POST",
        headers: { Cookie: cookie },
      });

      const res = await app.request("/board/secret-passage", {
        method: "PUT",
        headers: { Cookie: cookie },
      });

      const body = await res.json();

      assertEquals(res.status, 200);
      assertEquals(body.success, false);
      assertEquals(body.error, "Room Has No Secret Passage");
    });
  });

  describe("POST /turn/suspect", () => {
    it(" => should add a suspect combination", async () => {
      const { cookie } = setupLobby();

      await app.request("/game/start", {
        method: "POST",
        headers: { Cookie: cookie },
      });

      const suspicion = {
        weapon: "dagger",
        suspect: "scarlet",
        room: "hall",
      };
      await app.request(`/board/update-pawn-position/1`, {
        method: "PUT",
        headers: {
          Cookie: cookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          newNodeId: "hall",
          tiles: ["hall"],
          isUsingSecretPassage: false,
        }),
      });

      const res = await app.request("/turn/suspect", {
        method: "POST",
        body: JSON.stringify(suspicion),
        headers: { "content-type": "application/json", Cookie: cookie },
      });

      assertEquals(res.status, 200);
    });
  });

  describe("POST /game/confirmSuspicion", () => {
    it(" => shouldn't allowed to disprove without suspicion", async () => {
      const { cookie } = setupLobby();

      await app.request("/game/start", {
        method: "POST",
        headers: { Cookie: cookie },
      });

      const formData = new FormData();
      formData.append("disprove", "scarlet");

      const res = await app.request("/game/disprove", {
        method: "post",
        headers: {
          Cookie: cookie,
        },
        body: formData,
      });
      assertEquals(res.status, 400);
      assertEquals(await res.json(), {
        success: false,
        error: "Invalid game state",
      });
    });
  });

  describe("POST /game/disprove", () => {
    it("=> should throw invalid game state", async () => {
      const { cookie } = setupLobby();
      await app.request("game/start", {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
      });

      const formData = new FormData();
      formData.append("disprove", "scarlet");

      const res = await app.request("/game/disprove", {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
        body: formData,
      });

      const body = await res.json();
      assertEquals(res.status, 400);
      assertEquals(body.success, false);
    });
  });
});
