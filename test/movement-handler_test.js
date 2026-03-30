import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { getRolledNumber } from "../src/movement-handler.js";

describe("ROLL DICE", () => {
  it(" => should give random number", () => {
    const rollDice = () => 1;
    assertEquals(getRolledNumber(rollDice), 12);
  });
});
