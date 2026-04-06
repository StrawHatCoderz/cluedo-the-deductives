import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Lobby } from "../../src/models/lobby.js";
import { PAWNS } from "../../src/constants/game_config.js";

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
  });

  describe("add player", () => {
    it("=> should add player into lobby and assign character", () => {
      lobby.addPlayer(1, "username", true);
      const state = lobby.getState();
      assertEquals(state.players, [
        {
          character: {
            color: "violet",
            name: "professor plum",
          },
          id: 1,
          isHost: true,
          username: "username",
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
  });
});
