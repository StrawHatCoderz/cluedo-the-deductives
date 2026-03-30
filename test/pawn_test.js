import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Pawn } from "../src/models/pawn.js";

describe("PAWN POSITION", () => {
  it(" => should give pawn position", () => {
    const scarlet = new Pawn(1, "Ms.Scarlet", { x: 7, y: 24 }, "red", 1);
    assertEquals(scarlet.getPosition(), { x: 7, y: 24 });
  });
});
