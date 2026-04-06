import { assertEquals } from "@std/assert/equals";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../src/app.js";
import { boardConfig } from "../src/constants/board_config.js";
import {
  PAWNS,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "../src/constants/game_config.js";
import { LobbyController } from "../src/controllers/lobby_controller.js";
import { Board } from "../src/models/board.js";
import { Lobby } from "../src/models/lobby.js";
import { createGameInstance } from "../src/utils/game.js";

const silentLogger = () => (_, next) => next();

describe("APP TEST", () => {
  let app;
  let game;
  let lobbyController;
  beforeEach(() => {
    game = createGameInstance((list) => list);
    const pawns = PAWNS.map(({ name, color }) => ({ name, color }));
    const createLobby = (id) => new Lobby(id, 6, 3, pawns);
    lobbyController = new LobbyController(createLobby);
    app = createApp({
      game,
      getRandom: () => 1,
      roundUp: (x) => x,
      logger: () => (_, next) => next(),
      lobbyController,
    });
  });

  describe("BOARD", () => {
    describe("POST /roll", () => {
      it(" => should get dice value", async () => {
        await app.request("/start-game", { method: "POST" });

        await app.request("/update-state", { method: "POST" });
        const res = await app.request("/roll", { method: "POST" });
        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.diceValues, [6, 6]);
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

  describe("game handler", () => {
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
        assertEquals(game.getState().state, "running");
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
        const game = { updateTurn: () => ({ isEliminated: false }) };
        const app = createApp({ game, logger: silentLogger });

        const res = await app.request("/pass", { method: "post" });
        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body, { currentPlayer: { isEliminated: false } });
      });
    });

    describe("POST /accuse", () => {
      it("=> should fail if invalid accusation combination is provided", async () => {
        await app.request("/start-game", { method: "post" });
        const res = await app.request("/accuse", {
          method: "post",
          body: JSON.stringify({
            weapon: WEAPONS[0],
            room: ROOMS[0],
          }),
        });
        const body = await res.json();

        assertEquals(res.status, 400);
        assertEquals(body.error, "Invalid Accusation Combination");
      });

      it("=> should accuse the murder combination", async () => {
        await app.request("/start-game", { method: "post" });
        await app.request("/update-state", { method: "post" });

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
        assertEquals(body.isCorrect, true);
      });

      it("=> should eliminate for wrong murder combination", async () => {
        await app.request("/start-game", { method: "post" });
        await app.request("/update-state", { method: "post" });

        const res = await app.request("/accuse", {
          method: "post",
          body: JSON.stringify({
            suspect: SUSPECTS[0],
            weapon: WEAPONS[1],
            room: ROOMS[0],
          }),
        });

        const body = await res.json();
        assertEquals(res.status, 200);
        assertEquals(body.isCorrect, false);
      });
    });

    describe("POST /suspect", () => {
      it("=> should return false if the player is not in the room", async () => {
        await app.request("/start-game", { method: "post" });

        const res = await app.request("/suspect", {
          method: "post",
          body: JSON.stringify({
            suspect: SUSPECTS[0],
            weapon: WEAPONS[0],
            room: ROOMS[0],
          }),
          Headers: { "text-content": "application/json" },
        });

        const body = await res.json();

        assertEquals(res.status, 200);
        assertEquals(body.status, false);
      });
    });
  });

  describe("LOBBY", () => {
    describe("POST /lobby/create", () => {
      it("=> should not create a lobby if name is not provided", async () => {
        const res = await app.request("/lobby/create", { method: "post" });
        const body = await res.json();
        assertEquals(body.success, false);
        assertEquals(body.data, {});
        assertEquals(body.error, "Invalid name");
        assertEquals(res.status, 400);
      });

      it("=> should create a lobby if name is provided", async () => {
        const formData = new FormData();
        formData.append("name", "loki");
        const res = await app
          .request("/lobby/create", {
            method: "post",
            body: formData,
          });
        const body = await res.json();

        assertEquals(body.success, true);
        assertEquals(body.data, { lobbyId: 1, playerId: 1 });
        assertEquals(res.status, 201);
      });
    });

    describe("POST /lobby/join", () => {
      it("=> should not join a lobby if name is not provided", async () => {
        const res = await app.request("/lobby/join", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "" }),
        });
        const body = await res.json();
        assertEquals(body.success, false);
        assertEquals(body.data, {});
        assertEquals(body.error, "Invalid name");
        assertEquals(res.status, 400);
      });

      it("=> should not join a lobby if roomId is not provided", async () => {
        const res = await app.request("/lobby/join", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "loki", roomId: "" }),
        });

        const body = await res.json();
        assertEquals(body.success, false);
        assertEquals(body.data, {});
        assertEquals(body.error, "Invalid RoomId");
        assertEquals(res.status, 400);
      });

      it("=> should not join a lobby if  roomId is provided bit roomId is invalid", async () => {
        const formData = new FormData();
        formData.append("name", "loki");
        await app
          .request("/lobby/create", {
            method: "post",
            body: formData,
          });

        const res = await app.request("/lobby/join", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "loki", roomId: "2" }),
        });

        const body = await res.json();

        assertEquals(body.success, false);
        assertEquals(body.error, "RoomId is invalid");
        assertEquals(res.status, 400);
      });

      it("=> should join a lobby if name and roomId is provided and roomId is valid", async () => {
        const formData = new FormData();
        formData.append("name", "loki");
        await app
          .request("/lobby/create", {
            method: "post",
            body: formData,
          });

        const res = await app.request("/lobby/join", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ name: "loki", roomId: "1" }),
        });

        const body = await res.json();

        assertEquals(body.success, true);
        assertEquals(body.data, { lobbyId: 1, playerId: 2 });
        assertEquals(res.status, 200);
      });
    });

    describe("GET /lobby", () => {
      it(" => should return the state of lobby after creating new lobby", async () => {
        const { playerId, lobbyId } = lobbyController.hostLobby("tony");

        const res = await app.request("/lobby", {
          headers: {
            Cookie: `lobbyId=${lobbyId}; playerId=${playerId}`,
          },
        });
        const { data, success } = await res.json();

        assertEquals(success, true);
        assertEquals(data.players.length, 1);
        assertEquals(data.players[0].name, "tony");
      });
    });
  });
});
