import { shuffle } from "@std/random";

export class Game {
  #states = ["waiting", "setup", "running", "finished"];
  #currentState;
  #id;
  #board;
  #pawns;
  #pawnsToAssign;
  #deck;
  #players;
  #turnOrder;
  #shuffle;
  constructor(id, board, pawns, deck, shuffleFn = shuffle) {
    this.#currentState = this.#states.shift();
    this.#id = id;
    this.#board = board;
    this.#pawns = pawns;
    this.#deck = deck;
    this.#players = {};
    this.#shuffle = shuffleFn;
    this.#pawnsToAssign = shuffleFn(pawns);
  }

  start() {
    this.#distributeCards();
    this.changeCurrentState();
  }

  getCurrentState() {
    return {
      state: this.#currentState,
      players: this.getAllPlayers(),
      pawns: this.#getAllPawns(),
    };
  }

  changeCurrentState() {
    this.#currentState = this.#states.shift();
  }

  setTurnOrder() {
    this.#turnOrder = this.#shuffle(this.#players);
  }

  addPlayer(player) {
    const pawn = this.#pawnsToAssign.pop();
    player.assignPawn(pawn);
    this.#players[player.get().id] = player;
  }

  getAllPlayers() {
    return Object.values(this.#players).map((player) => player?.get());
  }

  #getAllPawns() {
    return this.#pawns.map((pawn) => pawn?.get());
  }

  getBoard() {
    return this.#board;
  }
  getPawnInstance(id) {
    return this.#pawns.find((pawn) => pawn?.get().id === id);
  }

  #rollDice(randomGenerator) {
    return Math.ceil(randomGenerator() * 6);
  }

  getRolledNumber(randomGenerator = Math.random) {
    return this.#rollDice(randomGenerator) + this.#rollDice(randomGenerator);
  }

  #distributeCards() {
    const players = Object.values(this.#players);
    this.#deck.distributeCards(players);
  }
}
