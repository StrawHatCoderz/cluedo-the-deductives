export class Player {
  #id;
  #name;
  #isHost;
  #pawn;
  #isEliminated;
  #hand;
  #isWon;

  constructor(id, name, isHost) {
    this.#id = id;
    this.#name = name;
    this.#isHost = isHost;
    this.#isEliminated = false;
    this.#isWon = false;
    this.#hand = [];
  }

  getPlayerData() {
    return {
      id: this.#id,
      name: this.#name,
      isEliminated: this.#isEliminated,
      hand: [...this.#hand],
      isHost: this.#isHost,
      isWon: this.#isWon,
      pawn: this.#getPawn(),
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

  #getPawn() {
    return this.#pawn?.getPawnData();
  }
}
