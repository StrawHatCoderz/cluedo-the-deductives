import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { GameController } from "../../src/controllers/game_controller.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

describe("GAME CONTROLLER", () => {
  let createGameMock;
  let gameMock;
  let controller;

  beforeEach(() => {
    gameMock = {
      addPlayer: () => {},
      start: () => {},
      getState: () => ({
        state: "running",
        currentPlayer: { hand: ["card-1"] },
        disprovalData: {
          suspicionCombo: { weapon: "card-1", suspect: "card-2" },
        },
      }),
      rollDice: () => [1, 2],
      getReachableNodes: () => [1, 2, 3, 4],
      getDiceValue: () => [1, 2],
      getActivePlayer: () => 1,
    };

    createGameMock = () => gameMock;

    controller = GameController.create(createGameMock);
  });

  describe("create()", () => {
    it(" => should throw if createGame is not a function", () => {
      assertThrows(() => GameController.create(null, () => []));
    });

    it("should create controller if valid functions are passed", () => {
      const result = GameController.create(
        () => ({}),
        () => [],
      );
      assertEquals(typeof result, "object");
    });
  });

  describe("startGame()", () => {
    it(" => should create a game and store it", () => {
      const players = [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ];

      controller.startGame(1, players);

      const state = controller.getGameState(1);

      assertEquals(state.state, "running");
    });

    it(" => should call addPlayer for each player with correct pawn", () => {
      const addPlayerCalls = [];

      gameMock.addPlayer = (player, pawn) => {
        addPlayerCalls.push({ player, pawn });
      };

      const players = [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
        {
          id: 2,
          name: "steve",
          isHost: false,
          character: { name: "Mustard" },
        },
      ];

      controller.startGame(1, players);

      assertEquals(addPlayerCalls.length, 2);
      assertEquals(addPlayerCalls[0].pawn.name, "Scarlet");
      assertEquals(addPlayerCalls[1].pawn.name, "Mustard");
    });

    it(" => should call game.start()", () => {
      let started = false;

      gameMock.start = () => {
        started = true;
      };

      const players = [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ];

      controller.startGame(1, players);

      assertEquals(started, true);
    });
  });

  describe("getGameState()", () => {
    it(" => should return game state for given gameId", () => {
      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const gameState = controller.getGameState(1);

      assertEquals(gameState.state, "running");
    });

    it(" => should throw if game does not exist", () => {
      assertThrows(
        () => controller.getGameState(999),
        ValidationError,
        "Invalid game id",
      );
    });
  });

  describe("rollDice()", () => {
    it(" => should return array of dice value", () => {
      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const randomFn = () => {};
      const ceilFn = () => {};
      const rolledNumber = controller.rollDice(1, randomFn, ceilFn);

      assertEquals(rolledNumber, [1, 2]);
    });
  });

  describe("getReachableNodes()", () => {
    it(" => should return array of reahable nodes", () => {
      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const rolledNumber = controller.getReachableNodes(1);

      assertEquals(rolledNumber, [1, 2, 3, 4]);
    });
  });

  describe("getDiceValue()", () => {
    it(" => should return previously rolled dice value", () => {
      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const rolledNumber = controller.getDiceValue(1);

      assertEquals(rolledNumber, [1, 2]);
    });
  });

  describe("movePawn()", () => {
    it(" => should call game.movePawn with correct args", () => {
      let receivedArgs;

      gameMock.movePawn = (...args) => {
        receivedArgs = args;
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.movePawn(1, 1, "tile-1", { x: 1, y: 2 });

      assertEquals(receivedArgs, [1, "tile-1", { x: 1, y: 2 }]);

      assertEquals(result, undefined);
    });
  });

  describe("accuse()", () => {
    it(" => should call game.accuse with correct payload", () => {
      let receivedPayload;

      gameMock.accuse = (payload) => {
        receivedPayload = payload;
        return { isCorrect: true };
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.accuse(1, {
        suspect: "A",
        weapon: "B",
        room: "C",
      });

      assertEquals(receivedPayload, {
        suspect: "A",
        weapon: "B",
        room: "C",
      });

      assertEquals(result, { isCorrect: true });
    });
  });

  describe("updateTurn()", () => {
    it(" => should call game.updateTurn", () => {
      let called = false;

      gameMock.updateTurn = () => {
        called = true;
        return { id: 1 };
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.updateTurn(1);

      assertEquals(called, true);
      assertEquals(result, { id: 1 });
    });
  });

  describe("addSuspicion()", () => {
    it(" => should add suspicion when allowed", () => {
      let received;

      gameMock.canSuspect = () => true;
      gameMock.addSuspicion = (s) => {
        received = s;
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      controller.addSuspicion(1, { suspect: "A" });

      assertEquals(received, { suspect: "A" });
    });

    it(" => should return false if cannot suspect", () => {
      let called = false;

      gameMock.canSuspect = () => false;

      gameMock.addSuspicion = () => {
        called = true;
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.addSuspicion(1, { suspect: "A" });

      assertEquals(result, undefined);

      assertEquals(called, true);
    });
  });

  describe("confirmDisproval()", () => {
    it(" => should call addDisprovedCard", () => {
      let received;

      gameMock.addDisprovedCard = (card) => {
        received = card;
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.confirmDisproval(1, 1, "card-1");

      assertEquals(received, "card-1");
      assertEquals(result, { status: true });
    });

    it(" => should throw error on invalid card", () => {
      gameMock.addDisprovedCard = (card) => {
        received = card;
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      assertThrows(
        () => controller.confirmDisproval(1, 1, "card-2"),
        ValidationError,
      );
    });
  });

  describe("getDisprovedCard()", () => {
    it(" => should return card from game", () => {
      gameMock.getDisprovedCard = () => "card-123";

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.getDisprovedCard(1);

      assertEquals(result, { card: "card-123" });
    });
  });

  describe("getActivePlayer()", () => {
    it(" => should return active player from game", () => {
      let called = false;

      gameMock.getActivePlayer = () => {
        called = true;
        return { id: 1 };
      };

      controller.startGame(1, [
        {
          id: 1,
          name: "tony",
          isHost: true,
          character: { name: "Scarlet" },
        },
      ]);

      const result = controller.getActivePlayer(1);

      assertEquals(called, true);
      assertEquals(result, { id: 1 });
    });
  });
});
