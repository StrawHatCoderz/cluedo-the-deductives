import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Player } from "../../src/models/player.js";
import { Turn } from "../../src/models/turn.js";

describe("Turn Management", () => {
  let turn;
  beforeEach(() => {
    const player = new Player(1, "loki", true);
    turn = new Turn(player);
  });

  describe("roll dice method", () => {
    it(" => should genarate a dice value", () => {
      const diceValue = turn.rollDice(
        () => 1,
        (x) => x,
      );
      assertEquals(diceValue, 12);
    });
  });

  describe("roll dice method", () => {
    it(" => should throw error if the player try to roll again", () => {
      turn.rollDice(
        () => 1,
        (x) => x,
      );
      assertThrows(() =>
        turn.rollDice(
          () => 1,
          (x) => x,
        )
      );
    });
  });
});
