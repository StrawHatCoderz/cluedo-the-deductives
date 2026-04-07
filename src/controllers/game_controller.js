import { Player } from "../models/player.js";

export class GameController {
  #games;
  #createGame;
  #pawns;
  constructor(createGame, pawns) {
    this.#createGame = createGame;
    this.#pawns = pawns;
    this.#games = {};
  }

  static create(createGame, createPawns) {
    if (typeof createGame !== "function") {
      throw new Error("Create Game Shold be valid function");
    }

    const pawns = createPawns();
    return new GameController(createGame, pawns);
  }

  #findPawn(name) {
    return this.#pawns.find((pawn) => pawn.getPawnData().name === name);
  }

  startGame(gameId, allPlayers) {
    const game = this.#createGame(gameId, this.#pawns);
    this.#games[gameId] = game;

    for (const { id, isHost, name, character } of allPlayers) {
      const playerInstance = new Player(id, name, isHost);
      const pawn = this.#findPawn(character.name);
      game.addPlayer(playerInstance, pawn);
    }

    game.start();
  }

  getGameState(gameId, playerId) {
    return this.#games[gameId].getState(playerId);
  }

  rollDice(gameId, randomFn, ceilFn) {
    const game = this.#games[gameId];
    return game.rollDice(randomFn, ceilFn);
  }

  getReachableNodes(gameId, position, steps) {
    const game = this.#games[gameId];
    return game.getReachableNodes(position, steps);
  }

  getDiceValue(gameId) {
    const game = this.#games[gameId];
    return game.getDiceValue();
  }

  movePawn(gameId, pawnId, payload, nodeId, pos) {
    const game = this.#games[gameId];

    return game.movePawn(pawnId, payload, nodeId, pos);
  }

  accuse(gameId, { suspect, weapon, room }) {
    const game = this.#games[gameId];
    return game.accuse({ suspect, weapon, room });
  }

  updateTurn(gameId) {
    return this.#games[gameId].updateTurn();
  }

  addSuspicion(gameId, suspicion) {
    const game = this.#games[gameId];
    if (game.canSuspect()) {
      game.addSuspicion(suspicion);
      return { status: true };
    }
    return { status: false };
  }

  confirmDisproval(gameId, disprove) {
    const game = this.#games[gameId];
    game.addDisprovedCard(disprove);
    return { status: true };
  }

  getDisprovedCard(gameId) {
    const game = this.#games[gameId];
    const card = game.getDisprovedCard();
    return { card };
  }
}
