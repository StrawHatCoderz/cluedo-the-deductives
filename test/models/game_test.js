import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { Game } from "../../src/models/game.js";
import { Player } from "../../src/models/player.js";
import { Pawn } from "../../src/models/pawn.js";

describe("Game", () => {
  let game;
  beforeEach(() => {
    const scarlet = new Pawn(1, "Scarlet", "0_0", "red", 1);
    const colonel = new Pawn(2, "Colonel", "0_9", "yellow", 2);
    game = new Game(
      1,
      {},
      [
        scarlet,
        colonel,
      ],
      {},
      (list) => [...list],
    );
  });

  describe("add player ", () => {
    it(" => should add pawn to the player", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player);
      assertEquals(player.getPawn().name, "Colonel");
    });
  });

  describe("get all players ", () => {
    it(" => should return all the players", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player);
      const expected = [
        {
          id: 1,
          playerName: "Javed",
          isEliminated: false,
          hand: [],
          isHost: false,
          isWon: false,
        },
      ];
      const players = game.getAllPlayers();
      assertEquals(players, expected);
    });
  });

  describe("get player", () => {
    it(" => should return details of one player ", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player);
      const expected = {
        id: 1,
        playerName: "Javed",
        isEliminated: false,
        hand: [],
        isHost: false,
        isWon: false,
      };
      assertEquals(game.getPlayer(1), expected);
    });
  });

  describe("getAllPawns", () => {
    it(" => should return all pawns ", () => {
      const pawns = game.getAllPawns();
      const expected = [
        { id: 1, name: "Scarlet", position: "0_0", color: "red", playerId: 1 },
        {
          id: 2,
          name: "Colonel",
          position: "0_9",
          color: "yellow",
          playerId: 2,
        },
      ];
      assertEquals(pawns, expected);
    });
  });

  describe("getPawn", () => {
    it(" => should return the details of pawn ", () => {
      assertEquals(game.getPawn(2).name, "Colonel");
    });
  });

  describe("roll dice", () => {
    it(" => should give dice value", () => {
      const randomGenerator = () => 1;
      assertEquals(game.getRolledNumber(randomGenerator), 12);
    });
  });
});
