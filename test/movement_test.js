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

describe("GET PAWN", () => {
  it(" => should give pawn details", () => {
    const scarlet = new Pawn("Ms.Scarlet", [23, 19], "red", 1);
    const expected = {
      name: "Ms.Scarlet",
      position: [23, 19],
      color: "red",
      playerId: 1,
    };
    assertEquals(scarlet.get(), expected);
  });
});

describe("UPDATE POSITION", () => {
  it(" => should update the position of the pawn", () => {
    const scarlet = new Pawn("Ms.Scarlet", [23, 19], "red", 1);
    scarlet.updatePosition([27, 9]);
    assertEquals(scarlet.get().position, [27, 9]);
  });
});
