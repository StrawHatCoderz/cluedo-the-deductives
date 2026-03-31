import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { Game } from "../../src/models/game.js";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";

describe("GAME", () => {
  let game;
  beforeEach(() => {
    const scarlet = new Pawn(1, "Scarlet", "0_0", "red");
    const colonel = new Pawn(2, "Colonel", "0_9", "yellow");
    game = new Game(
      1,
      {},
      [scarlet, colonel],
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
          pawn: new Pawn(),
        },
      ];
      const players = game.getAllPlayers();
      assertEquals(players, expected);
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
});
