import { distinct } from "@std/collections";

import { assertEquals, assertFalse, assertThrows } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { ROOMS, SUSPECTS, WEAPONS } from "../../src/constants/game_config.js";
import { DeckManager } from "../../src/models/deck_manager.js";
import { Player } from "../../src/models/player.js";
import { ValidationError } from "../../src/utils/custom_errors.js";

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
      const isInMurderCombination = remainingCards.some((card) =>
        card.includes(Object.values(murderCombination))
      );

      assertFalse(isInMurderCombination);
    });
  });

  describe("distribute cards", () => {
    let players;
    beforeEach(() => {
      const playersData = [
        { id: 1, name: "Thor", isHost: true },
        {
          id: 2,
          name: "Hulk",
          isHost: false,
        },
        { id: 3, name: "Loki", isHost: false },
      ];

      players = playersData.map(
        ({ id, name, isHost }) => new Player(id, name, isHost),
      );
    });

    it(" => should distribute cards and give unique player's hand from remaining cards if total card is divisible by total player", () => {
      const remainingCards = deckManager.getRemainingCards();
      deckManager.distributeCards(players);

      const hands = players.map((player) => player.getPlayerData().hand);
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
      const hands = players.map((player) => player.getPlayerData().hand);
      const uniqueCardsInHands = distinct(hands.flat());
      assertEquals(hands[0].length, 5);
      assertEquals(hands[1].length, 5);
      assertEquals(hands[2].length, 4);
      assertEquals(hands[3].length, 4);
      assertEquals(remainingCards.length, uniqueCardsInHands.length);
    });

    it(" => should throw validation error if player count is less then 3", () => {
      const deckManager = new DeckManager(
        {
          suspects: SUSPECTS,
          weapons: WEAPONS,
          rooms: ROOMS,
        },
        (list) => [...list],
      );

      assertThrows(
        () => deckManager.distributeCards([]),
        ValidationError,
        "Invalid player count",
      );
    });
  });
});
