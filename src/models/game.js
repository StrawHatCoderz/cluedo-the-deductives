import { shuffle } from "@std/random";
import { Turn } from "./turn.js";
import { Player } from "./player.js";

export class Game {
  #turnNum;
  #turn;
  #states = ["waiting", "setup", "running", "finished"];
  #currentState;
  #id;
  #board;
  #pawns;
  #pawnsToAssign;
  #deck;
  #players;
  #turnOrder;
  #currentPlayer;
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
    this.#turnNum = 0;
  }

  start() {
    const totalPlayers = Object.keys(this.#players).length;

    if (totalPlayers < 3 || totalPlayers > 6) {
      throw new Error("Invalid player count");
    }

    this.#distributeCards();
    this.changeCurrentState();
    this.#setTurnOrder();
  }

  updateTurn() {
    if (this.#currentState !== "running") {
      throw new Error("Game hasn't started yet");
    }

    this.#currentPlayer =
      this.#turnOrder[this.#turnNum++ % this.#turnOrder.length];
    if (this.#currentPlayer.get().isEliminated) {
      this.updateTurn();
    }

    this.#turn = new Turn(this.#currentPlayer);
    return this.#currentPlayer.get();
  }

  getCurrentState() {
    return {
      state: this.#currentState,
      currentPlayer: this.#currentPlayer?.get(),
      players: this.getAllPlayers(),
      pawns: this.#getAllPawns(),
    };
  }

  changeCurrentState() {
    this.#currentState = this.#states.shift();
  }

  #setTurnOrder() {
    this.#turnOrder = Object.values(this.#players).sort((p1, p2) =>
      p1.get().pawn.id - p2.get().pawn.id
    );
  }

  addPlayer(player) {
    if (!(player instanceof Player)) {
      throw new Error("Invalid player");
    }

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

  getRolledNumber(randomFn = Math.random, ceilFn = Math.ceil) {
    if (!this.#turn) throw new Error("Game hasn't started yet");
    return this.#turn.rollDice(randomFn, ceilFn);
  }

  #distributeCards() {
    const players = Object.values(this.#players);
    this.#deck.distributeCards(players);
  }
}
