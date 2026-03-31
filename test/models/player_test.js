import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { Player } from "../../src/models/player.js";
import { Pawn } from "../../src/models/pawn.js";

describe("PLAYER", () => {
  let player;
  beforeEach(() => {
    player = new Player(1, "Javed", false);
  });

  it(" => should give player details", () => {
    const actualPlayer = player.get();
    const expectedPlayer = {
      id: 1,
      playerName: "Javed",
      isHost: false,
      hand: [],
      isEliminated: false,
      isWon: false,
    };
    assertEquals(actualPlayer, expectedPlayer);
  });

  it(" => should eliminate player", () => {
    player.eliminate();
    assertEquals((player.get()).isEliminated, true);
  });

  it(" => should eliminate player", () => {
    player.eliminate();
    assertEquals((player.get()).isEliminated, true);
  });

  it(" => should setWon player", () => {
    player.setWon();
    assertEquals((player.get()).isWon, true);
  });

  it(" => should setHand of a player", () => {
    const cards = ["kitchen", "rope", "dagger"];
    player.addCard(cards[0]);
    player.addCard(cards[1]);
    player.addCard(cards[2]);
    assertEquals((player.get()).hand, cards);
  });

  it(" => assign pawn should assign a pawn to the player", () => {
    const pawn = new Pawn(1, "Scarlet", "0_0", "red", 1);
    player.assignPawn(pawn);
    assertEquals(player.getPawn().name, "Scarlet");
    assertEquals(player.getPawn().color, "red");
    assertEquals(player.getPawn().position, "0_0");
  });
});
