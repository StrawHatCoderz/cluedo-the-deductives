import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { Pawn } from "../src/models/pawn.js";

describe("PAWN", () => {
  let scarlet;
  beforeEach(() => {
    scarlet = new Pawn(1, "Ms.Scarlet", [23, 19], "red");
  });
  describe("pawn position", () => {
    it(" => should give pawn position", () => {
      assertEquals(scarlet.getPosition(), [23, 19]);
    });
  });

  describe("get pawn", () => {
    it(" => should give pawn details", () => {
      const expected = {
        id: 1,
        name: "Ms.Scarlet",
        position: [23, 19],
        color: "red",
      };
      assertEquals(scarlet.getPawnData(), expected);
    });
  });

  describe("update position", () => {
    it(" => should update the position of the pawn", () => {
      scarlet.updatePosition([27, 9]);
      assertEquals(scarlet.getPawnData().position, [27, 9]);
    });
  });
});
