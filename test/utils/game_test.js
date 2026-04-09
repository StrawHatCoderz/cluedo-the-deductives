import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  createLobbyInstance,
  createPawnInstances,
  getPosition,
  parseNode,
} from "../../src/utils/game.js";

describe("UTILS", () => {
  describe("UTILS: PARSE NODE TEST", () => {
    it(" => should return parsed node id for rooms", () => {
      assertEquals(parseNode("kitchen"), ["kitchen", {
        x: null,
        y: null,
        room: "kitchen",
      }]);
    });

    it(" => should return parsed node id for tiles", () => {
      assertEquals(parseNode("tile-6-7"), ["tile-6-7", {
        x: "6",
        y: "7",
        room: null,
      }]);
    });
  });

  describe("UTILS: GET POSTION TEST", () => {
    it(" => should return position for room", () => {
      assertEquals(
        getPosition({ position: { x: null, y: null, room: "kitchen" } }),
        "kitchen",
      );
    });

    it(" => should return position for tile", () => {
      assertEquals(
        getPosition({ position: { x: 1, y: 2, room: null } }),
        "tile-1-2",
      );
    });
  });

  describe("UTILS: CREATE PAWN INSTANCES", () => {
    it(" => should create Pawn instances with correct data", () => {
      const pawns = [
        { name: "A", position: { x: 1, y: 2, room: null }, color: "red" },
        {
          name: "B",
          position: { x: null, y: null, room: "hall" },
          color: "blue",
        },
      ];

      const result = createPawnInstances(pawns);

      assertEquals(result[0].getPawnData().id, 1);
      assertEquals(result[0].getPawnData().name, "A");

      assertEquals(result[1].getPawnData().id, 2);
      assertEquals(result[1].getPawnData().name, "B");
    });
  });

  describe("UTILS: CREATE LOBBY INSTANCE", () => {
    it(" => should create Lobby instance with correct defaults", () => {
      const pawns = [
        { name: "A", color: "red" },
        { name: "B", color: "blue" },
        { name: "C", color: "green" },
      ];

      const lobby = createLobbyInstance("room-1", pawns);
      lobby.addPlayer(1, "Tony", true);
      const state = lobby.getState(1);

      assertEquals(state.id, "room-1");
      assertEquals(state.isStarted, false);
      assertEquals(state.players.length, 1);
    });

    it(" => should allow adding players until max limit", () => {
      const pawns = [
        { name: "A", color: "red" },
        { name: "B", color: "blue" },
        { name: "C", color: "green" },
        { name: "D", color: "yellow" },
        { name: "E", color: "black" },
        { name: "F", color: "white" },
      ];

      const lobby = createLobbyInstance("room-2", pawns);

      pawns.forEach((_, i) => {
        lobby.addPlayer(i, `Player-${i}`, i === 0);
      });

      assertEquals(lobby.getState(1).players.length, 6);

      assertThrows(() => {
        lobby.addPlayer(7, "Extra", false);
      });
    });

    it(" => should not allow game start below min players", () => {
      const pawns = [
        { name: "A", color: "red" },
        { name: "B", color: "blue" },
        { name: "C", color: "green" },
      ];

      const lobby = createLobbyInstance("room-3", pawns);

      lobby.addPlayer(1, "Host", true);

      assertThrows(() => {
        lobby.updateState(1);
      });
    });

    it(" => should start game when valid conditions are met", () => {
      const pawns = [
        { name: "A", color: "red" },
        { name: "B", color: "blue" },
        { name: "C", color: "green" },
      ];

      const lobby = createLobbyInstance("room-4", pawns);

      lobby.addPlayer(1, "Host", true);
      lobby.addPlayer(2, "P2", false);
      lobby.addPlayer(3, "P3", false);

      lobby.updateState(1);

      assertEquals(lobby.getState(1).isStarted, true);
    });

    it(" => should not allow non-host to start game", () => {
      const pawns = [
        { name: "A", color: "red" },
        { name: "B", color: "blue" },
        { name: "C", color: "green" },
      ];

      const lobby = createLobbyInstance("room-5", pawns);

      lobby.addPlayer(1, "Host", true);
      lobby.addPlayer(2, "P2", false);
      lobby.addPlayer(3, "P3", false);

      assertThrows(() => {
        lobby.updateState(2);
      });
    });
  });
});
