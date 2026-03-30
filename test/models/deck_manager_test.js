import { distinct } from "@std/collections";

import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse } from "@std/assert";
import { DeckManager } from "../../src/models/deck_manager.js";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";

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

  describe("murder combination", () => {
    it(" => should give murder combination", () => {
      const murderCombination = deckManager.getMurderCombination();
      assertEquals(murderCombination, {
        suspect: SUSPECTS[0],
        weapon: WEAPONS[0],
        room: ROOMS[0],
      });
    });
  });

  describe("remaining cards", () => {
    it(" => should give remaining cards which are not present in murder combination", () => {
      const murderCombination = deckManager.getMurderCombination();
      const remainingCards = deckManager.getRemainingCards();
      const isInMurderCombination = remainingCards
        .some((card) => card.includes(Object.values(murderCombination)));

      assertFalse(isInMurderCombination);
    });
  });

  describe("distribute cards", () => {
    it(" => should distribute cards and give unique player's hand from remaining cards if total player is 6", () => {
      const remainingCards = deckManager.getRemainingCards();
      const hands = deckManager.distributeCards([1, 2, 3, 4, 5, 6]);
      const uniqueCardsInHands = distinct(Object.values(hands).flat());
      assertEquals(remainingCards.length, uniqueCardsInHands.length);
    });

    it(" => should distribute cards and give unique player's hand from remaining cards if total player is less than 6", () => {
      const remainingCards = deckManager.getRemainingCards();
      const hands = deckManager.distributeCards([1, 2, 3, 4]);
      const uniqueCardsInHands = distinct(Object.values(hands).flat());
      assertEquals(hands[1].length, 5);
      assertEquals(hands[2].length, 5);
      assertEquals(hands[3].length, 4);
      assertEquals(hands[4].length, 4);
      assertEquals(remainingCards.length, uniqueCardsInHands.length);
    });
  });
});
