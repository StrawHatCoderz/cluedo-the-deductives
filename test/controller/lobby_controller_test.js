import { assertEquals, assertThrows } from "@std/assert";
import { expect, fn } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { LobbyController } from "../../src/controllers/lobby_controller.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

describe("LOBBY", () => {
  describe("create lobby controller", () => {
    it(" => should throw error if createLobby fn is not provided", () => {
      assertThrows(
        () => LobbyController.create(),
        ValidationError,
        "createLobby should be a function",
      );
    });

    it(" => should create lobby controller if createLobby fn is provided", () => {
      expect(() => LobbyController.create(() => {})).not.toThrow();
    });
  });

  describe("get lobby state", () => {
    it("=> should give a lobby state", () => {
      const lobby = {
        getState: fn(() => ({ id: 1 })),
        addPlayer: fn(),
        isHost: fn(() => true),
      };

      const lobbyController = LobbyController.create(() => lobby);
      lobbyController.hostLobby("loki");
      const state = lobbyController.getLobbyState(1, 1);

      assertEquals(state, { id: 1, currentPlayerId: 1, isHost: true });
      expect(lobby.getState).toHaveBeenCalledTimes(2);
    });

    it("=> should throw validation error if lobby id is invalid", () => {
      const lobby = {
        getState: fn(() => ({ id: 1 })),
        addPlayer: fn(),
        isHost: fn(() => true),
      };

      const lobbyController = LobbyController.create(() => lobby);
      lobbyController.hostLobby("loki");
      assertThrows(
        () => lobbyController.getLobbyState(3, 1),
        ValidationError,
        "Invalid lobby id",
      );
    });
  });

  describe("hostLobby", () => {
    it(" => should create a lobby and add the player as host", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, name) => players.push({ id, name, isHost: true })),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = LobbyController.create(() => lobby);
      const { playerId, lobbyId } = lobbyController.hostLobby("name");
      assertEquals(players[0].name, "name");
      assertEquals(playerId, 1);
      assertEquals(lobbyId, 1);
    });
  });

  describe("joinLobby", () => {
    it(" => should join a lobby and add the player", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, name, isHost) => players.push({ id, name, isHost })),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = LobbyController.create(() => lobby);
      lobbyController.hostLobby("loki");
      const { playerId, lobbyId } = lobbyController.joinLobby("thor", 1);
      assertEquals(players, [
        {
          id: 1,
          isHost: true,
          name: "loki",
        },
        {
          id: 2,
          isHost: false,
          name: "thor",
        },
      ]);
      assertEquals(playerId, 2);
      assertEquals(lobbyId, 1);
    });

    it(" => should not join a lobby if lobby does not exists", () => {
      const players = [];
      const lobby = {
        addPlayer: fn((id, name, isHost) => players.push({ id, name, isHost })),
        getState: fn(() => ({ id: 1 })),
      };
      const lobbyController = LobbyController.create(() => lobby);
      assertThrows(
        () => lobbyController.joinLobby("thor", 1),
        ValidationError,
        "Lobby id 1 is invalid",
      );
    });
  });
  describe("updateLobbyState", () => {
    it(" => should call updateState on lobby with playerId", () => {
      const lobby = {
        updateState: fn(() => "started"),
        addPlayer: fn(),
        getState: fn(() => ({ id: 1 })),
      };

      const lobbyController = LobbyController.create(() => lobby);

      lobbyController.hostLobby("loki");

      const result = lobbyController.updateLobbyState(1, 1);

      assertEquals(result, "started");
      expect(lobby.updateState).toHaveBeenCalledWith(1);
      expect(lobby.updateState).toHaveBeenCalledTimes(1);
    });

    it(" => should throw if lobby does not exist", () => {
      const lobby = {
        updateState: fn(),
        addPlayer: fn(),
        getState: fn(() => ({ id: 1 })),
      };

      const lobbyController = LobbyController.create(() => lobby);

      assertThrows(
        () => lobbyController.updateLobbyState(1, 1),
        ValidationError,
        "1 Invalid Lobby Id",
      );
    });

    it(" => should throw if lobby id is invalid for getting state", () => {
      const lobbyController = new LobbyController();
      assertThrows(
        () => lobbyController.getLobbyState(1, 1),
        ValidationError,
        "Invalid lobby id",
      );
    });
  });
  describe("leaveLobby", () => {
    it(" => should call leaveLobby on the correct lobby with playerId", () => {
      const lobby = {
        leaveLobby: fn(() => "left"),
        addPlayer: fn(),
        getState: fn(() => ({ id: 1, players: [] })),
      };

      const lobbyController = LobbyController.create(() => lobby);

      lobbyController.hostLobby("loki");

      lobbyController.leaveLobby(1, 1);

      expect(lobby.leaveLobby).toHaveBeenCalledWith(1);
      expect(lobby.leaveLobby).toHaveBeenCalledTimes(1);
    });

    it(" => should call leaveLobby on the correct lobby with playerId and delete lobby if lastplayer", () => {
      const lobby = {
        leaveLobby: fn(() => "left"),
        addPlayer: fn(),
        getState: fn(() => ({ id: 1, players: ["one"] })),
        isHost: fn(() => true),
      };

      const lobbyController = LobbyController.create(() => lobby);

      lobbyController.hostLobby("loki");

      lobbyController.leaveLobby(1, 1);

      expect(lobby.leaveLobby).toHaveBeenCalledWith(1);
      expect(lobby.leaveLobby).toHaveBeenCalledTimes(1);
    });
    it(" => should throw error if lobby id is invalid", () => {
      const lobby = {
        leaveLobby: fn(),
        addPlayer: fn(),
        getState: fn(() => ({ id: 1 })),
      };

      const lobbyController = LobbyController.create(() => lobby);

      assertThrows(
        () => lobbyController.leaveLobby(999, 1),
        ValidationError,
        "Invalid lobby id",
      );
    });
  });
});
