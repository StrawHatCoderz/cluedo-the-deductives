import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { PAWNS } from "../../src/constants/game_config.js";
import { Lobby } from "../../src/models/lobby.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

describe("LOBBY", () => {
  let lobby;
  const pawns = PAWNS.map(({ name, color }) => ({ name, color }));
  const max = 6;
  const min = 3;
  const id = 1;
  beforeEach(() => {
    lobby = new Lobby(id, max, min, pawns);
  });

  describe("add player", () => {
    it(" => should add player into lobby and assign character", () => {
      lobby.addPlayer(1, "name", true);
      const state = lobby.getState(1);

      assertEquals(state.players, [
        {
          character: {
            color: PAWNS[5].color,
            name: PAWNS[5].name,
          },
          id: 1,
          isHost: true,
          name: "name",
        },
      ]);
    });

    it(" => should not add player into lobby if max player reached", () => {
      lobby.addPlayer(1, "username", true);
      lobby.addPlayer(2, "username", true);
      lobby.addPlayer(3, "username", true);
      lobby.addPlayer(4, "username", true);
      lobby.addPlayer(5, "username", true);
      lobby.addPlayer(6, "username", true);

      assertThrows(
        () => lobby.addPlayer(7, "username", true),
        ValidationError,
        "MaxPlayer reached",
      );
    });

    it(" => should not add player into lobby if looby is not at waiting state", () => {
      lobby.addPlayer(1, "username", true);
      lobby.addPlayer(2, "username", false);
      lobby.addPlayer(3, "username", false);
      lobby.updateState(1);
      assertThrows(
        () => lobby.addPlayer(4, "username", true),
        ValidationError,
        "Game already started",
      );
    });
  });

  describe("get state", () => {
    it(" => should throw validation error current lobby state if playerId is invalid", () => {
      assertThrows(
        () => lobby.getState(5),
        ValidationError,
        "Invalid player id",
      );
    });
    it(" => should give current lobby state playerId is valid", () => {
      lobby.addPlayer(1, "tony", true);
      const state = lobby.getState(1);

      assertEquals(state.isStarted, false);
      assertEquals(state.players[0].name, "tony");
    });

    it(" => should give current lobby state: two players", () => {
      lobby.addPlayer(2, "tony", true);
      lobby.addPlayer(3, "steve", false);

      const state = lobby.getState(2);

      assertEquals(state.id, id);
      assertEquals(state.players.length, 2);
      assertEquals(state.isStarted, false);
    });
  });

  describe("is host", () => {
    it(" => should return true if a player is host", () => {
      lobby.addPlayer(1, "name", true);
      const isHost = lobby.isHost(1);
      assertEquals(isHost, true);
    });

    it(" => should return false if a player is not host", () => {
      lobby.addPlayer(1, "name", false);
      const isHost = lobby.isHost(1);
      assertEquals(isHost, false);
    });
  });

  describe("update state", () => {
    it(" => should update state if valid player count", () => {
      lobby.addPlayer(1, "name", true);
      lobby.addPlayer(2, "name", false);
      lobby.addPlayer(3, "name", false);
      lobby.addPlayer(4, "name", false);
      lobby.addPlayer(5, "name", false);
      lobby.updateState(1);
      const state = lobby.getState(1);

      assertEquals(state.isStarted, true);
    });

    it(" => should not update state if invalid player count", () => {
      lobby.addPlayer(1, "username", true);

      assertThrows(() => lobby.updateState(1), ValidationError);
    });

    it(" => should not update state if requester is not host", () => {
      lobby.addPlayer(1, "username1", true);
      lobby.addPlayer(2, "username2", false);

      assertThrows(() => lobby.updateState(2), ValidationError);
    });

    it(" => should not update state if game already started", () => {
      lobby.addPlayer(1, "host", true);
      lobby.addPlayer(2, "p2", false);
      lobby.addPlayer(3, "p3", false);

      lobby.updateState(1);

      assertThrows(
        () => lobby.updateState(1),
        ValidationError,
        "Game has already started",
      );
    });
  });

  describe("leave lobby", () => {
    it(" => should remove player from lobby", () => {
      lobby.addPlayer(1, "tony", true);
      lobby.addPlayer(2, "steve", false);

      lobby.leaveLobby(2);

      const state = lobby.getState(1);

      assertEquals(state.players.length, 1);
      assertEquals(state.players[0].id, 1);
    });

    it(" => should throw error if player is not present", () => {
      lobby.addPlayer(1, "tony", true);

      assertThrows(
        () => lobby.leaveLobby(999),
        ValidationError,
        "Player is not present",
      );
    });

    it(" => should reassign host if host leaves", () => {
      lobby.addPlayer(1, "tony", true);
      lobby.addPlayer(2, "steve", false);

      lobby.leaveLobby(1);

      const state = lobby.getState(2);

      assertEquals(state.players[0].isHost, true);
      assertEquals(state.players[0].id, 2);
    });
  });
});
