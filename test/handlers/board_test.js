import { describe, it } from "@std/testing/bdd";
import { createGameInstance } from "../../src/handlers/game.js";
import { assertEquals } from "@std/assert/equals";
import { serveDiceValue } from "../../src/handlers/board.js";

describe("DICE VALUE: HANDLER", () => {
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
