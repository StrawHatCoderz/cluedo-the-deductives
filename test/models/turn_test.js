import { assertEquals, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";
import { Turn } from "../../src/models/turn.js";

describe("Turn Management", () => {
  let turn;
  let player;

  beforeEach(() => {
    player = new Player(1, "loki", true);
    const pawn = new Pawn(1, "scarlet", "1_1", "red");
    player.assignPawn(pawn);
    turn = new Turn(player);
  });

  describe("roll dice method", () => {
    it(" => should genarate a dice value", () => {
      const diceValue = turn.rollDice(
        () => 1,
        (x) => x,
      );
      turn.canSuspect();
      assertEquals(diceValue, [6, 6]);
    });

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

  describe("canSuspect method", () => {
    it(" => should return false if pawn is not in a room", () => {
      const result = turn.canSuspect();
      assertEquals(result, false);
    });

    it(" => should return true if pawn is inside a room and not yet suspected", () => {
      const pawn = new Pawn(1, "scarlet", { room: "kitchen" }, "red");
      player.assignPawn(pawn);
      turn = new Turn(player);

      const result = turn.canSuspect();
      assertEquals(result, true);
    });

    it(" => should return false after a suspect has already been made", () => {
      const pawn = new Pawn(1, "scarlet", { room: "kitchen" }, "red");
      player.assignPawn(pawn);
      turn = new Turn(player);

      turn.addSuspectCombination({}, [player]);
      const result = turn.canSuspect();

      assertEquals(result, false);
    });
  });

  describe("suspect combination methods", () => {
    it(" => should store suspect combination", () => {
      const combination = {
        suspect: "scarlet",
        weapon: "dagger",
        room: "kitchen",
      };
      const order = [player];

      turn.addSuspectCombination(combination, order);
      assertEquals(turn.getSuspectCombination(), combination);
    });
  });

  describe("secret passage", () => {
    it(" => should set true : usedSecretPassage", () => {
      turn.setUsedSecretPassage();
      assertEquals(turn.getUsedSecretPassage(), true);
    });
  });
});
