export class Player {
  #id;
  #playerName;
  #isHost;
  #pawn;
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
    this.#pawn = null;
  }

  get() {
    return {
      id: this.#id,
      playerName: this.#playerName,
      isEliminated: this.#isEliminated,
      hand: [...this.#hand],
      isHost: this.#isHost,
      isWon: this.#isWon,
    };
  }

  eliminate() {
    this.#isEliminated = true;
  }

  addCard(card) {
    this.#hand.push(card);
  }

  setWon() {
    this.#isWon = true;
  }

  assignPawn(pawn) {
    this.#pawn = pawn;
  }

  getPawn() {
    return this.#pawn.get();
  }
}
