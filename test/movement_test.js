import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { getRolledNumber, Pawn } from "../src/models/movement.js";

describe("ROLL DICE", () => {
  it(" => should give dice value", () => {
    const randomGenerator = () => 1;
    assertEquals(getRolledNumber(randomGenerator), 12);
  });
});

describe("PAWN POSITION", () => {
  it(" => should give pawn position", () => {
    const scarlet = new Pawn("Ms.Scarlet", [23, 19], "red", 1);
    assertEquals(scarlet.getPosition(), [23, 19]);
  });
});
