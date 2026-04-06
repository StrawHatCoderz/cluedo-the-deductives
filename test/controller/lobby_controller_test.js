import { assert, assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { LobbyController } from "../../src/controllers/lobby_controller.js";
import { expect, fn } from "@std/expect";

describe("LOBBY", () => {
  describe("create lobby controller", () => {
    it(" => should throw error if createLobby fn is not provided", () => {
      assertThrows(() => new LobbyController());
    });

    it(" => should create lobby controller if createLobby fn is provided", () => {
      assert(() => new LobbyController(createLobby));
    });
  });

  describe("get lobby state", () => {
    it("=> should give a lobby state", () => {
      const lobby = {
        getState: fn(() => ({ id: 1 })),
        addPlayer: fn(),
      };
      const lobbyController = new LobbyController(() => lobby);
      lobbyController.hostLobby("username");
      const state = lobbyController.getLobbyState(1);

      assertEquals(state, { id: 1 });
      expect(lobby.getState).toHaveBeenCalledTimes(2);
    });
  });

  describe("hostLobby", () => {
    it("=> should create a lobby and add the player as host", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, username) =>
          players.push({ id, username, isHost: true })
        ),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = new LobbyController(() => lobby);
      const { playerId, lobbyId } = lobbyController.hostLobby("username");
      assertEquals(players[0].username, "username");
      assertEquals(playerId, 1);
      assertEquals(lobbyId, 1);
    });
  });

  describe("joinLobby", () => {
    it("=> should join a lobby and add the player", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, username, isHost) =>
          players.push({ id, username, isHost })
        ),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = new LobbyController(() => lobby);
      lobbyController.hostLobby("loki");
      const { playerId, lobbyId } = lobbyController.joinLobby("thor", 1);
      assertEquals(players, [
        {
          id: 1,
          isHost: true,
          username: "loki",
        },
        {
          id: 2,
          isHost: false,
          username: "thor",
        },
      ]);
      assertEquals(playerId, 2);
      assertEquals(lobbyId, 1);
    });

    it("=> should not join a lobby if lobby does not exists", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, username, isHost) =>
          players.push({ id, username, isHost })
        ),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = new LobbyController(() => lobby);
      assertThrows(() => lobbyController.joinLobby("thor", 1));
    });
  });
});
