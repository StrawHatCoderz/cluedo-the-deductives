import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  PAWNS,
  ROOMS,
  SUSPECTS,
  WEAPONS,
} from "../../src/constants/game_config.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { Game } from "../../src/models/game.js";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

describe("GAME", () => {
  let game;
  let pawns;

  const createGame = () => {
    const pawns = PAWNS.map(
      ({ name, position, color }, i) => new Pawn(i + 1, name, position, color),
    );

    return new Game(
      1,
      {
        getSecretPassages: () => ({ study: "kitchen" }),
        getReachableNodes: () => ["tile-1-2"],
        getGraph: () => ({
          "tile-1-2": { type: "tile" },
          "tile-0-0": { type: "tile" },
          "tile-0-9": { type: "tile" },
          "tile-9-0": { type: "tile" },
          "tile-9-9": { type: "tile" },
          "study": { type: "room" },
        }),
        toggleIsOccupied: () => {},
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
    const p1 = new Player(1, "A", true);
    const p2 = new Player(2, "B", false);
    const p3 = new Player(3, "C", false);

    game.addPlayer(p1, { name: "miss scarlett" });
    game.addPlayer(p2, { name: "colonel mustard" });
    game.addPlayer(p3, { name: "professor plum" });

    return { p1, p2, p3 };
  };

  beforeEach(() => {
    game = createGame();
  });

  describe("add player", () => {
    it(" => should assign pawn to player", () => {
      const player = new Player(1, "Javed", false);
      game.addPlayer(player, { name: "professor plum" });

      assertEquals(
        player.getPlayerData().pawn.name,
        "professor plum",
      );
    });

    it(" => should throw error for invalid player", () => {
      assertThrows(() => game.addPlayer({}, { name: "miss scarlett" }), Error);
    });
  });

  describe("game state", () => {
    it(" => should throw validation error if playerId is invalid", () => {
      const add3Players = () => {
        game.addPlayer(new Player(1, "A", true), { name: "miss scarlett" });
        game.addPlayer(new Player(2, "B", false), { name: "colonel mustard" });
        game.addPlayer(new Player(3, "C", false), { name: "professor plum" });
      };

      add3Players();
      game.start();

      assertThrows(() => game.getState(), ValidationError, "Invalid player id");
    });

    it(" => should change state from setup to running", () => {
      const add3Players = () => {
        game.addPlayer(new Player(1, "A", true), { name: "miss scarlett" });
        game.addPlayer(new Player(2, "B", false), { name: "colonel mustard" });
        game.addPlayer(new Player(3, "C", false), { name: "professor plum" });
      };

      add3Players();
      game.start();

      assertEquals(game.getState(1).state, "running");
    });
  });

  describe("start game", () => {
    it(" => should throw error if players less than 3", () => {
      const p1 = new Player(1, "thor", true);
      const p2 = new Player(2, "hulk", false);

      game.addPlayer(p1, { name: "miss scarlett" });
      game.addPlayer(p2, { name: "colonel mustard" });

      assertThrows(() => game.start());
    });

    it(" => should distribute cards", () => {
      const { p1 } = add3Players();

      game.start();

      assertEquals(p1.getPlayerData().hand.length > 0, true);
    });
  });

  describe("turn and dice", () => {
    it(" => should throw if updateTurn before running", () => {
      add3Players();

      assertThrows(() => game.updateTurn(), Error);
    });

    it(" => should roll dice correctly", () => {
      const randomGenerator = () => 1;

      add3Players();
      game.start();

      game.updateTurn();

      assertEquals(game.rollDice(randomGenerator), [6, 6]);
    });

    it(" => should throw if rollDice before turn init", () => {
      assertThrows(() => game.rollDice(), Error);
    });
  });

  describe("turn order", () => {
    it(" => should return current player after start", () => {
      const { p3 } = add3Players();

      game.start();

      const current = game.getCurrentPlayer();

      assertEquals(current, p3);
    });
  });

  describe("update current player", () => {
    it(" => should update turn correctly", () => {
      const { p2 } = add3Players();

      game.start();

      const currentPlayer = game.updateTurn();
      assertEquals(currentPlayer.id, p2.getPlayerData().id);
    });

    it(" => should skip eliminated player", () => {
      const { p1, p2 } = add3Players();

      game.start();

      p1.eliminate();

      const currentPlayer = game.updateTurn();

      assertEquals(currentPlayer.id, p2.getPlayerData().id);
    });
  });

  describe("pawn", () => {
    it(" => should return correct pawn instance", () => {
      const pawn = game.getPawnInstance(1);
      assertEquals(pawn.getPawnData().name, "miss scarlett");
    });
  });

  describe("add suspect combination", () => {
    const moveCurrentPlayerToRoom = (room = "study") => {
      const currentPlayer = game.getCurrentPlayer();
      const pawn = game.getPawnInstance(currentPlayer.getPlayerData().pawn.id);

      pawn.updatePosition({ room });
    };

    it(" => should store suspicion", () => {
      add3Players();
      game.start();
      game.changeCurrentState();

      moveCurrentPlayerToRoom();

      const suspectCombination = {
        suspectId: 1,
        room: "BallRoom",
        weapon: "dagger",
      };

      game.addSuspicion(suspectCombination);

      assertEquals(game.getSuspectCombination(), suspectCombination);
    });

    it(" => should throw if already suspected in same turn", () => {
      add3Players();
      game.start();
      game.changeCurrentState();

      moveCurrentPlayerToRoom();

      const suspectCombination = {
        suspectId: 1,
        room: "BallRoom",
        weapon: "dagger",
      };

      game.addSuspicion(suspectCombination);

      assertThrows(
        () => game.addSuspicion(suspectCombination),
        ValidationError,
      );
    });

    it(" => should move suspect pawn to the suspected room", () => {
      add3Players();
      game.start();
      game.changeCurrentState();

      moveCurrentPlayerToRoom();

      const suspectCombination = {
        suspectId: 2,
        room: "kitchen",
        weapon: "dagger",
      };

      game.addSuspicion(suspectCombination);

      const pawn = game.getPawnInstance(2);

      assertEquals(pawn.getPawnData().position.room, "kitchen");
      assertEquals(pawn.getPawnData().position.x, null);
      assertEquals(pawn.getPawnData().position.y, null);
    });
  });

  describe("accuse murder combination", () => {
    beforeEach(() => {
      add3Players();
      game.start();
    });

    it(" => should return true for correct combination", () => {
      const combo = {
        suspect: SUSPECTS[0],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      };

      const result = game.accuse(combo);

      assertEquals(result.isCorrect, true);
    });

    it(" => should return false for wrong combination", () => {
      const combo = {
        suspect: SUSPECTS[1],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      };

      const result = game.accuse(combo);

      assertEquals(result.isCorrect, false);
    });
  });

  describe("secret passage", () => {
    let p1;
    let p2;
    let p3;
    beforeEach(() => {
      pawns = [
        new Pawn(1, "miss scarlett", { room: "study" }, "red"),
        new Pawn(2, "colonel mustard", "0_9", "yellow"),
        new Pawn(3, "professor plum", "0_9", "purple"),
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
      game.addPlayer(p1, { name: "miss scarlett" });
      game.addPlayer(p2, { name: "colonel mustard" });
      game.addPlayer(p3, { name: "professor plum" });

      game.start();
    });
  });

  describe("disproveASuspicion", () => {
    it(" => should return disprovable player", () => {
      add3Players();
      game.start();

      const combination = {
        suspectId: 1,
        weapon: "dagger",
        room: "kitchen",
      };

      game.addSuspicion(combination);

      assertEquals(game.getState(1).disprovalData.disprovablePlayer, 2);
    });
  });

  describe("add disprove card", () => {
    it(" => should add disproved card", () => {
      add3Players();
      game.start();
      const disprovedCard = "Dagger";
      game.addDisprovedCard({ disprovedCard });
      assertEquals(game.getDisprovedCard(), { disprovedCard });
    });
  });

  describe("secret passage", () => {
    let p1, p2, p3;

    beforeEach(() => {
      pawns = [
        new Pawn(1, "miss scarlett", { room: "study" }, "red"),
        new Pawn(2, "colonel mustard", { room: "hall" }, "yellow"),
        new Pawn(3, "professor plum", { room: "hall" }, "purple"),
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

      p1 = new Player(1, "A", true);
      p2 = new Player(2, "B", false);
      p3 = new Player(3, "C", false);

      game.addPlayer(p1, { name: "miss scarlett" });
      game.addPlayer(p2, { name: "colonel mustard" });
      game.addPlayer(p3, { name: "professor plum" });

      game.start();
    });

    it(" => should use secret passage successfully", () => {
      game.useSecretPassage(p1.getPlayerData().id);

      const pawn = game.getPawnInstance(1);

      assertEquals(pawn.getPawnData().position.room, "kitchen");
    });

    it(" => should throw if room has no secret passage", () => {
      const pawn = game.getPawnInstance(1);
      pawn.updatePosition({ room: "hall" });

      assertThrows(
        () => game.useSecretPassage(p1.getPlayerData().id),
        Error,
      );
    });

    it(" => should throw if dice already rolled", () => {
      game.rollDice(() => 1);

      assertThrows(
        () => game.useSecretPassage(p1.getPlayerData().id),
        Error,
      );
    });

    it(" => should throw if player already suspected", () => {
      game.addSuspicion({
        suspectId: 1,
        weapon: "dagger",
        room: "study",
      });

      assertThrows(
        () => game.useSecretPassage(p1.getPlayerData().id),
        Error,
      );
    });

    it(" => should throw if secret passage already used", () => {
      game.useSecretPassage(p1.getPlayerData().id);

      assertThrows(
        () => game.useSecretPassage(p1.getPlayerData().id),
        Error,
      );
    });
  });

  describe("movePawn()", () => {
    const setupGameWithTurn = () => {
      const { p1 } = add3Players();
      game.start();
      game.updateTurn();
      return p1;
    };

    it(" => should move pawn to valid tile", () => {
      const p1 = setupGameWithTurn();

      game.rollDice(() => 1);

      const reachable = game.getReachableNodes();
      const validTile = reachable[0];

      game.movePawn(p1.getPlayerData().id, validTile, {
        x: 1,
        y: 2,
        room: null,
      });

      const pawn = game.getPawnInstance(1);

      assertEquals(pawn.getPawnData().position.x, 1);
      assertEquals(pawn.getPawnData().position.y, 2);
    });

    it(" => should throw if dice not rolled", () => {
      const p1 = setupGameWithTurn();

      assertThrows(
        () =>
          game.movePawn(p1.getPlayerData().id, "tile-1-2", {
            x: 1,
            y: 2,
            room: null,
          }),
        ValidationError,
        "Roll dice first",
      );
    });

    it(" => should throw for invalid path", () => {
      const p1 = setupGameWithTurn();

      game.rollDice(() => 1);

      assertThrows(
        () =>
          game.movePawn(p1.getPlayerData().id, "tile-999-999", {
            x: 999,
            y: 999,
            room: null,
          }),
        ValidationError,
        "Provide Valid Path to move",
      );
    });
  });
});
