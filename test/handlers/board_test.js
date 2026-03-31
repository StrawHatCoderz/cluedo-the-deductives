import { describe, it } from "@std/testing/bdd";
import { createGameInstance } from "../../src/utils/game.js";
import { assertEquals } from "@std/assert/equals";
import { serveDiceValue } from "../../src/handlers/board.js";

describe("HANDLER", () => {
  describe("dice value", () => {
    it(" => should get dice value", () => {
      const mockContext = {
        get() {
          return createGameInstance();
        },
        json(value) {
          return JSON.stringify(value);
        },
      };
      const result = serveDiceValue(mockContext, () => 1);
      assertEquals(JSON.parse(result), { diceValue: 12 });
    });
  });

  describe("reachable nodes", () => {
    it(" => should get all reachable nodes", () => {
      const mockContext = {
        get() {
          return createGameInstance();
        },
        json(value) {
          return JSON.stringify(value);
        },
        URLSearchParams: {
          get() {
            return "tile-0-17";
          },
        },
      };
      const result = serveDiceValue(mockContext, () => 1);
      assertEquals(JSON.parse(result), { diceValue: 12 });
    });
  });
});
