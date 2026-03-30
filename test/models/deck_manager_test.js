import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import { DeckManager } from "../../src/models/deck_manager.js";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { assertFalse } from "@std/assert/false";

describe("DECK MANAGER", () => {
  let deckManager;
  beforeEach(() => {
    deckManager = new DeckManager(
      {
        suspects: SUSPECTS,
        weapons: WEAPONS,
        rooms: ROOMS,
      },
      (list) => [...list],
    );
  });

  describe("MURDER COMBINATION", () => {
    it("should give murder combination", () => {
      const murderCombination = deckManager.getMurderCombination();
      assertEquals(murderCombination, {
        suspect: SUSPECTS[0],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      });
    });
  });

  describe("REMAINING CARDS", () => {
    it("should give remaining cards which are not present in murder combination", () => {
      const murderCombination = deckManager.getMurderCombination();
      const remainingCards = deckManager.getRemainingCards();
      const isInMurderCombination = remainingCards
        .some((card) => card.includes(Object.values(murderCombination)));

      assertFalse(isInMurderCombination);
    });
  });
});
