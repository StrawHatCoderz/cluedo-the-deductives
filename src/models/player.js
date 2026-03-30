export class Player {
  #id;
  #playerName;
  #isHost;
  #isEliminated;
  #hand;
  #isWon;

  constructor(id, playerName, isHost) {
    this.#id = id;
    this.#playerName = playerName;
    this.#isHost = isHost;
    this.#isEliminated = false;
    this.#isWon = false;
    this.#hand = [];
  }

  get() {
    return {
      id: this.#id,
      playerName: this.#playerName,
      isEliminated: this.#isEliminated,
      hand : this.#hand,
      isHost: this.#isHost,
      isWon: this.#isWon,
    };
  }

  eliminate() {
    this.#isEliminated = true;
  }

  setHand(hand) {
    this.#hand = hand;
  }

  setWon() {
    this.#isWon = true;
  }
}
