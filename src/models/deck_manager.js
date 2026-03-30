import { shuffle } from "@std/random";

export class DeckManager {
  #shuffler;
  #suspects;
  #weapons;
  #rooms;
  #murderCombination;
  #remainingCards;

  constructor({ suspects, weapons, rooms }, shuffler = shuffle) {
    this.#shuffler = shuffler;
    this.#suspects = suspects;
    this.#weapons = weapons;
    this.#rooms = rooms;
    this.#murderCombination = { suspect: null, weapon: null, room: null };
    this.#remainingCards = [];
  }

  getMurderCombination() {
    const suspect = this.#shuffler(this.#suspects)[0];
    const weapon = this.#shuffler(this.#weapons)[0];
    const room = this.#shuffler(this.#rooms)[0];

    this.#murderCombination = { weapon, suspect, room };
    return { ...this.#murderCombination };
  }

  #filterMurderCombination(cards, type) {
    return cards.filter((card) => card !== this.#murderCombination[type]);
  }

  getRemainingCards() {
    const remainingSuspects = this.#filterMurderCombination(
      this.#suspects,
      "suspect",
    );

    const remainingWeapons = this.#filterMurderCombination(
      this.#weapons,
      "weapon",
    );

    const remainingRooms = this.#filterMurderCombination(this.#rooms, "room");

    this.#remainingCards = this.#shuffler([
      ...remainingSuspects,
      ...remainingWeapons,
      ...remainingRooms,
    ]);

    return this.#remainingCards;
  }
}
