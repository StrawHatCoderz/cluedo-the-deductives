import { Player } from "../models/player.js";

export class GameController {
  #games;
  #createGame;

  constructor(createGame) {
    this.#createGame = createGame;
    this.#games = {};
  }

  static create(createGame) {
    if (typeof createGame !== "function") {
      throw new Error("Create Game Shold be valid function");
    }

    return new GameController(createGame);
  }

  startGame(gameId, allPlayers) {
    const game = this.#createGame(gameId);
    this.#games[gameId] = game;

    for (const { id, isHost, name, character } of allPlayers) {
      const playerInstance = new Player(id, name, isHost);
      game.addPlayer(playerInstance, character);
    }

    game.start();
  }

  getGameState(gameId, playerId) {
    return this.#games[gameId].getState(playerId);
  }

  getDisprovablePlayer(gameId) {
    return this.#games[gameId].getDisprovablePlayer();
  }

  getSuspicionCombination(gameId) {
    return this.#games[gameId].getSuspectCombination();
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

  movePawn(gameId, playerId, newNodeId, pos) {
    const game = this.#games[gameId];
    return game.movePawn(playerId, newNodeId, pos);
  }

  useSecretPassage(gameId, playerId) {
    const game = this.#games[gameId];
    return game.useSecretPassage(playerId);
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
    game.addSuspicion(suspicion);
  }

  hasSuspected(gameId) {
    return this.#games[gameId].hasSuspected();
  }

  confirmDisproval(gameId, disprove) {
    const game = this.#games[gameId];
    game.addDisprovedCard(disprove);
    return { status: true };
  }

  isRollAllowed(gameId, playerId) {
    const gameState = this.#games[gameId].getState(playerId);
    return gameState.canRoll;
  }

  isValidLobby(gameId) {
    return gameId in this.#games;
  }

  getDisprovedCard(gameId) {
    const game = this.#games[gameId];
    const card = game.getDisprovedCard();
    return { card };
  }
}
