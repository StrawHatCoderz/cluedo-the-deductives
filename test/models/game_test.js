import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { Game } from "../../src/models/game.js";
import { Player } from "../../src/models/player.js";
import { Pawn } from "../../src/models/pawn.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";

describe("GAME", () => {
  let game;
  beforeEach(() => {
    const scarlet = new Pawn(1, "Scarlet", "0_0", "red");
    const colonel = new Pawn(2, "Colonel", "0_9", "yellow");
    game = new Game(
      1,
      {},
      [
        scarlet,
        colonel,
      ],
      new DeckManager(
        {
          suspects: SUSPECTS,
          weapons: WEAPONS,
          rooms: ROOMS,
        },
        (list) => [...list],
      ),
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
        { id: 1, name: "Scarlet", position: "0_0", color: "red" },
        {
          id: 2,
          name: "Colonel",
          position: "0_9",
          color: "yellow",
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

  describe("get current game state", () => {
    it(" => should give current game state", () => {
      assertEquals(game.getCurrentState().state, "waiting");
    });
  });

  describe("change current game state", () => {
    it(" => should change current game state", () => {
      game.changeCurrentState();
      assertEquals(game.getCurrentState().state, "setup");
    });
  });

  describe("distribute cards", () => {
    beforeEach(() => {
      const playersData = [{ id: 1, playerName: "Thor", isHost: true }, {
        id: 2,
        playerName: "Hulk",
        isHost: false,
      }, { id: 3, playerName: "Loki", isHost: false }];

      playersData.forEach(({ id, playerName, isHost }) => {
        const player = new Player(id, playerName, isHost);
        game.addPlayer(player);
      });
    });

    it(" => should distribute cards and give unique player's hand from remaining cards if total card is divisible by total player", () => {
      game.distributeCards();
      const players = game.getAllPlayers();
      const hands = players.map((player) => player.hand);

      assertEquals(hands[0].length, 6);
      assertEquals(hands[1].length, 6);
      assertEquals(hands[2].length, 6);
    });
  });
});
