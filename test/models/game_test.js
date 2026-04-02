import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { Game } from "../../src/models/game.js";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";

describe("GAME", () => {
  let game;
  let playerId;

  beforeEach(() => {
    const scarlet = new Pawn(1, "Scarlet", "0_0", "red");
    const colonel = new Pawn(2, "Colonel", "0_9", "yellow");
    const plum = new Pawn(3, "plum", "0_9", "yellow");

    game = new Game(
      1,
      {},
      [scarlet, colonel, plum],
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

    playerId = 1;
  });

  describe("add player", () => {
    it("should assign pawn to player", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player);

      assertEquals(player.getPlayerData().pawn.name, "plum");
    });

    it("should throw error for invalid player", () => {
      assertThrows(
        () => {
          game.addPlayer({});
        },
        Error,
        "Invalid player",
      );
    });
  });

  describe("game state", () => {
    it("should return initial state", () => {
      assertEquals(game.getState(playerId).state, "waiting");
    });

    it("should change state from waiting to setup", () => {
      game.changeCurrentState();
      assertEquals(game.getState(playerId).state, "setup");
    });
  });

  describe("start game", () => {
    it("should throw error if players less than 3", () => {
      const p1 = new Player(1, "thor", true);
      const p2 = new Player(2, "hulk", false);

      game.addPlayer(p1);
      game.addPlayer(p2);

      assertThrows(() => game.start());
    });

    it("should distribute cards and initialize game", () => {
      const p1 = new Player(1, "thor", false);
      const p2 = new Player(2, "hulk", true);
      const p3 = new Player(3, "deadpool", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();

      assertEquals(p1.getPlayerData().hand.length, 6);
    });
  });

  describe("turn and dice", () => {
    it("should throw if updateTurn called before running", () => {
      const p1 = new Player(1, "thor", false);
      const p2 = new Player(2, "hulk", false);
      const p3 = new Player(3, "deadpool", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();

      assertThrows(
        () => {
          game.updateTurn();
        },
        Error,
        "Game hasn't started yet",
      );
    });

    it("should give dice value", () => {
      const randomGenerator = () => 1;

      const p1 = new Player(1, "thor", false);
      const p2 = new Player(2, "hulk", true);
      const p3 = new Player(3, "deadpool", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();
      game.changeCurrentState();

      game.updateTurn();

      assertEquals(game.getRolledNumber(randomGenerator), 12);
    });

    it("should throw if rollDice before turn init", () => {
      assertThrows(
        () => {
          game.getRolledNumber();
        },
        Error,
        "Invalid player turn",
      );
    });
  });

  describe("turn order", () => {
    it("should return players sorted by pawn id", () => {
      const p1 = new Player(1, "A", false);
      const p2 = new Player(2, "B", false);
      const p3 = new Player(3, "C", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();

      const order = game.getTurnOrder();
      assertEquals(order.length, 3);
    });

    it("should return current player after start", () => {
      const p1 = new Player(1, "A", true);
      const p2 = new Player(2, "B", false);
      const p3 = new Player(3, "C", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();

      const current = game.getCurrentPlayer();

      assertEquals(current, p3);
    });
  });

  describe("update current player", () => {
    it("should update turn correctly", () => {
      const p3 = new Player(1, "thor", false);
      const p2 = new Player(2, "hulk", true);
      const p1 = new Player(3, "deadpool", false);

      game.addPlayer(p3);
      game.addPlayer(p2);
      game.addPlayer(p1);

      game.start();
      game.changeCurrentState();

      const currentPlayer = game.updateTurn();

      assertEquals(currentPlayer, p1.getPlayerData());
    });

    it("should skip eliminated player", () => {
      const p3 = new Player(1, "thor", false);
      const p2 = new Player(2, "hulk", true);
      const p1 = new Player(3, "deadpool", false);

      game.addPlayer(p3);
      game.addPlayer(p2);
      game.addPlayer(p1);

      game.start();
      game.changeCurrentState();

      p1.eliminate();

      const currentPlayer = game.updateTurn();

      assertEquals(currentPlayer, p2.getPlayerData());
    });
  });

  describe("pawn", () => {
    it("should return correct pawn instance", () => {
      const pawn = game.getPawnInstance(1);
      assertEquals(pawn.getPawnData().name, "Scarlet");
    });
  });

  describe("add suspect combination", () => {
    it("should update turn state after adding suspect", () => {
      const p1 = new Player(1, "A", false);
      const p2 = new Player(2, "B", false);
      const p3 = new Player(3, "C", false);

      game.addPlayer(p1);
      game.addPlayer(p2);
      game.addPlayer(p3);

      game.start();
      game.changeCurrentState();

      const suspectCombination = {
        suspect: "Scarlet",
        room: "BallRoom",
        weapon: "dagger",
      };

      game.addSuspect(suspectCombination);

      const actual = game.getSuspectCombination();

      assertEquals(actual, suspectCombination);
    });
  });
});
