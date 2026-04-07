import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { PAWNS } from "../../src/constants/game_config.js";
import { Lobby } from "../../src/models/lobby.js";

describe("LOBBY", () => {
  let lobby;
  const pawns = PAWNS.map(({ name, color }) => ({ name, color }));
  const max = 6;
  const min = 3;
  const id = 1;
  beforeEach(() => {
    lobby = new Lobby(id, max, min, pawns);
  });

  describe("get state", () => {
    it("=> should give current lobby state", () => {
      const state = lobby.getState();
      assertEquals(state, { id, players: [], state: "waiting" });
    });

    it("=> should give current lobby state: one player", () => {
      lobby.addPlayer(2, "tony", true);
      const state = lobby.getState();
      assertEquals(state, {
        id,
        players: [{
          id: 2,
          name: "tony",
          character: { color: "violet", name: "professor plum" },
          isHost: true,
        }],
        state: "waiting",
      });
    });

    it("=> should give current lobby state: two players", () => {
      lobby.addPlayer(2, "tony", true);
      lobby.addPlayer(3, "steve", false);

      const state = lobby.getState();

      assertEquals(state.id, id);
      assertEquals(state.players.length, 2);
      assertEquals(state.state, "waiting");
    });
  });

  describe("add player", () => {
    it("=> should add player into lobby and assign character", () => {
      lobby.addPlayer(1, "name", true);
      const state = lobby.getState();

      assertEquals(state.players, [
        {
          character: {
            color: "white",
            name: "mrs white",
          },
          id: 1,
          isHost: true,
          name: "name",
        },
      ]);
    });

    it("=> should not add player into lobby if max player reached", () => {
      lobby.addPlayer(1, "username", true);
      lobby.addPlayer(2, "username", true);
      lobby.addPlayer(3, "username", true);
      lobby.addPlayer(4, "username", true);
      lobby.addPlayer(5, "username", true);
      lobby.addPlayer(6, "username", true);

      assertThrows(() => lobby.addPlayer(7, "username", true));
    });

    it("=> should not add player into lobby if looby is not at waiting state", () => {
      lobby.addPlayer(1, "username", true);
      lobby.addPlayer(2, "username", false);
      lobby.addPlayer(3, "username", false);
      lobby.updateState();
      assertThrows(() => lobby.addPlayer(4, "username", true));
    });
  });

  describe("is host", () => {
    it("=> should return true if a player is host", () => {
      lobby.addPlayer(1, "name", true);
      const isHost = lobby.isHost(1);
      assertEquals(isHost, true);
    });

    it("=> should return false if a player is not host", () => {
      lobby.addPlayer(1, "name", false);
      const isHost = lobby.isHost(1);
      assertEquals(isHost, false);
    });
  });

  describe("update state", () => {
    it("=> should update state if valid player count", () => {
      lobby.addPlayer(1, "name", true);
      lobby.addPlayer(2, "name", false);
      lobby.addPlayer(3, "name", false);
      lobby.addPlayer(4, "name", false);
      lobby.addPlayer(5, "name", false);
      lobby.updateState("started");
      const state = lobby.getState();

      assertEquals(state.state, "started");
    });

    it("=> should not update state if invalid player count", () => {
      lobby.addPlayer(1, "username", true);

      assertThrows(() => lobby.updateState("started"));
    });
  });
});
