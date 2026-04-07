import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { GameController } from "../../src/controllers/game_controller.js";

describe("GAME CONTROLLER", () => {
  let createGameMock;
  let createPawnsMock;
  let gameMock;
  let pawns;
  let controller;

  beforeEach(() => {
    pawns = [
      {
        getPawnData: () => ({ name: "Scarlet" }),
      },
      {
        getPawnData: () => ({ name: "Mustard" }),
      },
    ];

    createPawnsMock = () => pawns;

    gameMock = {
      addPlayer: () => {},
      start: () => {},
      getState: () => ({ state: "running" }),
    };

    createGameMock = () => gameMock;

    controller = GameController.create(createGameMock, createPawnsMock);
  });

  describe("create()", () => {
    it(" => should throw if createGame is not a function", () => {
      assertThrows(() => GameController.create(null, () => []));
    });

    it("should create controller if valid functions are passed", () => {
      const result = GameController.create(() => ({}), () => []);
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
      assertEquals(addPlayerCalls[0].pawn.getPawnData().name, "Scarlet");
      assertEquals(addPlayerCalls[1].pawn.getPawnData().name, "Mustard");
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

      const state = controller.getGameState(1);

      assertEquals(state, { state: "running" });
    });

    it(" => should throw if game does not exist", () => {
      assertThrows(() => controller.getGameState(999));
    });
  });
});
