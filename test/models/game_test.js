import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { Game } from "../../src/models/game.js";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";

describe("GAME", () => {
  let game;
  let pawns;

  const createGame = () => {
    pawns = [
      new Pawn(1, "Scarlet", "0_0", "red"),
      new Pawn(2, "Colonel", "0_9", "yellow"),
      new Pawn(3, "Plum", "0_9", "purple"),
    ];

    return new Game(
      1,
      {
        getSecretPassages: () => ({ study: "kitchen" }),
      },
      pawns,
      new DeckManager(
        {
          suspects: SUSPECTS,
          weapons: WEAPONS,
          rooms: ROOMS,
        },
        (list) => [...list],
      ),
    );
  };

  const add3Players = () => {
    const p1 = new Player(1, "A", false);
    const p2 = new Player(2, "B", false);
    const p3 = new Player(3, "C", false);

    game.addPlayer(p1, pawns[0]);
    game.addPlayer(p2, pawns[1]);
    game.addPlayer(p3, pawns[2]);

    return { p1, p2, p3 };
  };

  beforeEach(() => {
    game = createGame();
  });

  describe("add player", () => {
    it("should assign pawn to player", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player, pawns[2]);

      assertEquals(player.getPlayerData().pawn.name, "Plum");
    });

    it("should throw error for invalid player", () => {
      assertThrows(() => game.addPlayer({}, pawns[0]), Error);
    });
  });

  describe("game state", () => {
    it("should return initial state as setup", () => {
      assertEquals(game.getState().state, "setup");
    });

    it(" => should change state from setup to running", () => {
      add3Players();
      game.start();

      assertEquals(game.getState().state, "running");
    });
  });

  describe("start game", () => {
    it("should throw error if players less than 3", () => {
      const p1 = new Player(1, "thor", true);
      const p2 = new Player(2, "hulk", false);

      game.addPlayer(p1, pawns[0]);
      game.addPlayer(p2, pawns[1]);

      assertThrows(() => game.start());
    });

    it("should distribute cards", () => {
      const { p1 } = add3Players();

      game.start();

      assertEquals(p1.getPlayerData().hand.length > 0, true);
    });
  });

  describe("turn and dice", () => {
    it("should throw if updateTurn before running", () => {
      add3Players();

      assertThrows(() => game.updateTurn(), Error);
    });

    it("should roll dice correctly", () => {
      const randomGenerator = () => 1;

      add3Players();
      game.start();

      game.updateTurn();

      assertEquals(game.rollDice(randomGenerator), [6, 6]);
    });

    it("should throw if rollDice before turn init", () => {
      assertThrows(() => game.rollDice(), Error);
    });
  });

  describe("turn order", () => {
    it("should return current player after start", () => {
      const { p3 } = add3Players();

      game.start();

      const current = game.getCurrentPlayer();

      assertEquals(current, p3);
    });
  });

  describe("update current player", () => {
    it("should update turn correctly", () => {
      const { p1 } = add3Players();

      game.start();

      const currentPlayer = game.updateTurn();

      assertEquals(currentPlayer.id, p1.getPlayerData().id);
    });

    it("should skip eliminated player", () => {
      const { p1, p2 } = add3Players();

      game.start();

      p1.eliminate();

      const currentPlayer = game.updateTurn();

      assertEquals(currentPlayer.id, p2.getPlayerData().id);
    });
  });

  describe("pawn", () => {
    it("should return correct pawn instance", () => {
      const pawn = game.getPawnInstance(1);
      assertEquals(pawn.getPawnData().name, "Scarlet");
    });
  });

  describe("add suspect combination", () => {
    it("should store suspicion", () => {
      add3Players();

      game.start();
      game.changeCurrentState();

      const suspectCombination = {
        suspect: "Scarlet",
        room: "BallRoom",
        weapon: "dagger",
      };

      game.addSuspicion(suspectCombination);

      assertEquals(game.getSuspectCombination(), suspectCombination);
    });
  });

  describe("accuse murder combination", () => {
    beforeEach(() => {
      add3Players();
      game.start();
    });

    it("should return true for correct combination", () => {
      const combo = {
        suspect: SUSPECTS[0],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      };

      const result = game.accuse(combo);

      assertEquals(result.isCorrect, true);
    });

    it("should return false for wrong combination", () => {
      const combo = {
        suspect: SUSPECTS[1],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      };

      const result = game.accuse(combo);

      assertEquals(result.isCorrect, false);
    });

    it("should throw for invalid combination", () => {
      assertThrows(() => {
        game.accuse({ weapon: WEAPONS[0] });
      });
    });
  });

  describe("secret passage", () => {
    let p1;
    let p2;
    let p3;
    beforeEach(() => {
      pawns = [
        new Pawn(1, "Scarlet", { room: "study" }, "red"),
        new Pawn(2, "Colonel", "0_9", "yellow"),
        new Pawn(3, "Plum", "0_9", "purple"),
      ];

      game = new Game(
        1,
        {
          getSecretPassages: () => ({ study: "kitchen" }),
        },
        pawns,
        new DeckManager(
          {
            suspects: SUSPECTS,
            weapons: WEAPONS,
            rooms: ROOMS,
          },
          (list) => [...list],
        ),
      );

      p1 = new Player(1, "A", false);
      p2 = new Player(2, "B", false);
      p3 = new Player(3, "C", false);

      game.addPlayer(p1, pawns[0]);
      game.addPlayer(p2, pawns[1]);
      game.addPlayer(p3, pawns[2]);

      game.start();

      game.updateTurn();
    });
    it("should return secret passage id", () => {
      const state = game.getState(p1.getPlayerData().id);

      assertEquals(state.secretPassageId, "kitchen");
    });
  });

  describe("disproveASuspicion", () => {
    it("should return disprovable player", () => {
      add3Players();
      game.start();

      const combination = {
        suspect: "Scarlet",
        weapon: "dagger",
        room: "kitchen",
      };

      game.addSuspicion(combination);

      assertEquals(game.getState().disprovablePlayer !== undefined, true);
    });
  });
});
