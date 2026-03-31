import { shuffle } from "@std/random";

export class DeckManager {
  #shuffle;
  #suspects;
  #weapons;
  #rooms;
  #murderCombination;
  #remainingCards;

  constructor({ suspects, weapons, rooms }, shuffleFn = shuffle) {
    this.#shuffle = shuffleFn;
    this.#suspects = suspects;
    this.#weapons = weapons;
    this.#rooms = rooms;
    this.#segregateMurderCombination();
  }

  #segregateMurderCombination() {
    const [suspect, ...remainingSuspects] = this.#shuffle(this.#suspects);
    const [weapon, ...remainingWeapons] = this.#shuffle(this.#weapons);
    const [room, ...remainingRooms] = this.#shuffle(this.#rooms);

    this.#murderCombination = { weapon, suspect, room };
    this.#remainingCards = this.#shuffle([
      ...remainingSuspects,
      ...remainingWeapons,
      ...remainingRooms,
    ]);
  }

  getMurderCombination() {
    return { ...this.#murderCombination };
  }

  getRemainingCards() {
    return [...this.#remainingCards];
  }

  distributeCards(players) {
    let inc = 0;

    while (this.#remainingCards.length !== 0) {
      const card = this.#remainingCards.pop();
      const currentPlayer = players[(inc++) % players.length];
      currentPlayer.addCard(card);
    }
  }
}
