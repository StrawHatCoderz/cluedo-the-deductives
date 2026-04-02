import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { Pawn } from "../../src/models/pawn.js";
import { Player } from "../../src/models/player.js";

describe("PLAYER", () => {
  let player;
  beforeEach(() => {
    player = new Player(1, "Javed", false);
  });

  it(" => should give player details", () => {
    const actualPlayer = player.getPlayerData();
    const expectedPlayer = {
      id: 1,
      name: "Javed",
      isHost: false,
      hand: [],
      isEliminated: false,
      pawn: undefined,
      isWon: false,
    };
    assertEquals(actualPlayer, expectedPlayer);
  });

  it(" => should eliminate player", () => {
    player.eliminate();
    assertEquals(player.getPlayerData().isEliminated, true);
  });

  it(" => should eliminate player", () => {
    player.eliminate();
    assertEquals(player.getPlayerData().isEliminated, true);
  });

  it(" => should setWon player", () => {
    player.setWon();
    assertEquals(player.getPlayerData().isWon, true);
  });

  it(" => should setHand of a player", () => {
    const cards = ["kitchen", "rope", "dagger"];
    player.addCard(cards[0]);
    player.addCard(cards[1]);
    player.addCard(cards[2]);
    assertEquals(player.getPlayerData().hand, cards);
  });

  it(" => assign pawn should assign a pawn to the player", () => {
    const pawn = new Pawn(1, "Scarlet", "0_0", "red", 1);
    player.assignPawn(pawn);
    assertEquals(player.getPlayerData().pawn.name, "Scarlet");
    assertEquals(player.getPlayerData().pawn.color, "red");
    assertEquals(player.getPlayerData().pawn.position, "0_0");
  });
});
