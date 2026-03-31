import { distinct } from "@std/collections";

import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse } from "@std/assert";
import { DeckManager } from "../../src/models/deck_manager.js";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { Player } from "../../src/models/player.js";

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
    let players;
    beforeEach(() => {
      const playersData = [{ id: 1, playerName: "Thor", isHost: true }, {
        id: 2,
        playerName: "Hulk",
        isHost: false,
      }, { id: 3, playerName: "Loki", isHost: false }];

      players = playersData.map(({ id, playerName, isHost }) =>
        new Player(id, playerName, isHost)
      );
    });

    it(" => should distribute cards and give unique player's hand from remaining cards if total card is divisible by total player", () => {
      const remainingCards = deckManager.getRemainingCards();
      deckManager.distributeCards(players);
      const hands = players.map((player) => player.get().hand);
      const uniqueCardsInHands = distinct(hands.flat());
      assertEquals(hands[0].length, 6);
      assertEquals(hands[1].length, 6);
      assertEquals(hands[2].length, 6);
      assertEquals(remainingCards.length, uniqueCardsInHands.length);
    });

    it(" => should distribute cards and give unique player's hand from remaining cards if total card is not divisible by total player", () => {
      const remainingCards = deckManager.getRemainingCards();
      const newPlayer = new Player(0, "abc", false);
      players.push(newPlayer);
      deckManager.distributeCards(players);
      const hands = players.map((player) => player.get().hand);
      const uniqueCardsInHands = distinct(hands.flat());
      assertEquals(hands[0].length, 5);
      assertEquals(hands[1].length, 5);
      assertEquals(hands[2].length, 4);
      assertEquals(hands[3].length, 4);
      assertEquals(remainingCards.length, uniqueCardsInHands.length);
    });
  });
});
